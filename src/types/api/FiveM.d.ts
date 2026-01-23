/**
 * FiveM Server API Response Types
 * Based on: http://server:port/info.json and /players.json
 */

/**
 * FiveM server variables from info.json
 */
interface FiveMVars {
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
}

/**
 * FiveM info.json response
 */
interface FiveMInfoResponse {
  enhancedHostSupport: boolean;
  icon: string;
  requestSteamTicket: string;
  resources: string[];
  server: string;
  vars: FiveMVars;
  version: number;
}

/**
 * FiveM player object from players.json
 */
interface FiveMPlayer {
  id: number;
  name: string;
  ping: number;
  [key: string]: unknown;
}

/**
 * FiveM players.json response
 */
type FiveMPlayersResponse = FiveMPlayer[];

/**
 * ====================================================================
 * Next.js Proxy API Response Types
 * ====================================================================
 */

/**
 * FiveM server information from transformed response
 */
interface FiveMServerInfo {
  name: string | null;
  desc: string | null;
  connect_url: string | null;
}

/**
 * FiveM member count information from transformed response
 */
interface FiveMMemberCount {
  total: number;
  online: number;
}

/**
 * Transformed FiveM server info response
 */
interface FiveMProxyData {
  server: FiveMServerInfo;
  member: FiveMMemberCount;
}

/**
 * Combined API response with both raw FiveM responses and transformed data
 */
interface _FiveMProxyResponse {
  status: number;
  message: string;
  raw: {
    info: FiveMInfoResponse;
    players: FiveMPlayersResponse;
  };
  data: FiveMProxyData;
}

declare global {
  /**
   * FiveM API Types
   */
  type FiveMVars = FiveMVars;
  type FiveMInfoResponse = FiveMInfoResponse;
  type FiveMPlayer = FiveMPlayer;
  type FiveMPlayersResponse = FiveMPlayersResponse;

  /**
   * Next.js Proxy API Types
   */
  type FiveMServerInfo = FiveMServerInfo;
  type FiveMMemberCount = FiveMMemberCount;
  type FiveMProxyData = FiveMProxyData;
  type FiveMProxyResponse = FiveMProxyResponse;
}

export {};
