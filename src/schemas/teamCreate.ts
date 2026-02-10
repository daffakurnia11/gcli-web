import { z } from "zod";

export const createTeamSchema = z.object({
  gangName: z
    .string()
    .trim()
    .min(3, "Gang name must be at least 3 characters")
    .max(100, "Gang name must not exceed 100 characters"),
  gangShortName: z
    .string()
    .trim()
    .min(2, "Gang short name must be at least 2 characters")
    .max(50, "Gang short name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Gang short name can only contain letters, numbers, and underscores",
    )
    .transform((value) => value.toLowerCase())
    .refine((value) => value !== "none", "Gang short name cannot be 'none'"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
