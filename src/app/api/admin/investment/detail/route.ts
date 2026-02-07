import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type InvestmentDetailRow = {
  businessId: number | bigint;
  bankAccountId: string;
  label: string;
  category: string;
  map: string | null;
  owner: string | null;
  isOwned: boolean | number | bigint;
  updatedAt: Date;
  balance: number | bigint | null;
  creator: string | null;
  isFrozen: number | bigint | null;
};

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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.optin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    const gang = searchParams.get("gang")?.trim();
    const query = searchParams.get("q")?.trim() ?? "";
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 10, 100);

    if (!category && !gang) {
      return NextResponse.json(
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

    const countRows = await prisma.$queryRaw<Array<{ total: bigint | number }>>(
      Prisma.sql`
        SELECT COUNT(*) AS total
        FROM tl_businesses tb
        LEFT JOIN bank_accounts_new ba ON ba.id = tb.bank_account_id
        WHERE ${baseWhere} ${searchWhere}
      `,
    );
    const totalItems = Number(countRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);
    const currentOffset = (currentPage - 1) * limit;

    const rows = await prisma.$queryRaw<InvestmentDetailRow[]>(Prisma.sql`
      SELECT
        tb.id AS businessId,
        tb.bank_account_id AS bankAccountId,
        tb.label AS label,
        tb.category AS category,
        tb.map AS map,
        tb.owner AS owner,
        tb.is_owned AS isOwned,
        tb.updated_at AS updatedAt,
        ba.amount AS balance,
        ba.creator AS creator,
        ba.isFrozen AS isFrozen
      FROM tl_businesses tb
      LEFT JOIN bank_accounts_new ba ON ba.id = tb.bank_account_id
      WHERE ${baseWhere} ${searchWhere}
      ORDER BY tb.label ASC, tb.bank_account_id ASC
      LIMIT ${limit}
      OFFSET ${currentOffset}
    `);

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

    return NextResponse.json(
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
    console.error("Admin investment detail fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
