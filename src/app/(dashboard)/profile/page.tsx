"use client";

import { AccountLinkage } from "@/app/(dashboard)/_components/dashboard/AccountLinkage";
import { ProfileSection } from "@/app/(dashboard)/_components/dashboard/ProfileSection";
import { Typography } from "@/components/typography";
import { useApiSWR } from "@/services/swr";

type UserAccountOverview = {
  email: string | null;
  profile: {
    real_name: string | null;
    fivem_name: string | null;
    gender: "male" | "female" | null;
    birth_date: string | null;
    province_id: string | null;
    province_name: string | null;
    city_id: string | null;
    city_name: string | null;
  } | null;
  discord: {
    username: string | null;
    email: string | null;
    image: string | null;
  } | null;
  user: {
    username: string | null;
  } | null;
  featureFlags: {
    allowFivemChange: boolean;
    allowDiscordChange: boolean;
  };
} | null;

export default function ProfilePage() {
  const { data: profileData } = useApiSWR<UserAccountOverview>("/api/user/account");

  return (
    <div className="space-y-6">
      <div>
        <Typography.Heading
          level={4}
          as={"h2"}
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          Profile
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Manage your profile information and linked accounts.
        </Typography.Paragraph>
      </div>

      <div className="space-y-6">
        <ProfileSection
          username={profileData?.user?.username}
          email={profileData?.email}
          realName={profileData?.profile?.real_name}
          fivemName={profileData?.profile?.fivem_name}
          gender={profileData?.profile?.gender ?? null}
          birthDate={profileData?.profile?.birth_date ?? null}
          provinceId={profileData?.profile?.province_id ?? null}
          provinceName={profileData?.profile?.province_name ?? null}
          cityId={profileData?.profile?.city_id ?? null}
          cityName={profileData?.profile?.city_name ?? null}
          avatarUrl={profileData?.discord?.image}
          allowFivemChange={profileData?.featureFlags.allowFivemChange}
        />

        <AccountLinkage
          isDiscordLinked={Boolean(profileData?.discord)}
          discordUsername={profileData?.discord?.username}
          discordEmail={profileData?.discord?.email}
          allowDiscordChange={profileData?.featureFlags.allowDiscordChange}
        />
      </div>
    </div>
  );
}
