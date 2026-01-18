import React from "react";

import BaseButton, { BaseButtonPropsInternal } from "./Base";

// Primary variant styles (gold theme)
const primaryStyles: Record<string, string> = {
  solid:
    "bg-secondary-700 text-black hover:bg-primary-100 border-2 border-secondary-700",
  outline: "bg-transparent text-secondary-700 border-2 border-secondary-700",
  text: "bg-transparent text-secondary-700 hover:text-primary-100 border-transparent",
};

export type PrimaryProps = Omit<
  BaseButtonPropsInternal,
  "variantStyles" | "slideColor" | "hoverTextColorClass"
>;

export default function Primary({
  children,
  className,
  disabled = false,
  type = "button",
  onClick,
  variant = "solid",
  size = "base",
  ...props
}: PrimaryProps) {
  return (
    <BaseButton
      className={className}
      disabled={disabled}
      type={type}
      onClick={onClick}
      variantStyles={primaryStyles}
      variant={variant}
      size={size}
      slideColor={variant === "outline" ? "#D19A1C" : undefined}
      hoverTextColorClass={
        variant === "outline" ? "group-hover:text-black" : undefined
      }
      {...props}
    >
      {children}
    </BaseButton>
  );
}
