import type { ReactNode } from "react";

import DashboardShell from "@/app/(dashboard)/_components/dashboard/DashboardShell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const rawLabel =
    session?.user?.username ||
    session?.user?.discordName ||
    session?.user?.name ||
    session?.user?.email ||
    session?.user?.discordEmail ||
    "User";
  const displayName = rawLabel.split("@")[0];
  const email = session?.user?.email || session?.user?.discordEmail || "";
  const avatarUrl = session?.user?.discordImage || null;
  const isGangBoss = session?.user?.gang?.isboss ?? false;
  const hasCharinfo = session?.user?.charinfo !== null;
  const hasGang = Boolean(
    session?.user?.gang?.name && session.user.gang.name !== "none",
  );
  const gangCode = session?.user?.gang?.name?.toLowerCase() ?? null;
  const hasJoinedLeague = hasGang && gangCode
    ? (await prisma.league_teams.count({
        where: { code: gangCode },
      })) > 0
    : false;
  const canAccessAdmin = session?.user?.optin === true;

  return (
    <DashboardShell
      displayName={displayName}
      email={email}
      avatarUrl={avatarUrl}
      isGangBoss={isGangBoss}
      hasCharinfo={hasCharinfo}
      hasGang={hasGang}
      hasJoinedLeague={hasJoinedLeague}
      canAccessAdmin={canAccessAdmin}
    >
      {children}
    </DashboardShell>
  );
}
