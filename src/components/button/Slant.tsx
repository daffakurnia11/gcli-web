import classNames from "classnames";
import React from "react";

import type { SlantProps } from "@/types/Button";

// Size styles for Slant buttons
const sizeStyles: Record<"lg" | "base" | "sm", string> = {
  lg: "h-14 px-10 text-xl", // 56px height, 18px font
  base: "h-12 px-8 text-lg", // 48px height, 16px font
  sm: "h-10 px-6 text-base", // 40px height, 14px font
};

// Variant styles
const variantStyles: Record<"primary" | "secondary", string> = {
  primary: "bg-secondary-700 text-black hover:bg-primary-100",
  secondary: "bg-primary-100 text-black hover:bg-gray-light",
};

export default function Slant({
  children,
  className,
  disabled = false,
  type = "button",
  onClick,
  variant = "primary",
  slant = "left",
  size = "base",
  prefix,
  suffix,
  fullWidth,
  ...props
}: SlantProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        // Base styles
        "font-display font-bold uppercase",
        "transition-all duration-200",
        "inline-flex items-center justify-center gap-2",
        "hover:scale-105 active:scale-100",
        "clip-path-slant",
        fullWidth && "w-full",

        // Slant direction
        slant === "right" && "clip-path-slant-reverse",

        // Size
        sizeStyles[size || "base"],

        // Variant
        variantStyles[variant || "primary"],

        // Disabled state
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",

        className
      )}
      {...props}
    >
      {prefix && <span className="flex-shrink-0">{prefix}</span>}
      {children}
      {suffix && <span className="flex-shrink-0">{suffix}</span>}
    </button>
  );
}
