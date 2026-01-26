import { z } from "zod";

/**
 * Information Step Validation Schema
 */
export const accountInfoSchema = z.object({
  name: z
    .string()
    .min(1, "Real name is required")
    .min(3, "Real name must be at least 3 characters")
    .max(100, "Real name must not exceed 100 characters"),
  username: z
    .string()
    .min(1, "FiveM account name is required")
    .min(3, "FiveM name must be at least 3 characters")
    .max(50, "FiveM name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_ -]+$/,
      "FiveM name can only contain letters, numbers, underscores, dashes, and spaces",
    ),
  gender: z
    .enum(["male", "female"])
    .or(z.literal(""))
    .refine((val) => val !== "", "Gender is required"),
  birthDate: z
    .string()
    .min(1, "Birth date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      return selectedDate <= today;
    }, "Birth date cannot be in the future"),
  province: z.object({
    id: z.number().min(1, "Province is required"),
    name: z.string().min(1, "Province is required"),
  }),
  city: z.object({
    id: z.number().min(1, "City is required"),
    name: z.string().min(1, "City is required"),
  }),
});

/**
 * Credentials Step Validation Schema
 */
export const passwordSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Infer types from schemas
 */
export type AccountInfoFormData = z.infer<typeof accountInfoSchema>;
export type AccountInfoDraft = Omit<AccountInfoFormData, "gender"> & {
  gender: "" | "male" | "female";
};
export type PasswordFormData = z.infer<typeof passwordSchema>;

/**
 * Form field error type
 */
export type FormErrors<T> = {
  [K in keyof T]?: string;
};
