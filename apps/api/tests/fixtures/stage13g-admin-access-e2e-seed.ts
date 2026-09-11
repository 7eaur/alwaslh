import assert from "node:assert/strict";
import { AccessService } from "../../src/access/service.js";
import { AuthService } from "../../src/auth/service.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13G E2E seed");

const adminIdentifier = process.env.STAGE13G_ADMIN_IDENTIFIER ?? "stage13g-admin-ui";
const studentIdentifier = process.env.STAGE13G_STUDENT_IDENTIFIER ?? "stage13g-student-ui";

const db = createDatabase(databaseUrl);
const auth = new AuthService(db, 24);
const access = new AccessService(db);

try {
  const admins = await db.query<{ id: string }>(
    `select p.id
     from profiles p
     join auth_credentials c on c.profile_id = p.id
     where p.role = 'admin' and c.normalized_identifier = lower(btrim($1))
     limit 1`,
    [adminIdentifier],
  );
  const adminId = admins[0]?.id;
  assert.ok(adminId, `Admin fixture ${adminIdentifier} must exist before Stage13G seed`);

  const classes = await db.query<{ id: string }>(
    `insert into classes (slug, name, position)
     values ('stage13g-access-class', 'الصف التجريبي للوصول', 1)
     returning id`,
  );
  const classId = classes[0]?.id;
  assert.ok(classId);

  const students = await db.query<{ id: string }>(
    `insert into profiles (role, display_name, status)
     values ('student', 'طالب الوصول التجريبي', 'active')
     returning id`,
  );
  const studentId = students[0]?.id;
  assert.ok(studentId);

  await auth.createCredential(studentId, studentIdentifier, "StudentStage13gPass123!");

  const entitlements = await db.query<{ id: string }>(
    `insert into student_entitlements (
       profile_id, scope, class_id, source, status, starts_at, expires_at
     ) values ($1, 'class', $2, 'admin', 'active', now(), now() + interval '90 days')
     returning id`,
    [studentId, classId],
  );
  assert.ok(entitlements[0]?.id);

  await db.query(
    `insert into auth_events (profile_id, event_type, actor_profile_id, metadata)
     values ($1, 'recovery_issued', $2, jsonb_build_object('fixture', true))`,
    [studentId, adminId],
  );

  const fullCodes = await access.generateFullCodes(adminId, 3, 60);
  const classCodes = await access.generateClassCodes(adminId, classId, 3, 45);
  assert.equal(fullCodes.length, 3);
  assert.equal(classCodes.length, 3);

  console.log(
    JSON.stringify({
      studentId,
      studentIdentifier,
      classId,
      fullCodeCount: fullCodes.length,
      classCodeCount: classCodes.length,
    }),
  );
} finally {
  await db.close();
}
