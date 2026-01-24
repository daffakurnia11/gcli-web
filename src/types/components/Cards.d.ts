export interface DiscordInfoCardProps {
  serverName: string | null;
  inviteLink: string | null;
  onlineMembers: number;
  totalMembers: number;
}

export interface FiveMInfoCardProps {
  serverName: string | null;
  connectUrl: string | null;
  onlinePlayers: number;
  totalPlayers: number;
}
