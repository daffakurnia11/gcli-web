import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { paymentRecapQuerySchema } from "@/schemas/payment";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const parsePositiveInt = (
  value: number | undefined,
  fallback: number,
  max?: number,
) => {
  if (!value || value < 1 || Number.isNaN(value)) {
    return fallback;
  }

  if (max && value > max) {
    return max;
  }

  return value;
};

const buildSummary = (
  groupedByStatus: Array<{
    status: string;
    _count: { _all: number };
    _sum: { amount: number | null };
  }>,
) => {
  const statusMap = new Map(
    groupedByStatus.map((entry) => [
      entry.status.toLowerCase(),
      {
        count: entry._count._all,
        amount: entry._sum.amount ?? 0,
      },
    ]),
  );

  const sumAllAmount = groupedByStatus.reduce(
    (total, entry) => total + (entry._sum.amount ?? 0),
    0,
  );

  return {
    totalAmount: sumAllAmount,
    paidAmount: statusMap.get("paid")?.amount ?? 0,
    totalPaid: statusMap.get("paid")?.count ?? 0,
    totalPending: statusMap.get("pending")?.count ?? 0,
    totalFailed: statusMap.get("failed")?.count ?? 0,
    totalExpired: statusMap.get("expired")?.count ?? 0,
    totalCanceled: statusMap.get("canceled")?.count ?? 0,
    totalRefunded: statusMap.get("refunded")?.count ?? 0,
  } satisfies UserPaymentRecapSummary;
};

export async function GET(request: Request) {
  try {
    const guard = await requireAccountId(request);
    if (!guard.ok) {
      return guard.response;
    }

    const { searchParams } = new URL(request.url);
    const parsedQuery = paymentRecapQuerySchema.safeParse({
      q: searchParams.get("q") ?? "",
      status: searchParams.get("status") ?? undefined,
      purposeType: searchParams.get("purposeType") ?? undefined,
      provider: searchParams.get("provider") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsedQuery.success) {
      return apiFromLegacy(
        { error: parsedQuery.error.issues[0]?.message ?? "Invalid query params." },
        { status: 400 },
      );
    }

    const query = parsedQuery.data.q.trim();
    const status = parsedQuery.data.status?.trim() || null;
    const purposeType = parsedQuery.data.purposeType?.trim() || null;
    const provider = parsedQuery.data.provider?.trim() || null;
    const page = parsePositiveInt(parsedQuery.data.page, DEFAULT_PAGE);
    const limit = parsePositiveInt(parsedQuery.data.limit, DEFAULT_LIMIT, 100);

    const where: Prisma.paymentsWhereInput = {
      payer_account_id: guard.accountId,
      ...(status ? { status } : {}),
      ...(purposeType ? { purpose_type: purposeType } : {}),
      ...(provider ? { provider } : {}),
      ...(query
        ? {
            OR: [
              { invoice_number: { contains: query } },
              { purpose_type: { contains: query } },
              { purpose_ref: { contains: query } },
              { status: { contains: query } },
              { provider: { contains: query } },
            ],
          }
        : {}),
    };

    const totalItems = await prisma.payments.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);
    const currentOffset = (currentPage - 1) * limit;

    const [payments, groupedByStatus] = await Promise.all([
      prisma.payments.findMany({
        where,
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        skip: currentOffset,
        take: limit,
      }),
      prisma.payments.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
        _sum: { amount: true },
      }),
    ]);

    return apiFromLegacy(
      {
        query,
        status,
        purposeType,
        provider,
        summary: buildSummary(groupedByStatus),
        pagination: {
          currentPage,
          itemsPerPage: limit,
          totalItems,
          totalPages,
        },
        items: payments.map((payment) => ({
          id: payment.id,
          invoiceNumber: payment.invoice_number,
          provider: payment.provider,
          channel: payment.channel,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          purposeType: payment.purpose_type,
          purposeRef: payment.purpose_ref,
          checkoutUrl: payment.checkout_url,
          paidAt: payment.paid_at?.toISOString() ?? null,
          expiredAt: payment.expired_at?.toISOString() ?? null,
          createdAt: payment.created_at.toISOString(),
          updatedAt: payment.updated_at.toISOString(),
        })),
      } satisfies UserPaymentRecapResponse,
      { status: 200 },
    );
  } catch (error) {
    logger.error("User payment recap fetch error:", error);
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
