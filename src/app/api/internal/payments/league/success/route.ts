import {
  finalizeLeagueJoinFromInvoice,
  syncLeagueJoinPaymentStatus,
} from "@/lib/leagueJoin";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

const INTERNAL_PAYMENT_WEBHOOK_TOKEN =
  process.env.INTERNAL_PAYMENT_WEBHOOK_TOKEN?.trim() ?? "";

export async function POST(request: Request) {
  try {
    if (INTERNAL_PAYMENT_WEBHOOK_TOKEN) {
      const token = request.headers.get("x-internal-token")?.trim() ?? "";
      if (token !== INTERNAL_PAYMENT_WEBHOOK_TOKEN) {
        return apiFromLegacy({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const rawBody = await request.json().catch(() => null);
    const invoiceNumber =
      rawBody && typeof rawBody === "object" && "invoiceNumber" in rawBody
        ? String((rawBody as { invoiceNumber?: unknown }).invoiceNumber ?? "")
        : "";
    const providerStatus =
      rawBody &&
      typeof rawBody === "object" &&
      "transactionStatus" in rawBody &&
      typeof (rawBody as { transactionStatus?: unknown }).transactionStatus ===
        "string"
        ? String((rawBody as { transactionStatus?: string }).transactionStatus)
        : null;

    if (!invoiceNumber) {
      return apiFromLegacy(
        { error: "invoiceNumber is required." },
        { status: 400 },
      );
    }

    const synced = await syncLeagueJoinPaymentStatus({
      invoiceNumber,
      providerStatus,
      providerPayload: rawBody,
    });
    if (!synced.ok && synced.reason === "payment_not_found") {
      return apiFromLegacy(
        { error: "Payment not found." },
        { status: 404 },
      );
    }

    if (!synced.ok && synced.reason === "invalid_purpose") {
      return apiFromLegacy(
        { error: "Payment purpose is invalid for league join." },
        { status: 400 },
      );
    }

    if (synced.ok && !synced.paid) {
      return apiFromLegacy(
        {
          message: "Payment is not paid yet.",
          inserted: false,
        },
        { status: 200 },
      );
    }

    const result = await finalizeLeagueJoinFromInvoice(invoiceNumber);
    if (!result.ok && result.reason === "league_not_found") {
      return apiFromLegacy({ error: "League not found." }, { status: 404 });
    }

    if (!result.ok) {
      return apiFromLegacy(
        {
          error: "Failed to record league join.",
        },
        { status: 400 },
      );
    }

    if (!result.inserted) {
      return apiFromLegacy(
        {
          message: "Team already joined this league.",
          inserted: false,
        },
        { status: 200 },
      );
    }

    return apiFromLegacy(
      {
        message: "League team join recorded.",
        inserted: true,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("League payment success callback error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

// AUTO_METHOD_NOT_ALLOWED
export function GET() {
  return apiMethodNotAllowed();
}

export function PUT() {
  return apiMethodNotAllowed();
}

export function PATCH() {
  return apiMethodNotAllowed();
}

export function DELETE() {
  return apiMethodNotAllowed();
}

export function OPTIONS() {
  return apiMethodNotAllowed();
}

export function HEAD() {
  return apiMethodNotAllowed();
}
