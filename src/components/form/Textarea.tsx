"use client";

import classNames from "classnames";

import type { FormSize, TextareaProps, TextareaResize } from "@/types/Form";

import { FieldWrapper } from "./FieldWrapper";

const sizeStyles: Record<FormSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-5 py-3.5 text-lg",
  xl: "px-6 py-4 text-xl",
};

const resizeStyles: Record<TextareaResize, string> = {
  none: "resize-none",
  both: "resize",
  horizontal: "resize-x",
  vertical: "resize-y",
};

export function Textarea({
  id,
  name,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  required = false,
  onChange,
  onBlur,
  onFocus,
  className = "",
  fullWidth = false,
  size = "md",
  label,
  error,
  helperText,
  rows = 4,
  resize = "vertical",
  maxLength,
}: TextareaProps) {
  const textareaId = id || name;
  const hasError = Boolean(error);
  const sizeClass = sizeStyles[size];
  const resizeClass = resizeStyles[resize];

  const baseTextareaStyles = `
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

  const textareaElement = (
    <textarea
      id={textareaId}
      name={name}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      rows={rows}
      maxLength={maxLength}
      className={classNames(
        baseTextareaStyles,
        sizeClass,
        resizeClass,
        className,
        fullWidth && "w-full",
      )}
      aria-invalid={hasError}
    />
  );

  if (label || error || helperText) {
    return (
      <FieldWrapper
        id={textareaId}
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
      >
        {textareaElement}
      </FieldWrapper>
    );
  }

  return textareaElement;
}
