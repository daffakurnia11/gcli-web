import { Prisma } from "@prisma/client";

import { requireAdminSession } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";
import { adminInvestmentRepository } from "@/services/repositories/admin-investment.repository";

const parsePositiveInt = (
  value: string | null,
  fallback: number,
  max?: number,
) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  if (max && parsed > max) {
    return max;
  }
  return parsed;
};

export async function GET(request: Request) {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    const gang = searchParams.get("gang")?.trim();
    const query = searchParams.get("q")?.trim() ?? "";
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 10, 100);

    if (!category && !gang) {
      return apiFromLegacy(
        { error: "Missing required query parameter: category or gang" },
        { status: 400 },
      );
    }

    const likeQuery = `%${query}%`;
    const baseWhere = category
      ? Prisma.sql`tb.category = ${category}`
      : Prisma.sql`tb.owner = ${gang} AND tb.is_owned = 1`;
    const searchWhere =
      query.length > 0
        ? Prisma.sql` AND (
            tb.label LIKE ${likeQuery}
            OR tb.bank_account_id LIKE ${likeQuery}
            OR COALESCE(tb.owner, '') LIKE ${likeQuery}
            OR COALESCE(tb.map, '') LIKE ${likeQuery}
            OR COALESCE(ba.creator, '') LIKE ${likeQuery}
          )`
        : Prisma.sql``;

    const countRows = await adminInvestmentRepository.countDetailItems(
      baseWhere,
      searchWhere,
    );
    const totalItems = Number(countRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);
    const currentOffset = (currentPage - 1) * limit;

    const rows = await adminInvestmentRepository.listDetailItems(
      baseWhere,
      searchWhere,
      limit,
      currentOffset,
    );

    const items = rows.map((row) => ({
      businessId: Number(row.businessId),
      bankAccountId: row.bankAccountId,
      label: row.label,
      category: row.category,
      map: row.map,
      owner: row.owner,
      isOwned: row.isOwned === true || Number(row.isOwned) === 1,
      updatedAt: row.updatedAt,
      balance: Number(row.balance ?? 0),
      creator: row.creator,
      isFrozen: Number(row.isFrozen ?? 0),
    }));

    return apiFromLegacy(
      {
        category: category ?? null,
        gang: gang ?? null,
        query,
        totalItems,
        pagination: {
          currentPage,
          itemsPerPage: limit,
          totalItems,
          totalPages,
        },
        items,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin investment detail fetch error:", error);
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
