import type { TypographyComponent } from "@/types/Typography";

import Heading from "./Heading";
import Paragraph from "./Paragraph";
import Small from "./Small";

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
export type { HeadingProps, ParagraphProps, SmallProps, TextProps } from "@/types/Typography";
