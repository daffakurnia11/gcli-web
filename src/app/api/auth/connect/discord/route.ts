import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { NextResponse } from "@/services/next-response";

const DISCORD_AUTHORIZE_URL = "https://discord.com/api/oauth2/authorize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get("callbackUrl") || "/auth/setup?step=3";

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return apiFromLegacy(
      { error: "Discord client ID is not configured" },
      { status: 500 },
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/connect/discord/callback`;
  const state = Buffer.from(JSON.stringify({ callbackUrl })).toString(
    "base64url",
  );

  const url = new URL(DISCORD_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify email");
  url.searchParams.set("state", state);

  return NextResponse.redirect(url.toString());
}

// AUTO_METHOD_NOT_ALLOWED
export function POST() {
  return apiMethodNotAllowed();
}

export function PUT() {
  return apiMethodNotAllowed();
}

export function PATCH() {
  return apiMethodNotAllowed();
}

export function DELETE() {
  return apiMethodNotAllowed();
}

export function OPTIONS() {
  return apiMethodNotAllowed();
}

export function HEAD() {
  return apiMethodNotAllowed();
}
