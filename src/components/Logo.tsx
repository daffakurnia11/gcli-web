import { LogoProps } from "@/types/Logo";
import classNames from "classnames";
import React from "react";

const logoPaths: Record<LogoProps["variant"], Record<LogoProps["color"], string>> = {
  icon: {
    black: "/Logo/logo-black.png",
    white: "/Logo/logo-white.png",
  },
  name: {
    black: "/Logo/logo-name-black.png",
    white: "/Logo/logo-name-white.png",
  },
};

export default function Logo({
  className,
  variant = "icon",
  color = "white",
}: LogoProps) {
  return (
    <img
      src={logoPaths[variant][color]}
      alt="GCLI Logo"
      className={classNames("w-full h-full object-contain", className)}
    />
  );
}
