"use client";

import classNames from "classnames";
import { File as FileIcon, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import type { DropzoneProps, FormSize } from "@/types/Form";

import { FieldWrapper } from "./FieldWrapper";

const sizeStyles: Record<FormSize, string> = {
  sm: "min-h-36 p-3 text-sm",
  md: "min-h-44 p-4 text-base",
  lg: "min-h-52 p-5 text-lg",
  xl: "min-h-60 p-6 text-xl",
};

const iconSizeStyles: Record<FormSize, number> = {
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
};

export function Dropzone({
  id,
  name,
  label,
  error,
  helperText,
  disabled = false,
  required = false,
  multiple = false,
  accept,
  validation,
  onFilesChange,
  className = "",
  fullWidth = false,
  size = "md",
}: DropzoneProps) {
  const dropzoneId = id || name;
  const hasError = Boolean(error);
  const sizeClass = sizeStyles[size];
  const iconSize = iconSizeStyles[size];

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (newFiles: File[]): { valid: File[]; errors: string[] } => {
      const errors: string[] = [];
      const valid: File[] = [];

      for (const file of newFiles) {
        // Check file size
        if (validation?.maxSize && file.size > validation.maxSize) {
          errors.push(
            `${file.name} exceeds maximum size of ${Math.round(validation.maxSize / 1024 / 1024)}MB`,
          );
          continue;
        }

        // Check file type
        if (
          validation?.allowedTypes &&
          !validation.allowedTypes.includes(file.type)
        ) {
          errors.push(`${file.name} is not an allowed file type`);
          continue;
        }

        valid.push(file);
      }

      // Check max files
      if (validation?.maxFiles && valid.length > validation.maxFiles) {
        errors.push(
          `Maximum ${validation.maxFiles} file${validation.maxFiles > 1 ? "s" : ""} allowed`,
        );
        return { valid: valid.slice(0, validation.maxFiles), errors };
      }

      return { valid, errors };
    },
    [validation],
  );

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      if (disabled) return;

      const { valid, errors } = validateFiles(newFiles);
      setValidationErrors(errors);

      const updatedFiles = multiple ? [...files, ...valid] : valid;
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    },
    [disabled, multiple, files, validateFiles, onFilesChange],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    },
    [disabled, handleFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      handleFiles(selectedFiles);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [handleFiles],
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      if (disabled) return;

      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
      setValidationErrors([]);
    },
    [disabled, files, onFilesChange],
  );

  const baseDropzoneStyles = `
    w-full rounded-md border-2 border-dashed
    transition-all duration-200
    focus:outline-none
    focus:outline-offset-2
    focus:outline-2
    focus:outline-secondary-700
    disabled:border-primary-500
    disabled:cursor-not-allowed
    ${hasError || validationErrors.length > 0 ? "border-tertiary-red" : "border-primary-300"}
    ${isDragging ? "border-secondary-700 bg-primary-700" : "bg-primary-900"}
  `;

  const dropzoneElement = (
    <div className={classNames(fullWidth && "w-full")}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={classNames(
          baseDropzoneStyles,
          sizeClass,
          className,
          disabled ? "opacity-50" : "cursor-pointer",
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          id={dropzoneId}
          name={name}
          type="file"
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          onChange={handleInputChange}
          className="hidden"
          aria-invalid={hasError || validationErrors.length > 0}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={classNames(
              "text-primary-300 transition-colors",
              isDragging && "text-secondary-700",
            )}
          >
            <Upload size={iconSize} />
          </div>
          <div className="text-center">
            <p className="font-medium text-primary-100">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-primary-300 mt-1">
              or <span className="text-secondary-700 underline">browse</span> to
              choose files
            </p>
          </div>
          {validation?.allowedTypes && (
            <p className="text-primary-300 text-xs">
              Allowed: {validation.allowedTypes.join(", ")}
            </p>
          )}
          {validation?.maxSize && (
            <p className="text-primary-300 text-xs">
              Max size: {Math.round(validation.maxSize / 1024 / 1024)}MB
            </p>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2 w-full">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 bg-primary-700 rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileIcon
                    size={iconSize - 4}
                    className="text-primary-300 shrink-0"
                  />
                  <span className="text-primary-100 text-sm truncate">
                    {file.name}
                  </span>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="text-primary-300 hover:text-tertiary-red transition-colors shrink-0"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={iconSize - 4} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mt-4 space-y-1">
            {validationErrors.map((error, index) => (
              <p key={index} className="text-tertiary-red text-xs">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (label || error || helperText) {
    return (
      <FieldWrapper
        id={dropzoneId}
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
      >
        {dropzoneElement}
      </FieldWrapper>
    );
  }

  return dropzoneElement;
}
