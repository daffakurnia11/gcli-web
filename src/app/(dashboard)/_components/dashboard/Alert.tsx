"use client";

import classNames from "classnames";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { ReactNode } from "react";

export interface AlertProps {
  variant?: "success" | "error" | "info";
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const variantStyles = {
  success: "bg-green-900/30 border-green-700 text-green-100",
  error: "bg-red-900/30 border-tertiary-red text-red-100",
  info: "bg-primary-800/30 border-primary-700 text-primary-100",
};

const variantIcon = {
  success: <CheckCircle2 size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

export function Alert({
  variant = "info",
  children,
  className = "",
  onDismiss,
}: AlertProps) {
  const styleClass = variantStyles[variant];
  const icon = variantIcon[variant];
  const role = variant === "error" ? "alert" : "status";

  return (
    <div
      className={classNames(
        "flex items-start gap-3 border rounded-md p-4",
        styleClass,
        className,
      )}
      role={role}
    >
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 text-sm">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
