import { BaseButtonProps } from "@/types/Button";
import classNames from "classnames";
import React from "react";

// Size styles for Slant buttons
const sizeStyles: Record<Required<BaseButtonProps>["size"], string> = {
  lg: "h-14 px-10 text-xl",     // 56px height, 18px font
  base: "h-12 px-8 text-lg",    // 48px height, 16px font
  sm: "h-10 px-6 text-base",    // 40px height, 14px font
};

// Variant styles
const variantStyles: Record<"primary" | "secondary", string> = {
  primary: "bg-secondary-700 text-black hover:bg-primary-100",
  secondary: "bg-primary-100 text-black hover:bg-gray-light",
};

export interface SlantProps extends BaseButtonProps {
  variant?: "primary" | "secondary";
  slant?: "left" | "right";
}

export default function Slant({
  children,
  className,
  disabled = false,
  type = "button",
  onClick,
  variant = "primary",
  size = "base",
  slant = "left",
  ...props
}: SlantProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        // Base styles
        "font-display font-bold uppercase tracking-widest",
        "transition-all duration-200",
        "inline-flex items-center justify-center gap-2",
        "hover:scale-105 active:scale-100",
        "clip-path-slant",

        // Slant direction
        slant === "right" && "clip-path-slant-reverse",

        // Size
        sizeStyles[size],

        // Variant
        variantStyles[variant],

        // Disabled state
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
