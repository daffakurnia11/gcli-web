import type { ReactNode } from "react";

/**
 * Size variants for form components
 */
export type FormSize = "sm" | "md" | "lg" | "xl";

/**
 * Base props shared by all form inputs
 */
export interface BaseInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  fullWidth?: boolean;
  size?: FormSize;
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Props for Text input component
 */
export interface TextInputProps extends BaseInputProps {
  type?: "text" | "email" | "password" | "tel" | "url" | "search";
  prefix?: ReactNode;
  suffix?: ReactNode;
  maxLength?: number;
}

/**
 * Props for Number input component
 */
export interface NumberInputProps extends Omit<BaseInputProps, "onChange" | "onBlur" | "onFocus"> {
  value?: number | string;
  defaultValue?: number | string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Option for Select component
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Props for Select component
 */
export interface SelectProps extends Omit<BaseInputProps, "onChange"> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

/**
 * Props for Date component
 */
export interface DateInputProps extends Omit<BaseInputProps, "value" | "defaultValue"> {
  value?: string; // ISO date string or ISO datetime string
  defaultValue?: string; // ISO date string or ISO datetime string
  min?: string; // ISO date string or ISO datetime string
  max?: string; // ISO date string or ISO datetime string
  enableTime?: boolean; // Show time picker
  hour12?: boolean; // Use 12-hour format (default: false/24-hour)
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * Resize options for Textarea
 */
export type TextareaResize = "none" | "both" | "horizontal" | "vertical";

/**
 * Props for Textarea component
 */
export interface TextareaProps extends Omit<BaseInputProps, "onChange" | "onBlur" | "onFocus"> {
  rows?: number;
  resize?: TextareaResize;
  maxLength?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

/**
 * File validation rules for Dropzone
 */
export interface FileValidation {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types, e.g., ["image/png", "image/jpeg"]
  maxFiles?: number;
}

/**
 * Props for Dropzone component
 */
export interface DropzoneProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  accept?: string; // HTML accept attribute
  validation?: FileValidation;
  onFilesChange?: (files: File[]) => void;
  className?: string;
  fullWidth?: boolean;
  size?: FormSize;
}

/**
 * Option for Radio component
 */
export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Props for Radio component
 */
export interface RadioProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  size?: FormSize;
}

/**
 * Props for Checkbox component
 */
export interface CheckboxProps {
  name?: string;
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  helperText?: string;
  className?: string;
  size?: FormSize;
}

/**
 * Props for FieldWrapper component
 */
export interface FieldWrapperProps {
  id?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Form component namespace type
 */
export interface FormComponent {
  Text: React.FC<TextInputProps>;
  Number: React.FC<NumberInputProps>;
  Select: React.FC<SelectProps>;
  Date: React.FC<DateInputProps>;
  Textarea: React.FC<TextareaProps>;
  Dropzone: React.FC<DropzoneProps>;
  Radio: React.FC<RadioProps>;
  Checkbox: React.FC<CheckboxProps>;
}
