import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";

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
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }

    const session = await auth();
    const gangName = session?.user?.gang?.name;

    if (!gangName) {
      return apiFromLegacy(
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
      return apiFromLegacy(
        { error: "Investment account not found." },
        { status: 404 },
      );
    }

    // Verify the account belongs to this gang
    if (bankAccount.creator !== gangName) {
      return apiFromLegacy(
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
    const parsedTransactions = parseJson<BankTransaction[]>(
      bankAccount.transactions,
      [],
    );

    // Sort by time descending (newest first)
    const sortedTransactions = parsedTransactions.sort((a, b) => b.time - a.time);

    // Calculate pagination
    const totalItems = sortedTransactions.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Get paginated data
    const paginatedTransactions = sortedTransactions.slice(offset, offset + limit);

    return apiFromLegacy(
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
    logger.error("Investment transactions fetch error:", error);
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
