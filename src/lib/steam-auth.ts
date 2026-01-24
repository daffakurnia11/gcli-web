import type { SteamProfile } from "@/types/api/Steam";

// Generate Steam OpenID login URL
export function getSteamAuthUrl(callbackUrl?: string): string {
  const baseUrl = "https://steamcommunity.com/openid/login";
  const returnUrl = new URL(`${process.env.NEXTAUTH_URL}/api/auth/callback/steam`);

  // Pass callbackUrl as a query parameter
  const safeCallbackUrl = sanitizeCallbackPath(callbackUrl);
  if (safeCallbackUrl) {
    returnUrl.searchParams.set("callbackUrl", safeCallbackUrl);
  }

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnUrl.toString(),
    "openid.realm": process.env.NEXTAUTH_URL || "",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `${baseUrl}?${params.toString()}`;
}

export function sanitizeCallbackPath(callbackUrl?: string | null): string | null {
  if (!callbackUrl) {
    return null;
  }
  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  return null;
}

// Extract Steam ID from OpenID response
export function extractSteamId(searchParams: URLSearchParams): string | null {
  const claimedId = searchParams.get("openid.claimed_id");
  if (!claimedId) return null;

  // Format: https://steamcommunity.com/openid/id/7656119XXXXXXXXX
  const parts = claimedId.split("/");
  return parts[parts.length - 1] || null;
}

/**
 * Convert SteamID64 to Steam Hex format for FiveM
 * Example: "76561198387594752" → "steam:11000013c5de980"
 */
export function steamId64ToHex(steamId64: string): string {
  try {
    const steamId64BigInt = BigInt(steamId64);
    const steamHex = steamId64BigInt.toString(16).toLowerCase();
    return `steam:${steamHex}`;
  } catch (error) {
    console.error("Error converting SteamID64 to hex:", error);
    return steamId64; // Fallback to original ID
  }
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
