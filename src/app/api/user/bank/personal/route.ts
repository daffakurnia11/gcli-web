import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
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

export async function GET(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = Math.max(DEFAULT_PAGE, Number.parseInt(pageParam ?? "", 10) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number.parseInt(limitParam ?? "", 10) || DEFAULT_LIMIT),
    );

    const resolved = await resolveCitizenIdForAccount(accountId);

    if (!resolved?.citizenId) {
      return apiFromLegacy(
        {
          citizenId: null,
          playerName: null,
          transactions: [],
          pagination: {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: 0,
            totalPages: 0,
          },
          message: "No linked player record found for this account.",
        },
        { status: 200 },
      );
    }

    // Fetch both transactions and player money data
    const [transactions, player] = await Promise.all([
      prisma.player_transactions.findUnique({
        where: { id: resolved.citizenId },
        select: {
          id: true,
          transactions: true,
          isFrozen: true,
        },
      }),
      prisma.players.findUnique({
        where: { citizenid: resolved.citizenId },
        select: { money: true },
      }),
    ]);

    // Parse money field
    let cashBalance = 0;
    let bankBalance = 0;
    if (player?.money) {
      const moneyData = parseJson<{ cash: number; bank: number; crypto?: number }>(
        player.money,
        { cash: 0, bank: 0 },
      );
      cashBalance = moneyData.cash ?? 0;
      bankBalance = moneyData.bank ?? 0;
    }

    if (!transactions) {
      return apiFromLegacy(
        {
          citizenId: resolved.citizenId,
          playerName: resolved.playerName,
          transactions: [],
          pagination: {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: 0,
            totalPages: 0,
          },
          cashBalance,
          bankBalance,
          isFrozen: 0,
        },
        { status: 200 },
      );
    }

    // Parse JSON fields
    const parsedTransactions = parseJson<BankTransaction[]>(
      transactions.transactions,
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
        citizenId: resolved.citizenId,
        playerName: resolved.playerName,
        transactions: paginatedTransactions,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages,
        },
        cashBalance,
        bankBalance,
        isFrozen: transactions.isFrozen ?? 0,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Personal bank transactions fetch error:", error);
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
