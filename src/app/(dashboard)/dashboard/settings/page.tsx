import { redirect } from "next/navigation";

import {
  DangerZone,
  DashboardSection,
  EmailSettings,
  PasswordSettings,
} from "@/app/_components/dashboard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getSettingsData(userId: string) {
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
      sessions: {
        select: {
          id: true,
          session_token: true,
          expires: true,
        },
        orderBy: { expires: "desc" },
      },
    },
  });

  return account;
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  const settingsData = await getSettingsData(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold uppercase tracking-wider text-primary-100">
          Settings
        </h2>
        <p className="text-primary-300 text-sm mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <DashboardSection title="Account Security">
          <div className="space-y-4">
            <EmailSettings currentEmail={settingsData?.email || session.user?.email} />
            <PasswordSettings />
          </div>
        </DashboardSection>

        <DashboardSection title="Danger Zone">
          <DangerZone />
        </DashboardSection>
      </div>
    </div>
  );
}
