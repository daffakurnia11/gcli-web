import type { ReactNode } from "react";

export interface DashboardCardProps {
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ children, className = "" }: DashboardCardProps) {
  return (
    <div className={`bg-primary-900/70 border border-primary-700 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
