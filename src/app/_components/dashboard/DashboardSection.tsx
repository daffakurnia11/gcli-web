import type { ReactNode } from "react";

import { Typography } from "@/components/typography";

export interface DashboardSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function DashboardSection({
  title,
  children,
  className = "",
  actions,
}: DashboardSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-primary-700 pb-3">
        <Typography.Heading
          level={6}
          className="uppercase tracking-widest text-secondary-700"
        >
          {title}
        </Typography.Heading>
        {actions}
      </div>
      {children}
    </section>
  );
}
