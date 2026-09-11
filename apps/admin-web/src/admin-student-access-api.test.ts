import { afterEach, describe, expect, it, vi } from "vitest";
import {
  allowStudentDeviceRebind,
  fetchAdminAccessCodes,
  fetchAdminStudentDetail,
  fetchAdminStudents,
  generateClassAccessCodes,
  generateFullAccessCodes,
  issueStudentTemporaryPassword,
  revokeStudentEntitlement,
  revokeUnusedAccessCodes,
} from "./admin-student-access-api";

function response(body: unknown, status = 200): Response {
  return new Response(body === undefined ? undefined : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin student/access api client", () => {
  it("encodes code filters and pagination through the shared authenticated transport", async () => {
    const payload = { codes: [], page: { total: 0, limit: 25, offset: 50 } };
    const fetchMock = vi.fn().mockResolvedValue(response(payload));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchAdminAccessCodes({
        type: "class_access",
        status: "active",
        search: "  ١٢٣٤  ",
        classId: "11111111-1111-4111-8111-111111111111",
        sort: "expires_at",
        direction: "asc",
        limit: 25,
        offset: 50,
      }),
    ).resolves.toEqual(payload);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsed = new URL(url, "http://admin.test");
    expect(parsed.pathname).toBe("/v1/admin/access/codes");
    expect(parsed.searchParams.get("type")).toBe("class_access");
    expect(parsed.searchParams.get("status")).toBe("active");
    expect(parsed.searchParams.get("search")).toBe("١٢٣٤");
    expect(parsed.searchParams.get("sort")).toBe("expires_at");
    expect(parsed.searchParams.get("offset")).toBe("50");
    expect(init.credentials).toBe("include");
  });

  it("keeps generation and non-destructive bulk revoke contracts explicit", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ codes: ["123456"], durationDays: 365 }))
      .mockResolvedValueOnce(
        response({
          codes: ["1234567"],
          classId: "11111111-1111-4111-8111-111111111111",
          durationDays: 30,
        }),
      )
      .mockResolvedValueOnce(
        response({ revokedIds: ["a"], blockedIds: ["b"], alreadyRevokedIds: [], missingIds: [] }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await generateFullAccessCodes(1, 365);
    await generateClassAccessCodes("11111111-1111-4111-8111-111111111111", 1, 30);
    await revokeUnusedAccessCodes("class_access", ["a", "b"]);

    const [, fullInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(fullInit.method).toBe("POST");
    expect(fullInit.body).toBe(JSON.stringify({ count: 1, durationDays: 365 }));

    const [classUrl, classInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(new URL(classUrl, "http://admin.test").pathname).toBe("/v1/admin/access/class-codes");
    expect(classInit.body).toBe(
      JSON.stringify({
        classId: "11111111-1111-4111-8111-111111111111",
        count: 1,
        durationDays: 30,
      }),
    );

    const [revokeUrl, revokeInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(new URL(revokeUrl, "http://admin.test").pathname).toBe("/v1/admin/access/codes/revoke");
    expect(revokeInit.body).toBe(JSON.stringify({ type: "class_access", codeIds: ["a", "b"] }));
  });

  it("loads student lists/details with bounded history pagination", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ students: [], page: { total: 0, limit: 20, offset: 40 } }))
      .mockResolvedValueOnce(response({ student: { id: "student-1" } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAdminStudents({
      search: "  student  ",
      status: "active",
      sort: "last_login",
      direction: "desc",
      limit: 20,
      offset: 40,
    });
    await fetchAdminStudentDetail("student-1", 10, 20);

    const listUrl = new URL(fetchMock.mock.calls[0]?.[0] as string, "http://admin.test");
    expect(listUrl.pathname).toBe("/v1/admin/students");
    expect(listUrl.searchParams.get("search")).toBe("student");
    expect(listUrl.searchParams.get("limit")).toBe("20");
    expect(listUrl.searchParams.get("offset")).toBe("40");

    const detailUrl = new URL(fetchMock.mock.calls[1]?.[0] as string, "http://admin.test");
    expect(detailUrl.pathname).toBe("/v1/admin/students/student-1");
    expect(detailUrl.searchParams.get("historyLimit")).toBe("10");
    expect(detailUrl.searchParams.get("historyOffset")).toBe("20");
  });

  it("uses existing auth/access authority for recovery, device rebind and entitlement revoke", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ temporaryPassword: "temp-value", expiresInHours: 24 }))
      .mockResolvedValueOnce(response({ status: "device_rebind_allowed" }))
      .mockResolvedValueOnce(response(undefined, 204));
    vi.stubGlobal("fetch", fetchMock);

    await issueStudentTemporaryPassword("student-1");
    await allowStudentDeviceRebind("student-1");
    await revokeStudentEntitlement("entitlement-1");

    const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
    expect(new URL(calls[0]?.[0] ?? "", "http://admin.test").pathname).toBe(
      "/v1/admin/auth/temporary-password",
    );
    expect(calls[0]?.[1].body).toBe(JSON.stringify({ profileId: "student-1" }));
    expect(new URL(calls[1]?.[0] ?? "", "http://admin.test").pathname).toBe(
      "/v1/admin/auth/device-rebind",
    );
    expect(new URL(calls[2]?.[0] ?? "", "http://admin.test").pathname).toBe(
      "/v1/admin/access/entitlements/entitlement-1/revoke",
    );
  });
});
