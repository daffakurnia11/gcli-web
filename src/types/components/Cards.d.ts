export interface DiscordInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  serverName: string | null;
  inviteLink: string | null;
  onlineMembers: number;
  totalMembers: number;
}

export interface FiveMInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  serverName: string | null;
  connectUrl: string | null;
  onlinePlayers: number;
  totalPlayers: number;
}
