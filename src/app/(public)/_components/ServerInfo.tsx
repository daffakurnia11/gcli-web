"use client";

import Image from "next/image";

import { DiscordInfoCard, FiveMInfoCard } from "@/components";
import { useServerInfo } from "@/services/hooks/api/useServerInfo";

export default function ServerInfo() {
  const { discord, fivem } = useServerInfo();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=2070&auto=format&fit=crop"
          width={0}
          height={0}
          sizes="100vw"
          alt="Street Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-b from-primary-900 via-primary-900/60 to-primary-900" />
      </div>
      <div className="container mx-auto px-6 flex justify-center flex-wrap gap-8 z-10 relative">
        <FiveMInfoCard
          serverName={fivem.data?.data?.server.name ?? null}
          connectUrl={fivem.data?.data?.server.connect_url ?? null}
          onlinePlayers={fivem.data?.data?.member.online ?? 0}
          totalPlayers={fivem.data?.data?.member.total ?? 0}
        />
        <DiscordInfoCard
          serverName={discord.data?.data?.server.name ?? null}
          inviteLink={discord.data?.data?.server.invite_link ?? null}
          onlineMembers={discord.data?.data?.member.online ?? 0}
          totalMembers={discord.data?.data?.member.total ?? 0}
        />
      </div>
    </section>
  );
}
