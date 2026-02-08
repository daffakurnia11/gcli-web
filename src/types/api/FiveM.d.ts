declare global {
  type FiveMVars = {
    gamename: string;
    locale: string;
    onesync_enabled: string;
    sv_disableClientReplays: string;
    sv_enforceGameBuild: string;
    sv_enhancedHostSupport: string;
    sv_lan: string;
    sv_licenseKeyToken: string;
    sv_maxClients: string;
    sv_poolSizesIncrease: string;
    sv_projectDesc: string;
    sv_projectName: string;
    sv_pureLevel: string;
    sv_replaceExeToSwitchBuilds: string;
    sv_scriptHookAllowed: string;
    tags: string;
    [key: string]: string;
  };

  type FiveMInfoResponse = {
    enhancedHostSupport: boolean;
    icon: string;
    requestSteamTicket: string;
    resources: string[];
    server: string;
    vars: FiveMVars;
    version: number;
  };

  type FiveMPlayer = {
    id: number;
    name: string;
    ping: number;
    [key: string]: unknown;
  };

  type FiveMPlayersResponse = FiveMPlayer[];

  type FiveMServerInfo = {
    name: string | null;
    desc: string | null;
    connect_url: string | null;
  };

  type FiveMMemberCount = {
    total: number;
    online: number;
  };

  type FiveMProxyData = {
    server: FiveMServerInfo;
    member: FiveMMemberCount;
  };

  type FiveMProxyResponse = {
    status: number;
    message: string;
    raw: {
      info: FiveMInfoResponse;
      players: FiveMPlayersResponse;
    };
    data: FiveMProxyData;
  };
}

export {};
