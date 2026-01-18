import classNames from "classnames";
import Image from "next/image";

import { LogoProps } from "@/types/Logo";

const logoPaths: Record<
  NonNullable<LogoProps["variant"]>,
  Record<NonNullable<LogoProps["color"]>, string>
> = {
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
    <Image
      src={logoPaths[variant][color]}
      alt="GCLI Logo"
      width={0}
      height={0}
      sizes="100vw"
      className={classNames("w-full h-full object-contain", className)}
    />
  );
}
