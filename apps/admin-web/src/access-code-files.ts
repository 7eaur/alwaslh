import type { AdminAccessCode } from "./admin-student-access-api";

export interface FullAccessCodeCsvRow {
  rowNumber: number;
  code: string;
  durationDays: number;
}

export interface CsvRowError {
  rowNumber: number;
  message: string;
}

export interface ParsedFullAccessCodeCsv {
  rows: FullAccessCodeCsvRow[];
  errors: CsvRowError[];
}

const MAX_IMPORT_ROWS = 500;
const templateHeader = "code,duration_days";

function parseCsvLine(line: string): string[] | null {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (character === "," && !quoted) {
      values.push(current);
      current = "";
      continue;
    }
    current += character;
  }

  if (quoted) return null;
  values.push(current);
  return values;
}

export function fullAccessCodeImportTemplate(): string {
  return `\uFEFF${templateHeader}\r\n012345,365\r\n`;
}

export function parseFullAccessCodeCsv(text: string): ParsedFullAccessCodeCsv {
  const normalized = text.replace(/^\uFEFF/, "");
  const lines = normalized.split(/\r?\n/);
  const header = lines[0]?.trim().toLowerCase();
  if (header !== templateHeader) {
    throw new Error("رأس الملف يجب أن يكون بالضبط: code,duration_days");
  }

  const rows: FullAccessCodeCsvRow[] = [];
  const errors: CsvRowError[] = [];
  let dataRowCount = 0;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (!line.trim()) continue;
    dataRowCount += 1;
    if (dataRowCount > MAX_IMPORT_ROWS) {
      throw new Error("ملف الاستيراد يتجاوز الحد الأقصى وهو 500 صف بيانات");
    }

    const rowNumber = index + 1;
    const columns = parseCsvLine(line);
    if (!columns || columns.length !== 2) {
      errors.push({ rowNumber, message: "الصف يجب أن يحتوي عمودَي code وduration_days فقط" });
      continue;
    }

    const code = columns[0]?.trim() ?? "";
    const rawDuration = columns[1]?.trim() ?? "";
    const durationDays = Number(rawDuration);

    if (!code) {
      errors.push({ rowNumber, message: "الكود مطلوب" });
      continue;
    }
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 3650) {
      errors.push({ rowNumber, message: "duration_days يجب أن يكون رقمًا صحيحًا بين 1 و3650" });
      continue;
    }

    rows.push({ rowNumber, code, durationDays });
  }

  if (rows.length === 0 && errors.length === 0) {
    throw new Error("ملف الاستيراد لا يحتوي صفوف بيانات");
  }

  return { rows, errors };
}

function spreadsheetSafe(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  const safe = spreadsheetSafe(text);
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildAccessCodesCsv(codes: readonly AdminAccessCode[]): string {
  const header = [
    "code",
    "type",
    "status",
    "class_name",
    "duration_days",
    "valid_from",
    "expires_at",
    "redeemed_at",
    "redeemed_by",
  ].join(",");

  const rows = codes.map((code) =>
    [
      code.code,
      code.type,
      code.status,
      code.className,
      code.entitlementDurationDays,
      code.validFrom,
      code.expiresAt,
      code.redeemedAt,
      code.redeemedByDisplayName ?? code.redeemedByIdentifier,
    ]
      .map(csvCell)
      .join(","),
  );

  return `\uFEFF${[header, ...rows].join("\r\n")}\r\n`;
}
