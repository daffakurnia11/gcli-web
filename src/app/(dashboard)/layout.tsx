import type { ReactNode } from "react";

import DashboardShell from "@/app/(dashboard)/_components/dashboard/DashboardShell";
import { auth } from "@/lib/auth";

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
  const canAccessAdmin = session?.user?.optin === true;

  return (
    <DashboardShell
      displayName={displayName}
      email={email}
      avatarUrl={avatarUrl}
      isGangBoss={isGangBoss}
      hasCharinfo={hasCharinfo}
      hasGang={hasGang}
      canAccessAdmin={canAccessAdmin}
    >
      {children}
    </DashboardShell>
  );
}
