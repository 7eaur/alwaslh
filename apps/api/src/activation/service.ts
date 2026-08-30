import { type EntitlementView, normalizeAccessCode } from "../access/service.js";
import { hashAuditValue, hashPassword } from "../auth/crypto.js";
import type { SessionProfile } from "../auth/service.js";
import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

interface FullCodeRow {
  id: string;
  status: "active" | "redeemed" | "expired" | "revoked";
  valid_from: Date;
  expires_at: Date | null;
  entitlement_duration_days: number;
}

interface EntitlementRow {
  id: string;
  scope: "all_content" | "class";
  class_id: string | null;
  status: "active" | "expired" | "revoked";
  starts_at: Date;
  expires_at: Date | null;
}

interface ActivationReplayRow {
  profile_id: string;
  entitlement_id: string;
  code_type: "full_access" | "class_access";
  full_code: string | null;
}

export interface StudentActivationResult {
  profile: SessionProfile;
  entitlement: EntitlementView;
  accountIdentifier: string;
  replayed: boolean;
}

function toEntitlement(row: EntitlementRow): EntitlementView {
  return {
    id: row.id,
    scope: row.scope,
    classId: row.class_id,
    status: row.status,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
  };
}

function assertIdempotencyKey(value: string): string {
  const key = value.trim();
  if (key.length < 12 || key.length > 120) {
    throw new AppError("BAD_REQUEST", "مفتاح طلب التفعيل غير صالح", 400);
  }
  return key;
}

function assertFreshCode(code: FullCodeRow | undefined): asserts code is FullCodeRow {
  if (!code) throw new AppError("NOT_FOUND", "كود التفعيل غير موجود", 404);
  if (code.status !== "active") {
    throw new AppError("CONFLICT", "كود التفعيل مستخدم أو غير نشط", 409);
  }
  const now = Date.now();
  if (code.valid_from.getTime() > now) {
    throw new AppError("CONFLICT", "كود التفعيل لم تبدأ صلاحيته بعد", 409);
  }
  if (code.expires_at && code.expires_at.getTime() <= now) {
    throw new AppError("CONFLICT", "انتهت صلاحية كود التفعيل", 409);
  }
}

export class StudentActivationService {
  constructor(private readonly db: Database) {}

  async activate(
    rawCode: string,
    password: string,
    idempotencyInput: string,
  ): Promise<StudentActivationResult> {
    const code = normalizeAccessCode(rawCode);
    if (!/^\d{6}$/.test(code)) {
      throw new AppError("BAD_REQUEST", "كود التفعيل يجب أن يكون 6 أرقام", 400);
    }
    const idempotencyKey = assertIdempotencyKey(idempotencyInput);

    // Fast replay path: do not spend a password-hash operation when a previous
    // successful request with the same idempotency key already exists.
    const replay = await this.findReplay(this.db, idempotencyKey);
    if (replay) return this.resolveReplay(this.db, replay, code);

    // Cheap preflight protects the expensive scrypt operation from arbitrary
    // invalid codes. The code is checked again under FOR UPDATE before writes.
    const previewRows = await this.db.query<FullCodeRow>(
      `select id, status, valid_from, expires_at, entitlement_duration_days
       from full_access_codes where code = $1`,
      [code],
    );
    assertFreshCode(previewRows[0]);

    const passwordHash = await hashPassword(password);

    return this.db.transaction(async (tx) => {
      await tx.query("select pg_advisory_xact_lock(hashtext($1))", [idempotencyKey]);

      const existingReplay = await this.findReplay(tx, idempotencyKey);
      if (existingReplay) return this.resolveReplay(tx, existingReplay, code);

      const codeRows = await tx.query<FullCodeRow>(
        `select id, status, valid_from, expires_at, entitlement_duration_days
         from full_access_codes where code = $1 for update`,
        [code],
      );
      const accessCode = codeRows[0];
      assertFreshCode(accessCode);

      const profileRows = await tx.query<{ id: string; display_name: string | null }>(
        `insert into profiles (role, display_name)
         values ('student', null)
         returning id, display_name`,
      );
      const profile = profileRows[0];
      if (!profile) throw new AppError("CONFLICT", "تعذر إنشاء حساب الطالب", 409);

      try {
        await tx.query(
          `insert into auth_credentials (profile_id, normalized_identifier, password_hash)
           values ($1, $2, $3)`,
          [profile.id, code, passwordHash],
        );
      } catch (error) {
        if ((error as { code?: string }).code === "23505") {
          throw new AppError("CONFLICT", "معرّف حساب الطالب مستخدم بالفعل", 409);
        }
        throw error;
      }

      const entitlementRows = await tx.query<EntitlementRow>(
        `insert into student_entitlements (
           profile_id, scope, class_id, source, source_id, expires_at
         ) values (
           $1, 'all_content', null, 'full_code', $2,
           now() + ($3::integer * interval '1 day')
         )
         returning id, scope, class_id, status, starts_at, expires_at`,
        [profile.id, accessCode.id, accessCode.entitlement_duration_days],
      );
      const entitlement = entitlementRows[0];
      if (!entitlement) throw new AppError("CONFLICT", "تعذر إنشاء صلاحية الطالب", 409);

      await tx.query(
        `update full_access_codes
         set status = 'redeemed', redeemed_at = now(), redeemed_by_profile_id = $2
         where id = $1`,
        [accessCode.id, profile.id],
      );

      try {
        await tx.query(
          `insert into access_redemptions (
             profile_id, code_type, full_access_code_id, entitlement_id, idempotency_key,
             request_metadata
           ) values (
             $1, 'full_access', $2, $3, $4,
             jsonb_build_object('flow', 'initial_activation')
           )`,
          [profile.id, accessCode.id, entitlement.id, idempotencyKey],
        );
      } catch (error) {
        if ((error as { code?: string }).code === "23505") {
          throw new AppError("CONFLICT", "كود التفعيل أو مفتاح الطلب مستخدم بالفعل", 409);
        }
        throw error;
      }

      await tx.query(
        `insert into access_events (
           event_type, subject_profile_id, code_type, full_access_code_id, entitlement_id, metadata
         ) values
           ('code_redeemed', $1, 'full_access', $2, $3, jsonb_build_object('flow', 'initial_activation')),
           ('entitlement_created', $1, 'full_access', $2, $3, jsonb_build_object('flow', 'initial_activation'))`,
        [profile.id, accessCode.id, entitlement.id],
      );

      await tx.query(
        `insert into auth_events (
           profile_id, event_type, identifier_hash_sha256, metadata
         ) values (
           $1, 'account_activated', $2, jsonb_build_object('flow', 'full_access_code')
         )`,
        [profile.id, hashAuditValue(code)],
      );

      return {
        profile: { id: profile.id, role: "student", displayName: profile.display_name },
        entitlement: toEntitlement(entitlement),
        accountIdentifier: code,
        replayed: false,
      };
    });
  }

  private async findReplay(
    executor: QueryExecutor,
    idempotencyKey: string,
  ): Promise<ActivationReplayRow | undefined> {
    const rows = await executor.query<ActivationReplayRow>(
      `select r.profile_id, r.entitlement_id, r.code_type, f.code as full_code
       from access_redemptions r
       left join full_access_codes f on f.id = r.full_access_code_id
       where r.idempotency_key = $1
       limit 1`,
      [idempotencyKey],
    );
    return rows[0];
  }

  private async resolveReplay(
    executor: QueryExecutor,
    replay: ActivationReplayRow,
    requestedCode: string,
  ): Promise<StudentActivationResult> {
    if (replay.code_type !== "full_access" || replay.full_code !== requestedCode) {
      throw new AppError("CONFLICT", "مفتاح طلب التفعيل مستخدم لعملية أخرى", 409);
    }

    const profileRows = await executor.query<{
      id: string;
      role: "student" | "admin";
      display_name: string | null;
      status: "active" | "inactive" | "archived";
    }>(
      `select id, role, display_name, status
       from profiles where id = $1`,
      [replay.profile_id],
    );
    const profile = profileRows[0];
    if (!profile || profile.role !== "student" || profile.status !== "active") {
      throw new AppError("CONFLICT", "حساب التفعيل السابق لم يعد نشطًا", 409);
    }

    const entitlementRows = await executor.query<EntitlementRow>(
      `select id, scope, class_id, status, starts_at, expires_at
       from student_entitlements where id = $1 and profile_id = $2`,
      [replay.entitlement_id, replay.profile_id],
    );
    const entitlement = entitlementRows[0];
    if (!entitlement) throw new AppError("CONFLICT", "صلاحية التفعيل السابقة غير موجودة", 409);

    return {
      profile: { id: profile.id, role: "student", displayName: profile.display_name },
      entitlement: toEntitlement(entitlement),
      accountIdentifier: requestedCode,
      replayed: true,
    };
  }
}
