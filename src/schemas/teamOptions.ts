import { z } from "zod";

export const updateTeamNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Team name must be at least 3 characters")
    .max(100, "Team name must not exceed 100 characters"),
});

export type UpdateTeamNameInput = z.infer<typeof updateTeamNameSchema>;
