import { redirect } from "next/navigation";

import { AccountLinkage } from "@/app/_components/dashboard/AccountLinkage";
import { ProfileSection } from "@/app/_components/dashboard/ProfileSection";
import { Typography } from "@/components/typography";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getProfileData(userId: string) {
  const accountId = Number.parseInt(userId, 10);
  if (Number.isNaN(accountId)) {
    return null;
  }

  const account = await prisma.web_accounts.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      email: true,
      created_at: true,
      profile: {
        select: {
          real_name: true,
          fivem_name: true,
        },
      },
      discord: {
        select: {
          username: true,
          email: true,
          image: true,
        },
      },
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return account;
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  const allowFivemChange = process.env.ALLOW_FIVEM_CHANGE === "true";
  const allowDiscordChange = process.env.ALLOW_DISCORD_CHANGE === "true";
  const profileData = await getProfileData(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <Typography.Heading
          level={6}
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
          username={profileData?.user?.username || session.user?.username}
          email={profileData?.email || session.user?.email}
          realName={profileData?.profile?.real_name}
          fivemName={profileData?.profile?.fivem_name}
          avatarUrl={profileData?.discord?.image || session.user?.discordImage}
          allowFivemChange={allowFivemChange}
        />

        <AccountLinkage
          isDiscordLinked={Boolean(profileData?.discord)}
          discordUsername={
            profileData?.discord?.username || session.user?.discordUsername
          }
          discordEmail={
            profileData?.discord?.email || session.user?.discordEmail
          }
          allowDiscordChange={allowDiscordChange}
        />
      </div>
    </div>
  );
}
