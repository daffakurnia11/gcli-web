import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type InvestmentAccount = {
  id: string;
  label: string;
  category: string | null;
  amount: number;
  creator: string;
};

export async function GET(request: Request) {
  try {
    const accountId = await getAccountIdFromRequest(request);
    if (!accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await auth();
    const gangName = session?.user?.gang?.name;

    if (!gangName) {
      return NextResponse.json(
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

    return NextResponse.json(
      {
        gangName,
        investments: investments as InvestmentAccount[],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Investment accounts fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
