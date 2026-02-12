import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  leagueCreateSchema,
  leagueListQuerySchema,
} from "@/schemas/league";
import { requireAdminSession } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

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

const mapCreatorUsernames = async (creators: string[]) => {
  const userIds = creators
    .map((creator) => Number.parseInt(creator, 10))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (userIds.length === 0) {
    return new Map<number, string>();
  }

  const users = await prisma.users.findMany({
    where: { userId: { in: Array.from(new Set(userIds)) } },
    select: { userId: true, username: true },
  });

  return new Map(users.map((user) => [user.userId, user.username ?? "-"]));
};

export async function GET(request: Request) {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const { searchParams } = new URL(request.url);
    const queryResult = leagueListQuerySchema.safeParse({
      q: searchParams.get("q") ?? "",
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!queryResult.success) {
      return apiFromLegacy(
        { error: queryResult.error.issues[0]?.message ?? "Invalid query params." },
        { status: 400 },
      );
    }

    const query = queryResult.data.q?.trim() ?? "";
    const status = queryResult.data.status;
    const page = parsePositiveInt(queryResult.data.page, 1);
    const limit = parsePositiveInt(queryResult.data.limit, 10, 100);

    const where = {
      ...(status ? { status } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { creator: { contains: query } },
              { status: { contains: query } },
            ],
          }
        : {}),
    };

    const totalItems = await prisma.leagues.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);
    const currentOffset = (currentPage - 1) * limit;

    const leagues = await prisma.leagues.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: currentOffset,
      take: limit,
    });

    const leagueIds = leagues.map((league) => league.id);

    const [teamCounts, matchCounts] = await Promise.all([
      leagueIds.length > 0
        ? prisma.league_teams.groupBy({
            by: ["league_id"],
            where: { league_id: { in: leagueIds } },
            _count: { _all: true },
          })
        : Promise.resolve([]),
      leagueIds.length > 0
        ? prisma.league_matches.groupBy({
            by: ["league_id"],
            where: { league_id: { in: leagueIds } },
            _count: { _all: true },
          })
        : Promise.resolve([]),
    ]);

    const teamCountMap = new Map(
      teamCounts.map((entry) => [entry.league_id, entry._count._all]),
    );
    const matchCountMap = new Map(
      matchCounts.map((entry) => [entry.league_id, entry._count._all]),
    );

    const creatorMap = await mapCreatorUsernames(
      leagues.map((league) => league.creator),
    );

    const items: AdminLeagueItem[] = leagues.map((league) => {
      const creatorUserId = Number.parseInt(league.creator, 10);
      const creatorUsername = creatorMap.get(creatorUserId) ?? league.creator ?? "-";

      return {
        id: league.id,
        name: league.name,
        status: league.status as LeagueStatus,
        startAt: league.start_at?.toISOString() ?? null,
        endAt: league.end_at?.toISOString() ?? null,
        creator: league.creator,
        creatorUsername,
        price: league.price,
        maxTeam: league.max_team,
        minPlayer: league.min_player,
        totalTeams: teamCountMap.get(league.id) ?? 0,
        totalMatches: matchCountMap.get(league.id) ?? 0,
        rulesJson: league.rules_json,
      };
    });

    return apiFromLegacy(
      {
        query,
        status: status ?? null,
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
    logger.error("Admin league list fetch error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const rawBody = await request.json().catch(() => null);
    const parsed = leagueCreateSchema.safeParse(rawBody);

    if (!parsed.success) {
      return apiFromLegacy(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload." },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const accountId = Number.parseInt(admin.session.user.id, 10);
    if (!Number.isInteger(accountId) || accountId < 1) {
      return apiFromLegacy({ error: "Invalid authenticated account." }, { status: 401 });
    }

    const account = await prisma.web_accounts.findUnique({
      where: { id: accountId },
      select: { user_id: true },
    });

    if (!account?.user_id) {
      return apiFromLegacy(
        { error: "Authenticated account is not linked to a users record." },
        { status: 400 },
      );
    }

    const created = await prisma.leagues.create({
      data: {
        name: payload.name,
        status: payload.status,
        creator: String(account.user_id),
        price: payload.price,
        max_team: payload.maxTeam,
        min_player: payload.minPlayer,
        start_at: payload.startAt ? new Date(payload.startAt) : null,
        end_at: payload.endAt ? new Date(payload.endAt) : null,
        rules_json:
          payload.rulesJson === undefined
            ? undefined
            : payload.rulesJson === null
              ? Prisma.DbNull
              : (payload.rulesJson as Prisma.InputJsonValue),
      },
    });

    const creatorMap = await mapCreatorUsernames([created.creator]);
    const creatorUserId = Number.parseInt(created.creator, 10);

    return apiFromLegacy(
      {
        item: {
          id: created.id,
          name: created.name,
          status: created.status,
          startAt: created.start_at?.toISOString() ?? null,
          endAt: created.end_at?.toISOString() ?? null,
          creator: created.creator,
          creatorUsername: creatorMap.get(creatorUserId) ?? created.creator,
          price: created.price,
          maxTeam: created.max_team,
          minPlayer: created.min_player,
          totalTeams: 0,
          totalMatches: 0,
          rulesJson: created.rules_json,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Admin league create error:", error);
    return apiFromLegacy({ error: "Internal server error" }, { status: 500 });
  }
}

// AUTO_METHOD_NOT_ALLOWED
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
