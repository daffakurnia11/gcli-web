"use client";

import {
  RegistrationCleanup,
  ServerStatusCards,
  UserStatsCard,
} from "@/app/(dashboard)/_components/dashboard";
import { Typography } from "@/components/typography";
import { useApiSWR } from "@/services/swr";

type UserAccountOverview = {
  id: number;
  email: string | null;
  created_at: string | null;
  discord_id: string | null;
  profile: {
    real_name: string | null;
    fivem_name: string | null;
    gender: "male" | "female" | null;
    birth_date: string | null;
    city_name: string | null;
    province_name: string | null;
  } | null;
  discord: {
    username: string | null;
    image: string | null;
  } | null;
  user: {
    username: string | null;
    fivem: string | null;
    license: string | null;
    license2: string | null;
  } | null;
} | null;

export default function DashboardPage() {
  const { data: account } = useApiSWR<UserAccountOverview>("/api/user/account");

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
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Welcome back, {account?.user?.username || "User"}.
        </Typography.Paragraph>
      </div>

      <UserStatsCard
        username={account?.user?.username}
        realName={account?.profile?.real_name}
        fivemName={account?.profile?.fivem_name}
        email={account?.email}
        birthDate={account?.profile?.birth_date}
        address={address || null}
        gender={account?.profile?.gender ?? null}
        connectUrl={null}
        registrationDate={account?.created_at ?? null}
        discordId={account?.discord_id}
        discordUsername={account?.discord?.username}
        fivemId={account?.user?.fivem ?? null}
        licenseId={account?.user?.license ?? null}
        license2Id={account?.user?.license2 ?? null}
        avatarUrl={account?.discord?.image ?? null}
      />

      <ServerStatusCards />
    </div>
  );
}
