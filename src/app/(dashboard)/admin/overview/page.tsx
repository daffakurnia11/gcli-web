import { redirect } from "next/navigation";

import {
  DashboardCard,
  DashboardSection,
} from "@/app/(dashboard)/_components/dashboard";
import { Typography } from "@/components/typography";
import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (session.user.optin !== true) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <Typography.Heading
          level={6}
          as="h2"
          type="display"
          className="uppercase tracking-wider text-primary-100"
        >
          Admin
        </Typography.Heading>
        <Typography.Paragraph className="text-primary-300 text-sm mt-1">
          Administrative tools and moderation controls.
        </Typography.Paragraph>
      </div>

      <DashboardSection title="Overview">
        <DashboardCard>
          <Typography.Paragraph className="text-primary-200">
            Admin dashboard is ready. Add admin modules under `/admin` routes.
          </Typography.Paragraph>
        </DashboardCard>
      </DashboardSection>
    </div>
  );
}
