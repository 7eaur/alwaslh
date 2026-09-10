import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAllAccessCodesForExport, importFullAccessCodes } from "./admin-access-files-api";

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Admin access files API", () => {
  it("imports full-access rows through the shared authenticated transport", async () => {
    const payload = { imported: [], errors: [], summary: { received: 1, imported: 1, rejected: 0 } };
    const fetchMock = vi.fn().mockResolvedValue(response(payload));
    vi.stubGlobal("fetch", fetchMock);

    await expect(importFullAccessCodes([{ rowNumber: 2, code: "012345", durationDays: 365 }])).resolves.toEqual(
      payload,
    );

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(url, "http://admin.test").pathname).toBe("/v1/admin/access/full-codes/import");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.body).toBe(
      JSON.stringify({ rows: [{ rowNumber: 2, code: "012345", durationDays: 365 }] }),
    );
  });

  it("walks paginated access inventory until the first-page total is complete", async () => {
    const firstCodes = Array.from({ length: 100 }, (_, index) => ({ id: `first-${index}` }));
    const secondCodes = Array.from({ length: 20 }, (_, index) => ({ id: `second-${index}` }));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ codes: firstCodes, page: { total: 120, limit: 100, offset: 0 } }))
      .mockResolvedValueOnce(response({ codes: secondCodes, page: { total: 120, limit: 100, offset: 100 } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAllAccessCodesForExport({ type: "full_access", status: "redeemed" });
    expect(result).toHaveLength(120);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstUrl = new URL(fetchMock.mock.calls[0]?.[0] as string, "http://admin.test");
    const secondUrl = new URL(fetchMock.mock.calls[1]?.[0] as string, "http://admin.test");
    expect(firstUrl.searchParams.get("limit")).toBe("100");
    expect(firstUrl.searchParams.get("status")).toBe("redeemed");
    expect(secondUrl.searchParams.get("offset")).toBe("100");
  });

  it("fails explicitly when the inventory changes between export pages", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          codes: Array.from({ length: 100 }, (_, index) => ({ id: `first-${index}` })),
          page: { total: 120, limit: 100, offset: 0 },
        }),
      )
      .mockResolvedValueOnce(
        response({
          codes: Array.from({ length: 21 }, (_, index) => ({ id: `second-${index}` })),
          page: { total: 121, limit: 100, offset: 100 },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchAllAccessCodesForExport({ type: "full_access" })).rejects.toThrow(
      "تغير عدد الأكواد أثناء تجهيز الملف",
    );
  });
});
