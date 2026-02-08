import { describe, expect, it } from "vitest";

import { checkRateLimit } from "@/services/rate-limit";

describe("checkRateLimit", () => {
  it("blocks requests exceeding limit", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const request = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });

    const config = { keyPrefix: "unit-test", limit: 2, windowMs: 10_000 };

    const first = await checkRateLimit(request, config);
    const second = await checkRateLimit(request, config);
    const third = await checkRateLimit(request, config);

    expect(first).toBeNull();
    expect(second).toBeNull();
    expect(third).not.toBeNull();

    if (third) {
      const body = (await third.json()) as ApiStandardErrorResponse;
      expect(body.code).toBe(429);
    }
  });
});
