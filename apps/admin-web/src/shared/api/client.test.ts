import { afterEach, describe, expect, it, vi } from "vitest";
import {
  adminApiBlobRequest,
  adminApiRequest,
  ApiRequestError,
  isMissingSessionError,
} from "./client";

function response(body: unknown, status = 200): Response {
  return new Response(body === undefined ? undefined : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("shared admin API transport", () => {
  it("always sends credential cookies and JSON content type for request bodies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      adminApiRequest<{ ok: boolean }>("/v1/example", {
        method: "POST",
        body: JSON.stringify({ value: 1 }),
      }),
    ).resolves.toEqual({ ok: true });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.credentials).toBe("include");
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });

  it("preserves the backend public error contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({ error: { code: "CONFLICT", message: "تعارض معروف" } }, 409),
      ),
    );

    await expect(adminApiRequest("/v1/example")).rejects.toMatchObject({
      code: "CONFLICT",
      message: "تعارض معروف",
      status: 409,
    });
  });

  it("maps network failures to service unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(adminApiRequest("/v1/example")).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      status: 0,
    });
  });

  it("classifies only unauthorized and forbidden request errors as missing session", () => {
    expect(isMissingSessionError(new ApiRequestError("UNAUTHORIZED", "", 401))).toBe(true);
    expect(isMissingSessionError(new ApiRequestError("FORBIDDEN", "", 403))).toBe(true);
    expect(isMissingSessionError(new ApiRequestError("CONFLICT", "", 409))).toBe(false);
    expect(isMissingSessionError(new Error("other"))).toBe(false);
  });

  it("keeps blob responses and blob errors on the same transport contract", async () => {
    const blob = new Blob(["csv"], { type: "text/csv" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(blob, { status: 200 }))
      .mockResolvedValueOnce(response({ error: { code: "FORBIDDEN", message: "ممنوع" } }, 403));
    vi.stubGlobal("fetch", fetchMock);

    await expect(adminApiBlobRequest("/v1/export")).resolves.toBeInstanceOf(Blob);
    await expect(adminApiBlobRequest("/v1/export")).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "ممنوع",
      status: 403,
    });
  });
});
