/**
 * Discord API Invite Response Types
 * Based on: https://discord.com/api/v10/invites/{code}?with_counts=true
 */

/**
 * Discord invite user object
 */
interface DiscordInviteUser {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | null;
  accent_color: number | null;
  global_name: string | null;
  avatar_decoration_data: {
    asset: string;
    sku_id: string;
    expires_at: string | null;
  } | null;
  collectibles: {
    nameplate: {
      sku_id: string;
      asset: string;
      label: string;
      palette: string;
    };
  } | null;
  display_name_styles: unknown[] | null;
  banner_color: string | null;
  clan: {
    identity_guild_id: string;
    identity_enabled: boolean;
    tag: string;
    badge: string;
  } | null;
  primary_guild: {
    identity_guild_id: string;
    identity_enabled: boolean;
    tag: string;
    badge: string;
  } | null;
}

/**
 * Discord guild object from invite response
 */
interface DiscordInviteGuild {
  id: string;
  name: string;
  splash: string | null;
  banner: string | null;
  description: string | null;
  icon: string | null;
  features: string[];
  verification_level: number;
  vanity_url_code: string | null;
  nsfw_level: number;
  nsfw: boolean;
  premium_subscription_count: number;
  premium_tier: number;
}

/**
 * Discord channel object from invite response
 */
interface DiscordInviteChannel {
  id: string;
  type: number;
  name: string;
}

/**
 * Discord profile object from invite response
 */
interface DiscordInviteProfile {
  id: string;
  name: string;
  icon_hash: string | null;
  member_count: number;
  online_count: number;
  description: string | null;
  banner_hash: string | null;
  game_application_ids: string[];
  game_activity: {
    [applicationId: string]: {
      activity_level: number;
      activity_score: number;
    };
  };
  tag: string | null;
  badge: number;
  badge_color_primary: string;
  badge_color_secondary: string;
  badge_hash: string | null;
  traits: unknown[];
  features: string[];
  visibility: number;
  custom_banner_hash: string | null;
  premium_subscription_count: number;
  premium_tier: number;
}

/**
 * Full Discord invite API response
 */
interface DiscordInviteResponse {
  type: number;
  code: string;
  inviter: DiscordInviteUser;
  expires_at: string | null;
  id: string;
  guild: DiscordInviteGuild;
  guild_id: string;
  channel: DiscordInviteChannel;
  profile: DiscordInviteProfile;
  approximate_member_count: number;
  approximate_presence_count: number;
}

/**
 * ====================================================================
 * Next.js Proxy API Response Types
 * ====================================================================
 */

/**
 * Server information from transformed response
 */
interface DiscordServerInfo {
  id: string | null;
  name: string | null;
  invite_link: string | null;
  invite_code: string | null;
  invite_expires: string | null;
}

/**
 * Member count information from transformed response
 */
interface DiscordMemberCount {
  total: number;
  online: number;
}

/**
 * Transformed Discord server info response
 */
interface DiscordProxyData {
  server: DiscordServerInfo;
  member: DiscordMemberCount;
}

/**
 * Combined API response with both raw Discord response and transformed data
 */
interface _DiscordProxyResponse {
  raw: DiscordInviteResponse;
  data: DiscordProxyData;
}

declare global {
  /**
   * Discord API Types
   */
  type DiscordInviteUser = DiscordInviteUser;
  type DiscordInviteGuild = DiscordInviteGuild;
  type DiscordInviteChannel = DiscordInviteChannel;
  type DiscordInviteProfile = DiscordInviteProfile;
  type DiscordInviteResponse = DiscordInviteResponse;

  /**
   * Next.js Proxy API Types
   */
  type DiscordServerInfo = DiscordServerInfo;
  type DiscordMemberCount = DiscordMemberCount;
  type DiscordProxyData = DiscordProxyData;
  type DiscordProxyResponse = DiscordProxyResponse;
}

export {};
