declare global {
  type DiscordInviteUser = {
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
  };

  type DiscordInviteGuild = {
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
  };

  type DiscordInviteChannel = {
    id: string;
    type: number;
    name: string;
  };

  type DiscordInviteProfile = {
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
  };

  type DiscordInviteResponse = {
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
  };

  type DiscordServerInfo = {
    id: string | null;
    name: string | null;
    invite_link: string | null;
    invite_code: string | null;
    invite_expires: string | null;
  };

  type DiscordMemberCount = {
    total: number;
    online: number;
  };

  type DiscordProxyData = {
    server: DiscordServerInfo;
    member: DiscordMemberCount;
  };

  type DiscordProxyResponse = {
    status: number;
    message: string;
    raw: DiscordInviteResponse;
    data: DiscordProxyData;
  };
}

export {};
