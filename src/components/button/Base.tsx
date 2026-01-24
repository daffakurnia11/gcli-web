import classNames from "classnames";
import React from "react";

import type { BaseButtonProps, BaseButtonPropsInternal } from "@/types/Button";

// Size styles - following 8pt grid and touch target guidelines
const sizeStyles: Record<
  Required<BaseButtonProps>["size"],
  string
> = {
  lg: "h-14 px-8 text-lg leading-tight", // 56px height, 18px font
  base: "h-11 px-6 text-base leading-tight", // 44px height, 16px font
  sm: "h-9 px-4 text-sm leading-tight", // 36px height, 14px font
};

function BaseButton({
  children,
  className,
  disabled = false,
  type = "button",
  onClick,
  variantStyles,
  variant = "solid",
  size = "base",
  slideColor,
  hoverTextColorClass,
  prefix,
  suffix,
  fullWidth,
  ...props
}: BaseButtonPropsInternal) {
  const isOutline = variant === "outline" && slideColor;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        // Base styles
        "font-display font-bold uppercase tracking-wider",
        "rounded-sm transition-all duration-200",
        "inline-flex items-center justify-center",
        "relative overflow-hidden group",
        !isOutline && "hover:-translate-y-0.5 active:translate-y-0",
        fullWidth && "w-full",

        // Size
        sizeStyles[size],

        // Variant + style (base styles without hover background for outline)
        variant === "outline" && slideColor
          ? variantStyles[variant]?.replace(/hover:bg-[^ ]+\s*/g, "")
          : variantStyles[variant],

        // Disabled state
        disabled && "opacity-50 cursor-not-allowed hover:translate-y-0",

        className
      )}
      {...props}
    >
      {/* Slide animation span for outline buttons */}
      {isOutline && (
        <span
          className="absolute inset-0 w-full h-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out pointer-events-none"
          style={{ backgroundColor: slideColor }}
        />
      )}

      {/* Content with prefix and suffix */}
      <span
        className={classNames(
          "relative z-10 transition-colors duration-300",
          "inline-flex items-center justify-center gap-2",
          hoverTextColorClass
        )}
      >
        {prefix && <span className="flex-shrink-0">{prefix}</span>}
        {children}
        {suffix && <span className="flex-shrink-0">{suffix}</span>}
      </span>
    </button>
  );
}

export default BaseButton;
