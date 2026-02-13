import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";

type ParsedCharinfo = {
  firstname?: string;
  lastname?: string;
};

const parsePositiveInt = (
  value: string | null,
  fallback: number,
  max?: number,
) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  if (max && parsed > max) {
    return max;
  }
  return parsed;
};

const buildCharacterName = (charinfoValue: string | null | undefined, fallback: string) => {
  const parsed = parseJson<ParsedCharinfo | null>(charinfoValue, null);
  const characterName = [parsed?.firstname, parsed?.lastname]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ")
    .trim();
  return characterName || fallback;
};

export async function GET(request: Request) {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") ?? "").trim().toLowerCase();
    const status = (searchParams.get("status") ?? "").trim().toLowerCase() || null;
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 10, 100);

    const matches = await prisma.league_matches.findMany({
      orderBy: [{ scheduled_at: "asc" }, { id: "asc" }],
      select: {
        id: true,
        league_id: true,
        scheduled_at: true,
        round: true,
        stage: true,
        zone: true,
        status: true,
        home_team_id: true,
        away_team_id: true,
        home_team: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        away_team: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        leagues: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        league_match_results: {
          select: {
            home_score: true,
            away_score: true,
            result_status: true,
            winner_team_id: true,
          },
        },
      },
    });

    const matchIds = matches.map((match) => match.id);
    const rosters = matchIds.length > 0
      ? await prisma.league_match_roster_players.findMany({
          where: { match_id: { in: matchIds } },
          select: {
            match_id: true,
            team_id: true,
            citizenid: true,
          },
          orderBy: [{ match_id: "asc" }, { id: "asc" }],
        })
      : [];

    const citizenIds = Array.from(new Set(rosters.map((roster) => roster.citizenid)));
    const players = citizenIds.length > 0
      ? await prisma.players.findMany({
          where: { citizenid: { in: citizenIds } },
          select: {
            citizenid: true,
            name: true,
            charinfo: true,
          },
        })
      : [];
    const playerMap = new Map(players.map((player) => [player.citizenid, player]));

    const rosterMap = new Map<string, LeagueRosterPlayer[]>();
    for (const roster of rosters) {
      const key = `${roster.match_id}:${roster.team_id}`;
      const profile = playerMap.get(roster.citizenid);
      const playerName = profile?.name ?? null;
      const characterName = buildCharacterName(profile?.charinfo, playerName || roster.citizenid);
      const item: LeagueRosterPlayer = {
        citizenId: roster.citizenid,
        playerName,
        characterName,
      };
      const existing = rosterMap.get(key) ?? [];
      existing.push(item);
      rosterMap.set(key, existing);
    }

    const rawItems: AdminLeagueMatchScheduleItem[] = matches.map((match) => ({
      matchId: match.id,
      leagueId: match.league_id,
      leagueName: match.leagues.name,
      leagueStatus: match.leagues.status,
      round: match.round,
      stage: match.stage,
      zone: match.zone,
      scheduledAt: match.scheduled_at?.toISOString() ?? null,
      matchStatus: match.status,
      homeTeam: {
        id: match.home_team.id,
        code: match.home_team.code,
        name: match.home_team.name,
      },
      awayTeam: {
        id: match.away_team.id,
        code: match.away_team.code,
        name: match.away_team.name,
      },
      result: match.league_match_results
        ? {
            homeScore: match.league_match_results.home_score,
            awayScore: match.league_match_results.away_score,
            resultStatus: match.league_match_results.result_status,
            winnerTeamId: match.league_match_results.winner_team_id,
          }
        : null,
      rosters: {
        home: rosterMap.get(`${match.id}:${match.home_team_id}`) ?? [],
        away: rosterMap.get(`${match.id}:${match.away_team_id}`) ?? [],
      },
    }));

    const filteredItems = rawItems.filter((item) => {
      if (status && item.matchStatus.toLowerCase() !== status) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.leagueName.toLowerCase().includes(query) ||
        item.homeTeam.name.toLowerCase().includes(query) ||
        item.awayTeam.name.toLowerCase().includes(query) ||
        item.homeTeam.code.toLowerCase().includes(query) ||
        item.awayTeam.code.toLowerCase().includes(query) ||
        (item.stage ?? "").toLowerCase().includes(query) ||
        (item.zone ?? "").toLowerCase().includes(query)
      );
    });

    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(page, totalPages);
    const offset = (currentPage - 1) * limit;
    const items = filteredItems.slice(offset, offset + limit);

    return apiFromLegacy(
      {
        query,
        status,
        summary: {
          totalMatches: filteredItems.length,
          scheduled: filteredItems.filter(
            (item) => item.matchStatus.toLowerCase() === "scheduled",
          )
            .length,
          ongoing: filteredItems.filter(
            (item) => item.matchStatus.toLowerCase() === "ongoing",
          )
            .length,
          finished: filteredItems.filter(
            (item) => item.matchStatus.toLowerCase() === "finished",
          )
            .length,
          canceled: filteredItems.filter(
            (item) => item.matchStatus.toLowerCase() === "canceled",
          )
            .length,
        },
        items,
        pagination: {
          currentPage,
          itemsPerPage: limit,
          totalItems,
          totalPages,
        },
      } satisfies AdminLeagueScheduleResponse,
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin league schedule fetch error:", error);
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
