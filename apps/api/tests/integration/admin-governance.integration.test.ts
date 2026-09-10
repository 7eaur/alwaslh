import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for G-C2 governance integration tests");

const origin = "http://localhost:5173";
const hiddenMetadataSecret = "gc2-hidden-metadata-secret";
const hiddenReviewSecret = "gc2-hidden-reviewed-output-secret";

interface GovernanceBaseline {
  locked_login_guards: string;
  pending_recovery_tokens: string;
  active_student_devices: string;
  forced_password_changes: string;
  ai_routes_paused: string;
  ai_routes_cooling_down: string;
  password_changed_events: string;
}

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("G-C2 projects reports/settings/security/audit from canonical authorities without exposing secrets", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    DATABASE_SSL: "require",
    DATABASE_POOL_MAX: "7",
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: `${origin},http://localhost:5174`,
    SESSION_TTL_HOURS: "24",
    SESSION_COOKIE_SAME_SITE: "lax",
    MEDIA_STORAGE_ROOT: "/tmp/gc2-sensitive-storage-path",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const baselineRows = await db.query<GovernanceBaseline>(`
    select
      (select count(*) from auth_login_guards where locked_until > now())::text as locked_login_guards,
      (select count(*) from auth_password_reset_tokens where used_at is null and expires_at > now())::text as pending_recovery_tokens,
      (select count(*) from student_devices where revoked_at is null)::text as active_student_devices,
      (select count(*) from auth_credentials where must_change_password)::text as forced_password_changes,
      (select count(*) from ai_route_runtime_state where kill_switch)::text as ai_routes_paused,
      (select count(*) from ai_route_runtime_state where cooldown_until > now())::text as ai_routes_cooling_down,
      (select count(*) from auth_events where event_type = 'password_changed')::text as password_changed_events
  `);
  const baseline = baselineRows[0];
  assert.ok(baseline);

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير G-C2') returning id",
  );
  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب G-C2') returning id",
  );
  const adminId = adminRows[0]?.id;
  const studentId = studentRows[0]?.id;
  assert.ok(adminId && studentId);

  await auth.createCredential(adminId, "stage13g-gc2-admin", "Stage13gGc2Admin123!");
  await auth.createCredential(studentId, "stage13g-gc2-student", "Stage13gGc2Student123!");
  await db.query(
    `insert into auth_login_guards (normalized_identifier, failed_count, locked_until)
     values ('stage13g-gc2-locked', 4, now() + interval '1 hour')`,
  );
  await db.query(
    `insert into auth_password_reset_tokens (profile_id, token_hash_sha256, expires_at, created_by_profile_id)
     values ($1, $2, now() + interval '1 hour', $3)`,
    [studentId, "a".repeat(64), adminId],
  );
  const deviceRows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'gc2-device') returning id`,
    [studentId, "x".repeat(100), "b".repeat(64)],
  );
  const deviceId = deviceRows[0]?.id;
  assert.ok(deviceId);
  const studentSession = await auth.createStudentSession(studentId, deviceId, "gc2-student-session");
  await db.query("update auth_credentials set must_change_password = true where profile_id = $1", [
    studentId,
  ]);

  const classRows = await db.query<{ id: string }>(
    "insert into classes (slug, name) values ('stage13g-gc2-class', 'صف G-C2') returning id",
  );
  const subjectRows = await db.query<{ id: string }>(
    "insert into subjects (slug, name) values ('stage13g-gc2-subject', 'مادة G-C2') returning id",
  );
  const classId = classRows[0]?.id;
  const subjectId = subjectRows[0]?.id;
  assert.ok(classId && subjectId);
  await db.query("insert into subject_class_links (class_id, subject_id) values ($1, $2)", [
    classId,
    subjectId,
  ]);

  await db.query(
    `insert into auth_events (profile_id, event_type, actor_profile_id, metadata)
     values ($1, 'password_changed', $2, jsonb_build_object('private', $3::text))`,
    [studentId, adminId, hiddenMetadataSecret],
  );
  await db.query(
    `insert into access_events (event_type, actor_profile_id, subject_profile_id, metadata)
     values ('entitlement_created', $1, $2, jsonb_build_object('private', $3::text))`,
    [adminId, studentId, hiddenMetadataSecret],
  );

  const aiJobRows = await db.query<{ id: string }>(
    `insert into ai_jobs (created_by_profile_id, job_type, prompt_key, prompt_version, total_units, idempotency_key)
     values ($1, 'gc2-audit', 'gc2', '1', 1, 'stage13g-gc2-audit-job') returning id`,
    [adminId],
  );
  const aiUnitRows = await db.query<{ id: string }>(
    `insert into ai_job_units (job_id, unit_key, position, provider_project_alias, credential_alias)
     values ($1, 'unit-1', 0, 'hidden-project-alias', 'hidden-credential-alias') returning id`,
    [aiJobRows[0]?.id],
  );
  const aiOutputRows = await db.query<{ id: string }>(
    `insert into ai_outputs (job_unit_id) values ($1) returning id`,
    [aiUnitRows[0]?.id],
  );
  await db.query(
    `insert into ai_output_review_events (ai_output_id, revision, action, actor_profile_id, reviewed_output, note)
     values ($1, 1, 'edit', $2, jsonb_build_object('private', $3::text), $4)`,
    [aiOutputRows[0]?.id, adminId, hiddenReviewSecret, hiddenMetadataSecret],
  );

  const bankRows = await db.query<{ id: string }>(
    `insert into question_bank_items (class_id, subject_id, origin, created_by_profile_id)
     values ($1, $2, 'manual', $3) returning id`,
    [classId, subjectId, adminId],
  );
  await db.query(
    `insert into question_bank_events (item_id, action, actor_profile_id, note)
     values ($1, 'create', $2, $3)`,
    [bankRows[0]?.id, adminId, hiddenMetadataSecret],
  );

  const quizRows = await db.query<{ id: string }>(
    `insert into quizzes (title, class_id, subject_id, created_by_profile_id)
     values ('اختبار G-C2', $1, $2, $3) returning id`,
    [classId, subjectId, adminId],
  );
  await db.query(
    `insert into quiz_builder_events (quiz_id, action, actor_profile_id, note)
     values ($1, 'create', $2, $3)`,
    [quizRows[0]?.id, adminId, hiddenMetadataSecret],
  );

  await db.query(
    `update ai_execution_runtime_control
     set kill_switch = true, updated_at = now()
     where singleton`,
  );
  await db.query(
    `insert into ai_route_runtime_state (route_key, provider_key, provider_project_alias, credential_alias, model_used, kill_switch, cooldown_until)
     values ('gc2-route', 'hidden-provider', 'hidden-project', 'hidden-credential', 'hidden-model', true, now() + interval '1 hour')`,
  );

  const app = buildApp({ config, database: db });

  try {
    const adminLogin = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: "stage13g-gc2-admin", password: "Stage13gGc2Admin123!" },
    });
    assert.equal(adminLogin.statusCode, 200);
    const adminCookie = cookieFrom(adminLogin);
    const studentCookie = `${config.SESSION_COOKIE_NAME}=${studentSession.token}`;

    const governance = await app.inject({
      method: "GET",
      url: "/v1/admin/operations/governance",
      headers: { cookie: adminCookie },
    });
    assert.equal(governance.statusCode, 200);
    const governanceBody = governance.json();
    assert.equal(governanceBody.settings.environment, "test");
    assert.equal(governanceBody.settings.databaseSsl, "require");
    assert.equal(governanceBody.settings.databasePoolMax, 7);
    assert.equal(governanceBody.settings.sessionTtlHours, 24);
    assert.equal(governanceBody.settings.allowedOriginCount, 2);
    assert.equal(governanceBody.settings.aiGlobalKillSwitch, true);
    assert.equal(governanceBody.security.lockedLoginGuards, Number(baseline.locked_login_guards) + 1);
    assert.equal(governanceBody.security.pendingRecoveryTokens, Number(baseline.pending_recovery_tokens) + 1);
    assert.equal(governanceBody.security.activeStudentDevices, Number(baseline.active_student_devices) + 1);
    assert.equal(governanceBody.security.forcedPasswordChanges, Number(baseline.forced_password_changes) + 1);
    assert.equal(governanceBody.security.aiRoutesPaused, Number(baseline.ai_routes_paused) + 1);
    assert.equal(governanceBody.security.aiRoutesCoolingDown, Number(baseline.ai_routes_cooling_down) + 1);

    const audit = await app.inject({
      method: "GET",
      url: "/v1/admin/operations/audit?limit=100&offset=0",
      headers: { cookie: adminCookie },
    });
    assert.equal(audit.statusCode, 200);
    const auditBody = audit.json();
    const sources = new Set((auditBody.entries as Array<{ source: string }>).map((entry) => entry.source));
    assert.deepEqual(
      [...sources].sort(),
      ["access", "ai_review", "auth", "question_bank", "quiz_builder"].sort(),
    );

    const authOnly = await app.inject({
      method: "GET",
      url: "/v1/admin/operations/audit?source=auth&eventType=password_changed&limit=100",
      headers: { cookie: adminCookie },
    });
    assert.equal(authOnly.statusCode, 200);
    assert.equal(authOnly.json().page.total, Number(baseline.password_changed_events) + 1);
    assert.ok(
      (authOnly.json().entries as Array<{ source: string; eventType: string }>).every(
        (entry) => entry.source === "auth" && entry.eventType === "password_changed",
      ),
    );

    const publicProjection = JSON.stringify([governanceBody, auditBody]);
    for (const forbidden of [
      hiddenMetadataSecret,
      hiddenReviewSecret,
      "hidden-project-alias",
      "hidden-credential-alias",
      "hidden-provider",
      "hidden-model",
      databaseUrl,
      "/tmp/gc2-sensitive-storage-path",
      origin,
      "password_hash",
      "token_hash",
      "public_key_spki",
      "provider_metadata",
      "reviewed_output",
    ]) {
      assert.equal(publicProjection.includes(forbidden), false, `public projection leaked ${forbidden}`);
    }

    const anonymous = await app.inject({ method: "GET", url: "/v1/admin/operations/governance" });
    assert.equal(anonymous.statusCode, 401);
    const studentForbidden = await app.inject({
      method: "GET",
      url: "/v1/admin/operations/audit",
      headers: { cookie: studentCookie },
    });
    assert.equal(studentForbidden.statusCode, 403);

    const invalidAudit = await app.inject({
      method: "GET",
      url: "/v1/admin/operations/audit?source=unknown",
      headers: { cookie: adminCookie },
    });
    assert.equal(invalidAudit.statusCode, 400);
  } finally {
    await app.close();
  }
});
