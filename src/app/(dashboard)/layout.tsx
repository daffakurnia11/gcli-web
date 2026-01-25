import Link from "next/link";
import type { ReactNode } from "react";

import { Typography } from "@/components/typography";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-primary-900 pt-15 text-primary-100">
      <div className="container mx-auto px-6 py-10 grid gap-6 md:grid-cols-[240px_1fr]">
        <aside className="bg-primary-900/70 border border-primary-700 rounded-lg p-5">
          <Typography.Heading
            level={5}
            type="display"
            className="uppercase tracking-widest text-primary-200 mb-6"
          >
            Dashboard
          </Typography.Heading>
          <nav className="flex flex-col gap-3 text-sm font-display tracking-wide">
            <Link
              className="text-primary-100 hover:text-secondary-700"
              href="/dashboard"
            >
              <Typography.Paragraph className="text-primary-100 hover:text-secondary-700">
                Overview
              </Typography.Paragraph>
            </Link>
            <Link
              className="text-primary-100 hover:text-secondary-700"
              href="/dashboard/profile"
            >
              <Typography.Paragraph className="text-primary-100 hover:text-secondary-700">
                Profile
              </Typography.Paragraph>
            </Link>
            <Link
              className="text-primary-100 hover:text-secondary-700"
              href="/dashboard/settings"
            >
              <Typography.Paragraph className="text-primary-100 hover:text-secondary-700">
                Settings
              </Typography.Paragraph>
            </Link>
          </nav>
        </aside>
        <main className="bg-primary-900/40 border border-primary-700 rounded-lg p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
