import {
  extractPaymentStatus,
  finalizeLeagueJoinFromInvoice,
  isLeagueJoinPaidStatus,
  syncLeagueJoinPaymentStatus,
} from "@/lib/leagueJoin";
import { apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";
import { NextResponse } from "@/services/next-response";

const PAYMENT_SERVICE_BASE_URL =
  process.env.PAYMENT_SERVICE_BASE_URL ?? "http://localhost:3001";

const redirectToDashboard = (requestUrl: string) => {
  const url = new URL("/dashboard", requestUrl);
  return NextResponse.redirect(url.toString());
};

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const invoiceNumber = requestUrl.searchParams.get("invoiceNumber")?.trim() ?? "";

    if (!invoiceNumber) {
      return redirectToDashboard(request.url);
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

    await syncLeagueJoinPaymentStatus({
      invoiceNumber,
      providerStatus: paymentStatus,
      providerPayload: paymentStatusPayload,
    });

    if (!paymentStatusResponse.ok || !isLeagueJoinPaidStatus(paymentStatus)) {
      return redirectToDashboard(request.url);
    }

    const result = await finalizeLeagueJoinFromInvoice(invoiceNumber);
    if (!result.ok && result.reason !== "league_not_found") {
      logger.error("Failed to finalize league join from callback", {
        invoiceNumber,
        reason: result.reason,
      });
    }

    return redirectToDashboard(request.url);
  } catch (error) {
    logger.error("League join complete callback error:", error);
    return redirectToDashboard(request.url);
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
