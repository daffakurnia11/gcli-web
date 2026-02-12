import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

type RouteParams = {
  params: Promise<{
    invoiceNumber: string;
  }>;
};

export async function GET(_request: Request, context: RouteParams) {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const { invoiceNumber: rawInvoiceNumber } = await context.params;
    const invoiceNumber = decodeURIComponent(rawInvoiceNumber).trim();
    if (!invoiceNumber) {
      return apiFromLegacy({ error: "Invalid invoice number." }, { status: 400 });
    }

    const payment = await prisma.payments.findUnique({
      where: { invoice_number: invoiceNumber },
      select: {
        id: true,
        invoice_number: true,
        provider: true,
        channel: true,
        amount: true,
        currency: true,
        status: true,
        payer_account_id: true,
        purpose_type: true,
        purpose_ref: true,
        checkout_url: true,
        paid_at: true,
        expired_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!payment) {
      return apiFromLegacy({ error: "Payment not found." }, { status: 404 });
    }

    const payer = payment.payer_account_id
      ? await prisma.web_accounts.findUnique({
          where: { id: payment.payer_account_id },
          select: { user: { select: { username: true } } },
        })
      : null;

    return apiFromLegacy(
      {
        payment: {
          id: payment.id,
          invoiceNumber: payment.invoice_number,
          provider: payment.provider,
          channel: payment.channel,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          payerAccountId: payment.payer_account_id,
          payerUsername: payer?.user?.username ?? "-",
          purposeType: payment.purpose_type,
          purposeRef: payment.purpose_ref,
          checkoutUrl: payment.checkout_url,
          paidAt: payment.paid_at?.toISOString() ?? null,
          expiredAt: payment.expired_at?.toISOString() ?? null,
          createdAt: payment.created_at.toISOString(),
          updatedAt: payment.updated_at.toISOString(),
        },
      } satisfies AdminPaymentDetailResponse,
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin payment detail fetch error:", error);
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
