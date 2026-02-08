import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXTAUTH_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(1).optional(),
    NEXTAUTH_SECRET: z.string().min(1).optional(),
    DISCORD_CLIENT_ID: z.string().min(1).optional(),
    DISCORD_CLIENT_SECRET: z.string().min(1).optional(),
    DISCORD_API_INVITE_CODE: z.string().min(1).optional(),
    FIVEM_API_BASE: z.string().url().optional(),
    FIVEM_API_BASE_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    const hasAuthSecret = Boolean(env.AUTH_SECRET || env.NEXTAUTH_SECRET);
    if (env.NODE_ENV === "production" && !hasAuthSecret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_SECRET"],
        message: "AUTH_SECRET or NEXTAUTH_SECRET is required in production",
      });
    }

    const hasUpstashUrl = Boolean(env.UPSTASH_REDIS_REST_URL);
    const hasUpstashToken = Boolean(env.UPSTASH_REDIS_REST_TOKEN);
    if (hasUpstashUrl !== hasUpstashToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["UPSTASH_REDIS_REST_URL"],
        message:
          "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be provided together",
      });
    }
  });

let cachedEnv: z.infer<typeof envSchema> | null = null;

export const getEnv = () => {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }
  return cachedEnv;
};
