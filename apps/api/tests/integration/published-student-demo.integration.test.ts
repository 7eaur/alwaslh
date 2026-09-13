import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { AuthService } from "../../src/auth/service.js";
import {
  cleanupPublishedStudentDemo,
  PUBLISHED_STUDENT_DEMO_SLUGS,
  seedPublishedStudentDemo,
  verifyPublishedStudentDemo,
} from "../../src/content/published-student-demo.js";
import { createDatabase } from "../../src/db.js";
import { StudentAssessmentService } from "../../src/student-assessment/service.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for published demo integration tests");

test("published student demo seeds through real contracts, replays, verifies, starts practice, and cleans up", async () => {
  const db = createDatabase(databaseUrl);
  const storageRoot = await mkdtemp(join(tmpdir(), "alwaslh-published-demo-"));
  const auth = new AuthService(db, 24);
  const suffix = randomUUID();
  const adminIdentifier = `published-demo-admin-${suffix}`;
  const studentIdentifier = `published-demo-student-${suffix}`;
  let adminId: string | null = null;
  let studentId: string | null = null;

  try {
    const adminRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('admin', 'مدير البيانات التجريبية') returning id",
    );
    const studentRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('student', 'طالب البيانات التجريبية') returning id",
    );
    adminId = adminRows[0]?.id ?? null;
    studentId = studentRows[0]?.id ?? null;
    assert.ok(adminId && studentId);
    await auth.createCredential(adminId, adminIdentifier, "PublishedDemoAdmin123!");
    await auth.createCredential(studentId, studentIdentifier, "PublishedDemoStudent123!");

    const identity = { adminIdentifier, studentIdentifier };
    const seeded = await seedPublishedStudentDemo(db, storageRoot, identity);
    assert.equal(seeded.replayed, false);
    assert.ok(Object.values(seeded.checks).every(Boolean), JSON.stringify(seeded.checks));
    assert.equal(seeded.counts.readerAssets, 3);
    assert.equal(seeded.counts.publishedQuestionRevisions, 3);
    assert.equal(seeded.counts.quizVersions, 1);
    assert.equal(seeded.ids.mediaAssetIds.length, 3);
    assert.equal(seeded.ids.lessonAssetIds.length, 3);
    assert.equal(seeded.ids.questionBankItemIds.length, 3);
    assert.equal(seeded.ids.questionBankRevisionIds.length, 3);
    assert.equal(seeded.databaseDelta.classes, 1);
    assert.equal(seeded.databaseDelta.subjects, 1);
    assert.equal(seeded.databaseDelta.curriculum_sections, 1);
    assert.equal(seeded.databaseDelta.lessons, 1);

    const verified = await verifyPublishedStudentDemo(db, storageRoot, identity);
    assert.ok(Object.values(verified.checks).every(Boolean), JSON.stringify(verified.checks));

    const replayed = await seedPublishedStudentDemo(db, storageRoot, identity);
    assert.equal(replayed.replayed, true);
    assert.deepEqual(replayed.databaseDelta, {});
    assert.deepEqual(replayed.ids, verified.ids);

    const assessments = new StudentAssessmentService(db);
    const started = await assessments.start(studentId, seeded.ids.quizId, { mode: "practice" });
    assert.equal(started.session.status, "in_progress");
    assert.equal(started.quiz.id, seeded.ids.quizId);
    assert.equal(started.questions.length, 3);
    assert.ok(started.questions.every((question) => question.questionBankRevisionId));

    const cleaned = await cleanupPublishedStudentDemo(db, storageRoot);
    assert.equal(cleaned.removed, true);
    assert.ok(cleaned.storageKeysRemoved >= 15, `expected ingestion + 4 variants per page, got ${cleaned.storageKeysRemoved}`);

    const markerRows = await db.query<{ count: string }>(
      `select count(*)::text as count from classes where slug = $1`,
      [PUBLISHED_STUDENT_DEMO_SLUGS.class],
    );
    assert.equal(markerRows[0]?.count, "0");

    const secondCleanup = await cleanupPublishedStudentDemo(db, storageRoot);
    assert.deepEqual(secondCleanup, {
      marker: "DEMO-PUBLISHED-CONTENT",
      removed: false,
      storageKeysRemoved: 0,
    });
  } finally {
    await cleanupPublishedStudentDemo(db, storageRoot).catch(() => undefined);
    if (studentId) await db.query("delete from profiles where id = $1", [studentId]).catch(() => undefined);
    if (adminId) await db.query("delete from profiles where id = $1", [adminId]).catch(() => undefined);
    await db.close();
    await rm(storageRoot, { recursive: true, force: true });
  }
});
