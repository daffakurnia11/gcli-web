import { ParagraphProps } from "@/types/Typography";
import classNames from "classnames";
import React from "react";
export default function Paragraph({
  as = "p",
  children,
  className,
  ...props
}: ParagraphProps) {
  const Component: React.ElementType = (
    typeof as === "string" ? as : `p`
  ) as React.ElementType;
  return (
    <Component
      {...props}
      className={classNames("font-sans text-sm sm:text-base", className)}
    >
      {children}
    </Component>
  );
}
