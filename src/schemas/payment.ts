import { z } from "zod";

export const paymentRecapQuerySchema = z.object({
  q: z.string().optional().default(""),
  status: z.string().optional(),
  purposeType: z.string().optional(),
  provider: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
