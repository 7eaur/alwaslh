import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAdminNotification,
  deleteAdminNotification,
  fetchAdminNotifications,
  fetchAdminOperationsOverview,
} from "./admin-operations-api";

function response(body: unknown, status = 200): Response {
  return new Response(body === undefined ? undefined : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin operations api client", () => {
  it("loads the bounded real operations overview", async () => {
    const payload = { metrics: {}, recentNotifications: [], recentActivity: [] };
    const fetchMock = vi.fn().mockResolvedValue(response(payload));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchAdminOperationsOverview(12)).resolves.toEqual(payload);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsed = new URL(url, "http://admin.test");
    expect(parsed.pathname).toBe("/v1/admin/operations/overview");
    expect(parsed.searchParams.get("recentLimit")).toBe("12");
    expect(init.credentials).toBe("include");
  });

  it("encodes notification filters and pagination", async () => {
    const payload = { notifications: [], page: { total: 0, limit: 25, offset: 25 } };
    const fetchMock = vi.fn().mockResolvedValue(response(payload));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAdminNotifications({
      search: "  تنبيه مهم  ",
      severity: "warning",
      limit: 25,
      offset: 25,
    });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsed = new URL(url, "http://admin.test");
    expect(parsed.pathname).toBe("/v1/admin/notifications");
    expect(parsed.searchParams.get("search")).toBe("تنبيه مهم");
    expect(parsed.searchParams.get("severity")).toBe("warning");
    expect(parsed.searchParams.get("offset")).toBe("25");
  });

  it("creates and deletes notifications through the canonical authority", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ notification: { id: "notification-1" } }, 201))
      .mockResolvedValueOnce(response(undefined, 204));
    vi.stubGlobal("fetch", fetchMock);

    await createAdminNotification({
      title: "إشعار الاختبار",
      body: "رسالة عملية",
      severity: "critical",
      actionPath: "/student",
      expiresAt: null,
    });
    await deleteAdminNotification("notification-1");

    const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
    expect(new URL(calls[0]?.[0] ?? "", "http://admin.test").pathname).toBe("/v1/admin/notifications");
    expect(calls[0]?.[1].method).toBe("POST");
    expect(calls[0]?.[1].body).toBe(
      JSON.stringify({
        title: "إشعار الاختبار",
        body: "رسالة عملية",
        severity: "critical",
        actionPath: "/student",
        expiresAt: null,
      }),
    );
    expect(new URL(calls[1]?.[0] ?? "", "http://admin.test").pathname).toBe(
      "/v1/admin/notifications/notification-1",
    );
    expect(calls[1]?.[1].method).toBe("DELETE");
  });
});
