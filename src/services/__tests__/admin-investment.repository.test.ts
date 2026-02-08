import { describe, expect, it } from "vitest";

import { ensureRowsAffected } from "@/services/repositories/admin-investment.repository";

describe("ensureRowsAffected", () => {
  it("throws when no rows are affected", () => {
    expect(() => ensureRowsAffected(0)).toThrowError(
      "Business metadata not found for bank account",
    );
  });

  it("passes when rows are affected", () => {
    expect(() => ensureRowsAffected(1)).not.toThrow();
  });
});
