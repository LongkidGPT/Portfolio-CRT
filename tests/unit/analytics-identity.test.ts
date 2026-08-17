import { describe, expect, test, vi } from "vitest";
import {
  createSessionId,
  getOrCreateVisitorId,
  normalizeBranchId,
  resolveDeploymentBranchId,
} from "@/lib/analytics/identity";

describe("analytics identity", () => {
  test.each([
    ["/", undefined, "/"],
    ["/anker-visual", undefined, "/anker-visual"],
    ["/about", "/anker-visual", "/anker-visual"],
    ["/work/brand-system", "/anker-visual", "/anker-visual"],
    ["/work/brand-system", undefined, "/"],
    ["/ANKER-VISUAL/", undefined, "/anker-visual"],
    ["/%3Cscript%3E", undefined, "/"],
  ])("normalizes %s with stored branch %s", (pathname, stored, expected) => {
    expect(normalizeBranchId(pathname, stored)).toBe(expected);
  });

  test.each([
    ["machinepulse--longkid-portfolio-crt.netlify.app", "/", undefined, "/machinepulse"],
    ["longkid-portfolio-crt.netlify.app", "/", undefined, "/main"],
    ["localhost:3000", "/machinepulse", undefined, "/machinepulse"],
  ])("resolves deployment %s independently from pathname", (hostname, pathname, stored, expected) => {
    expect(resolveDeploymentBranchId(hostname, pathname, stored)).toBe(expected);
  });

  test("persists one anonymous visitor but creates fresh session IDs", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const crypto = {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce("visitor-a")
        .mockReturnValueOnce("session-a")
        .mockReturnValueOnce("session-b"),
    };

    expect(getOrCreateVisitorId(storage, crypto)).toBe("visitor-a");
    expect(getOrCreateVisitorId(storage, crypto)).toBe("visitor-a");
    expect(createSessionId(crypto)).toBe("session-a");
    expect(createSessionId(crypto)).toBe("session-b");
  });
});
