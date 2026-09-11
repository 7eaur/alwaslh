import { describe, expect, it } from "vitest";
import type { AdminAccessCode } from "./admin-student-access-api";
import {
  buildAccessCodesCsv,
  fullAccessCodeImportTemplate,
  parseFullAccessCodeCsv,
} from "./access-code-files";

function code(overrides: Partial<AdminAccessCode> = {}): AdminAccessCode {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    type: "full_access",
    code: "012345",
    status: "active",
    classId: null,
    className: null,
    validFrom: "2026-09-10T00:00:00.000Z",
    expiresAt: null,
    entitlementDurationDays: 365,
    redeemedAt: null,
    redeemedByProfileId: null,
    redeemedByIdentifier: null,
    redeemedByDisplayName: null,
    entitlementExpiresAt: null,
    createdAt: "2026-09-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("access code CSV files", () => {
  it("provides an Excel-compatible UTF-8 template that preserves leading zeroes", () => {
    const template = fullAccessCodeImportTemplate();
    expect(template.charCodeAt(0)).toBe(0xfeff);
    expect(template).toContain("code,duration_days\r\n012345,365\r\n");
  });

  it("parses BOM/CRLF and keeps source row numbers while leaving code validation to the server", () => {
    expect(parseFullAccessCodeCsv("\uFEFFcode,duration_days\r\n٠١٢٣٤٥,90\r\n12345,120\r\n")).toEqual({
      rows: [
        { rowNumber: 2, code: "٠١٢٣٤٥", durationDays: 90 },
        { rowNumber: 3, code: "12345", durationDays: 120 },
      ],
      errors: [],
    });
  });

  it("reports local structural errors without discarding valid rows", () => {
    expect(parseFullAccessCodeCsv("code,duration_days\n,365\n012345,0\n012346,30,extra\n012347,45\n")).toEqual({
      rows: [{ rowNumber: 5, code: "012347", durationDays: 45 }],
      errors: [
        { rowNumber: 2, message: "الكود مطلوب" },
        { rowNumber: 3, message: "duration_days يجب أن يكون رقمًا صحيحًا بين 1 و3650" },
        { rowNumber: 4, message: "الصف يجب أن يحتوي عمودَي code وduration_days فقط" },
      ],
    });
  });

  it("rejects incorrect headers and files larger than the bounded import contract", () => {
    expect(() => parseFullAccessCodeCsv("access_code,duration_days\n012345,30\n")).toThrow(
      "رأس الملف يجب أن يكون بالضبط: code,duration_days",
    );
    const rows = Array.from({ length: 501 }, (_, index) => `${String(index).padStart(6, "0")},30`).join("\n");
    expect(() => parseFullAccessCodeCsv(`code,duration_days\n${rows}`)).toThrow(
      "ملف الاستيراد يتجاوز الحد الأقصى وهو 500 صف بيانات",
    );
  });

  it("exports BOM CSV and neutralizes spreadsheet formulas in dynamic cells", () => {
    const csv = buildAccessCodesCsv([
      code({
        redeemedAt: "2026-09-10T01:00:00.000Z",
        redeemedByIdentifier: '=HYPERLINK("https://example.test")',
      }),
      code({
        id: "22222222-2222-4222-8222-222222222222",
        type: "class_access",
        code: "1234567",
        className: 'الصف "الأول"',
      }),
    ]);

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("'=HYPERLINK(\"\"https://example.test\"\")");
    expect(csv).not.toContain('"=HYPERLINK(');
    expect(csv).toContain('"الصف ""الأول"""');
  });
});
