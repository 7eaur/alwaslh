import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentOfflineLease } from "./offline-api";

const mocks = vi.hoisted(() => ({
  fetchLease: vi.fn(), save: vi.fn(), remove: vi.fn(), list: vi.fn(),
}));
vi.mock("./offline-api", () => ({ getStudentOfflineLease: mocks.fetchLease }));
vi.mock("./offline-store", () => ({
  saveOfflineLease: mocks.save, deleteOfflineScope: mocks.remove, listOfflineLeases: mocks.list,
}));

const key = "alwaslh-student-offline:active-scope";
const lease: StudentOfflineLease = {
  version: 1, profileId: "profile-1", deviceId: "device-1",
  issuedAt: "2026-09-12T00:00:00.000Z", expiresAt: "2026-09-13T00:00:00.000Z", grants: [],
};
function storage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    getItem: (name) => values.get(name) ?? null,
    setItem: (name, value) => { values.set(name, value); },
    removeItem: (name) => { values.delete(name); },
    clear: () => values.clear(), key: (index) => [...values.keys()][index] ?? null,
  };
}

describe("durable offline scope lifecycle", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal("window", { localStorage: storage(), sessionStorage: storage() });
    mocks.fetchLease.mockResolvedValue(lease);
    mocks.save.mockImplementation(async (value) => ({ ...value, lease: value }));
    mocks.remove.mockResolvedValue(undefined);
    mocks.list.mockResolvedValue([]);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("survives module/browser session restart using only profile/device and observes cross-tab logout", async () => {
    const session = await import("./offline-session");
    await session.syncOfflineLeaseForSession(lease.profileId, "login");
    expect(JSON.parse(window.localStorage.getItem(key)!)).toEqual({ profileId: "profile-1", deviceId: "device-1" });
    window.sessionStorage.clear();
    vi.resetModules();
    const restarted = await import("./offline-session");
    expect(restarted.getActiveOfflineScope()).toEqual({ profileId: "profile-1", deviceId: "device-1" });
    expect(restarted.getActiveOfflineScope("other-profile")).toBeNull();
    window.localStorage.removeItem(key);
    expect(restarted.getActiveOfflineScope()).toBeNull();
  });

  it("rejects malformed or secret-bearing selectors and unavailable storage", async () => {
    const session = await import("./offline-session");
    for (const value of ["null", "[]", "broken", JSON.stringify({ profileId: "p", deviceId: "d", token: "secret" })]) {
      window.localStorage.setItem(key, value);
      expect(session.getActiveOfflineScope()).toBeNull();
    }
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => { throw new Error("denied"); });
    expect(session.getActiveOfflineScope()).toBeNull();
  });

  it("checks the expected account before persisting any lease or scope", async () => {
    const session = await import("./offline-session");
    await expect(session.syncOfflineLeaseForSession("other-profile", "login")).rejects.toThrow("offline_lease_profile_mismatch");
    expect(mocks.save).not.toHaveBeenCalled();
    expect(session.getActiveOfflineScope()).toBeNull();
  });

  it("logout invalidates a delayed lease response instead of resurrecting local authorization", async () => {
    const session = await import("./offline-session");
    await session.syncOfflineLeaseForSession(lease.profileId, "login");
    let finish!: (value: StudentOfflineLease) => void;
    mocks.fetchLease.mockReturnValue(new Promise<StudentOfflineLease>((resolve) => { finish = resolve; }));
    const pending = session.refreshOfflineLeaseForCurrentSession();
    await session.clearActiveOfflineLease();
    finish(lease);
    await expect(pending).rejects.toThrow("offline_session_changed");
    expect(session.getActiveOfflineScope()).toBeNull();
    expect(mocks.remove).toHaveBeenCalledWith("profile-1", "device-1");
    expect(mocks.save).toHaveBeenCalledTimes(1);
  });

  it("removes only stale devices of the rebound profile", async () => {
    mocks.list.mockResolvedValue([
      { profileId: lease.profileId, deviceId: "old-device" },
      { profileId: "other-profile", deviceId: "other-device" }, lease,
    ]);
    const session = await import("./offline-session");
    await session.syncOfflineLeaseForSession(lease.profileId, "device_rebind");
    expect(mocks.remove).toHaveBeenCalledExactlyOnceWith("profile-1", "old-device");
  });
});
