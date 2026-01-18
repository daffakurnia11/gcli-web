import { BaseButtonProps } from "@/types/Button";
import BaseButton, { BaseButtonPropsInternal } from "./Base";
import React from "react";

// Secondary variant styles (neutral theme)
const secondaryStyles: Record<Required<BaseButtonProps>["style"], string> = {
  solid: "bg-primary-100 text-black hover:bg-gray-light border-2 border-primary-100",
  outline: "bg-transparent text-primary-100 border-2 border-primary-100",
  text: "bg-transparent text-primary-100 hover:text-gray-light border-transparent",
};

export type SecondaryProps = Omit<BaseButtonPropsInternal, 'variantStyles' | 'slideColor' | 'hoverTextColorClass'>;

export default function Secondary({
  children,
  className,
  disabled = false,
  type = "button",
  onClick,
  style: styleProp = "solid",
  size = "base",
  ...props
}: SecondaryProps) {
  return (
    <BaseButton
      className={className}
      disabled={disabled}
      type={type}
      onClick={onClick}
      variantStyles={secondaryStyles}
      style={styleProp}
      size={size}
      slideColor={styleProp === "outline" ? "#D7D7D7" : undefined}
      hoverTextColorClass={styleProp === "outline" ? "group-hover:text-black" : undefined}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
