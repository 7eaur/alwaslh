import { describe, expect, it } from "vitest";
import { ADMIN_NAVIGATION, ADMIN_PRIMARY_ROUTES } from "./admin-navigation";

describe("admin navigation architecture", () => {
  it("keeps the primary IA small and two levels deep", () => {
    expect(ADMIN_NAVIGATION).toHaveLength(5);
    expect(ADMIN_NAVIGATION.every((group) => group.items.length >= 1 && group.items.length <= 3)).toBe(true);
  });

  it("uses unique deep-linkable primary routes", () => {
    expect(new Set(ADMIN_PRIMARY_ROUTES).size).toBe(ADMIN_PRIMARY_ROUTES.length);
    expect(ADMIN_PRIMARY_ROUTES).toEqual(
      expect.arrayContaining([
        "/app",
        "/app/curriculum",
        "/app/content",
        "/app/reviews",
        "/app/questions",
        "/app/quizzes",
        "/app/students",
        "/app/access-codes",
        "/app/operations",
        "/app/operations/audit",
        "/app/operations/diagnostics",
      ]),
    );
  });

  it("does not expose transitional technical workspaces in the sidebar", () => {
    expect(ADMIN_PRIMARY_ROUTES.some((route) => route.includes("ai-authoring"))).toBe(false);
    expect(ADMIN_PRIMARY_ROUTES.some((route) => route.includes("reports"))).toBe(false);
    expect(ADMIN_PRIMARY_ROUTES.some((route) => route.includes("governance"))).toBe(false);
  });
});
