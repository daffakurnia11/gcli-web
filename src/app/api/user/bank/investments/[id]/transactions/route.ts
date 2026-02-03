import { NextResponse } from "next/server";

import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BankTransaction = {
  time: number;
  receiver: string;
  trans_type: "deposit" | "withdraw";
  trans_id: string;
  issuer: string;
  message: string;
  amount: number;
  title: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const accountId = await getAccountIdFromRequest(request);
    if (!accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await auth();
    const gangName = session?.user?.gang?.name;

    if (!gangName) {
      return NextResponse.json(
        { error: "No gang membership found for this account." },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Fetch the bank account and verify it belongs to this gang
    const bankAccount = await prisma.bank_accounts_new.findUnique({
      where: { id },
      select: {
        id: true,
        amount: true,
        transactions: true,
        isFrozen: true,
        creator: true,
      },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: "Investment account not found." },
        { status: 404 },
      );
    }

    // Verify the account belongs to this gang
    if (bankAccount.creator !== gangName) {
      return NextResponse.json(
        { error: "You don't have access to this investment account." },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = Math.max(DEFAULT_PAGE, Number.parseInt(pageParam ?? "", 10) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number.parseInt(limitParam ?? "", 10) || DEFAULT_LIMIT),
    );

    // Parse JSON fields
    const parsedTransactions = bankAccount.transactions
      ? (JSON.parse(bankAccount.transactions) as BankTransaction[])
      : [];

    // Sort by time descending (newest first)
    const sortedTransactions = parsedTransactions.sort((a, b) => b.time - a.time);

    // Calculate pagination
    const totalItems = sortedTransactions.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Get paginated data
    const paginatedTransactions = sortedTransactions.slice(offset, offset + limit);

    return NextResponse.json(
      {
        accountId: id,
        transactions: paginatedTransactions,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages,
        },
        balance: bankAccount.amount ?? 0,
        isFrozen: bankAccount.isFrozen ?? 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Investment transactions fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
