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

export type { BaseButtonProps };
