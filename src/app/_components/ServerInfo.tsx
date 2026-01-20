import Image from "next/image";

import { DiscordInfoCard, FiveMInfoCard } from "@/components";

async function getDiscordInfo(): Promise<DiscordProxyData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/info/discord`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data: DiscordProxyResponse = await response.json();
    return data.data as DiscordProxyData;
  } catch {
    return null;
  }
}

async function getFiveMInfo(): Promise<FiveMProxyData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/info/fivem`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data: FiveMProxyResponse = await response.json();
    return data.data as FiveMProxyData;
  } catch {
    return null;
  }
}

export default async function ServerInfo() {
  const [discordData, fivemData] = await Promise.all([
    getDiscordInfo(),
    getFiveMInfo(),
  ]);

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
          serverName={fivemData?.server.name ?? null}
          connectUrl={fivemData?.server.connect_url ?? null}
          onlinePlayers={fivemData?.member.online ?? 0}
          totalPlayers={fivemData?.member.total ?? 0}
        />
        <DiscordInfoCard
          serverName={discordData?.server.name ?? null}
          inviteLink={discordData?.server.invite_link ?? null}
          onlineMembers={discordData?.member.online ?? 0}
          totalMembers={discordData?.member.total ?? 0}
        />
      </div>
    </section>
  );
}
