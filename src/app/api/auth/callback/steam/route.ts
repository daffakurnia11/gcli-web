import { NextRequest, NextResponse } from "next/server";

import {
  extractSteamId,
  fetchSteamProfile,
  sanitizeCallbackPath,
  steamId64ToHex,
} from "@/lib/steam-auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Extract callback URL from query parameters
  const callbackUrl = sanitizeCallbackPath(searchParams.get("callbackUrl"));

  // Extract Steam ID from OpenID response
  const steamId = extractSteamId(searchParams);

  if (!steamId) {
    console.error("Failed to extract Steam ID");
    return NextResponse.redirect(new URL("/auth?error=SteamSignInError", request.url));
  }

  // Fetch Steam profile
  const profile = await fetchSteamProfile(steamId);

  if (!profile) {
    console.error("Failed to fetch Steam profile");
    return NextResponse.redirect(new URL("/auth?error=SteamProfileError", request.url));
  }

  // Convert SteamID64 to Steam Hex format for FiveM
  const steamHex = steamId64ToHex(profile.steamid);

  // Create redirect URL with Steam data in query parameters
  const redirectUrl = new URL(callbackUrl || "/", request.url);

  // Add Steam connection data as URL parameter (base64 encoded)
  const steamData = {
    id: profile.steamid,
    steamHex,
    username: profile.personaname,
    image: profile.avatarfull,
  };

  const steamDataEncoded = Buffer.from(JSON.stringify(steamData)).toString("base64");
  redirectUrl.searchParams.set("steam_data", steamDataEncoded);

  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
