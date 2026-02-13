import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/services/api-guards";
import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { parseJson } from "@/services/json";
import { logger } from "@/services/logger";

type ParsedCharinfo = {
  firstname?: string;
  lastname?: string;
};

const parseLeagueId = async (
  params: Promise<{ id: string }>,
): Promise<number | null> => {
  const id = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
};

const mapCreatorUsername = async (creator: string) => {
  const userId = Number.parseInt(creator, 10);
  if (!Number.isInteger(userId) || userId < 1) {
    return creator;
  }

  const user = await prisma.users.findUnique({
    where: { userId },
    select: { username: true },
  });

  return user?.username ?? creator;
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

const buildCharacterName = (charinfoValue: string | null | undefined, fallback: string) => {
  const parsed = parseJson<ParsedCharinfo | null>(charinfoValue, null);
  const characterName = [parsed?.firstname, parsed?.lastname]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ")
    .trim();
  return characterName || fallback;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminSession();
    if (!admin.ok) {
      return admin.response;
    }

    const leagueId = await parseLeagueId(params);
    if (!leagueId) {
      return apiFromLegacy({ error: "Invalid league id." }, { status: 400 });
    }

    const league = await prisma.leagues.findUnique({
      where: { id: leagueId },
      select: {
        id: true,
        name: true,
        status: true,
        start_at: true,
        end_at: true,
        creator: true,
        price: true,
        max_team: true,
        min_player: true,
        rules_json: true,
      },
    });

    if (!league) {
      return apiFromLegacy({ error: "League not found." }, { status: 404 });
    }

    const [teams, matches, creatorUsername] = await Promise.all([
      prisma.league_teams.findMany({
        where: { league_id: leagueId },
        orderBy: [{ joined_at: "desc" }, { id: "desc" }],
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          joined_at: true,
        },
      }),
      prisma.league_matches.findMany({
        where: { league_id: leagueId },
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
          home_team: { select: { id: true, code: true, name: true } },
          away_team: { select: { id: true, code: true, name: true } },
          leagues: { select: { id: true, name: true, status: true } },
          league_match_results: {
            select: {
              home_score: true,
              away_score: true,
              result_status: true,
              winner_team_id: true,
            },
          },
        },
      }),
      mapCreatorUsername(league.creator),
    ]);

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
          select: { citizenid: true, name: true, charinfo: true },
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

    const standings: AdminLeagueTeamStatusItem[] = teams.map((team) => ({
      leagueId,
      leagueName: league.name,
      leagueStatus: league.status,
      teamId: team.id,
      teamCode: team.code,
      teamName: team.name,
      teamStatus: team.status,
      joinedAt: team.joined_at?.toISOString() ?? null,
      totalTeams: teams.length,
      standing: buildStanding({ teamId: team.id, matches }),
    }));

    const scheduleItems: AdminLeagueMatchScheduleItem[] = matches.map((match) => ({
      matchId: match.id,
      leagueId,
      leagueName: league.name,
      leagueStatus: league.status,
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

    return apiFromLegacy(
      {
        league: {
          id: league.id,
          name: league.name,
          status: league.status,
          startAt: league.start_at?.toISOString() ?? null,
          endAt: league.end_at?.toISOString() ?? null,
          price: league.price,
          maxTeam: league.max_team,
          minPlayer: league.min_player,
          creator: league.creator,
          creatorUsername,
          rulesJson: league.rules_json,
        },
        summary: {
          totalTeams: standings.length,
          totalMatches: scheduleItems.length,
          scheduled: scheduleItems.filter((item) => item.matchStatus.toLowerCase() === "scheduled")
            .length,
          ongoing: scheduleItems.filter((item) => item.matchStatus.toLowerCase() === "ongoing")
            .length,
          finished: scheduleItems.filter((item) => item.matchStatus.toLowerCase() === "finished")
            .length,
          canceled: scheduleItems.filter((item) => item.matchStatus.toLowerCase() === "canceled")
            .length,
        },
        standings,
        matches: scheduleItems,
      } satisfies AdminLeagueDetailResponse,
      { status: 200 },
    );
  } catch (error) {
    logger.error("Admin league detail combined fetch error:", error);
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
