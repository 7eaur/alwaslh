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

export type ProfileRole = "student" | "admin";

export interface SessionProfile {
  id: string;
  role: ProfileRole;
  displayName: string | null;
}

interface CredentialRow {
  profile_id: string;
  normalized_identifier: string;
  password_hash: string;
  role: ProfileRole;
  display_name: string | null;
  status: "active" | "inactive" | "archived";
}

interface SessionRow {
  profile_id: string;
  role: ProfileRole;
  display_name: string | null;
}

const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_MAX_FAILURES = 5;
const LOGIN_LOCK_MINUTES = 15;
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
    | "session_revoked",
  options: { profileId?: string; identifier?: string; actorProfileId?: string } = {},
): Promise<void> {
  await db.query(
    `insert into auth_events (profile_id, event_type, identifier_hash_sha256, actor_profile_id)
     values ($1, $2, $3, $4)`,
    [
      options.profileId ?? null,
      eventType,
      options.identifier ? hashAuditValue(options.identifier) : null,
      options.actorProfileId ?? null,
    ],
  );
}

export class AuthService {
  constructor(
    private readonly db: Database,
    private readonly sessionTtlHours: number,
  ) {}

  async login(identifierInput: string, password: string, userAgent?: string): Promise<{ token: string; profile: SessionProfile }> {
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

    const token = createOpaqueToken();
    const tokenHash = hashToken(token);
    const userAgentHash = userAgent ? hashAuditValue(userAgent) : null;

    await this.db.transaction(async (tx) => {
      await tx.query("delete from auth_login_guards where normalized_identifier = $1", [identifier]);
      await tx.query(
        `insert into auth_sessions (profile_id, token_hash_sha256, expires_at, user_agent_hash_sha256)
         values ($1, $2, now() + ($3 * interval '1 hour'), $4)`,
        [credential.profile_id, tokenHash, this.sessionTtlHours, userAgentHash],
      );
      await recordAuthEvent(tx, "login_success", { profileId: credential.profile_id, identifier });
    });

    return {
      token,
      profile: { id: credential.profile_id, role: credential.role, displayName: credential.display_name },
    };
  }

  async authenticate(token: string | undefined): Promise<SessionProfile> {
    if (!token || token.length < 32 || token.length > 128) {
      throw new AppError("UNAUTHORIZED", "يلزم تسجيل الدخول", 401);
    }
    const rows = await this.db.query<SessionRow>(
      `select s.profile_id, p.role, p.display_name
       from auth_sessions s
       join profiles p on p.id = s.profile_id
       where s.token_hash_sha256 = $1
         and s.revoked_at is null
         and s.expires_at > now()
         and p.status = 'active'
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

  async issueRecoveryToken(actor: SessionProfile, targetProfileId: string): Promise<string> {
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const token = createOpaqueToken();
    await this.db.transaction(async (tx) => {
      const target = await tx.query<{ id: string }>(
        "select id from profiles where id = $1 and role = 'student' and status = 'active'",
        [targetProfileId],
      );
      if (!target[0]) throw new AppError("NOT_FOUND", "حساب الطالب غير موجود", 404);
      await tx.query(
        `update auth_password_reset_tokens
         set used_at = coalesce(used_at, now())
         where profile_id = $1 and used_at is null`,
        [targetProfileId],
      );
      await tx.query(
        `insert into auth_password_reset_tokens
          (profile_id, token_hash_sha256, expires_at, created_by_profile_id)
         values ($1, $2, now() + interval '30 minutes', $3)`,
        [targetProfileId, hashToken(token), actor.id],
      );
      await recordAuthEvent(tx, "recovery_issued", {
        profileId: targetProfileId,
        actorProfileId: actor.id,
      });
    });
    return token;
  }

  async resetPassword(recoveryToken: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(recoveryToken);
    const passwordHash = await hashPassword(newPassword);
    await this.db.transaction(async (tx) => {
      const rows = await tx.query<{ id: string; profile_id: string }>(
        `select id, profile_id
         from auth_password_reset_tokens
         where token_hash_sha256 = $1 and used_at is null and expires_at > now()
         for update`,
        [tokenHash],
      );
      const reset = rows[0];
      if (!reset) throw new AppError("UNAUTHORIZED", "رمز الاسترجاع غير صالح أو منتهي", 401);

      await tx.query(
        `update auth_credentials
         set password_hash = $1, password_changed_at = now()
         where profile_id = $2`,
        [passwordHash, reset.profile_id],
      );
      await tx.query("update auth_password_reset_tokens set used_at = now() where id = $1", [reset.id]);
      await tx.query(
        `update auth_sessions
         set revoked_at = coalesce(revoked_at, now())
         where profile_id = $1 and revoked_at is null`,
        [reset.profile_id],
      );
      await recordAuthEvent(tx, "password_changed", { profileId: reset.profile_id });
      await recordAuthEvent(tx, "recovery_used", { profileId: reset.profile_id });
    });
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
      await recordAuthEvent(tx, "login_failure", { profileId, identifier });
      if (rows[0]?.locked_until) await recordAuthEvent(tx, "login_locked", { profileId, identifier });
    });
  }
}
