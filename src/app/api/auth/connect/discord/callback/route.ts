import { apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";
import { NextResponse } from "@/services/next-response";

const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
const DISCORD_USER_URL = "https://discord.com/api/users/@me";

type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

const parseState = (state: string | null) => {
  if (!state) {
    return { callbackUrl: "/auth/setup?step=3" };
  }
  try {
    const raw = Buffer.from(state, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as { callbackUrl?: string };
    return { callbackUrl: parsed.callbackUrl || "/auth/setup?step=3" };
  } catch {
    return { callbackUrl: "/auth/setup?step=3" };
  }
};

const redirectWithError = (
  callbackUrl: string,
  error: string,
  requestUrl: string,
) => {
  const url = new URL(callbackUrl, requestUrl);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url.toString());
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const { callbackUrl } = parseState(searchParams.get("state"));

  if (!code) {
    return redirectWithError(callbackUrl, "DiscordConnectError", request.url);
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return redirectWithError(callbackUrl, "DiscordConfigError", request.url);
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/connect/discord/callback`;

  try {
    const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      return redirectWithError(callbackUrl, "DiscordTokenError", request.url);
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      token_type?: string;
    };

    if (!tokenData.access_token) {
      return redirectWithError(callbackUrl, "DiscordTokenError", request.url);
    }

    const userResponse = await fetch(DISCORD_USER_URL, {
      headers: {
        Authorization: `${tokenData.token_type ?? "Bearer"} ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return redirectWithError(callbackUrl, "DiscordProfileError", request.url);
    }

    const user = (await userResponse.json()) as DiscordUser;
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`;

    const payload = {
      id: `discord:${user.id}`,
      username: user.username || "Discord User",
      name: user.global_name ?? null,
      email: user.email ?? null,
      image: avatarUrl,
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      request.url;
    const redirectUrl = new URL(callbackUrl, baseUrl);
    redirectUrl.searchParams.set("discord_data", encoded);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error("Discord connect error:", error);
    return redirectWithError(callbackUrl, "DiscordConnectError", request.url);
  }
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
