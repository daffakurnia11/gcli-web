import { BaseButtonProps } from "@/types/Button";
import BaseButton, { BaseButtonPropsInternal } from "./Base";
import React from "react";

// Primary variant styles (gold theme)
const primaryStyles: Record<Required<BaseButtonProps>["style"], string> = {
  solid: "bg-secondary-700 text-black hover:bg-primary-100 border-2 border-secondary-700",
  outline: "bg-transparent text-secondary-700 border-2 border-secondary-700",
  text: "bg-transparent text-secondary-700 hover:text-primary-100 border-transparent",
};

export type PrimaryProps = Omit<BaseButtonPropsInternal, 'variantStyles' | 'slideColor' | 'hoverTextColorClass'>;

export default function Primary({
  children,
  className,
  disabled = false,
  type = "button",
  onClick,
  style: styleProp = "solid",
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
      style={styleProp}
      size={size}
      slideColor={styleProp === "outline" ? "#D19A1C" : undefined}
      hoverTextColorClass={styleProp === "outline" ? "group-hover:text-black" : undefined}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
