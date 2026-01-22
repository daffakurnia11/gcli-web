export interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull: string;
}

// Generate Steam OpenID login URL
export function getSteamAuthUrl(): string {
  const baseUrl = "https://steamcommunity.com/openid/login";
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
    "openid.realm": process.env.NEXTAUTH_URL || "",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `${baseUrl}?${params.toString()}`;
}

// Extract Steam ID from OpenID response
export function extractSteamId(searchParams: URLSearchParams): string | null {
  const claimedId = searchParams.get("openid.claimed_id");
  if (!claimedId) return null;

  // Format: https://steamcommunity.com/openid/id/7656119XXXXXXXXX
  const parts = claimedId.split("/");
  return parts[parts.length - 1] || null;
}

// Fetch Steam user profile using Web API
export async function fetchSteamProfile(steamId: string): Promise<SteamProfile | null> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    console.error("STEAM_API_KEY is not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
    );

    if (!response.ok) {
      console.error("Steam API request failed:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data.response?.players?.[0]) {
      console.error("No player data found");
      return null;
    }

    return data.response.players[0];
  } catch (error) {
    console.error("Error fetching Steam profile:", error);
    return null;
  }
}
