import { redirect } from "next/navigation";

import {
  RegistrationCleanup,
  UserStatsCard,
} from "@/app/_components/dashboard";
import { DiscordInfoCard, FiveMInfoCard } from "@/components";
import { Typography } from "@/components/typography";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getServerInfo() {
  try {
    const [discordResponse, fivemResponse] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/info/discord`,
        {
          cache: "no-store",
        },
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/info/fivem`,
        {
          cache: "no-store",
        },
      ),
    ]);

    const discordData = discordResponse.ok
      ? ((await discordResponse.json()) as DiscordProxyResponse)
      : null;
    const fivemData = fivemResponse.ok
      ? ((await fivemResponse.json()) as FiveMProxyResponse)
      : null;

    return { discordData, fivemData };
  } catch {
    return { discordData: null, fivemData: null };
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth");
  }
  const { discordData, fivemData } = await getServerInfo();
  const accountId = session?.user?.id
    ? Number.parseInt(session.user.id, 10)
    : null;
  const account =
    accountId && Number.isFinite(accountId)
      ? await prisma.web_accounts.findUnique({
          where: { id: accountId },
          select: {
            email: true,
            created_at: true,
            discord_id: true,
            profile: {
              select: {
                real_name: true,
                fivem_name: true,
                gender: true,
                birth_date: true,
                city_name: true,
                province_name: true,
              },
            },
            discord: {
              select: {
                username: true,
                image: true,
              },
            },
            user: {
              select: {
                username: true,
                fivem: true,
                license: true,
                license2: true,
              },
            },
          },
        })
      : null;

  const discordId = account?.discord_id;
  const address = [account?.profile?.city_name, account?.profile?.province_name]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <RegistrationCleanup />
      <div>
        <Typography.Heading
          level={6}
          as={"h2"}
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          Overview
        </Typography.Heading>
        <p className="text-primary-300 text-sm mt-1">
          Welcome back,{" "}
          {session?.user?.username || session?.user?.name || "User"}.
        </p>
      </div>

      {/* User Stats Card */}
      <UserStatsCard
        username={account?.user?.username || session?.user?.username}
        realName={account?.profile?.real_name}
        fivemName={account?.profile?.fivem_name}
        email={account?.email || session?.user?.email}
        birthDate={account?.profile?.birth_date}
        address={address || null}
        gender={account?.profile?.gender ?? null}
        connectUrl={fivemData?.data?.server?.connect_url ?? null}
        registrationDate={account?.created_at ?? null}
        discordId={discordId}
        discordUsername={
          account?.discord?.username || session?.user?.discordUsername
        }
        fivemId={account?.user?.fivem ?? null}
        licenseId={account?.user?.license ?? null}
        license2Id={account?.user?.license2 ?? null}
        avatarUrl={account?.discord?.image ?? null}
      />

      {/* Server Status Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {fivemData?.data && (
          <FiveMInfoCard
            serverName={fivemData.data.server.name}
            connectUrl={fivemData.data.server.connect_url}
            onlinePlayers={fivemData.data.member.online}
            totalPlayers={fivemData.data.member.total}
            className="max-w-full!"
          />
        )}
        {discordData?.data && (
          <DiscordInfoCard
            serverName={discordData.data.server.name}
            inviteLink={discordData.data.server.invite_link}
            onlineMembers={discordData.data.member.online}
            totalMembers={discordData.data.member.total}
            className="max-w-full!"
          />
        )}
      </div>
    </div>
  );
}
