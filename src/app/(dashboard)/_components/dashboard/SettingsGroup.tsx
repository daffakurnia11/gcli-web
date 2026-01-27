import type { ReactNode } from "react";

export interface SettingsGroupProps {
  children: ReactNode;
  className?: string;
}

export function SettingsGroup({
  children,
  className = "",
}: SettingsGroupProps) {
  return (
    <div
      className={`border-b border-primary-700 py-4 last:border-b-0 ${className}`}
    >
      {children}
    </div>
  );
}
