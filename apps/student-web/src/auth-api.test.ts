import { afterEach, describe, expect, it, vi } from "vitest";
import {
  activateStudent,
  createActivationIdempotencyKey,
  isSixDigitAccessCode,
  normalizeAccessCode,
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

describe("isSixDigitAccessCode", () => {
  it("accepts exactly six normalized digits", () => {
    expect(isSixDigitAccessCode("١٢٣٤٥٦")).toBe(true);
    expect(isSixDigitAccessCode("123456")).toBe(true);
  });

  it("rejects shorter and longer values", () => {
    expect(isSixDigitAccessCode("12345")).toBe(false);
    expect(isSixDigitAccessCode("1234567")).toBe(false);
  });
});

describe("activation API contract", () => {
  it("posts the documented activation payload with the session cookie contract", async () => {
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
            startsAt: "2026-08-30T00:00:00.000Z",
            expiresAt: "2027-08-30T00:00:00.000Z",
          },
          accountIdentifier: "123456",
          replayed: false,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await activateStudent("123456", "StudentPass123!", "activation-request-0001");

    expect(result.accountIdentifier).toBe("123456");
    expect(result.profile.role).toBe("student");
    expect(fetchMock).toHaveBeenCalledOnce();
    const firstCall = calls[0];
    expect(firstCall).toBeDefined();
    if (!firstCall) throw new Error("Expected one fetch call");
    const [path, init] = firstCall;
    expect(path).toBe("/v1/student/activate");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(JSON.parse(String(init?.body))).toEqual({
      code: "123456",
      password: "StudentPass123!",
      idempotencyKey: "activation-request-0001",
    });
  });

  it("creates UUID-shaped stable request keys", () => {
    const key = createActivationIdempotencyKey();
    expect(key.length).toBeGreaterThanOrEqual(12);
    expect(key).toMatch(/^[0-9a-f-]+$/i);
  });
});
