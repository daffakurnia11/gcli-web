interface BaseButtonProps {
  children: React.ReactNode | string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  as?: keyof JSX.IntrinsicElements;
  style?: 'solid' | 'outline' | 'text';
  size?: 'lg' | 'base' | 'sm';
}

export type { BaseButtonProps };
