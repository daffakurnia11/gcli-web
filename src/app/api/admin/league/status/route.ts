import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

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

const buildStanding = (params: {
  teamId: number;
  matches: Array<{
    home_team_id: number;
    away_team_id: number;
    status: string;
    league_match_results: {
      home_score: number;
      away_score: number;
      result_status: string;
      winner_team_id: number | null;
    } | null;
  }>;
}): LeagueTeamStanding => {
  const standing: LeagueTeamStanding = {
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  };

  for (const match of params.matches) {
    const result = match.league_match_results;
    if (!result || match.status.trim().toLowerCase() !== "finished") {
      continue;
    }

    const isHome = match.home_team_id === params.teamId;
    const isAway = match.away_team_id === params.teamId;
    if (!isHome && !isAway) {
      continue;
    }

    const resultStatus = result.result_status.trim().toLowerCase();
    if (resultStatus === "cancelled" || resultStatus === "canceled") {
      continue;
    }

    standing.matchesPlayed += 1;
    const goalsFor = isHome ? result.home_score : result.away_score;
    const goalsAgainst = isHome ? result.away_score : result.home_score;
    standing.goalsFor += goalsFor;
    standing.goalsAgainst += goalsAgainst;

    if (resultStatus === "draw") {
      standing.draws += 1;
      standing.points += 1;
      continue;
    }

    const didWin =
      result.winner_team_id === params.teamId ||
      (resultStatus === "home_win" && isHome) ||
      (resultStatus === "away_win" && isAway);

    if (didWin) {
      standing.wins += 1;
      standing.points += 3;
    } else {
      standing.losses += 1;
    }
  }

  standing.goalDiff = standing.goalsFor - standing.goalsAgainst;
  return standing;
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

    const teams = await prisma.league_teams.findMany({
      orderBy: [{ joined_at: "desc" }, { id: "desc" }],
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        joined_at: true,
        league_id: true,
        leagues: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    const leagueIds = teams.map((team) => team.league_id);
    const teamIds = teams.map((team) => team.id);
    const [teamCounts, matches] = await Promise.all([
      leagueIds.length > 0
        ? prisma.league_teams.groupBy({
            by: ["league_id"],
            where: { league_id: { in: leagueIds } },
            _count: { _all: true },
          })
        : Promise.resolve([]),
      teamIds.length > 0
        ? prisma.league_matches.findMany({
            where: {
              league_id: { in: leagueIds },
              OR: [{ home_team_id: { in: teamIds } }, { away_team_id: { in: teamIds } }],
            },
            select: {
              league_id: true,
              home_team_id: true,
              away_team_id: true,
              status: true,
              league_match_results: {
                select: {
                  home_score: true,
                  away_score: true,
                  result_status: true,
                  winner_team_id: true,
                },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    const teamCountMap = new Map(teamCounts.map((entry) => [entry.league_id, entry._count._all]));

    const rawItems: AdminLeagueTeamStatusItem[] = teams.map((team) => {
      const leagueMatches = matches.filter((match) => match.league_id === team.league_id);
      return {
        leagueId: team.league_id,
        leagueName: team.leagues.name,
        leagueStatus: team.leagues.status,
        teamId: team.id,
        teamCode: team.code,
        teamName: team.name,
        teamStatus: team.status,
        joinedAt: team.joined_at?.toISOString() ?? null,
        totalTeams: teamCountMap.get(team.league_id) ?? 0,
        standing: buildStanding({ teamId: team.id, matches: leagueMatches }),
      };
    });

    const filteredItems = rawItems.filter((item) => {
      if (status && item.leagueStatus.toLowerCase() !== status) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.leagueName.toLowerCase().includes(query) ||
        item.teamCode.toLowerCase().includes(query) ||
        item.teamName.toLowerCase().includes(query)
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
          totalLeagues: new Set(filteredItems.map((item) => item.leagueId)).size,
          totalTeams: filteredItems.length,
          activeTeams: filteredItems.filter((item) => item.teamStatus.toLowerCase() === "active")
            .length,
        },
        items,
        pagination: {
          currentPage,
          itemsPerPage: limit,
          totalItems,
          totalPages,
        },
      } satisfies AdminLeagueStatusResponse,
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin league status fetch error:", error);
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
