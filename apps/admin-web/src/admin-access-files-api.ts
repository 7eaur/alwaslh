import { adminApiRequest } from "./admin-api";
import {
  type AdminAccessCode,
  type AdminAccessCodeStatus,
  type AdminAccessCodeType,
  fetchAdminAccessCodes,
} from "./admin-student-access-api";

export interface FullAccessCodeImportRow {
  rowNumber: number;
  code: string;
  durationDays: number;
}

export interface FullAccessCodeImportError {
  rowNumber: number;
  code: string;
  errorCode: "INVALID_CODE" | "DUPLICATE_IN_FILE" | "DUPLICATE_EXISTING";
  message: string;
}

export interface ImportedFullAccessCode {
  rowNumber: number;
  id: string;
  code: string;
  durationDays: number;
}

export interface FullAccessCodeImportResult {
  imported: ImportedFullAccessCode[];
  errors: FullAccessCodeImportError[];
  summary: {
    received: number;
    imported: number;
    rejected: number;
  };
}

export function importFullAccessCodes(rows: readonly FullAccessCodeImportRow[]): Promise<FullAccessCodeImportResult> {
  return adminApiRequest<FullAccessCodeImportResult>("/v1/admin/access/full-codes/import", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });
}

export async function fetchAllAccessCodesForExport(input: {
  type: AdminAccessCodeType;
  status?: AdminAccessCodeStatus;
  classId?: string;
}): Promise<AdminAccessCode[]> {
  const pageSize = 100;
  const first = await fetchAdminAccessCodes({
    type: input.type,
    ...(input.status ? { status: input.status } : {}),
    ...(input.classId ? { classId: input.classId } : {}),
    sort: "created_at",
    direction: "desc",
    limit: pageSize,
    offset: 0,
  });

  const expectedTotal = first.page.total;
  const codes = [...first.codes];
  let offset = pageSize;

  while (codes.length < expectedTotal) {
    const page = await fetchAdminAccessCodes({
      type: input.type,
      ...(input.status ? { status: input.status } : {}),
      ...(input.classId ? { classId: input.classId } : {}),
      sort: "created_at",
      direction: "desc",
      limit: pageSize,
      offset,
    });

    if (page.page.total !== expectedTotal) {
      throw new Error("تغير عدد الأكواد أثناء تجهيز الملف. أعد التصدير للحصول على نسخة متسقة.");
    }
    if (page.codes.length === 0) {
      throw new Error("توقف التصدير قبل اكتمال جميع الأكواد. أعد المحاولة.");
    }

    codes.push(...page.codes);
    offset += pageSize;
  }

  if (codes.length !== expectedTotal) {
    throw new Error("تعذر تكوين ملف تصدير متسق. أعد المحاولة.");
  }
  return codes;
}
