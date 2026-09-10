import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudentOfflineLease } from "./offline-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Student offline lease API", () => {
  it("requests the server-issued lease with the authenticated cookie", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(input).toBe("/v1/student/offline/lease");
      expect(init?.credentials).toBe("include");
      return new Response(
        JSON.stringify({
          lease: {
            version: 1,
            profileId: "profile-1",
            deviceId: "device-1",
            issuedAt: "2026-09-10T00:00:00.000Z",
            expiresAt: "2026-09-11T00:00:00.000Z",
            grants: [
              {
                entitlementId: "entitlement-1",
                scope: "class",
                classId: "class-1",
                expiresAt: "2026-09-10T12:00:00.000Z",
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const lease = await getStudentOfflineLease();
    expect(lease.profileId).toBe("profile-1");
    expect(lease.deviceId).toBe("device-1");
    expect(lease.grants[0]?.classId).toBe("class-1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
