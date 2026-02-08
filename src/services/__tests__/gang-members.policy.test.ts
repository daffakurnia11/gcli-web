import { describe, expect, it } from "vitest";

import {
  canAssignGangGrade,
  canManageGangMemberByGrade,
  canManageGangMembers,
  canModifySelf,
} from "@/services/policies/gang-members.policy";

describe("gang member policy", () => {
  it("allows only bosses to manage members", () => {
    expect(canManageGangMembers(true)).toBe(true);
    expect(canManageGangMembers(false)).toBe(false);
  });

  it("does not allow modifying self", () => {
    expect(canModifySelf("A", "A")).toBe(false);
    expect(canModifySelf("A", "B")).toBe(true);
  });

  it("allows assigning lower grades only", () => {
    expect(canAssignGangGrade(4, 3)).toBe(true);
    expect(canAssignGangGrade(4, 4)).toBe(false);
  });

  it("allows managing members below actor grade only", () => {
    expect(canManageGangMemberByGrade(4, 2)).toBe(true);
    expect(canManageGangMemberByGrade(4, 4)).toBe(false);
  });
});
