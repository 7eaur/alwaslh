import { hashToken } from "../auth/crypto.js";
import type { Database } from "../db.js";
import { AppError } from "../errors.js";

export type OfflineLeaseGrantScope = "all_content" | "class";

export interface StudentOfflineLeaseGrant {
  entitlementId: string;
  scope: OfflineLeaseGrantScope;
  classId: string | null;
  expiresAt: Date;
}

export interface StudentOfflineLease {
  version: 1;
  profileId: string;
  deviceId: string;
  issuedAt: Date;
  expiresAt: Date;
  grants: StudentOfflineLeaseGrant[];
}

interface OfflineLeaseRow {
  device_id: string;
  session_expires_at: Date;
  server_now: Date;
  entitlement_id: string | null;
  entitlement_scope: OfflineLeaseGrantScope | null;
  entitlement_class_id: string | null;
  entitlement_expires_at: Date | null;
}

export const MAX_OFFLINE_LEASE_HOURS = 24;
const MAX_OFFLINE_LEASE_MS = MAX_OFFLINE_LEASE_HOURS * 60 * 60 * 1000;

function earlierDate(first: Date, second: Date): Date {
  return first.getTime() <= second.getTime() ? first : second;
}

export class StudentOfflineService {
  constructor(private readonly db: Database) {}

  async lease(profileId: string, sessionToken: string | undefined): Promise<StudentOfflineLease> {
    if (!sessionToken || sessionToken.length < 32 || sessionToken.length > 128) {
      throw new AppError("UNAUTHORIZED", "يلزم تسجيل الدخول", 401);
    }

    const rows = await this.db.query<OfflineLeaseRow>(
      `select
         s.device_id,
         s.expires_at as session_expires_at,
         now() as server_now,
         e.id as entitlement_id,
         e.scope as entitlement_scope,
         e.class_id as entitlement_class_id,
         e.expires_at as entitlement_expires_at
       from auth_sessions s
       join student_devices d
         on d.id = s.device_id
        and d.profile_id = s.profile_id
        and d.revoked_at is null
       left join student_entitlements e
         on e.profile_id = s.profile_id
        and e.status = 'active'
        and e.starts_at <= now()
        and (e.expires_at is null or e.expires_at > now())
       where s.token_hash_sha256 = $1
         and s.profile_id = $2
         and s.device_id is not null
         and s.revoked_at is null
         and s.expires_at > now()
       order by
         case when e.scope = 'all_content' then 0 else 1 end,
         e.starts_at,
         e.id`,
      [hashToken(sessionToken), profileId],
    );

    const session = rows[0];
    if (!session) throw new AppError("UNAUTHORIZED", "انتهت الجلسة أو لم تعد صالحة", 401);

    const issuedAt = session.server_now;
    const maxLeaseExpiry = new Date(issuedAt.getTime() + MAX_OFFLINE_LEASE_MS);
    const expiresAt = earlierDate(maxLeaseExpiry, session.session_expires_at);
    const grants: StudentOfflineLeaseGrant[] = [];

    for (const row of rows) {
      if (!row.entitlement_id || !row.entitlement_scope) continue;
      const grantExpiry = row.entitlement_expires_at
        ? earlierDate(expiresAt, row.entitlement_expires_at)
        : expiresAt;
      grants.push({
        entitlementId: row.entitlement_id,
        scope: row.entitlement_scope,
        classId: row.entitlement_class_id,
        expiresAt: grantExpiry,
      });
    }

    return {
      version: 1,
      profileId,
      deviceId: session.device_id,
      issuedAt,
      expiresAt,
      grants,
    };
  }
}
