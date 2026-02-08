"use client";

import {
  DangerZone,
  DashboardSection,
  EmailSettings,
  PasswordSettings,
} from "@/app/(dashboard)/_components/dashboard";
import { Typography } from "@/components/typography";
import { useApiSWR } from "@/services/swr";

type UserAccountOverview = {
  email: string | null;
} | null;

export default function SettingsPage() {
  const { data: settingsData } = useApiSWR<UserAccountOverview>("/api/user/account");

  return (
    <div className="space-y-6">
      <div>
        <Typography.Heading
          level={4}
          as="h2"
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          Settings
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Manage your account settings and preferences.
        </Typography.Paragraph>
      </div>

      <div className="space-y-6">
        <DashboardSection title="Account Security">
          <div className="space-y-4">
            <EmailSettings currentEmail={settingsData?.email} />
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
