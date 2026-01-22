import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

import { extractSteamId, fetchSteamProfile } from "@/lib/steam-auth";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "");

// Create a JWT token for the user
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createToken(steamId: string, profile: any) {
  const token = await new SignJWT({
    sub: steamId,
    name: profile.personaname,
    picture: profile.avatarfull,
    provider: "steam",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return token;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Extract Steam ID from OpenID response
  const steamId = extractSteamId(searchParams);

  if (!steamId) {
    return NextResponse.redirect(new URL("/auth?error=SteamSignInError", request.url));
  }

  // Fetch Steam profile
  const profile = await fetchSteamProfile(steamId);

  if (!profile) {
    return NextResponse.redirect(new URL("/auth?error=SteamProfileError", request.url));
  }

  // Create JWT token
  const token = await createToken(steamId, profile);

  // Create response and set cookie
  const response = NextResponse.redirect(new URL("/", request.url));

  // Set the next-auth session token cookie
  response.cookies.set({
    name: "next-auth.session-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
