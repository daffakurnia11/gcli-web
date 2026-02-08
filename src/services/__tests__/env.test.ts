import { describe, expect, it } from "vitest";
import { z } from "zod";

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    AUTH_SECRET: z.string().optional(),
    NEXTAUTH_SECRET: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    const hasAuthSecret = Boolean(env.AUTH_SECRET || env.NEXTAUTH_SECRET);
    if (env.NODE_ENV === "production" && !hasAuthSecret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AUTH_SECRET or NEXTAUTH_SECRET is required in production",
      });
    }

    const hasUpstashUrl = Boolean(env.UPSTASH_REDIS_REST_URL);
    const hasUpstashToken = Boolean(env.UPSTASH_REDIS_REST_TOKEN);
    if (hasUpstashUrl !== hasUpstashToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be provided together",
      });
    }
  });

describe("env schema", () => {
  it("rejects production without auth secret", () => {
    const parsed = schema.safeParse({ NODE_ENV: "production" });
    expect(parsed.success).toBe(false);
  });

  it("rejects partial upstash config", () => {
    const parsed = schema.safeParse({
      NODE_ENV: "development",
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
    });
    expect(parsed.success).toBe(false);
  });
});
