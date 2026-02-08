import axios from "axios";

import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { logger } from "@/services/logger";

const DISCORD_API_BASE =
  process.env.DISCORD_API_BASE_URL || "https://discord.com/api/v10";
const DISCORD_INVITE_CODE = process.env.DISCORD_API_INVITE_CODE;

export async function GET() {
  try {
    if (!DISCORD_INVITE_CODE) {
      return apiFromLegacy(
        { error: "Discord invite code not configured" },
        { status: 500 },
      );
    }

    // Call Discord invite API with counts
    const response = await axios.get<DiscordInviteResponse>(
      `${DISCORD_API_BASE}/invites/${DISCORD_INVITE_CODE}`,
      {
        params: {
          with_counts: "true",
        },
      },
    );

    const data: DiscordInviteResponse = response.data;

    // Transform the response to the desired format
    const transformedResponse: DiscordProxyData = {
      server: {
        id: data.guild?.id || data.guild_id || null,
        name: data.guild?.name || null,
        invite_link: `https://discord.gg/${data.code}`,
        invite_code: data.code || null,
        invite_expires: data.expires_at || null,
      },
      member: {
        total: data.approximate_member_count || data.profile?.member_count || 0,
        online:
          data.approximate_presence_count || data.profile?.online_count || 0,
      },
    };

    // Return both original Discord API response and transformed data
    const proxyResponse: DiscordProxyResponse = {
      status: 200,
      message: "Discord invite info fetched successfully",
      raw: data,
      data: transformedResponse,
    };

    return apiFromLegacy(proxyResponse, { status: 200 });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data || {
        error: "Discord invite API request failed",
      };

      return apiFromLegacy(data, { status });
    }

    logger.error("Discord info proxy error:", error);
    return apiFromLegacy(
      { error: "Internal server error" },
      { status: 500 },
    );
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
