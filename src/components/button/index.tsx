import type { ButtonComponentExtended } from "@/types/Button";

import BaseButton from "./Base";
import Primary from "./Primary";
import Secondary from "./Secondary";
import Slant from "./Slant";

const Button = BaseButton as ButtonComponentExtended;
Button.Primary = Primary;
Button.Secondary = Secondary;
Button.Slant = Slant;

export { Button };
export { default as BaseButton } from "./Base";
export type { PrimaryProps } from "./Primary";
export { default as Primary } from "./Primary";
export type { SecondaryProps } from "./Secondary";
export { default as Secondary } from "./Secondary";
export { default as Slant } from "./Slant";
export type { SlantProps } from "@/types/Button";
export type { BaseButtonPropsInternal } from "@/types/Button";
export type { BaseButtonProps } from "@/types/Button";
