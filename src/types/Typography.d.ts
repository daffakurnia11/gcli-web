interface TextProps {
  children: React.ReactNode | string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  tabIndex?: number;
  as?: keyof JSX.IntrinsicElements;
}

export interface HeadingProps extends TextProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  type?: "heading" | "display";
}

export type ParagraphProps = TextProps;

export type SmallProps = TextProps;

export interface TypographyComponent {
  Heading: React.FC<HeadingProps>;
  Paragraph: React.FC<ParagraphProps>;
  Small: React.FC<SmallProps>;
}
