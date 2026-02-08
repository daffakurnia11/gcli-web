import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

type InvestmentAccount = {
  id: string;
  label: string;
  category: string | null;
  amount: number;
  creator: string;
};

export async function GET(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }

    const session = await auth();
    const gangName = session?.user?.gang?.name;

    if (!gangName) {
      return apiFromLegacy(
        {
          investments: [],
          message: "No gang membership found for this account.",
        },
        { status: 200 },
      );
    }

    // Fetch all bank accounts created by this gang with business metadata.
    const investments = await prisma.$queryRaw<InvestmentAccount[]>(Prisma.sql`
      SELECT
        ba.id AS id,
        COALESCE(tb.label, ba.id) AS label,
        tb.category AS category,
        ba.amount AS amount,
        ba.creator AS creator
      FROM bank_accounts_new ba
      LEFT JOIN tl_businesses tb ON tb.bank_account_id = ba.id
      WHERE ba.creator = ${gangName}
      ORDER BY COALESCE(tb.label, ba.id) ASC
    `);

    return apiFromLegacy(
      {
        gangName,
        investments: investments as InvestmentAccount[],
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Investment accounts fetch error:", error);
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
