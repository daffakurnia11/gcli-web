import { describe, expect, it } from "vitest";

import { apiFromLegacy } from "@/services/api-response";

describe("apiFromLegacy", () => {
  it("wraps success payload with standard envelope", async () => {
    const response = apiFromLegacy({ foo: "bar" }, { status: 200 });
    const body = (await response.json()) as ApiStandardSuccessResponse<Record<string, string>>;

    expect(body.success).toBe(true);
    expect(body.code).toBe(200);
    expect(body.message).toBe("Successfully fetch data");
    expect(body.data).toEqual({ foo: "bar" });
  });

  it("wraps error payload with standard envelope", async () => {
    const response = apiFromLegacy({ error: "Unauthorized" }, { status: 401 });
    const body = (await response.json()) as ApiStandardErrorResponse;

    expect(body.success).toBe(false);
    expect(body.code).toBe(401);
    expect(body.message).toBe("Unauthorized");
  });
});
