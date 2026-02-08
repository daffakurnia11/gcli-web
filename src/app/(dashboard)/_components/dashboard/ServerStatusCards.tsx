"use client";

import { DiscordInfoCard, FiveMInfoCard } from "@/components";
import { useServerInfo } from "@/services/hooks/api/useServerInfo";

export function ServerStatusCards() {
  const { discord, fivem } = useServerInfo();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {fivem.data?.data && (
        <FiveMInfoCard
          serverName={fivem.data.data.server.name}
          connectUrl={fivem.data.data.server.connect_url}
          onlinePlayers={fivem.data.data.member.online}
          totalPlayers={fivem.data.data.member.total}
          className="max-w-full!"
        />
      )}
      {discord.data?.data && (
        <DiscordInfoCard
          serverName={discord.data.data.server.name}
          inviteLink={discord.data.data.server.invite_link}
          onlineMembers={discord.data.data.member.online}
          totalMembers={discord.data.data.member.total}
          className="max-w-full!"
        />
      )}
    </div>
  );
}
