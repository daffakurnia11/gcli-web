import type { ReactNode } from "react";

import { Typography } from "@/components/typography";

export interface DashboardSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  actionButton?: ReactNode;
  actions?: ReactNode;
}

export function DashboardSection({
  title,
  children,
  className = "",
  actionButton,
  actions,
}: DashboardSectionProps) {
  const headerAction = actionButton ?? actions;

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-primary-700 pb-3">
        <Typography.Heading
          level={6}
          className="uppercase tracking-widest text-secondary-700"
        >
          {title}
        </Typography.Heading>
        {headerAction}
      </div>
      {children}
    </section>
  );
}
