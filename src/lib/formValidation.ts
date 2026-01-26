import type { ZodError } from "zod";

type ZodIssueLike = {
  path: Array<PropertyKey>;
  message: string;
};

type ZodErrorLike = Pick<ZodError, "issues"> & {
  errors?: ZodIssueLike[];
};

/**
 * Format Zod error into a key-value pair object
 *
 * @example
 * ```ts
 * const formatted = formatZodError(error);
 * // { email: "Invalid email", password: "Too short" }
 * ```
 */
export function formatZodError<T extends Record<string, unknown>>(
  error: ZodError,
): Record<keyof T, string> {
  const formattedErrors: Record<string, string> = {};

  const issues =
    (error as ZodErrorLike).issues ?? (error as ZodErrorLike).errors ?? [];

  issues.forEach((err: ZodIssueLike) => {
    if (err.path.length > 0) {
      const field = err.path[0].toString();
      if (!formattedErrors[field]) {
        formattedErrors[field] = err.message;
      }
    }
  });

  return formattedErrors as Record<keyof T, string>;
}

/**
 * Get the first error message from a Zod error
 *
 * @example
 * ```ts
 * const firstError = getFirstZodError(error);
 * // "Invalid email"
 * ```
 */
export function getFirstZodError(error: ZodError): string | undefined {
  const issues =
    (error as ZodErrorLike).issues ?? (error as ZodErrorLike).errors ?? [];
  return issues[0]?.message;
}

/**
 * Check if a specific field has an error
 *
 * @example
 * ```ts
 * const hasEmailError = hasFieldError(formattedErrors, "email");
 * // true or false
 * ```
 */
export function hasFieldError<T extends Record<string, unknown>>(
  errors: Partial<Record<keyof T, string>>,
  field: keyof T,
): boolean {
  return Boolean(errors[field]);
}
