import { hashToken } from "../../api/src/auth/crypto.js";
import { createDatabase } from "../../api/src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for reconnect authority fixture");

const [action, sessionToken] = process.argv.slice(2);
if (action !== "revoke-entitlements" || !sessionToken) {
  throw new Error("usage: offline-reconnect-authority.ts revoke-entitlements <sessionToken>");
}

const db = createDatabase(databaseUrl);
try {
  const sessions = await db.query<{ profile_id: string }>(
    `select profile_id
       from auth_sessions
      where token_hash_sha256 = $1
      limit 1`,
    [hashToken(sessionToken)],
  );
  const profileId = sessions[0]?.profile_id;
  if (!profileId) throw new Error("reconnect_fixture_session_not_found");

  const revoked = await db.query<{ id: string }>(
    `update student_entitlements
        set status = 'revoked', revoked_at = now()
      where profile_id = $1
        and status = 'active'
      returning id`,
    [profileId],
  );
  if (revoked.length === 0) throw new Error("reconnect_fixture_no_active_entitlement");

  process.stdout.write(JSON.stringify({ profileId, revokedCount: revoked.length }));
} finally {
  await db.close();
}
