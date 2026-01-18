import React from "react";
import Heading from "./Heading";
import Paragraph from "./Paragraph";
import Small from "./Small";
import type { HeadingProps, ParagraphProps, SmallProps } from "@/types/Typography";

export interface TypographyComponent {
  Heading: React.FC<HeadingProps>;
  Paragraph: React.FC<ParagraphProps>;
  Small: React.FC<SmallProps>;
}

const Typography = {} as TypographyComponent;
Typography.Heading = Heading;
Typography.Paragraph = Paragraph;
Typography.Small = Small;

export { Typography };

// Named exports for convenience
export { default as Heading } from "./Heading";
export { default as Paragraph } from "./Paragraph";
export { default as Small } from "./Small";

// Type exports
export type { TextProps, HeadingProps, ParagraphProps, SmallProps } from "@/types/Typography";
