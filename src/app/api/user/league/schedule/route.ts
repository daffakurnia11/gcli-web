import { prisma } from "@/lib/prisma";
import { resolveCitizenIdForAccount } from "@/lib/userCitizenId";
import { requireAccountId } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";

type ParsedGang = {
  name?: string;
  label?: string;
};

type ParsedCharinfo = {
  firstname?: string;
  lastname?: string;
};

const resolveGangContext = async (request: Request) => {
  const authz = await requireAccountId(request);
  if (!authz.ok) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const resolved = await resolveCitizenIdForAccount(authz.accountId);
  if (!resolved?.citizenId) {
    return {
      error: "No linked character was found for this account.",
      status: 400 as const,
    };
  }

  const player = await prisma.players.findUnique({
    where: { citizenid: resolved.citizenId },
    select: { gang: true },
  });

  const parsedGang = parseJson<ParsedGang | null>(player?.gang, null);
  const gangName = parsedGang?.name?.toLowerCase();
  const gangLabel = parsedGang?.label?.trim() || parsedGang?.name?.trim() || "Team";

  if (!gangName || gangName === "none") {
    return {
      error: "You are not currently assigned to a team.",
      status: 403 as const,
    };
  }

  return {
    gangName,
    gangLabel,
  };
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
    const context = await resolveGangContext(request);
    if ("error" in context) {
      return apiFromLegacy({ error: context.error }, { status: context.status });
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") ?? "").trim().toLowerCase();
    const status = (searchParams.get("status") ?? "").trim().toLowerCase() || null;
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), 10, 100);

    const teamEntries = await prisma.league_teams.findMany({
      where: { code: context.gangName },
      select: {
        id: true,
        league_id: true,
      },
    });

    const teamIds = teamEntries.map((entry) => entry.id);
    const myTeamIdByLeague = new Map(teamEntries.map((entry) => [entry.league_id, entry.id]));

    if (teamIds.length === 0) {
      return apiFromLegacy(
        {
          teamCode: context.gangName,
          teamName: context.gangLabel,
          query,
          status,
          summary: {
            totalMatches: 0,
            scheduled: 0,
            ongoing: 0,
            finished: 0,
            canceled: 0,
          },
          items: [],
          pagination: {
            currentPage: 1,
            itemsPerPage: limit,
            totalItems: 0,
            totalPages: 1,
          },
        } satisfies LeagueScheduleResponse,
        { status: 200 },
      );
    }

    const matches = await prisma.league_matches.findMany({
      where: {
        OR: [{ home_team_id: { in: teamIds } }, { away_team_id: { in: teamIds } }],
      },
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
    const rosters = matchIds.length
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

    const rosterCitizenIds = Array.from(new Set(rosters.map((roster) => roster.citizenid)));
    const playerRows = rosterCitizenIds.length
      ? await prisma.players.findMany({
          where: { citizenid: { in: rosterCitizenIds } },
          select: {
            citizenid: true,
            name: true,
            charinfo: true,
          },
        })
      : [];
    const playerMap = new Map(playerRows.map((player) => [player.citizenid, player]));

    const rosterMap = new Map<string, LeagueRosterPlayer[]>();
    for (const roster of rosters) {
      const rosterKey = `${roster.match_id}:${roster.team_id}`;
      const profile = playerMap.get(roster.citizenid);
      const playerName = profile?.name ?? null;
      const characterName = buildCharacterName(profile?.charinfo, playerName || roster.citizenid);
      const item: LeagueRosterPlayer = {
        citizenId: roster.citizenid,
        playerName,
        characterName,
      };

      const existing = rosterMap.get(rosterKey) ?? [];
      existing.push(item);
      rosterMap.set(rosterKey, existing);
    }

    const rawItems: LeagueMatchScheduleItem[] = matches.map((match) => {
      const myTeamId = myTeamIdByLeague.get(match.league_id) ?? match.home_team_id;
      const mySide: "home" | "away" = match.home_team_id === myTeamId ? "home" : "away";
      const opponentTeam = mySide === "home" ? match.away_team : match.home_team;

      return {
        matchId: match.id,
        leagueId: match.leagues.id,
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
        myTeamId,
        mySide,
        opponentTeam: {
          id: opponentTeam.id,
          code: opponentTeam.code,
          name: opponentTeam.name,
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
      };
    });

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

    const summary = {
      totalMatches: filteredItems.length,
      scheduled: filteredItems.filter((item) => item.matchStatus.toLowerCase() === "scheduled")
        .length,
      ongoing: filteredItems.filter((item) => item.matchStatus.toLowerCase() === "ongoing")
        .length,
      finished: filteredItems.filter((item) => item.matchStatus.toLowerCase() === "finished")
        .length,
      canceled: filteredItems.filter((item) => item.matchStatus.toLowerCase() === "canceled")
        .length,
    };

    return apiFromLegacy(
      {
        teamCode: context.gangName,
        teamName: context.gangLabel,
        query,
        status,
        summary,
        items,
        pagination: {
          currentPage,
          itemsPerPage: limit,
          totalItems,
          totalPages,
        },
      } satisfies LeagueScheduleResponse,
      { status: 200 },
    );
  } catch (error) {
    logger.error("User league schedule fetch error:", error);
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
