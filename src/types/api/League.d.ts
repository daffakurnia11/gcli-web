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
    startAt: string | null;
    endAt: string | null;
    rulesJson?: unknown;
  };
}

export {};
