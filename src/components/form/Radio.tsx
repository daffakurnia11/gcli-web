"use client";

import classNames from "classnames";
import { useState } from "react";

import type { FormSize, RadioProps } from "@/types/Form";

import { FieldWrapper } from "./FieldWrapper";

const sizeStyles: Record<
  FormSize,
  { container: string; label: string; icon: number }
> = {
  sm: {
    container: "gap-2",
    label: "text-sm",
    icon: 16,
  },
  md: {
    container: "gap-2.5",
    label: "text-base",
    icon: 18,
  },
  lg: {
    container: "gap-3",
    label: "text-lg",
    icon: 20,
  },
  xl: {
    container: "gap-3.5",
    label: "text-xl",
    icon: 22,
  },
};

export function Radio({
  name,
  options,
  value,
  defaultValue,
  label,
  error,
  helperText,
  disabled = false,
  required = false,
  onChange,
  orientation = "vertical",
  className = "",
  size = "md",
}: RadioProps) {
  const hasError = Boolean(error);
  const sizeConfig = sizeStyles[size];
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = isControlled ? value : internalValue;

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const radioGroup = (
    <div
      className={classNames(
        orientation === "horizontal"
          ? "flex flex-wrap gap-6"
          : "flex flex-col gap-3",
        className,
      )}
      role="radiogroup"
      aria-required={required}
    >
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <label
            key={option.value}
            className={classNames(
              `flex items-center ${sizeConfig.container} cursor-pointer`,
              isDisabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <div className="relative w-5 h-5">
              <input
                type="radio"
                name={name}
                value={option.value}
                {...(isControlled
                  ? { checked: isSelected }
                  : { defaultChecked: isSelected })}
                disabled={isDisabled}
                onChange={() => handleChange(option.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className={classNames(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  "transition-all duration-200 pointer-events-none bg-primary-900",
                  isSelected ? "border-secondary-700" : "border-primary-300",
                  isDisabled && "opacity-50",
                  hasError && !isSelected && "border-tertiary-red",
                )}
              >
                <div
                  className={classNames(
                    "w-2.5 h-2.5 rounded-full bg-secondary-500 pointer-events-none",
                    "transition-all duration-200 ease-out",
                    isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0",
                  )}
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span
                className={classNames(
                  sizeConfig.label,
                  isSelected
                    ? "text-secondary-700 font-medium"
                    : "text-primary-100",
                  isDisabled && "text-primary-500",
                  hasError && "text-tertiary-red",
                  "transition-colors duration-200",
                )}
              >
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs text-primary-300 mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );

  if (label || error || helperText) {
    return (
      <FieldWrapper
        id={name}
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
      >
        {radioGroup}
      </FieldWrapper>
    );
  }

  return radioGroup;
}
