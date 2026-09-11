import { describe, expect, it } from "vitest";
import type { StudentOfflineLease } from "./offline-api";
import {
  createStoredOfflineLease,
  evaluateStoredOfflineLease,
  offlineScopeKey,
  storedLeaseAllowsClass,
} from "./offline-store";

function lease(overrides: Partial<StudentOfflineLease> = {}): StudentOfflineLease {
  return {
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
    ...overrides,
  };
}

describe("Student offline lease storage policy", () => {
  it("scopes records by both profile and registered device", () => {
    expect(offlineScopeKey("profile-1", "device-1")).toBe("profile-1:device-1");
    expect(offlineScopeKey("profile-1", "device-2")).not.toBe(offlineScopeKey("profile-1", "device-1"));
  });

  it("estimates server time from the online observation instead of trusting absolute client time", () => {
    const observedAtClientMs = Date.parse("2026-09-10T03:00:00.000Z");
    const record = createStoredOfflineLease(lease(), observedAtClientMs);
    const evaluation = evaluateStoredOfflineLease(record, observedAtClientMs + 60 * 60 * 1000);

    expect(evaluation.status).toBe("fresh");
    expect(evaluation.estimatedServerTimeMs).toBe(Date.parse("2026-09-10T01:00:00.000Z"));
  });

  it("rejects meaningful client clock rollback and expires at the server-issued lease boundary", () => {
    const observedAtClientMs = Date.parse("2026-09-10T03:00:00.000Z");
    const record = createStoredOfflineLease(lease(), observedAtClientMs);
    record.lastSeenClientMs = observedAtClientMs + 2 * 60 * 60 * 1000;

    expect(evaluateStoredOfflineLease(record, observedAtClientMs).status).toBe("clock_rollback");
    expect(evaluateStoredOfflineLease(record, observedAtClientMs + 24 * 60 * 60 * 1000).status).toBe("expired");
  });

  it("allows only unexpired grants for the requested class", () => {
    const observedAtClientMs = Date.parse("2026-09-10T03:00:00.000Z");
    const record = createStoredOfflineLease(lease(), observedAtClientMs);

    expect(storedLeaseAllowsClass(record, "class-1", observedAtClientMs + 30 * 60 * 1000)).toBe(true);
    expect(storedLeaseAllowsClass(record, "class-2", observedAtClientMs + 30 * 60 * 1000)).toBe(false);
    expect(storedLeaseAllowsClass(record, "class-1", observedAtClientMs + 13 * 60 * 60 * 1000)).toBe(false);

    const allContent = createStoredOfflineLease(
      lease({
        grants: [
          {
            entitlementId: "entitlement-all",
            scope: "all_content",
            classId: null,
            expiresAt: "2026-09-11T00:00:00.000Z",
          },
        ],
      }),
      observedAtClientMs,
    );
    expect(storedLeaseAllowsClass(allContent, "any-class", observedAtClientMs + 60 * 60 * 1000)).toBe(true);
  });
});
