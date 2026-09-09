import { afterEach, describe, expect, it, vi } from "vitest";
import {
  completeActivation,
  completeStudentLogin,
  createAccessRedemptionIdempotencyKey,
  createActivationIdempotencyKey,
  isSevenDigitClassCode,
  isSixDigitAccessCode,
  listStudentEntitlements,
  normalizeAccessCode,
  redeemStudentAccess,
  startStudentLogin,
  verifyActivation,
} from "./auth-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeAccessCode", () => {
  it("normalizes Arabic-Indic digits", () => {
    expect(normalizeAccessCode(" ١٢٣-٤٥٦ ")).toBe("123456");
  });

  it("normalizes Eastern Arabic digits", () => {
    expect(normalizeAccessCode("۱۲۳ ۴۵۶")).toBe("123456");
  });

  it("removes separators and non-digit characters", () => {
    expect(normalizeAccessCode("12a-34 56")).toBe("123456");
  });
});

describe("access-code validation", () => {
  it("accepts exactly six normalized activation digits", () => {
    expect(isSixDigitAccessCode("١٢٣٤٥٦")).toBe(true);
    expect(isSixDigitAccessCode("123456")).toBe(true);
    expect(isSixDigitAccessCode("12345")).toBe(false);
    expect(isSixDigitAccessCode("1234567")).toBe(false);
  });

  it("accepts exactly seven normalized class-code digits", () => {
    expect(isSevenDigitClassCode("١٢٣٤٥٦٧")).toBe(true);
    expect(isSevenDigitClassCode("۱۲۳۴۵۶۷")).toBe(true);
    expect(isSevenDigitClassCode("1234567")).toBe(true);
    expect(isSevenDigitClassCode("123456")).toBe(false);
    expect(isSevenDigitClassCode("12345678")).toBe(false);
  });
});

describe("student auth API contract", () => {
  it("verifies activation without sending a password", async () => {
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push([input, init]);
      return new Response(
        JSON.stringify({
          activationTicket: "ticket-abcdefghijklmnopqrstuvwxyz-1234567890",
          accountIdentifier: "123456",
          expiresInSeconds: 600,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyActivation("123456");
    expect(result.accountIdentifier).toBe("123456");
    const firstCall = calls[0];
    expect(firstCall).toBeDefined();
    if (!firstCall) throw new Error("Expected one fetch call");
    const [path, init] = firstCall;
    expect(path).toBe("/v1/student/activation/verify");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(JSON.parse(String(init?.body))).toEqual({ code: "123456" });
  });

  it("completes activation with ticket, idempotency and device proof", async () => {
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push([input, init]);
      return new Response(
        JSON.stringify({
          profile: { id: "profile-id", role: "student", displayName: null },
          entitlement: {
            id: "entitlement-id",
            scope: "all_content",
            classId: null,
            status: "active",
            startsAt: "2026-09-06T00:00:00.000Z",
            expiresAt: "2027-09-06T00:00:00.000Z",
          },
          accountIdentifier: "123456",
          deviceId: "device-id",
          replayed: false,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await completeActivation({
      activationTicket: "ticket-abcdefghijklmnopqrstuvwxyz-1234567890",
      password: "StudentPass123!",
      idempotencyKey: "activation-request-0001",
      devicePublicKeySpki: "public-key-spki",
      deviceProof: "device-proof",
    });

    expect(result.profile.role).toBe("student");
    const firstCall = calls[0];
    expect(firstCall).toBeDefined();
    if (!firstCall) throw new Error("Expected one fetch call");
    const [path, init] = firstCall;
    expect(path).toBe("/v1/student/activation/complete");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      activationTicket: "ticket-abcdefghijklmnopqrstuvwxyz-1234567890",
      password: "StudentPass123!",
      idempotencyKey: "activation-request-0001",
      devicePublicKeySpki: "public-key-spki",
      deviceProof: "device-proof",
    });
  });

  it("uses separate start and complete routes for returning login", async () => {
    const responses = [
      new Response(
        JSON.stringify({
          challengeToken: "challenge-abcdefghijklmnopqrstuvwxyz-1234567890",
          purpose: "login",
          requiresDeviceRegistration: false,
          mustChangePassword: false,
          expiresInSeconds: 300,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
      new Response(
        JSON.stringify({
          profile: { id: "profile-id", role: "student", displayName: null },
          deviceId: "device-id",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    ];
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push([input, init]);
      const response = responses.shift();
      if (!response) throw new Error("Unexpected fetch");
      return response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const challenge = await startStudentLogin("123456", "StudentPass123!");
    await completeStudentLogin({
      challengeToken: challenge.challengeToken,
      signature: "device-proof",
    });

    expect(calls[0]?.[0]).toBe("/v1/student/login/start");
    expect(JSON.parse(String(calls[0]?.[1]?.body))).toEqual({
      identifier: "123456",
      password: "StudentPass123!",
    });
    expect(calls[1]?.[0]).toBe("/v1/student/login/complete");
    expect(JSON.parse(String(calls[1]?.[1]?.body))).toEqual({
      challengeToken: "challenge-abcdefghijklmnopqrstuvwxyz-1234567890",
      signature: "device-proof",
    });
  });

  it("reads canonical entitlements and redeems a class code with an idempotency key", async () => {
    const activeEntitlement = {
      id: "11111111-1111-4111-8111-111111111111",
      scope: "class",
      classId: "22222222-2222-4222-8222-222222222222",
      status: "active",
      startsAt: "2026-09-10T00:00:00.000Z",
      expiresAt: "2026-10-10T00:00:00.000Z",
    };
    const responses = [
      new Response(JSON.stringify({ entitlements: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify({ entitlement: activeEntitlement }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ];
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push([input, init]);
        const response = responses.shift();
        if (!response) throw new Error("Unexpected fetch");
        return response;
      }),
    );

    expect(await listStudentEntitlements()).toEqual([]);
    const entitlement = await redeemStudentAccess("1234567", "student-access-request-0001");
    expect(entitlement).toEqual(activeEntitlement);
    expect(calls[0]?.[0]).toBe("/v1/student/access/entitlements");
    expect(calls[0]?.[1]?.credentials).toBe("include");
    expect(calls[1]?.[0]).toBe("/v1/student/access/redeem");
    expect(calls[1]?.[1]?.method).toBe("POST");
    expect(JSON.parse(String(calls[1]?.[1]?.body))).toEqual({
      code: "1234567",
      idempotencyKey: "student-access-request-0001",
    });
  });

  it("creates UUID-shaped stable request keys", () => {
    for (const key of [createActivationIdempotencyKey(), createAccessRedemptionIdempotencyKey()]) {
      expect(key.length).toBeGreaterThanOrEqual(12);
      expect(key).toMatch(/^[0-9a-f-]+$/i);
    }
  });
});
