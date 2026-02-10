declare global {
  type LeagueFormValues = {
    name: string;
    status: LeagueStatus;
    startAt: string;
    endAt: string;
    price: string;
    maxTeam: string;
    rulesJson: string;
  };

  type LeagueFormErrors = {
    [K in keyof LeagueFormValues]?: string;
  };
}

export {};
