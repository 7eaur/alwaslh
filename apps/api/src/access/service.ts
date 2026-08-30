import { randomInt } from "node:crypto";
import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

export type AccessCodeType = "full_access" | "class_access";

export interface EntitlementView {
  id: string;
  scope: "all_content" | "class";
  classId: string | null;
  status: "active" | "expired" | "revoked";
  startsAt: Date;
  expiresAt: Date | null;
}

interface FullCodeRow {
  id: string;
  status: "active" | "redeemed" | "expired" | "revoked";
  valid_from: Date;
  expires_at: Date | null;
  entitlement_duration_days: number;
}

interface ClassCodeRow extends FullCodeRow {
  class_id: string;
}

interface EntitlementRow {
  id: string;
  scope: "all_content" | "class";
  class_id: string | null;
  status: "active" | "expired" | "revoked";
  starts_at: Date;
  expires_at: Date | null;
}

interface RedemptionRow {
  entitlement_id: string;
}

const CODE_INSERT_RETRIES = 12;

export function normalizeAccessCode(value: string): string {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabic = "۰۱۲۳۴۵۶۷۸۹";
  return value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(arabicIndic.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(easternArabic.indexOf(digit)))
    .replace(/[\s-]+/g, "");
}

function createDigits(length: 6 | 7): string {
  let code = "";
  for (let index = 0; index < length; index += 1) code += String(randomInt(0, 10));
  return code;
}

function entitlementView(row: EntitlementRow): EntitlementView {
  return {
    id: row.id,
    scope: row.scope,
    classId: row.class_id,
    status: row.status,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
  };
}

async function expireElapsedEntitlements(tx: QueryExecutor, profileId: string): Promise<void> {
  await tx.query(
    `update student_entitlements
     set status = 'expired'
     where profile_id = $1
       and status = 'active'
       and expires_at is not null
       and expires_at <= now()`,
    [profileId],
  );
}

async function assertActiveStudent(tx: QueryExecutor, profileId: string): Promise<void> {
  const rows = await tx.query<{ role: "student" | "admin"; status: string }>(
    "select role, status from profiles where id = $1 for update",
    [profileId],
  );
  if (!rows[0] || rows[0].role !== "student" || rows[0].status !== "active") {
    throw new AppError("FORBIDDEN", "الحساب غير مؤهل لاستخدام كود الوصول", 403);
  }
}

async function findEntitlement(tx: QueryExecutor, entitlementId: string): Promise<EntitlementView> {
  const rows = await tx.query<EntitlementRow>(
    `select id, scope, class_id, status, starts_at, expires_at
     from student_entitlements where id = $1`,
    [entitlementId],
  );
  if (!rows[0]) throw new AppError("CONFLICT", "تعذر استرجاع صلاحية الوصول", 409);
  return entitlementView(rows[0]);
}

export class AccessService {
  constructor(private readonly db: Database) {}

  async generateFullCodes(actorProfileId: string, count: number, durationDays: number): Promise<string[]> {
    return this.generateCodes("full_access", actorProfileId, count, durationDays);
  }

  async generateClassCodes(
    actorProfileId: string,
    classId: string,
    count: number,
    durationDays: number,
  ): Promise<string[]> {
    const classes = await this.db.query<{ id: string }>(
      "select id from classes where id = $1 and status = 'active'",
      [classId],
    );
    if (!classes[0]) throw new AppError("NOT_FOUND", "الصف غير موجود أو غير نشط", 404);
    return this.generateCodes("class_access", actorProfileId, count, durationDays, classId);
  }

  async redeem(profileId: string, rawCode: string, idempotencyKey: string): Promise<EntitlementView> {
    const code = normalizeAccessCode(rawCode);
    if (!/^\d{6,7}$/.test(code)) throw new AppError("BAD_REQUEST", "صيغة كود الوصول غير صحيحة", 400);
    if (idempotencyKey.trim().length < 12 || idempotencyKey.length > 120) {
      throw new AppError("BAD_REQUEST", "مفتاح الطلب غير صالح", 400);
    }

    return this.db.transaction(async (tx) => {
      await tx.query("select pg_advisory_xact_lock(hashtext($1))", [idempotencyKey]);
      const previous = await tx.query<RedemptionRow>(
        "select entitlement_id from access_redemptions where idempotency_key = $1",
        [idempotencyKey],
      );
      if (previous[0]) return findEntitlement(tx, previous[0].entitlement_id);

      await assertActiveStudent(tx, profileId);
      await expireElapsedEntitlements(tx, profileId);

      return code.length === 6
        ? this.redeemFullCode(tx, profileId, code, idempotencyKey)
        : this.redeemClassCode(tx, profileId, code, idempotencyKey);
    });
  }

  async listActiveEntitlements(profileId: string): Promise<EntitlementView[]> {
    await this.db.query(
      `update student_entitlements
       set status = 'expired'
       where profile_id = $1 and status = 'active' and expires_at is not null and expires_at <= now()`,
      [profileId],
    );
    const rows = await this.db.query<EntitlementRow>(
      `select id, scope, class_id, status, starts_at, expires_at
       from student_entitlements
       where profile_id = $1 and status = 'active'
       order by case when scope = 'all_content' then 0 else 1 end, starts_at`,
      [profileId],
    );
    return rows.map(entitlementView);
  }

  async revokeEntitlement(actorProfileId: string, entitlementId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const rows = await tx.query<{ id: string; profile_id: string; status: string }>(
        "select id, profile_id, status from student_entitlements where id = $1 for update",
        [entitlementId],
      );
      const entitlement = rows[0];
      if (!entitlement) throw new AppError("NOT_FOUND", "صلاحية الوصول غير موجودة", 404);
      if (entitlement.status === "revoked") return;
      await tx.query(
        `update student_entitlements
         set status = 'revoked', revoked_at = now()
         where id = $1`,
        [entitlementId],
      );
      await tx.query(
        `insert into access_events (event_type, actor_profile_id, subject_profile_id, entitlement_id)
         values ('entitlement_revoked', $1, $2, $3)`,
        [actorProfileId, entitlement.profile_id, entitlementId],
      );
    });
  }

  private async generateCodes(
    type: AccessCodeType,
    actorProfileId: string,
    count: number,
    durationDays: number,
    classId?: string,
  ): Promise<string[]> {
    if (!Number.isInteger(count) || count < 1 || count > 500) {
      throw new AppError("BAD_REQUEST", "عدد الأكواد يجب أن يكون بين 1 و500", 400);
    }
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 3650) {
      throw new AppError("BAD_REQUEST", "مدة الصلاحية غير صحيحة", 400);
    }

    const codes: string[] = [];
    for (let index = 0; index < count; index += 1) {
      let inserted = false;
      for (let attempt = 0; attempt < CODE_INSERT_RETRIES && !inserted; attempt += 1) {
        const code = createDigits(type === "full_access" ? 6 : 7);
        const rows =
          type === "full_access"
            ? await this.db.query<{ code: string }>(
                `insert into full_access_codes (code, created_by_profile_id, entitlement_duration_days)
                 values ($1, $2, $3)
                 on conflict (code) do nothing
                 returning code`,
                [code, actorProfileId, durationDays],
              )
            : await this.db.query<{ code: string }>(
                `insert into class_access_codes (code, class_id, created_by_profile_id, entitlement_duration_days)
                 values ($1, $2, $3, $4)
                 on conflict (code) do nothing
                 returning code`,
                [code, classId, actorProfileId, durationDays],
              );
        if (rows[0]) {
          codes.push(rows[0].code);
          inserted = true;
          await this.db.query(
            `insert into access_events (
               event_type, actor_profile_id, code_type, full_access_code_id, class_access_code_id, metadata
             )
             select 'code_generated', $1, $2,
                    case when $2 = 'full_access' then id else null end,
                    null,
                    jsonb_build_object('durationDays', $3)
             from full_access_codes where $2 = 'full_access' and code = $4
             union all
             select 'code_generated', $1, $2,
                    null,
                    case when $2 = 'class_access' then id else null end,
                    jsonb_build_object('durationDays', $3)
             from class_access_codes where $2 = 'class_access' and code = $4`,
            [actorProfileId, type, durationDays, code],
          );
        }
      }
      if (!inserted) throw new AppError("CONFLICT", "تعذر إنشاء كود فريد، أعد المحاولة", 409);
    }
    return codes;
  }

  private async redeemFullCode(
    tx: QueryExecutor,
    profileId: string,
    code: string,
    idempotencyKey: string,
  ): Promise<EntitlementView> {
    const rows = await tx.query<FullCodeRow>(
      `select id, status, valid_from, expires_at, entitlement_duration_days
       from full_access_codes where code = $1 for update`,
      [code],
    );
    const accessCode = rows[0];
    this.assertRedeemableCode(accessCode);

    const existingRows = await tx.query<EntitlementRow>(
      `select id, scope, class_id, status, starts_at, expires_at
       from student_entitlements
       where profile_id = $1 and scope = 'all_content' and status = 'active'
       for update`,
      [profileId],
    );
    const existing = existingRows[0];
    if (existing?.expires_at === null) {
      throw new AppError("CONFLICT", "لدى الطالب وصول كامل غير محدود بالفعل", 409);
    }

    const entitlement = existing
      ? await this.renewEntitlement(tx, existing.id, accessCode.entitlement_duration_days, "full_code", accessCode.id)
      : await this.createEntitlement(
          tx,
          profileId,
          "all_content",
          null,
          accessCode.entitlement_duration_days,
          "full_code",
          accessCode.id,
        );

    await tx.query(
      `update full_access_codes
       set status = 'redeemed', redeemed_at = now(), redeemed_by_profile_id = $2
       where id = $1`,
      [accessCode.id, profileId],
    );
    await tx.query(
      `insert into access_redemptions (
         profile_id, code_type, full_access_code_id, entitlement_id, idempotency_key
       ) values ($1, 'full_access', $2, $3, $4)`,
      [profileId, accessCode.id, entitlement.id, idempotencyKey],
    );
    await this.recordRedemptionEvents(tx, profileId, "full_access", accessCode.id, entitlement.id, Boolean(existing));
    return entitlement;
  }

  private async redeemClassCode(
    tx: QueryExecutor,
    profileId: string,
    code: string,
    idempotencyKey: string,
  ): Promise<EntitlementView> {
    const rows = await tx.query<ClassCodeRow>(
      `select id, class_id, status, valid_from, expires_at, entitlement_duration_days
       from class_access_codes where code = $1 for update`,
      [code],
    );
    const accessCode = rows[0];
    this.assertRedeemableCode(accessCode);

    const fullAccess = await tx.query<{ id: string }>(
      `select id from student_entitlements
       where profile_id = $1 and scope = 'all_content' and status = 'active'
       limit 1`,
      [profileId],
    );
    if (fullAccess[0]) {
      throw new AppError("CONFLICT", "لدى الطالب وصول كامل بالفعل؛ لم يتم استهلاك كود الصف", 409);
    }

    const existingRows = await tx.query<EntitlementRow>(
      `select id, scope, class_id, status, starts_at, expires_at
       from student_entitlements
       where profile_id = $1 and scope = 'class' and class_id = $2 and status = 'active'
       for update`,
      [profileId, accessCode.class_id],
    );
    const existing = existingRows[0];
    if (existing?.expires_at === null) {
      throw new AppError("CONFLICT", "لدى الطالب وصول غير محدود لهذا الصف بالفعل", 409);
    }

    const entitlement = existing
      ? await this.renewEntitlement(tx, existing.id, accessCode.entitlement_duration_days, "class_code", accessCode.id)
      : await this.createEntitlement(
          tx,
          profileId,
          "class",
          accessCode.class_id,
          accessCode.entitlement_duration_days,
          "class_code",
          accessCode.id,
        );

    await tx.query(
      `update class_access_codes
       set status = 'redeemed', redeemed_at = now(), redeemed_by_profile_id = $2
       where id = $1`,
      [accessCode.id, profileId],
    );
    await tx.query(
      `insert into access_redemptions (
         profile_id, code_type, class_access_code_id, entitlement_id, idempotency_key
       ) values ($1, 'class_access', $2, $3, $4)`,
      [profileId, accessCode.id, entitlement.id, idempotencyKey],
    );
    await this.recordRedemptionEvents(tx, profileId, "class_access", accessCode.id, entitlement.id, Boolean(existing));
    return entitlement;
  }

  private assertRedeemableCode(code: FullCodeRow | undefined): asserts code is FullCodeRow {
    if (!code) throw new AppError("NOT_FOUND", "كود الوصول غير موجود", 404);
    if (code.status !== "active") throw new AppError("CONFLICT", "كود الوصول مستخدم أو غير نشط", 409);
    const now = Date.now();
    if (code.valid_from.getTime() > now || (code.expires_at && code.expires_at.getTime() <= now)) {
      throw new AppError("CONFLICT", "انتهت صلاحية كود الوصول أو لم تبدأ بعد", 409);
    }
  }

  private async createEntitlement(
    tx: QueryExecutor,
    profileId: string,
    scope: "all_content" | "class",
    classId: string | null,
    durationDays: number,
    source: "full_code" | "class_code",
    sourceId: string,
  ): Promise<EntitlementView> {
    const rows = await tx.query<EntitlementRow>(
      `insert into student_entitlements (
         profile_id, scope, class_id, source, source_id, expires_at
       ) values ($1, $2, $3, $4, $5, now() + ($6 * interval '1 day'))
       returning id, scope, class_id, status, starts_at, expires_at`,
      [profileId, scope, classId, source, sourceId, durationDays],
    );
    if (!rows[0]) throw new AppError("CONFLICT", "تعذر إنشاء صلاحية الوصول", 409);
    return entitlementView(rows[0]);
  }

  private async renewEntitlement(
    tx: QueryExecutor,
    entitlementId: string,
    durationDays: number,
    source: "full_code" | "class_code",
    sourceId: string,
  ): Promise<EntitlementView> {
    const rows = await tx.query<EntitlementRow>(
      `update student_entitlements
       set expires_at = greatest(expires_at, now()) + ($2 * interval '1 day'),
           source = $3,
           source_id = $4
       where id = $1
       returning id, scope, class_id, status, starts_at, expires_at`,
      [entitlementId, durationDays, source, sourceId],
    );
    if (!rows[0]) throw new AppError("CONFLICT", "تعذر تجديد صلاحية الوصول", 409);
    return entitlementView(rows[0]);
  }

  private async recordRedemptionEvents(
    tx: QueryExecutor,
    profileId: string,
    type: AccessCodeType,
    codeId: string,
    entitlementId: string,
    renewed: boolean,
  ): Promise<void> {
    const fullId = type === "full_access" ? codeId : null;
    const classId = type === "class_access" ? codeId : null;
    await tx.query(
      `insert into access_events (
         event_type, subject_profile_id, code_type, full_access_code_id, class_access_code_id, entitlement_id
       ) values
         ('code_redeemed', $1, $2, $3, $4, $5),
         ($6, $1, $2, $3, $4, $5)`,
      [profileId, type, fullId, classId, entitlementId, renewed ? "entitlement_renewed" : "entitlement_created"],
    );
  }
}
