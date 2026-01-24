import { NextRequest, NextResponse } from "next/server";

import { getSteamAuthUrl } from "@/lib/steam-auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get("callbackUrl") || undefined;

  const steamUrl = getSteamAuthUrl(callbackUrl);
  return NextResponse.redirect(steamUrl);
}
