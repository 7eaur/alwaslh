import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";
import {
  createOpaqueToken,
  hashAuditValue,
  hashPassword,
  hashToken,
  normalizeIdentifier,
  verifyPassword,
} from "./crypto.js";
import { assertDeviceProof, type DeviceProofPurpose } from "./device-crypto.js";

export type ProfileRole = "student" | "admin";
export type StudentChallengePurpose = Exclude<DeviceProofPurpose, "activation">;

export interface SessionProfile {
  id: string;
  role: ProfileRole;
  displayName: string | null;
}

export interface StudentLoginChallenge {
  challengeToken: string;
  purpose: StudentChallengePurpose;
  requiresDeviceRegistration: boolean;
  mustChangePassword: boolean;
  expiresInSeconds: number;
}

interface CredentialRow {
  profile_id: string;
  normalized_identifier: string;
  password_hash: string;
  must_change_password: boolean;
  temporary_password_expires_at: Date | null;
  device_rebind_allowed: boolean;
  role: ProfileRole;
  display_name: string | null;
  status: "active" | "inactive" | "archived";
}

interface SessionRow {
  profile_id: string;
  role: ProfileRole;
  display_name: string | null;
}

interface DeviceRow {
  id: string;
  public_key_spki: string;
  public_key_sha256: string;
}

interface ChallengeRow {
  id: string;
  profile_id: string;
  device_id: string | null;
  purpose: StudentChallengePurpose;
  expires_at: Date;
  used_at: Date | null;
  role: ProfileRole;
  display_name: string | null;
  status: "active" | "inactive" | "archived";
  must_change_password: boolean;
  device_rebind_allowed: boolean;
}

const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_MAX_FAILURES = 5;
const LOGIN_LOCK_MINUTES = 15;
const DEVICE_CHALLENGE_SECONDS = 5 * 60;
const TEMPORARY_PASSWORD_HOURS = 24;
let dummyHashPromise: Promise<string> | undefined;

function dummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword("invalid-credential-placeholder");
  return dummyHashPromise;
}

async function recordAuthEvent(
  db: QueryExecutor,
  eventType:
    | "login_success"
    | "login_failure"
    | "login_locked"
    | "logout"
    | "password_changed"
    | "recovery_issued"
    | "recovery_used"
    | "session_revoked"
    | "device_registered"
    | "device_challenge_issued"
    | "device_challenge_verified"
    | "temporary_password_issued"
    | "device_rebind_reset",
  options: {
    profileId?: string;
    identifier?: string;
    actorProfileId?: string;
    metadata?: Record<string, unknown>;
  } = {},
): Promise<void> {
  await db.query(
    `insert into auth_events (
       profile_id, event_type, identifier_hash_sha256, actor_profile_id, metadata
     ) values ($1, $2, $3, $4, $5::jsonb)`,
    [
      options.profileId ?? null,
      eventType,
      options.identifier ? hashAuditValue(options.identifier) : null,
      options.actorProfileId ?? null,
      JSON.stringify(options.metadata ?? {}),
    ],
  );
}

function assertChallengeFresh(challenge: ChallengeRow | undefined): asserts challenge is ChallengeRow {
  if (!challenge || challenge.used_at || challenge.expires_at.getTime() <= Date.now()) {
    throw new AppError("UNAUTHORIZED", "تحدي الجهاز غير صالح أو منتهي", 401);
  }
  if (challenge.role !== "student" || challenge.status !== "active") {
    throw new AppError("UNAUTHORIZED", "حساب الطالب غير متاح", 401);
  }
}

export class AuthService {
  constructor(
    private readonly db: Database,
    private readonly sessionTtlHours: number,
  ) {}

  async login(
    identifierInput: string,
    password: string,
    userAgent?: string,
  ): Promise<{ token: string; profile: SessionProfile }> {
    const credential = await this.verifyCredential(identifierInput, password);
    if (credential.role !== "admin") {
      throw new AppError("UNAUTHORIZED", "بيانات الدخول غير صحيحة", 401);
    }
    return this.db.transaction(async (tx) => {
      const token = await this.createSession(tx, credential, null, userAgent);
      await tx.query("delete from auth_login_guards where normalized_identifier = $1", [
        credential.normalized_identifier,
      ]);
      await recordAuthEvent(tx, "login_success", {
        profileId: credential.profile_id,
        identifier: credential.normalized_identifier,
      });
      return { token, profile: this.toProfile(credential) };
    });
  }

  async startStudentLogin(identifierInput: string, password: string): Promise<StudentLoginChallenge> {
    const credential = await this.verifyCredential(identifierInput, password);
    if (credential.role !== "student") {
      throw new AppError("UNAUTHORIZED", "بيانات الدخول غير صحيحة", 401);
    }
    if (
      credential.must_change_password &&
      credential.temporary_password_expires_at &&
      credential.temporary_password_expires_at.getTime() <= Date.now()
    ) {
      throw new AppError(
        "UNAUTHORIZED",
        "انتهت صلاحية كلمة المرور المؤقتة. اطلب واحدة جديدة من الإدارة",
        401,
      );
    }

    const devices = await this.db.query<DeviceRow>(
      `select id, public_key_spki, public_key_sha256
       from student_devices
       where profile_id = $1 and revoked_at is null
       order by registered_at desc
       limit 1`,
      [credential.profile_id],
    );
    const device = devices[0];
    if (!device && !credential.device_rebind_allowed) {
      throw new AppError("FORBIDDEN", "يلزم إعادة ربط الجهاز من الإدارة قبل تسجيل الدخول", 403);
    }

    const purpose: StudentChallengePurpose = device
      ? credential.must_change_password
        ? "password_change"
        : "login"
      : credential.must_change_password
        ? "password_change_rebind"
        : "device_rebind";
    const challengeToken = createOpaqueToken();

    await this.db.transaction(async (tx) => {
      await tx.query(
        `update auth_device_challenges
         set used_at = coalesce(used_at, now())
         where profile_id = $1 and used_at is null`,
        [credential.profile_id],
      );
      await tx.query(
        `insert into auth_device_challenges (
           token_hash_sha256, profile_id, device_id, purpose, expires_at
         ) values ($1, $2, $3, $4, now() + ($5::integer * interval '1 second'))`,
        [
          hashToken(challengeToken),
          credential.profile_id,
          device?.id ?? null,
          purpose,
          DEVICE_CHALLENGE_SECONDS,
        ],
      );
      await tx.query("delete from auth_login_guards where normalized_identifier = $1", [
        credential.normalized_identifier,
      ]);
      await recordAuthEvent(tx, "device_challenge_issued", {
        profileId: credential.profile_id,
        identifier: credential.normalized_identifier,
        metadata: { purpose, deviceId: device?.id ?? null },
      });
    });

    return {
      challengeToken,
      purpose,
      requiresDeviceRegistration: !device,
      mustChangePassword: credential.must_change_password,
      expiresInSeconds: DEVICE_CHALLENGE_SECONDS,
    };
  }

  async completeStudentLogin(input: {
    challengeToken: string;
    signature: string;
    publicKeySpki?: string;
    newPassword?: string;
    userAgent?: string;
  }): Promise<{ token: string; profile: SessionProfile; deviceId: string }> {
    if (input.challengeToken.length < 32 || input.challengeToken.length > 128) {
      throw new AppError("UNAUTHORIZED", "تحدي الجهاز غير صالح أو منتهي", 401);
    }
    const challengeHash = hashToken(input.challengeToken);

    return this.db.transaction(async (tx) => {
      const rows = await tx.query<ChallengeRow>(
        `select ch.id, ch.profile_id, ch.device_id, ch.purpose, ch.expires_at, ch.used_at,
                p.role, p.display_name, p.status,
                c.must_change_password, c.device_rebind_allowed
         from auth_device_challenges ch
         join profiles p on p.id = ch.profile_id
         join auth_credentials c on c.profile_id = ch.profile_id
         where ch.token_hash_sha256 = $1
         for update`,
        [challengeHash],
      );
      const challenge = rows[0];
      assertChallengeFresh(challenge);

      const requiresPasswordChange =
        challenge.purpose === "password_change" || challenge.purpose === "password_change_rebind";
      const requiresRebind =
        challenge.purpose === "device_rebind" || challenge.purpose === "password_change_rebind";

      if (requiresPasswordChange !== challenge.must_change_password) {
        throw new AppError("CONFLICT", "تغيرت حالة كلمة المرور. ابدأ تسجيل الدخول من جديد", 409);
      }
      if (requiresRebind && !challenge.device_rebind_allowed) {
        throw new AppError("FORBIDDEN", "إذن إعادة ربط الجهاز غير متاح", 403);
      }

      let deviceId: string;
      if (requiresRebind) {
        if (!input.publicKeySpki) {
          throw new AppError("BAD_REQUEST", "يلزم مفتاح الجهاز الجديد", 400);
        }
        const active = await tx.query<{ id: string }>(
          "select id from student_devices where profile_id = $1 and revoked_at is null limit 1",
          [challenge.profile_id],
        );
        if (active[0]) throw new AppError("CONFLICT", "يوجد جهاز مسجل بالفعل", 409);
        const deviceKey = assertDeviceProof(
          input.publicKeySpki,
          challenge.purpose,
          input.challengeToken,
          input.signature,
        );
        const historical = await tx.query<{ id: string }>(
          `select id
           from student_devices
           where profile_id = $1 and public_key_sha256 = $2
           limit 1`,
          [challenge.profile_id, deviceKey.fingerprintSha256],
        );
        if (historical[0]) {
          throw new AppError("CONFLICT", "إعادة ربط الجهاز تتطلب مفتاح جهاز جديدًا", 409);
        }

        let devices: readonly { id: string }[];
        try {
          devices = await tx.query<{ id: string }>(
            `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
             values ($1, $2, $3, 'primary')
             returning id`,
            [challenge.profile_id, deviceKey.publicKeySpki, deviceKey.fingerprintSha256],
          );
        } catch (error) {
          if ((error as { code?: string }).code === "23505") {
            throw new AppError("CONFLICT", "تعذر إعادة ربط الجهاز بهذا المفتاح", 409);
          }
          throw error;
        }
        const device = devices[0];
        if (!device) throw new AppError("CONFLICT", "تعذر تسجيل الجهاز الجديد", 409);
        deviceId = device.id;
        await tx.query("update auth_credentials set device_rebind_allowed = false where profile_id = $1", [
          challenge.profile_id,
        ]);
        await recordAuthEvent(tx, "device_registered", {
          profileId: challenge.profile_id,
          metadata: { deviceId, fingerprint: deviceKey.fingerprintSha256, flow: "admin_rebind" },
        });
      } else {
        if (!challenge.device_id) throw new AppError("CONFLICT", "تحدي الجهاز غير مكتمل", 409);
        const devices = await tx.query<DeviceRow>(
          `select id, public_key_spki, public_key_sha256
           from student_devices
           where id = $1 and profile_id = $2 and revoked_at is null
           for update`,
          [challenge.device_id, challenge.profile_id],
        );
        const device = devices[0];
        if (!device) throw new AppError("FORBIDDEN", "الجهاز المسجل لم يعد صالحًا", 403);
        assertDeviceProof(device.public_key_spki, challenge.purpose, input.challengeToken, input.signature);
        deviceId = device.id;
      }

      if (requiresPasswordChange) {
        if (!input.newPassword) {
          throw new AppError("BAD_REQUEST", "يلزم اختيار كلمة مرور خاصة جديدة", 400);
        }
        const passwordHash = await hashPassword(input.newPassword);
        await tx.query(
          `update auth_credentials
           set password_hash = $1,
               password_changed_at = now(),
               must_change_password = false,
               temporary_password_expires_at = null
           where profile_id = $2`,
          [passwordHash, challenge.profile_id],
        );
        await recordAuthEvent(tx, "password_changed", { profileId: challenge.profile_id });
        await recordAuthEvent(tx, "recovery_used", { profileId: challenge.profile_id });
      }

      await tx.query("update auth_device_challenges set used_at = now() where id = $1", [challenge.id]);
      await recordAuthEvent(tx, "device_challenge_verified", {
        profileId: challenge.profile_id,
        metadata: { purpose: challenge.purpose, deviceId },
      });

      const credentialRows = await tx.query<CredentialRow>(
        `select c.profile_id, c.normalized_identifier, c.password_hash,
                c.must_change_password, c.temporary_password_expires_at, c.device_rebind_allowed,
                p.role, p.display_name, p.status
         from auth_credentials c
         join profiles p on p.id = c.profile_id
         where c.profile_id = $1`,
        [challenge.profile_id],
      );
      const credential = credentialRows[0];
      if (!credential) throw new AppError("UNAUTHORIZED", "حساب الطالب غير متاح", 401);
      const token = await this.createSession(tx, credential, deviceId, input.userAgent);
      await recordAuthEvent(tx, "login_success", {
        profileId: credential.profile_id,
        identifier: credential.normalized_identifier,
        metadata: { deviceId },
      });
      return { token, profile: this.toProfile(credential), deviceId };
    });
  }

  async createStudentSession(
    profileId: string,
    deviceId: string,
    userAgent?: string,
  ): Promise<{ token: string; profile: SessionProfile }> {
    return this.db.transaction(async (tx) => {
      const credentials = await tx.query<CredentialRow>(
        `select c.profile_id, c.normalized_identifier, c.password_hash,
                c.must_change_password, c.temporary_password_expires_at, c.device_rebind_allowed,
                p.role, p.display_name, p.status
         from auth_credentials c
         join profiles p on p.id = c.profile_id
         where c.profile_id = $1`,
        [profileId],
      );
      const credential = credentials[0];
      if (!credential || credential.role !== "student" || credential.status !== "active") {
        throw new AppError("UNAUTHORIZED", "حساب الطالب غير متاح", 401);
      }
      if (credential.must_change_password) {
        throw new AppError("FORBIDDEN", "يلزم تغيير كلمة المرور قبل إنشاء جلسة", 403);
      }
      const devices = await tx.query<{ id: string }>(
        `select id from student_devices
         where id = $1 and profile_id = $2 and revoked_at is null
         for update`,
        [deviceId, profileId],
      );
      if (!devices[0]) throw new AppError("FORBIDDEN", "الجهاز المسجل غير صالح", 403);
      const token = await this.createSession(tx, credential, deviceId, userAgent);
      await recordAuthEvent(tx, "login_success", {
        profileId,
        identifier: credential.normalized_identifier,
        metadata: { deviceId, flow: "activation" },
      });
      return { token, profile: this.toProfile(credential) };
    });
  }

  async authenticate(token: string | undefined): Promise<SessionProfile> {
    if (!token || token.length < 32 || token.length > 128) {
      throw new AppError("UNAUTHORIZED", "يلزم تسجيل الدخول", 401);
    }
    const rows = await this.db.query<SessionRow>(
      `select s.profile_id, p.role, p.display_name
       from auth_sessions s
       join profiles p on p.id = s.profile_id
       left join student_devices d
         on d.id = s.device_id and d.profile_id = s.profile_id and d.revoked_at is null
       where s.token_hash_sha256 = $1
         and s.revoked_at is null
         and s.expires_at > now()
         and p.status = 'active'
         and (
           p.role = 'admin'
           or (p.role = 'student' and s.device_id is not null and d.id is not null)
         )
       limit 1`,
      [hashToken(token)],
    );
    const row = rows[0];
    if (!row) throw new AppError("UNAUTHORIZED", "انتهت الجلسة أو لم تعد صالحة", 401);
    return { id: row.profile_id, role: row.role, displayName: row.display_name };
  }

  async logout(token: string | undefined): Promise<void> {
    if (!token) return;
    await this.db.transaction(async (tx) => {
      const sessions = await tx.query<{ profile_id: string }>(
        `update auth_sessions
         set revoked_at = coalesce(revoked_at, now())
         where token_hash_sha256 = $1
         returning profile_id`,
        [hashToken(token)],
      );
      if (sessions[0]) await recordAuthEvent(tx, "logout", { profileId: sessions[0].profile_id });
    });
  }

  async createCredential(
    profileId: string,
    identifierInput: string,
    password: string,
    executor: QueryExecutor = this.db,
  ): Promise<void> {
    const identifier = normalizeIdentifier(identifierInput);
    if (identifier.length < 3 || identifier.length > 120) {
      throw new AppError("BAD_REQUEST", "معرّف الحساب غير صالح", 400);
    }
    const passwordHash = await hashPassword(password);
    try {
      await executor.query(
        `insert into auth_credentials (profile_id, normalized_identifier, password_hash)
         values ($1, $2, $3)`,
        [profileId, identifier, passwordHash],
      );
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "23505") throw new AppError("CONFLICT", "معرّف الحساب مستخدم", 409);
      throw error;
    }
  }

  async issueTemporaryPassword(
    actor: SessionProfile,
    targetProfileId: string,
  ): Promise<{ temporaryPassword: string; expiresInHours: number }> {
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const temporaryPassword = `Tmp-${createOpaqueToken().slice(0, 18)}`;
    const passwordHash = await hashPassword(temporaryPassword);

    await this.db.transaction(async (tx) => {
      const target = await tx.query<{ id: string }>(
        "select id from profiles where id = $1 and role = 'student' and status = 'active' for update",
        [targetProfileId],
      );
      if (!target[0]) throw new AppError("NOT_FOUND", "حساب الطالب غير موجود", 404);
      const updated = await tx.query<{ profile_id: string }>(
        `update auth_credentials
         set password_hash = $1,
             password_changed_at = now(),
             must_change_password = true,
             temporary_password_expires_at = now() + ($2::integer * interval '1 hour')
         where profile_id = $3
         returning profile_id`,
        [passwordHash, TEMPORARY_PASSWORD_HOURS, targetProfileId],
      );
      if (!updated[0]) throw new AppError("NOT_FOUND", "بيانات دخول الطالب غير موجودة", 404);
      await this.revokeStudentAuthState(tx, targetProfileId);
      await recordAuthEvent(tx, "temporary_password_issued", {
        profileId: targetProfileId,
        actorProfileId: actor.id,
        metadata: { expiresInHours: TEMPORARY_PASSWORD_HOURS },
      });
      await recordAuthEvent(tx, "recovery_issued", {
        profileId: targetProfileId,
        actorProfileId: actor.id,
        metadata: { method: "temporary_password" },
      });
    });

    return { temporaryPassword, expiresInHours: TEMPORARY_PASSWORD_HOURS };
  }

  async resetStudentDevice(actor: SessionProfile, targetProfileId: string): Promise<void> {
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    await this.db.transaction(async (tx) => {
      const target = await tx.query<{ id: string }>(
        "select id from profiles where id = $1 and role = 'student' and status = 'active' for update",
        [targetProfileId],
      );
      if (!target[0]) throw new AppError("NOT_FOUND", "حساب الطالب غير موجود", 404);
      await tx.query(
        `update student_devices
         set revoked_at = coalesce(revoked_at, now()), revoked_by_profile_id = $2
         where profile_id = $1 and revoked_at is null`,
        [targetProfileId, actor.id],
      );
      await tx.query("update auth_credentials set device_rebind_allowed = true where profile_id = $1", [
        targetProfileId,
      ]);
      await this.revokeStudentAuthState(tx, targetProfileId);
      await recordAuthEvent(tx, "device_rebind_reset", {
        profileId: targetProfileId,
        actorProfileId: actor.id,
      });
    });
  }

  private async verifyCredential(identifierInput: string, password: string): Promise<CredentialRow> {
    const identifier = normalizeIdentifier(identifierInput);
    if (identifier.length < 3 || identifier.length > 120 || password.length > 128) {
      throw new AppError("UNAUTHORIZED", "بيانات الدخول غير صحيحة", 401);
    }

    const guard = await this.db.query<{ locked_until: Date | null }>(
      "select locked_until from auth_login_guards where normalized_identifier = $1",
      [identifier],
    );
    if (guard[0]?.locked_until && guard[0].locked_until.getTime() > Date.now()) {
      await recordAuthEvent(this.db, "login_locked", { identifier });
      throw new AppError("RATE_LIMITED", "تم إيقاف محاولات الدخول مؤقتًا. حاول لاحقًا", 429);
    }

    const rows = await this.db.query<CredentialRow>(
      `select c.profile_id, c.normalized_identifier, c.password_hash,
              c.must_change_password, c.temporary_password_expires_at, c.device_rebind_allowed,
              p.role, p.display_name, p.status
       from auth_credentials c
       join profiles p on p.id = c.profile_id
       where c.normalized_identifier = $1`,
      [identifier],
    );
    const credential = rows[0];
    const passwordHash = credential?.password_hash ?? (await dummyHash());
    const passwordValid = await verifyPassword(password, passwordHash);

    if (!credential || !passwordValid || credential.status !== "active") {
      await this.recordLoginFailure(identifier, credential?.profile_id);
      throw new AppError("UNAUTHORIZED", "بيانات الدخول غير صحيحة", 401);
    }
    return credential;
  }

  private async createSession(
    tx: QueryExecutor,
    credential: CredentialRow,
    deviceId: string | null,
    userAgent?: string,
  ): Promise<string> {
    const token = createOpaqueToken();
    const tokenHash = hashToken(token);
    const userAgentHash = userAgent ? hashAuditValue(userAgent) : null;
    await tx.query(
      `insert into auth_sessions (
         profile_id, token_hash_sha256, expires_at, user_agent_hash_sha256, device_id
       ) values ($1, $2, now() + ($3 * interval '1 hour'), $4, $5)`,
      [credential.profile_id, tokenHash, this.sessionTtlHours, userAgentHash, deviceId],
    );
    return token;
  }

  private async revokeStudentAuthState(tx: QueryExecutor, profileId: string): Promise<void> {
    const revoked = await tx.query<{ id: string }>(
      `update auth_sessions
       set revoked_at = coalesce(revoked_at, now())
       where profile_id = $1 and revoked_at is null
       returning id`,
      [profileId],
    );
    await tx.query(
      `update auth_device_challenges
       set used_at = coalesce(used_at, now())
       where profile_id = $1 and used_at is null`,
      [profileId],
    );
    if (revoked.length > 0) {
      await recordAuthEvent(tx, "session_revoked", {
        profileId,
        metadata: { count: revoked.length },
      });
    }
  }

  private toProfile(credential: CredentialRow): SessionProfile {
    return {
      id: credential.profile_id,
      role: credential.role,
      displayName: credential.display_name,
    };
  }

  private async recordLoginFailure(identifier: string, profileId?: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const rows = await tx.query<{ failed_count: number; locked_until: Date | null }>(
        `insert into auth_login_guards (normalized_identifier, failed_count, window_started_at, locked_until)
         values ($1, 1, now(), null)
         on conflict (normalized_identifier) do update set
           failed_count = case
             when auth_login_guards.window_started_at < now() - interval '${LOGIN_WINDOW_MINUTES} minutes' then 1
             else auth_login_guards.failed_count + 1
           end,
           window_started_at = case
             when auth_login_guards.window_started_at < now() - interval '${LOGIN_WINDOW_MINUTES} minutes' then now()
             else auth_login_guards.window_started_at
           end,
           locked_until = case
             when (case
               when auth_login_guards.window_started_at < now() - interval '${LOGIN_WINDOW_MINUTES} minutes' then 1
               else auth_login_guards.failed_count + 1
             end) >= ${LOGIN_MAX_FAILURES}
             then now() + interval '${LOGIN_LOCK_MINUTES} minutes'
             else auth_login_guards.locked_until
           end
         returning failed_count, locked_until`,
        [identifier],
      );
      const eventContext = profileId ? { profileId, identifier } : { identifier };
      await recordAuthEvent(tx, "login_failure", eventContext);
      if (rows[0]?.locked_until) await recordAuthEvent(tx, "login_locked", eventContext);
    });
  }
}
