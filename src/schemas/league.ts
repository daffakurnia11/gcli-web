import { z } from "zod";

export const leagueStatusSchema = z.enum(["upcoming", "active", "finished"]);

const parseJson = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return JSON.parse(trimmed) as unknown;
};

const parseDateTimeString = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

export const leagueFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "League name is required")
      .max(255, "League name must not exceed 255 characters"),
    status: leagueStatusSchema,
    startAt: z.string(),
    endAt: z.string(),
    price: z
      .string()
      .min(1, "Registration fee is required")
      .regex(/^\d+$/, "Registration fee must be a non-negative integer"),
    maxTeam: z
      .string()
      .min(1, "Max team is required")
      .regex(/^\d+$/, "Max team must be a non-negative integer"),
    minPlayer: z
      .string()
      .min(1, "Minimum player is required")
      .regex(/^\d+$/, "Minimum player must be a non-negative integer"),
    rulesJson: z
      .string()
      .optional()
      .transform((value) => value ?? "")
      .refine((value) => {
        try {
          parseJson(value);
          return true;
        } catch {
          return false;
        }
      }, "Rules JSON must be valid JSON"),
  })
  .refine((data) => {
    const startAt = parseDateTimeString(data.startAt);
    const endAt = parseDateTimeString(data.endAt);

    if (!startAt || !endAt) {
      return true;
    }

    return endAt >= startAt;
  }, {
    message: "End At must be greater than or equal to Start At",
    path: ["endAt"],
  });

const leagueUpsertBaseSchema = z.object({
  name: z.string().trim().min(1).max(255),
  status: leagueStatusSchema,
  startAt: z.string().datetime().nullable().optional(),
  endAt: z.string().datetime().nullable().optional(),
  price: z.number().int().min(0),
  maxTeam: z.number().int().min(0),
  minPlayer: z.number().int().min(0),
  rulesJson: z.unknown().optional(),
});

export const leagueCreateSchema = leagueUpsertBaseSchema.refine((data) => {
  if (!data.startAt || !data.endAt) {
    return true;
  }
  return new Date(data.endAt) >= new Date(data.startAt);
}, {
  message: "endAt must be greater than or equal to startAt.",
  path: ["endAt"],
});

export const leagueUpdateSchema = leagueUpsertBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No updatable fields were provided.",
  })
  .refine((data) => {
    if (!data.startAt || !data.endAt) {
      return true;
    }
    return new Date(data.endAt) >= new Date(data.startAt);
  }, {
    message: "endAt must be greater than or equal to startAt.",
    path: ["endAt"],
  });

export const leagueListQuerySchema = z.object({
  q: z.string().optional(),
  status: leagueStatusSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type LeagueCreateInput = z.infer<typeof leagueCreateSchema>;
export type LeagueUpdateInput = z.infer<typeof leagueUpdateSchema>;

export const toLeaguePayload = (form: LeagueFormValues): AdminLeagueUpsertPayload => ({
  name: form.name.trim(),
  status: form.status,
  startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
  endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
  price: Number.parseInt(form.price, 10),
  maxTeam: Number.parseInt(form.maxTeam, 10),
  minPlayer: Number.parseInt(form.minPlayer, 10),
  rulesJson: parseJson(form.rulesJson),
});
