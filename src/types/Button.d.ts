import type React from "react";

import type { PrimaryProps } from "@/components/button/Primary";
import type { SecondaryProps } from "@/components/button/Secondary";
import type Slant from "@/components/button/Slant";

interface BaseButtonProps {
  children: React.ReactNode | string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  as?: keyof JSX.IntrinsicElements;
  variant?: "solid" | "outline" | "text";
  size?: "lg" | "base" | "sm";
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
}

export interface BaseButtonPropsInternal extends Omit<
  BaseButtonProps,
  "variant"
> {
  variantStyles: Record<string, string>;
  slideColor?: string;
  hoverTextColorClass?: string;
  variant?: "solid" | "outline" | "text";
}

export interface ButtonComponent extends React.FC<BaseButtonPropsInternal> {
  Primary: React.FC<PrimaryProps>;
  Secondary: React.FC<SecondaryProps>;
}

export interface ButtonComponentExtended extends ButtonComponent {
  Slant: typeof Slant;
}

export interface SlantProps {
  children: React.ReactNode | string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary";
  slant?: "left" | "right";
  size?: "lg" | "base" | "sm";
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
}

export type { BaseButtonProps };
