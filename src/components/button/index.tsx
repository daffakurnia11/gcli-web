import BaseButton, { ButtonComponent } from "./Base";
import Primary from "./Primary";
import Secondary from "./Secondary";
import Slant from "./Slant";

export interface ButtonComponentExtended extends ButtonComponent {
  Slant: typeof Slant;
}

const Button = BaseButton as ButtonComponentExtended;
Button.Primary = Primary;
Button.Secondary = Secondary;
Button.Slant = Slant;

export { Button };
export type { BaseButtonPropsInternal } from "./Base";
export { default as BaseButton } from "./Base";
export type { PrimaryProps } from "./Primary";
export { default as Primary } from "./Primary";
export type { SecondaryProps } from "./Secondary";
export { default as Secondary } from "./Secondary";
export type { SlantProps } from "./Slant";
export { default as Slant } from "./Slant";
export type { BaseButtonProps } from "@/types/Button";
