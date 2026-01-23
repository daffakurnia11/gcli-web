"use client";

import classNames from "classnames";

import type { FormSize, TextInputProps } from "@/types/Form";

import { FieldWrapper } from "./FieldWrapper";

const sizeStyles: Record<FormSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-13 px-5 text-lg",
  xl: "h-15 px-6 text-xl",
};

const wrapperSizeStyles: Record<FormSize, string> = {
  sm: "h-9",
  md: "h-11",
  lg: "h-13",
  xl: "h-15",
};

export function Text({
  id,
  name,
  type = "text",
  value,
  defaultValue,
  placeholder,
  disabled = false,
  required = false,
  autoComplete,
  onChange,
  onBlur,
  onFocus,
  className = "",
  fullWidth = false,
  size = "md",
  label,
  error,
  helperText,
  prefix,
  suffix,
  maxLength,
}: TextInputProps) {
  const inputId = id || name;
  const hasError = Boolean(error);
  const sizeClass = sizeStyles[size];
  const wrapperSizeClass = wrapperSizeStyles[size];

  const baseInputStyles = `
    ${wrapperSizeClass}
    w-full rounded-md
    bg-primary-900
    border border-primary-300
    text-primary-100
    placeholder:text-primary-300
    transition-colors duration-200
    focus:border-secondary-700
    focus:outline-none
    focus:outline-offset-2
    focus:outline-2
    focus:outline-secondary-700
    disabled:border-primary-500
    disabled:text-primary-500
    disabled:cursor-not-allowed
    ${hasError ? "border-tertiary-red" : ""}
  `;

  const inputElement = (
    <div className={`relative ${fullWidth ? "w-full" : ""}`}>
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-300 flex items-center pointer-events-none">
          {prefix}
        </div>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        maxLength={maxLength}
        className={classNames(
          baseInputStyles,
          sizeClass,
          Boolean(prefix) && "pl-10",
          Boolean(suffix) && "pr-10",
          className,
        )}
        aria-invalid={hasError}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-300 flex items-center pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
  );

  if (label || error || helperText) {
    return (
      <FieldWrapper
        id={inputId}
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
      >
        {inputElement}
      </FieldWrapper>
    );
  }

  return inputElement;
}
