import { z } from "zod";

export const leagueJoinCheckoutSchema = z.object({
  leagueId: z.coerce.number().int().positive(),
});

export type LeagueJoinCheckoutInput = z.infer<typeof leagueJoinCheckoutSchema>;
