import { insertLeagueTeamFromInvoice } from "@/lib/leagueJoin";
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

    if (!invoiceNumber) {
      return apiFromLegacy(
        { error: "invoiceNumber is required." },
        { status: 400 },
      );
    }

    const result = await insertLeagueTeamFromInvoice(invoiceNumber);
    if (!result.ok && result.reason === "invalid_invoice") {
      return apiFromLegacy(
        { error: "Invalid league invoice number." },
        { status: 400 },
      );
    }

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
