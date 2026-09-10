import { normalizeAccessCode } from "../access/service.js";
import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

export type AdminAccessCodeType = "full_access" | "class_access";
export type AdminAccessCodeStatus = "active" | "redeemed" | "expired" | "revoked";
export type AdminAccessCodeSort = "created_at" | "code" | "status" | "valid_from" | "expires_at" | "redeemed_at";
export type AdminStudentStatus = "active" | "inactive" | "archived";
export type AdminStudentSort = "created_at" | "identifier" | "status" | "last_login";
export type SortDirection = "asc" | "desc";

export interface AdminAccessCodeView {
  id: string;
  type: AdminAccessCodeType;
  code: string;
  status: AdminAccessCodeStatus;
  classId: string | null;
  className: string | null;
  validFrom: Date;
  expiresAt: Date | null;
  entitlementDurationDays: number;
  redeemedAt: Date | null;
  redeemedByProfileId: string | null;
  redeemedByIdentifier: string | null;
  redeemedByDisplayName: string | null;
  entitlementExpiresAt: Date | null;
  createdAt: Date;
}

export interface AdminStudentAccountView {
  id: string;
  identifier: string;
  displayName: string | null;
  status: AdminStudentStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
  activeEntitlementCount: number;
  activeClassCount: number;
  hasAllContent: boolean;
  hasActiveDevice: boolean;
  recoveryRequired: boolean;
  deviceRebindAllowed: boolean;
}

export interface AdminStudentEntitlementView {
  id: string;
  scope: "all_content" | "class";
  classId: string | null;
  className: string | null;
  source: "full_code" | "class_code" | "admin";
  sourceId: string | null;
  status: "active" | "expired" | "revoked";
  startsAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
}

export interface AdminStudentDeviceView {
  id: string;
  label: string | null;
  registeredAt: Date;
  revokedAt: Date | null;
  active: boolean;
}

export interface AdminStudentRedemptionView {
  id: string;
  codeType: AdminAccessCodeType;
  code: string | null;
  entitlementId: string;
  redeemedAt: Date;
}

export interface AdminStudentActivityView {
  id: string;
  source: "auth" | "access";
  eventType: string;
  actorProfileId: string | null;
  actorDisplayName: string | null;
  createdAt: Date;
}

export interface AdminStudentDetailView extends AdminStudentAccountView {
  activeSessionCount: number;
  entitlements: AdminStudentEntitlementView[];
  devices: AdminStudentDeviceView[];
  redemptions: AdminStudentRedemptionView[];
  redemptionTotal: number;
  activity: AdminStudentActivityView[];
  activityTotal: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

interface CountRow {
  total: string;
}

interface AccessCodeRow {
  id: string;
  code_type: AdminAccessCodeType;
  code: string;
  effective_status: AdminAccessCodeStatus;
  class_id: string | null;
  class_name: string | null;
  valid_from: Date;
  expires_at: Date | null;
  entitlement_duration_days: number;
  redeemed_at: Date | null;
  redeemed_by_profile_id: string | null;
  redeemed_by_identifier: string | null;
  redeemed_by_display_name: string | null;
  entitlement_expires_at: Date | null;
  created_at: Date;
}

interface RevocableCodeRow {
  id: string;
  status: AdminAccessCodeStatus;
  redeemed_by_profile_id: string | null;
  has_redemption: boolean;
}

interface StudentAccountRow {
  id: string;
  normalized_identifier: string;
  display_name: string | null;
  status: AdminStudentStatus;
  created_at: Date;
  last_login_at: Date | null;
  active_entitlement_count: string;
  active_class_count: string;
  has_all_content: boolean;
  active_device_id: string | null;
  must_change_password: boolean;
  device_rebind_allowed: boolean;
  active_session_count?: string;
}

interface EntitlementRow {
  id: string;
  scope: "all_content" | "class";
  class_id: string | null;
  class_name: string | null;
  source: "full_code" | "class_code" | "admin";
  source_id: string | null;
  effective_status: "active" | "expired" | "revoked";
  starts_at: Date;
  expires_at: Date | null;
  revoked_at: Date | null;
}

interface DeviceHistoryRow {
  id: string;
  label: string | null;
  registered_at: Date;
  revoked_at: Date | null;
}

interface RedemptionHistoryRow {
  id: string;
  code_type: AdminAccessCodeType;
  code: string | null;
  entitlement_id: string;
  redeemed_at: Date;
}

interface ActivityRow {
  id: string;
  source: "auth" | "access";
  event_type: string;
  actor_profile_id: string | null;
  actor_display_name: string | null;
  created_at: Date;
}

const ACCESS_CODE_SORT_SQL: Record<AdminAccessCodeSort, string> = {
  created_at: "c.created_at",
  code: "c.code",
  status:
    "case when c.status = 'active' and c.expires_at is not null and c.expires_at <= now() then 'expired' else c.status::text end",
  valid_from: "c.valid_from",
  expires_at: "c.expires_at",
  redeemed_at: "c.redeemed_at",
};

const STUDENT_SORT_SQL: Record<AdminStudentSort, string> = {
  created_at: "p.created_at",
  identifier: "c.normalized_identifier",
  status: "p.status",
  last_login: "last_login.last_login_at",
};

function assertPage(limit: number, offset: number): void {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("BAD_REQUEST", "حجم الصفحة غير صالح", 400);
  }
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new AppError("BAD_REQUEST", "إزاحة الصفحة غير صالحة", 400);
  }
}

function toCodeView(row: AccessCodeRow): AdminAccessCodeView {
  return {
    id: row.id,
    type: row.code_type,
    code: row.code,
    status: row.effective_status,
    classId: row.class_id,
    className: row.class_name,
    validFrom: row.valid_from,
    expiresAt: row.expires_at,
    entitlementDurationDays: row.entitlement_duration_days,
    redeemedAt: row.redeemed_at,
    redeemedByProfileId: row.redeemed_by_profile_id,
    redeemedByIdentifier: row.redeemed_by_identifier,
    redeemedByDisplayName: row.redeemed_by_display_name,
    entitlementExpiresAt: row.entitlement_expires_at,
    createdAt: row.created_at,
  };
}

function toStudentView(row: StudentAccountRow): AdminStudentAccountView {
  return {
    id: row.id,
    identifier: row.normalized_identifier,
    displayName: row.display_name,
    status: row.status,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    activeEntitlementCount: Number(row.active_entitlement_count),
    activeClassCount: Number(row.active_class_count),
    hasAllContent: row.has_all_content,
    hasActiveDevice: Boolean(row.active_device_id),
    recoveryRequired: row.must_change_password,
    deviceRebindAllowed: row.device_rebind_allowed,
  };
}

async function beginReadSnapshot(tx: QueryExecutor): Promise<void> {
  await tx.query("set transaction isolation level repeatable read, read only");
}

export class AdminStudentAccessService {
  constructor(private readonly db: Database) {}

  async listAccessCodes(input: {
    type: AdminAccessCodeType;
    status?: AdminAccessCodeStatus;
    search?: string;
    classId?: string;
    sort: AdminAccessCodeSort;
    direction: SortDirection;
    limit: number;
    offset: number;
  }): Promise<PageResult<AdminAccessCodeView>> {
    assertPage(input.limit, input.offset);
    if (input.type === "full_access" && input.classId) {
      throw new AppError("BAD_REQUEST", "فلتر الصف متاح لأكواد الصف فقط", 400);
    }

    const table = input.type === "full_access" ? "full_access_codes" : "class_access_codes";
    const codeJoinColumn = input.type === "full_access" ? "full_access_code_id" : "class_access_code_id";
    const classProjection =
      input.type === "class_access"
        ? "c.class_id, cls.name as class_name"
        : "null::uuid as class_id, null::text as class_name";
    const classJoin = input.type === "class_access" ? "left join classes cls on cls.id = c.class_id" : "";
    const classFilter =
      input.type === "class_access"
        ? "and ($3::uuid is null or c.class_id = $3::uuid)"
        : "and $3::uuid is null";
    const effectiveStatus =
      "case when c.status = 'active' and c.expires_at is not null and c.expires_at <= now() then 'expired' else c.status::text end";
    const normalizedSearch = input.search?.trim() ? normalizeAccessCode(input.search) : null;
    const values: readonly unknown[] = [input.status ?? null, normalizedSearch, input.classId ?? null];
    const orderBy = ACCESS_CODE_SORT_SQL[input.sort];
    const direction = input.direction === "asc" ? "asc" : "desc";

    return this.db.transaction(async (tx) => {
      await beginReadSnapshot(tx);
      const counts = await tx.query<CountRow>(
        `select count(*)::text as total
         from ${table} c
         where ($1::text is null or ${effectiveStatus} = $1::text)
           and ($2::text is null or c.code like ('%' || $2::text || '%'))
           ${classFilter}`,
        values,
      );

      const rows = await tx.query<AccessCodeRow>(
        `select c.id,
                '${input.type}'::text as code_type,
                c.code,
                ${effectiveStatus} as effective_status,
                ${classProjection},
                c.valid_from,
                c.expires_at,
                c.entitlement_duration_days,
                c.redeemed_at,
                c.redeemed_by_profile_id,
                redeemed_credential.normalized_identifier as redeemed_by_identifier,
                redeemed_profile.display_name as redeemed_by_display_name,
                entitlement.expires_at as entitlement_expires_at,
                c.created_at
         from ${table} c
         ${classJoin}
         left join profiles redeemed_profile on redeemed_profile.id = c.redeemed_by_profile_id
         left join auth_credentials redeemed_credential on redeemed_credential.profile_id = redeemed_profile.id
         left join lateral (
           select ar.entitlement_id
           from access_redemptions ar
           where ar.${codeJoinColumn} = c.id
           order by ar.redeemed_at desc
           limit 1
         ) redemption on true
         left join student_entitlements entitlement on entitlement.id = redemption.entitlement_id
         where ($1::text is null or ${effectiveStatus} = $1::text)
           and ($2::text is null or c.code like ('%' || $2::text || '%'))
           ${classFilter}
         order by ${orderBy} ${direction} nulls last, c.id ${direction}
         limit $4::integer offset $5::integer`,
        [...values, input.limit, input.offset],
      );

      return {
        items: rows.map(toCodeView),
        total: Number(counts[0]?.total ?? 0),
        limit: input.limit,
        offset: input.offset,
      };
    });
  }

  async revokeUnusedCodes(
    actorProfileId: string,
    type: AdminAccessCodeType,
    codeIds: readonly string[],
  ): Promise<{
    revokedIds: string[];
    blockedIds: string[];
    alreadyRevokedIds: string[];
    missingIds: string[];
  }> {
    const uniqueIds = [...new Set(codeIds)];
    if (uniqueIds.length < 1 || uniqueIds.length > 100) {
      throw new AppError("BAD_REQUEST", "اختر من 1 إلى 100 كود في العملية الواحدة", 400);
    }

    const table = type === "full_access" ? "full_access_codes" : "class_access_codes";
    const redemptionColumn = type === "full_access" ? "full_access_code_id" : "class_access_code_id";

    return this.db.transaction(async (tx) => {
      const rows = await tx.query<RevocableCodeRow>(
        `select c.id,
                c.status,
                c.redeemed_by_profile_id,
                exists (
                  select 1 from access_redemptions ar where ar.${redemptionColumn} = c.id
                ) as has_redemption
         from ${table} c
         where c.id = any($1::uuid[])
         for update`,
        [uniqueIds],
      );
      const found = new Map(rows.map((row) => [row.id, row]));
      const missingIds = uniqueIds.filter((id) => !found.has(id));
      const blockedIds: string[] = [];
      const alreadyRevokedIds: string[] = [];
      const eligible: RevocableCodeRow[] = [];

      for (const id of uniqueIds) {
        const row = found.get(id);
        if (!row) continue;
        if (row.status === "revoked") {
          alreadyRevokedIds.push(id);
          continue;
        }
        if (row.status === "redeemed" || row.redeemed_by_profile_id || row.has_redemption) {
          blockedIds.push(id);
          continue;
        }
        eligible.push(row);
      }

      const revokedIds = eligible.map((row) => row.id);
      if (revokedIds.length > 0) {
        await tx.query(`update ${table} set status = 'revoked' where id = any($1::uuid[])`, [revokedIds]);
        for (const row of eligible) {
          if (type === "full_access") {
            await tx.query(
              `insert into access_events (
                 event_type, actor_profile_id, code_type, full_access_code_id, metadata
               ) values ('code_revoked', $1, 'full_access', $2, jsonb_build_object('previousStatus', $3::text))`,
              [actorProfileId, row.id, row.status],
            );
          } else {
            await tx.query(
              `insert into access_events (
                 event_type, actor_profile_id, code_type, class_access_code_id, metadata
               ) values ('code_revoked', $1, 'class_access', $2, jsonb_build_object('previousStatus', $3::text))`,
              [actorProfileId, row.id, row.status],
            );
          }
        }
      }

      return { revokedIds, blockedIds, alreadyRevokedIds, missingIds };
    });
  }

  async listStudents(input: {
    search?: string;
    status?: AdminStudentStatus;
    sort: AdminStudentSort;
    direction: SortDirection;
    limit: number;
    offset: number;
  }): Promise<PageResult<AdminStudentAccountView>> {
    assertPage(input.limit, input.offset);
    const search = input.search?.trim().toLowerCase() || null;
    const searchPattern = search ? `%${search}%` : null;
    const orderBy = STUDENT_SORT_SQL[input.sort];
    const direction = input.direction === "asc" ? "asc" : "desc";
    const values: readonly unknown[] = [input.status ?? null, searchPattern];

    return this.db.transaction(async (tx) => {
      await beginReadSnapshot(tx);
      const counts = await tx.query<CountRow>(
        `select count(*)::text as total
         from profiles p
         join auth_credentials c on c.profile_id = p.id
         where p.role = 'student'
           and ($1::text is null or p.status::text = $1::text)
           and ($2::text is null or c.normalized_identifier like $2::text or lower(coalesce(p.display_name, '')) like $2::text)`,
        values,
      );

      const rows = await tx.query<StudentAccountRow>(
        `select p.id,
                c.normalized_identifier,
                p.display_name,
                p.status,
                p.created_at,
                last_login.last_login_at,
                coalesce(entitlements.active_entitlement_count, 0)::text as active_entitlement_count,
                coalesce(entitlements.active_class_count, 0)::text as active_class_count,
                coalesce(entitlements.has_all_content, false) as has_all_content,
                device.id as active_device_id,
                c.must_change_password,
                c.device_rebind_allowed
         from profiles p
         join auth_credentials c on c.profile_id = p.id
         left join lateral (
           select ae.created_at as last_login_at
           from auth_events ae
           where ae.profile_id = p.id and ae.event_type = 'login_success'
           order by ae.created_at desc
           limit 1
         ) last_login on true
         left join lateral (
           select count(*) as active_entitlement_count,
                  count(*) filter (where se.scope = 'class') as active_class_count,
                  bool_or(se.scope = 'all_content') as has_all_content
           from student_entitlements se
           where se.profile_id = p.id
             and se.status = 'active'
             and (se.expires_at is null or se.expires_at > now())
         ) entitlements on true
         left join lateral (
           select sd.id
           from student_devices sd
           where sd.profile_id = p.id and sd.revoked_at is null
           order by sd.registered_at desc
           limit 1
         ) device on true
         where p.role = 'student'
           and ($1::text is null or p.status::text = $1::text)
           and ($2::text is null or c.normalized_identifier like $2::text or lower(coalesce(p.display_name, '')) like $2::text)
         order by ${orderBy} ${direction} nulls last, p.id ${direction}
         limit $3::integer offset $4::integer`,
        [...values, input.limit, input.offset],
      );

      return {
        items: rows.map(toStudentView),
        total: Number(counts[0]?.total ?? 0),
        limit: input.limit,
        offset: input.offset,
      };
    });
  }

  async studentDetail(
    profileId: string,
    historyLimit: number,
    historyOffset: number,
  ): Promise<AdminStudentDetailView> {
    assertPage(historyLimit, historyOffset);

    return this.db.transaction(async (tx) => {
      await beginReadSnapshot(tx);
      const rows = await tx.query<StudentAccountRow>(
        `select p.id,
                c.normalized_identifier,
                p.display_name,
                p.status,
                p.created_at,
                last_login.last_login_at,
                coalesce(entitlements.active_entitlement_count, 0)::text as active_entitlement_count,
                coalesce(entitlements.active_class_count, 0)::text as active_class_count,
                coalesce(entitlements.has_all_content, false) as has_all_content,
                device.id as active_device_id,
                c.must_change_password,
                c.device_rebind_allowed,
                coalesce(sessions.active_session_count, 0)::text as active_session_count
         from profiles p
         join auth_credentials c on c.profile_id = p.id
         left join lateral (
           select ae.created_at as last_login_at
           from auth_events ae
           where ae.profile_id = p.id and ae.event_type = 'login_success'
           order by ae.created_at desc
           limit 1
         ) last_login on true
         left join lateral (
           select count(*) as active_entitlement_count,
                  count(*) filter (where se.scope = 'class') as active_class_count,
                  bool_or(se.scope = 'all_content') as has_all_content
           from student_entitlements se
           where se.profile_id = p.id
             and se.status = 'active'
             and (se.expires_at is null or se.expires_at > now())
         ) entitlements on true
         left join lateral (
           select sd.id
           from student_devices sd
           where sd.profile_id = p.id and sd.revoked_at is null
           order by sd.registered_at desc
           limit 1
         ) device on true
         left join lateral (
           select count(*) as active_session_count
           from auth_sessions s
           where s.profile_id = p.id and s.revoked_at is null and s.expires_at > now()
         ) sessions on true
         where p.id = $1 and p.role = 'student'`,
        [profileId],
      );
      const base = rows[0];
      if (!base) throw new AppError("NOT_FOUND", "حساب الطالب غير موجود", 404);

      const entitlements = await tx.query<EntitlementRow>(
        `select se.id,
                se.scope,
                se.class_id,
                cls.name as class_name,
                se.source,
                se.source_id,
                case
                  when se.status = 'active' and se.expires_at is not null and se.expires_at <= now() then 'expired'
                  else se.status::text
                end as effective_status,
                se.starts_at,
                se.expires_at,
                se.revoked_at
         from student_entitlements se
         left join classes cls on cls.id = se.class_id
         where se.profile_id = $1
         order by se.created_at desc, se.id desc
         limit 100`,
        [profileId],
      );

      const devices = await tx.query<DeviceHistoryRow>(
        `select id, label, registered_at, revoked_at
         from student_devices
         where profile_id = $1
         order by registered_at desc, id desc
         limit 50`,
        [profileId],
      );

      const redemptionCounts = await tx.query<CountRow>(
        "select count(*)::text as total from access_redemptions where profile_id = $1",
        [profileId],
      );
      const redemptions = await tx.query<RedemptionHistoryRow>(
        `select ar.id,
                ar.code_type,
                coalesce(fac.code, cac.code) as code,
                ar.entitlement_id,
                ar.redeemed_at
         from access_redemptions ar
         left join full_access_codes fac on fac.id = ar.full_access_code_id
         left join class_access_codes cac on cac.id = ar.class_access_code_id
         where ar.profile_id = $1
         order by ar.redeemed_at desc, ar.id desc
         limit $2::integer offset $3::integer`,
        [profileId, historyLimit, historyOffset],
      );

      const activityCounts = await tx.query<CountRow>(
        `select (
           (select count(*) from auth_events where profile_id = $1)
           +
           (select count(*) from access_events where subject_profile_id = $1)
         )::text as total`,
        [profileId],
      );
      const activity = await tx.query<ActivityRow>(
        `select activity.id,
                activity.source,
                activity.event_type,
                activity.actor_profile_id,
                actor.display_name as actor_display_name,
                activity.created_at
         from (
           select ae.id::text as id,
                  'auth'::text as source,
                  ae.event_type::text as event_type,
                  ae.actor_profile_id,
                  ae.created_at
           from auth_events ae
           where ae.profile_id = $1
           union all
           select access.id::text as id,
                  'access'::text as source,
                  access.event_type::text as event_type,
                  access.actor_profile_id,
                  access.created_at
           from access_events access
           where access.subject_profile_id = $1
         ) activity
         left join profiles actor on actor.id = activity.actor_profile_id
         order by activity.created_at desc, activity.id desc
         limit $2::integer offset $3::integer`,
        [profileId, historyLimit, historyOffset],
      );

      return {
        ...toStudentView(base),
        activeSessionCount: Number(base.active_session_count ?? 0),
        entitlements: entitlements.map((row) => ({
          id: row.id,
          scope: row.scope,
          classId: row.class_id,
          className: row.class_name,
          source: row.source,
          sourceId: row.source_id,
          status: row.effective_status,
          startsAt: row.starts_at,
          expiresAt: row.expires_at,
          revokedAt: row.revoked_at,
        })),
        devices: devices.map((row) => ({
          id: row.id,
          label: row.label,
          registeredAt: row.registered_at,
          revokedAt: row.revoked_at,
          active: row.revoked_at === null,
        })),
        redemptions: redemptions.map((row) => ({
          id: row.id,
          codeType: row.code_type,
          code: row.code,
          entitlementId: row.entitlement_id,
          redeemedAt: row.redeemed_at,
        })),
        redemptionTotal: Number(redemptionCounts[0]?.total ?? 0),
        activity: activity.map((row) => ({
          id: row.id,
          source: row.source,
          eventType: row.event_type,
          actorProfileId: row.actor_profile_id,
          actorDisplayName: row.actor_display_name,
          createdAt: row.created_at,
        })),
        activityTotal: Number(activityCounts[0]?.total ?? 0),
      };
    });
  }
}
