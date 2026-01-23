import type { FieldWrapperProps } from "@/types/Form";

export function FieldWrapper({
  id,
  label,
  error,
  helperText,
  required,
  disabled,
  children,
}: FieldWrapperProps) {
  const hasHelperOrError = Boolean(error || helperText);
  const helperId = hasHelperOrError ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium ${disabled ? "text-primary-500" : "text-primary-100"}`}
        >
          {label}
          {required && <span className="text-tertiary-red ml-0.5">*</span>}
        </label>
      )}

      <div
        aria-invalid={Boolean(error)}
        aria-describedby={hasHelperOrError ? helperId : undefined}
        aria-required={required}
      >
        {children}
      </div>

      {hasHelperOrError && (
        <p
          id={errorId || helperId}
          className={`text-xs ${error ? "text-tertiary-red" : "text-primary-300"}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
