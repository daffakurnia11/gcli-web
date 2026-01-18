import { HeadingProps } from "@/types/Typography";
import classNames from "classnames";
import React from "react";

const headingStyles: Record<HeadingProps["level"], string> = {
  1: "text-5xl sm:text-6xl",
  2: "text-4xl sm:text-5xl",
  3: "text-3xl sm:text-4xl",
  4: "text-2xl sm:text-3xl",
  5: "text-xl sm:text-2xl",
  6: "text-lg sm:text-xl",
};

export default function Heading({
  as,
  level,
  children,
  className,
  type = 'heading',
  ...props
}: HeadingProps) {
  const Component: React.ElementType = (
    typeof as === "string" ? as : `h${level}`
  ) as React.ElementType;
  const headingType = type === "heading" ? "font-sans" : "font-display";

  return (
    <Component
      {...props}
      className={classNames(
        "font-bold",
        headingType,
        headingStyles[level],
        className
      )}
    >
      {children}
    </Component>
  );
}
