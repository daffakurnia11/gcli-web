import classNames from "classnames";
import React from "react";

import { SmallProps } from "@/types/Typography";

export default function Small({
  as = "span",
  children,
  className,
  ...props
}: SmallProps) {
  const Component: React.ElementType = (
    typeof as === "string" ? as : `span`
  ) as React.ElementType;
  return (
    <Component
      {...props}
      className={classNames("font-sans text-xs", className)}
    >
      {children}
    </Component>
  );
}
