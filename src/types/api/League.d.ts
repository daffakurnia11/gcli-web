declare global {
  type LeagueStatus = "upcoming" | "active" | "finished";

  type AdminLeagueItem = {
    id: number;
    name: string;
    status: LeagueStatus;
    startAt: string | null;
    endAt: string | null;
    creator: string;
    creatorUsername: string;
    price: number;
    maxTeam: number;
    minPlayer: number;
    totalTeams: number;
    totalMatches: number;
    rulesJson?: unknown;
  };

  type AdminLeagueListResponse = {
    query: string;
    status: LeagueStatus | null;
    items: AdminLeagueItem[];
    pagination: ApiPaginationMeta;
  };

  type AdminLeagueUpsertPayload = {
    name: string;
    status: LeagueStatus;
    price: number;
    maxTeam: number;
    minPlayer: number;
    startAt: string | null;
    endAt: string | null;
    rulesJson?: unknown;
  };

  type LeagueJoinListItem = {
    id: number;
    name: string;
    status: LeagueStatus;
    startAt: string | null;
    endAt: string | null;
    price: number;
    maxTeam: number;
    rulesJson?: unknown;
    alreadyJoined: boolean;
  };

  type LeagueJoinListResponse = {
    teamCode: string;
    teamName: string;
    leagues: LeagueJoinListItem[];
  };

  type LeagueJoinCheckoutPayload = {
    leagueId: number;
  };

  type LeagueJoinCheckoutResponse = {
    message: string;
    invoiceNumber: string;
    checkoutUrl: string | null;
    league: {
      id: number;
      name: string;
      price: number;
    };
    paymentGatewayResponse: unknown;
  };

  type LeagueTeamStanding = {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    points: number;
  };

  type LeagueTeamStatusItem = {
    leagueId: number;
    leagueName: string;
    leagueStatus: LeagueStatus | string;
    teamId: number;
    teamCode: string;
    teamName: string;
    teamStatus: string;
    joinedAt: string | null;
    totalTeams: number;
    standing: LeagueTeamStanding;
  };

  type LeagueTeamStatusResponse = {
    teamCode: string;
    teamName: string;
    query: string;
    status: string | null;
    summary: {
      totalLeagues: number;
      totalPoints: number;
      totalPlayed: number;
      activeLeagues: number;
    };
    items: LeagueTeamStatusItem[];
    pagination: ApiPaginationMeta;
  };

  type LeagueRosterPlayer = {
    citizenId: string;
    playerName: string | null;
    characterName: string;
  };

  type LeagueMatchScheduleItem = {
    matchId: number;
    leagueId: number;
    leagueName: string;
    leagueStatus: LeagueStatus | string;
    round: number | null;
    stage: string | null;
    zone: string | null;
    scheduledAt: string | null;
    matchStatus: string;
    homeTeam: {
      id: number;
      code: string;
      name: string;
    };
    awayTeam: {
      id: number;
      code: string;
      name: string;
    };
    myTeamId: number;
    mySide: "home" | "away";
    opponentTeam: {
      id: number;
      code: string;
      name: string;
    };
    result: {
      homeScore: number;
      awayScore: number;
      resultStatus: string;
      winnerTeamId: number | null;
    } | null;
    rosters: {
      home: LeagueRosterPlayer[];
      away: LeagueRosterPlayer[];
    };
  };

  type LeagueScheduleResponse = {
    teamCode: string;
    teamName: string;
    query: string;
    status: string | null;
    summary: {
      totalMatches: number;
      scheduled: number;
      ongoing: number;
      finished: number;
      canceled: number;
    };
    items: LeagueMatchScheduleItem[];
    pagination: ApiPaginationMeta;
  };

  type AdminLeagueTeamStatusItem = {
    leagueId: number;
    leagueName: string;
    leagueStatus: LeagueStatus | string;
    teamId: number;
    teamCode: string;
    teamName: string;
    teamStatus: string;
    joinedAt: string | null;
    totalTeams: number;
    standing: LeagueTeamStanding;
  };

  type AdminLeagueStatusResponse = {
    query: string;
    status: string | null;
    summary: {
      totalLeagues: number;
      totalTeams: number;
      activeTeams: number;
    };
    items: AdminLeagueTeamStatusItem[];
    pagination: ApiPaginationMeta;
  };

  type AdminLeagueMatchScheduleItem = {
    matchId: number;
    leagueId: number;
    leagueName: string;
    leagueStatus: LeagueStatus | string;
    round: number | null;
    stage: string | null;
    zone: string | null;
    scheduledAt: string | null;
    matchStatus: string;
    homeTeam: {
      id: number;
      code: string;
      name: string;
    };
    awayTeam: {
      id: number;
      code: string;
      name: string;
    };
    result: {
      homeScore: number;
      awayScore: number;
      resultStatus: string;
      winnerTeamId: number | null;
    } | null;
    rosters: {
      home: LeagueRosterPlayer[];
      away: LeagueRosterPlayer[];
    };
  };

  type AdminLeagueScheduleResponse = {
    query: string;
    status: string | null;
    summary: {
      totalMatches: number;
      scheduled: number;
      ongoing: number;
      finished: number;
      canceled: number;
    };
    items: AdminLeagueMatchScheduleItem[];
    pagination: ApiPaginationMeta;
  };

  type AdminLeagueDetailResponse = {
    league: {
      id: number;
      name: string;
      status: LeagueStatus | string;
      startAt: string | null;
      endAt: string | null;
      price: number;
      maxTeam: number;
      minPlayer: number;
      creator: string;
      creatorUsername: string;
      rulesJson?: unknown;
    };
    summary: {
      totalTeams: number;
      totalMatches: number;
      scheduled: number;
      ongoing: number;
      finished: number;
      canceled: number;
    };
    standings: AdminLeagueTeamStatusItem[];
    matches: AdminLeagueMatchScheduleItem[];
  };
}

export {};
