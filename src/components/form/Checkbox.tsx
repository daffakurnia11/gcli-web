"use client";

import classNames from "classnames";
import { Check } from "lucide-react";
import { useState } from "react";

import type { CheckboxProps, FormSize } from "@/types/Form";

const sizeStyles: Record<
  FormSize,
  { container: string; label: string; icon: number; boxSize: string }
> = {
  sm: {
    container: "gap-2",
    label: "text-sm",
    icon: 12,
    boxSize: "w-4 h-4",
  },
  md: {
    container: "gap-2.5",
    label: "text-base",
    icon: 14,
    boxSize: "w-5 h-5",
  },
  lg: {
    container: "gap-3",
    label: "text-lg",
    icon: 16,
    boxSize: "w-6 h-6",
  },
  xl: {
    container: "gap-3.5",
    label: "text-xl",
    icon: 18,
    boxSize: "w-7 h-7",
  },
};

export function Checkbox({
  name,
  label,
  checked,
  defaultChecked = false,
  value,
  disabled = false,
  required = false,
  indeterminate = false,
  onChange,
  error,
  helperText,
  className = "",
  size = "md",
}: CheckboxProps) {
  const hasError = Boolean(error);
  const sizeConfig = sizeStyles[size];
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    if (onChange) {
      onChange(newChecked);
    }
  };

  const checkboxElement = (
    <label
      className={classNames(
        `inline-flex items-center ${sizeConfig.container}`,
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <div className={classNames("relative shrink-0", sizeConfig.boxSize)}>
        <input
          ref={(el) => {
            if (el) {
              el.indeterminate = indeterminate;
            }
          }}
          type="checkbox"
          name={name}
          {...(isControlled
            ? { checked: isChecked }
            : { defaultChecked: isChecked })}
          value={value}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-invalid={hasError}
        />
        <div
          className={classNames(
            "absolute inset-0",
            "rounded border-2 flex items-center justify-center",
            "transition-all duration-200 pointer-events-none",
            isChecked || indeterminate
              ? "border-secondary-700 bg-secondary-700"
              : "border-primary-300 bg-primary-900",
            disabled && "opacity-50",
            hasError && !(isChecked || indeterminate) && "border-tertiary-red",
          )}
        >
          {(isChecked || indeterminate) && (
            <Check
              size={sizeConfig.icon}
              className="text-primary-900 pointer-events-none"
              aria-hidden="true"
              strokeWidth={3}
            />
          )}
        </div>
      </div>
      {label && (
        <span
          className={classNames(
            sizeConfig.label,
            isChecked ? "text-secondary-700" : "text-primary-100",
            disabled && "text-primary-500",
            hasError && "text-tertiary-red",
            "transition-colors duration-200 select-none",
          )}
        >
          {label}
        </span>
      )}
    </label>
  );

  if (helperText || error) {
    return (
      <div>
        {checkboxElement}
        {(helperText || error) && (
          <p
            className={`text-xs mt-1.5 ${error ? "text-tertiary-red" : "text-primary-300"}`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }

  return checkboxElement;
}
