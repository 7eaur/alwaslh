import { type EntitlementView, normalizeAccessCode } from "../access/service.js";
import { createOpaqueToken, hashAuditValue, hashPassword, hashToken, verifyPassword } from "../auth/crypto.js";
import { assertDeviceProof } from "../auth/device-crypto.js";
import type { SessionProfile } from "../auth/service.js";
import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

interface FullCodeRow {
  id: string;
  code: string;
  status: "active" | "redeemed" | "expired" | "revoked";
  valid_from: Date;
  expires_at: Date | null;
  entitlement_duration_days: number;
}

interface TicketRow {
  id: string;
  full_access_code_id: string;
  expires_at: Date;
  used_at: Date | null;
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
  activation_ticket_hash: string | null;
  password_hash: string;
  profile_status: "active" | "inactive" | "archived";
  display_name: string | null;
  device_id: string | null;
  device_key_hash: string | null;
}

export interface ActivationVerificationResult {
  activationTicket: string;
  accountIdentifier: string;
  expiresInSeconds: number;
}

export interface StudentActivationResult {
  profile: SessionProfile;
  entitlement: EntitlementView;
  accountIdentifier: string;
  deviceId: string;
  replayed: boolean;
}

const ACTIVATION_TICKET_SECONDS = 10 * 60;

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

function normalizeFullCode(rawCode: string): string {
  const code = normalizeAccessCode(rawCode);
  if (!/^\d{6}$/.test(code)) {
    throw new AppError("BAD_REQUEST", "كود التفعيل يجب أن يكون 6 أرقام", 400);
  }
  return code;
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

function assertFreshTicket(ticket: TicketRow | undefined): asserts ticket is TicketRow {
  if (!ticket || ticket.used_at || ticket.expires_at.getTime() <= Date.now()) {
    throw new AppError("UNAUTHORIZED", "تذكرة التفعيل غير صالحة أو منتهية", 401);
  }
}

export class StudentActivationService {
  constructor(private readonly db: Database) {}

  async verifyCode(rawCode: string): Promise<ActivationVerificationResult> {
    const code = normalizeFullCode(rawCode);
    const codeRows = await this.db.query<FullCodeRow>(
      `select id, code, status, valid_from, expires_at, entitlement_duration_days
       from full_access_codes where code = $1`,
      [code],
    );
    const accessCode = codeRows[0];
    assertFreshCode(accessCode);

    const ticket = createOpaqueToken();
    await this.db.transaction(async (tx) => {
      await tx.query(
        `insert into student_activation_tickets (token_hash_sha256, full_access_code_id, expires_at)
         values ($1, $2, now() + ($3::integer * interval '1 second'))`,
        [hashToken(ticket), accessCode.id, ACTIVATION_TICKET_SECONDS],
      );
      await tx.query(
        `insert into auth_events (event_type, identifier_hash_sha256, metadata)
         values ('activation_ticket_issued', $1, jsonb_build_object('flow', 'two_step_activation'))`,
        [hashAuditValue(code)],
      );
    });

    return {
      activationTicket: ticket,
      accountIdentifier: code,
      expiresInSeconds: ACTIVATION_TICKET_SECONDS,
    };
  }

  async activate(
    activationTicket: string,
    password: string,
    idempotencyInput: string,
    publicKeySpki: string,
    deviceProof: string,
  ): Promise<StudentActivationResult> {
    if (activationTicket.length < 32 || activationTicket.length > 128) {
      throw new AppError("UNAUTHORIZED", "تذكرة التفعيل غير صالحة أو منتهية", 401);
    }
    const idempotencyKey = assertIdempotencyKey(idempotencyInput);
    const ticketHash = hashToken(activationTicket);
    const deviceKey = assertDeviceProof(publicKeySpki, "activation", activationTicket, deviceProof);

    const replay = await this.findReplay(this.db, idempotencyKey);
    if (replay) {
      return this.resolveReplay(replay, ticketHash, password, deviceKey.fingerprintSha256);
    }

    const preflightTickets = await this.db.query<TicketRow>(
      `select id, full_access_code_id, expires_at, used_at
       from student_activation_tickets where token_hash_sha256 = $1`,
      [ticketHash],
    );
    const preflightTicket = preflightTickets[0];
    assertFreshTicket(preflightTicket);

    const previewRows = await this.db.query<FullCodeRow>(
      `select id, code, status, valid_from, expires_at, entitlement_duration_days
       from full_access_codes where id = $1`,
      [preflightTicket.full_access_code_id],
    );
    assertFreshCode(previewRows[0]);
    const passwordHash = await hashPassword(password);

    return this.db.transaction(async (tx) => {
      await tx.query("select pg_advisory_xact_lock(hashtext($1))", [idempotencyKey]);

      const existingReplay = await this.findReplay(tx, idempotencyKey);
      if (existingReplay) {
        return this.resolveReplay(existingReplay, ticketHash, password, deviceKey.fingerprintSha256);
      }

      const ticketRows = await tx.query<TicketRow>(
        `select id, full_access_code_id, expires_at, used_at
         from student_activation_tickets
         where token_hash_sha256 = $1
         for update`,
        [ticketHash],
      );
      const ticket = ticketRows[0];
      assertFreshTicket(ticket);

      const codeRows = await tx.query<FullCodeRow>(
        `select id, code, status, valid_from, expires_at, entitlement_duration_days
         from full_access_codes where id = $1 for update`,
        [ticket.full_access_code_id],
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
          `insert into auth_credentials (
             profile_id, normalized_identifier, password_hash, must_change_password, device_rebind_allowed
           ) values ($1, $2, $3, false, false)`,
          [profile.id, accessCode.code, passwordHash],
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

      const deviceRows = await tx.query<{ id: string }>(
        `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
         values ($1, $2, $3, 'primary')
         returning id`,
        [profile.id, deviceKey.publicKeySpki, deviceKey.fingerprintSha256],
      );
      const device = deviceRows[0];
      if (!device) throw new AppError("CONFLICT", "تعذر تسجيل جهاز الطالب", 409);

      await tx.query(
        `update full_access_codes
         set status = 'redeemed', redeemed_at = now(), redeemed_by_profile_id = $2
         where id = $1`,
        [accessCode.id, profile.id],
      );

      await tx.query(
        `insert into access_redemptions (
           profile_id, code_type, full_access_code_id, entitlement_id, idempotency_key,
           request_metadata
         ) values (
           $1, 'full_access', $2, $3, $4,
           jsonb_build_object(
             'flow', 'two_step_activation',
             'activation_ticket_hash', $5,
             'device_fingerprint', $6
           )
         )`,
        [profile.id, accessCode.id, entitlement.id, idempotencyKey, ticketHash, deviceKey.fingerprintSha256],
      );

      await tx.query(
        `update student_activation_tickets set used_at = now() where id = $1`,
        [ticket.id],
      );

      await tx.query(
        `insert into access_events (
           event_type, subject_profile_id, code_type, full_access_code_id, entitlement_id, metadata
         ) values
           ('code_redeemed', $1, 'full_access', $2, $3, jsonb_build_object('flow', 'two_step_activation')),
           ('entitlement_created', $1, 'full_access', $2, $3, jsonb_build_object('flow', 'two_step_activation'))`,
        [profile.id, accessCode.id, entitlement.id],
      );

      await tx.query(
        `insert into auth_events (
           profile_id, event_type, identifier_hash_sha256, metadata
         ) values
           ($1, 'account_activated', $2, jsonb_build_object('flow', 'two_step_activation')),
           ($1, 'device_registered', $2, jsonb_build_object('device_id', $3, 'fingerprint', $4))`,
        [profile.id, hashAuditValue(accessCode.code), device.id, deviceKey.fingerprintSha256],
      );

      return {
        profile: { id: profile.id, role: "student", displayName: profile.display_name },
        entitlement: toEntitlement(entitlement),
        accountIdentifier: accessCode.code,
        deviceId: device.id,
        replayed: false,
      };
    });
  }

  private async findReplay(
    executor: QueryExecutor,
    idempotencyKey: string,
  ): Promise<ActivationReplayRow | undefined> {
    const rows = await executor.query<ActivationReplayRow>(
      `select r.profile_id,
              r.entitlement_id,
              r.code_type,
              r.request_metadata ->> 'activation_ticket_hash' as activation_ticket_hash,
              c.password_hash,
              p.status as profile_status,
              p.display_name,
              d.id as device_id,
              d.public_key_sha256 as device_key_hash
       from access_redemptions r
       join profiles p on p.id = r.profile_id
       join auth_credentials c on c.profile_id = r.profile_id
       left join student_devices d
         on d.profile_id = r.profile_id and d.revoked_at is null
       where r.idempotency_key = $1
       limit 1`,
      [idempotencyKey],
    );
    return rows[0];
  }

  private async resolveReplay(
    replay: ActivationReplayRow,
    ticketHash: string,
    password: string,
    deviceKeyHash: string,
  ): Promise<StudentActivationResult> {
    if (
      replay.code_type !== "full_access" ||
      replay.activation_ticket_hash !== ticketHash ||
      replay.profile_status !== "active" ||
      !replay.device_id ||
      replay.device_key_hash !== deviceKeyHash
    ) {
      throw new AppError("CONFLICT", "مفتاح طلب التفعيل مستخدم لعملية أخرى", 409);
    }
    if (!(await verifyPassword(password, replay.password_hash))) {
      throw new AppError("UNAUTHORIZED", "بيانات التفعيل غير صحيحة", 401);
    }

    const entitlementRows = await this.db.query<EntitlementRow>(
      `select id, scope, class_id, status, starts_at, expires_at
       from student_entitlements where id = $1 and profile_id = $2`,
      [replay.entitlement_id, replay.profile_id],
    );
    const entitlement = entitlementRows[0];
    if (!entitlement) throw new AppError("CONFLICT", "صلاحية التفعيل السابقة غير موجودة", 409);

    return {
      profile: { id: replay.profile_id, role: "student", displayName: replay.display_name },
      entitlement: toEntitlement(entitlement),
      accountIdentifier: "",
      deviceId: replay.device_id,
      replayed: true,
    };
  }
}
