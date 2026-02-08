import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { apiTooManyRequests } from "@/services/api-response";
import { getEnv } from "@/services/env";

type Bucket = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, Bucket>();
const limiterStore = new Map<string, Ratelimit>();

const getIdentifier = (request: Request, keyPrefix: string) => {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";
  return `${keyPrefix}:${ip}`;
};

const getUpstashLimiter = (keyPrefix: string, limit: number, windowMs: number) => {
  const env = getEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const cacheKey = `${keyPrefix}:${limit}:${windowMs}`;
  const existing = limiterStore.get(cacheKey);
  if (existing) {
    return existing;
  }

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  const seconds = Math.max(1, Math.ceil(windowMs / 1000));
  const limiter = new Ratelimit({
    redis,
    prefix: `rate-limit:${keyPrefix}`,
    limiter: Ratelimit.fixedWindow(limit, `${seconds} s`),
    analytics: true,
  });

  limiterStore.set(cacheKey, limiter);
  return limiter;
};

const checkMemoryRateLimit = (
  identifier: string,
  config: { limit: number; windowMs: number },
) => {
  const now = Date.now();
  const current = memoryStore.get(identifier);

  if (!current || now > current.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return null;
  }

  if (current.count >= config.limit) {
    return apiTooManyRequests();
  }

  current.count += 1;
  memoryStore.set(identifier, current);
  return null;
};

export const checkRateLimit = async (
  request: Request,
  config: { keyPrefix: string; limit: number; windowMs: number },
) => {
  const identifier = getIdentifier(request, config.keyPrefix);
  const upstashLimiter = getUpstashLimiter(
    config.keyPrefix,
    config.limit,
    config.windowMs,
  );

  if (!upstashLimiter) {
    return checkMemoryRateLimit(identifier, config);
  }

  const result = await upstashLimiter.limit(identifier);
  if (!result.success) {
    return apiTooManyRequests();
  }

  return null;
};
