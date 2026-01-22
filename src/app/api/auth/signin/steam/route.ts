import { NextResponse } from "next/server";

import { getSteamAuthUrl } from "@/lib/steam-auth";

export async function GET() {
  const steamUrl = getSteamAuthUrl();
  return NextResponse.redirect(steamUrl);
}
