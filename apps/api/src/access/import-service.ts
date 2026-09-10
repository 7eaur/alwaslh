import { normalizeAccessCode } from "./service.js";
import type { Database } from "../db.js";
import { AppError } from "../errors.js";

export interface FullAccessCodeImportRow {
  rowNumber: number;
  code: string;
  durationDays: number;
}

export type FullAccessCodeImportErrorCode =
  | "INVALID_CODE"
  | "DUPLICATE_IN_FILE"
  | "DUPLICATE_EXISTING";

export interface FullAccessCodeImportError {
  rowNumber: number;
  code: string;
  errorCode: FullAccessCodeImportErrorCode;
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

interface InsertedCodeRow {
  id: string;
  code: string;
}

const strictCodePattern = /^[0-9٠-٩۰-۹]{6}$/;

export class AccessCodeImportService {
  constructor(private readonly db: Database) {}

  async importFullAccessCodes(
    actorProfileId: string,
    rows: readonly FullAccessCodeImportRow[],
  ): Promise<FullAccessCodeImportResult> {
    if (rows.length < 1 || rows.length > 500) {
      throw new AppError("BAD_REQUEST", "يجب أن يحتوي الاستيراد على 1 إلى 500 صف", 400);
    }

    const errors: FullAccessCodeImportError[] = [];
    const candidates: Array<FullAccessCodeImportRow & { normalizedCode: string }> = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const rawCode = row.code.trim();
      if (!strictCodePattern.test(rawCode)) {
        errors.push({
          rowNumber: row.rowNumber,
          code: row.code,
          errorCode: "INVALID_CODE",
          message: "الكود يجب أن يتكون من ستة أرقام فقط مع الحفاظ على الأصفار في البداية",
        });
        continue;
      }

      const normalizedCode = normalizeAccessCode(rawCode);
      if (seen.has(normalizedCode)) {
        errors.push({
          rowNumber: row.rowNumber,
          code: normalizedCode,
          errorCode: "DUPLICATE_IN_FILE",
          message: "الكود مكرر داخل ملف الاستيراد",
        });
        continue;
      }

      seen.add(normalizedCode);
      candidates.push({ ...row, normalizedCode });
    }

    const imported = await this.db.transaction(async (tx) => {
      const accepted: ImportedFullAccessCode[] = [];

      for (const row of candidates) {
        const inserted = await tx.query<InsertedCodeRow>(
          `insert into full_access_codes (
             code, created_by_profile_id, entitlement_duration_days, metadata
           ) values (
             $1, $2, $3,
             jsonb_build_object('imported', true, 'method', 'csv_import', 'sourceRow', $4::integer)
           )
           on conflict (code) do nothing
           returning id, code`,
          [row.normalizedCode, actorProfileId, row.durationDays, row.rowNumber],
        );
        const code = inserted[0];
        if (!code) {
          errors.push({
            rowNumber: row.rowNumber,
            code: row.normalizedCode,
            errorCode: "DUPLICATE_EXISTING",
            message: "الكود موجود مسبقًا ولم يتم تغييره",
          });
          continue;
        }

        await tx.query(
          `insert into access_events (
             event_type, actor_profile_id, code_type, full_access_code_id, metadata
           ) values (
             'code_generated', $1, 'full_access', $2,
             jsonb_build_object(
               'durationDays', $3::integer,
               'method', 'csv_import',
               'sourceRow', $4::integer
             )
           )`,
          [actorProfileId, code.id, row.durationDays, row.rowNumber],
        );

        accepted.push({
          rowNumber: row.rowNumber,
          id: code.id,
          code: code.code,
          durationDays: row.durationDays,
        });
      }

      return accepted;
    });

    errors.sort((left, right) => left.rowNumber - right.rowNumber);
    return {
      imported,
      errors,
      summary: {
        received: rows.length,
        imported: imported.length,
        rejected: errors.length,
      },
    };
  }
}
