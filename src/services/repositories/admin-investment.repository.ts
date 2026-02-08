import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type CategoryRow = {
  category: string;
  total: bigint | number;
};

export type GangOwnershipRow = {
  gangCode: string;
  gangLabel: string;
  ownershipCount: bigint | number;
};

export type InvestmentDetailRow = {
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

export const ensureRowsAffected = (affectedRows: number | bigint) => {
  if (Number(affectedRows) < 1) {
    throw new Error("Business metadata not found for bank account");
  }
};

export const adminInvestmentRepository = {
  findGangs: () =>
    prisma.tl_gangs.findMany({
      where: { name: { not: "none" } },
      select: { name: true, label: true },
      orderBy: { label: "asc" },
    }),

  findGangByCode: (gangCode: string) =>
    prisma.tl_gangs.findUnique({ where: { name: gangCode }, select: { name: true } }),

  findBankAccount: (bankAccountId: string) =>
    prisma.bank_accounts_new.findUnique({
      where: { id: bankAccountId },
      select: { id: true },
    }),

  listCategories: () => prisma.$queryRaw<CategoryRow[]>`
      SELECT category, COUNT(*) AS total
      FROM tl_businesses
      GROUP BY category
      ORDER BY category ASC
    `,

  listGangOwnership: () => prisma.$queryRaw<GangOwnershipRow[]>`
      SELECT
        g.name AS gangCode,
        g.label AS gangLabel,
        COUNT(tb.id) AS ownershipCount
      FROM tl_gangs g
      LEFT JOIN tl_businesses tb
        ON tb.owner = g.name
       AND tb.is_owned = 1
      WHERE LOWER(g.name) <> 'none'
      GROUP BY g.name, g.label
      ORDER BY ownershipCount DESC, g.label ASC
    `,

  countDetailItems: (baseWhere: Prisma.Sql, searchWhere: Prisma.Sql) =>
    prisma.$queryRaw<Array<{ total: bigint | number }>>(
      Prisma.sql`
        SELECT COUNT(*) AS total
        FROM tl_businesses tb
        LEFT JOIN bank_accounts_new ba ON ba.id = tb.bank_account_id
        WHERE ${baseWhere} ${searchWhere}
      `,
    ),

  listDetailItems: (
    baseWhere: Prisma.Sql,
    searchWhere: Prisma.Sql,
    limit: number,
    offset: number,
  ) =>
    prisma.$queryRaw<InvestmentDetailRow[]>(Prisma.sql`
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
      OFFSET ${offset}
    `),

  assignBusiness: async (bankAccountId: string, gangCode: string, isUnassign: boolean) => {
    await prisma.$transaction(async (tx) => {
      if (isUnassign) {
        await tx.bank_accounts_new.update({
          where: { id: bankAccountId },
          data: { creator: null },
        });
      } else {
        await tx.bank_accounts_new.update({
          where: { id: bankAccountId },
          data: { creator: gangCode, amount: 0, transactions: "[]" },
        });
      }

      const affectedRows = await tx.$executeRaw(
        Prisma.sql`
          UPDATE tl_businesses
          SET owner = ${isUnassign ? null : gangCode},
              is_owned = ${isUnassign ? 0 : 1},
              updated_at = CURRENT_TIMESTAMP
          WHERE bank_account_id = ${bankAccountId}
        `,
      );

      ensureRowsAffected(affectedRows);
    });
  },
};
