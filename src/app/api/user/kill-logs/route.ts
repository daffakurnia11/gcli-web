import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

type KillLogType = "kill" | "dead";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parseType = (value: string | null): KillLogType => {
  return value === "dead" ? "dead" : "kill";
};

export async function GET(request: Request) {
  try {
    const authz = await requireAccountId(request);
    if (!authz.ok) {
      return authz.response;
    }
    const accountId = authz.accountId;

    const url = new URL(request.url);
    const type = parseType(url.searchParams.get("type"));
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    const page = Math.max(DEFAULT_PAGE, Number.parseInt(pageParam ?? "", 10) || DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number.parseInt(limitParam ?? "", 10) || DEFAULT_LIMIT),
    );

    const resolved = await resolveCitizenIdForAccount(accountId);

    if (!resolved?.citizenId) {
      return apiFromLegacy(
        {
          type,
          citizenId: null,
          playerName: null,
          records: [],
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

    const where =
      type === "kill"
        ? { killer_citizenid: resolved.citizenId }
        : { victim_citizenid: resolved.citizenId };

    // Get total count for pagination
    const totalItems = await prisma.tl_kill_logs.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const logs = await prisma.tl_kill_logs.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        killer_citizenid: true,
        killer_name: true,
        victim_citizenid: true,
        victim_name: true,
        weapon: true,
        created_at: true,
      },
    });

    return apiFromLegacy(
      {
        type,
        citizenId: resolved.citizenId,
        playerName: resolved.playerName,
        records: logs.map((log) => ({
          id: log.id,
          killerCitizenId: log.killer_citizenid,
          killerName: log.killer_name,
          victimCitizenId: log.victim_citizenid,
          victimName: log.victim_name,
          weapon: log.weapon,
          createdAt: log.created_at,
        })),
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Kill log fetch error:", error);
    return apiFromLegacy(
      { error: "Internal server error" },
      { status: 500 },
    );
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
