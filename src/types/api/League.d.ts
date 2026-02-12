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
}

export {};
