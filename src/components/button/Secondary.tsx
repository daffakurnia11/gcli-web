import React from "react";

import BaseButton, { BaseButtonPropsInternal } from "./Base";

// Secondary variant styles (neutral theme)
const secondaryStyles: Record<string, string> = {
  solid:
    "bg-primary-100 text-black hover:bg-gray-light border-2 border-primary-100",
  outline: "bg-transparent text-primary-100 border-2 border-primary-100",
  text: "bg-transparent text-primary-100 hover:text-gray-light border-transparent",
};

export type SecondaryProps = Omit<
  BaseButtonPropsInternal,
  "variantStyles" | "slideColor" | "hoverTextColorClass"
>;

export default function Secondary({
  children,
  className,
  disabled = false,
  type = "button",
  onClick,
  variant = "solid",
  size = "base",
  prefix,
  suffix,
  fullWidth,
  ...props
}: SecondaryProps) {
  return (
    <BaseButton
      className={className}
      disabled={disabled}
      type={type}
      onClick={onClick}
      variantStyles={secondaryStyles}
      variant={variant}
      size={size}
      slideColor={variant === "outline" ? "#D7D7D7" : undefined}
      hoverTextColorClass={
        variant === "outline" ? "group-hover:text-black" : undefined
      }
      prefix={prefix}
      suffix={suffix}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
