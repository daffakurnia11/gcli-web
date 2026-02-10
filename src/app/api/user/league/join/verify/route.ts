import {
  extractPaymentStatus,
  insertLeagueTeamFromInvoice,
  isLeagueJoinPaidStatus,
} from "@/lib/leagueJoin";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

const PAYMENT_SERVICE_BASE_URL =
  process.env.PAYMENT_SERVICE_BASE_URL ?? "http://localhost:3001";

export async function GET(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return apiFromLegacy({ error: "Unauthorized" }, { status: 401 });
    }

    const requestUrl = new URL(request.url);
    const invoiceNumber = requestUrl.searchParams.get("invoiceNumber")?.trim() ?? "";
    if (!invoiceNumber) {
      return apiFromLegacy(
        { error: "invoiceNumber is required." },
        { status: 400 },
      );
    }

    const paymentStatusResponse = await fetch(
      `${PAYMENT_SERVICE_BASE_URL}/api/payments/${encodeURIComponent(invoiceNumber)}/status`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const paymentStatusPayload = await paymentStatusResponse.json().catch(() => null);
    const paymentStatus = extractPaymentStatus(paymentStatusPayload);
    const paid = paymentStatusResponse.ok && isLeagueJoinPaidStatus(paymentStatus);

    if (!paid) {
      return apiFromLegacy(
        {
          paid: false,
          inserted: false,
          status: paymentStatus,
        },
        { status: 200 },
      );
    }

    const insertResult = await insertLeagueTeamFromInvoice(invoiceNumber);
    if (!insertResult.ok && insertResult.reason === "league_not_found") {
      return apiFromLegacy({ error: "League not found." }, { status: 404 });
    }

    if (!insertResult.ok) {
      return apiFromLegacy(
        { error: "Failed to finalize league join." },
        { status: 400 },
      );
    }

    return apiFromLegacy(
      {
        paid: true,
        inserted: insertResult.inserted,
        status: paymentStatus,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("League join verify error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

// AUTO_METHOD_NOT_ALLOWED
export function POST() {
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
