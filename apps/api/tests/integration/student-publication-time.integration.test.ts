import assert from "node:assert/strict";
import test from "node:test";
import { CurriculumService } from "../../src/curriculum/service.js";
import { StudentReaderService } from "../../src/curriculum/student-reader.js";
import { createDatabase } from "../../src/db.js";
import { FileSystemMediaStorage } from "../../src/media/storage.js";
import { StudentAssessmentService } from "../../src/student-assessment/service.js";

const databaseUrl = process.env.DATABASE_URL;

test("Student Reader and assessment reject lessons scheduled for future publication", {
  skip: !databaseUrl,
}, async () => {
  assert.ok(databaseUrl);
  const db = createDatabase(databaseUrl);
  const profileIds: string[] = [];
  let classId: string | undefined;
  let subjectId: string | undefined;
  let lessonId: string | undefined;
  let quizId: string | undefined;

  try {
    const adminRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('admin', 'Student future publication fixture') returning id",
    );
    const studentRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('student', 'طالب نشر مجدول') returning id",
    );
    const adminId = adminRows[0]?.id;
    const studentId = studentRows[0]?.id;
    assert.ok(adminId && studentId);
    profileIds.push(adminId, studentId);

    const curriculum = new CurriculumService(db);
    const classRecord = await curriculum.createClass(adminId, {
      slug: `future-student-class-${crypto.randomUUID()}`,
      name: "صف النشر المجدول",
      description: null,
      position: 0,
      status: "active",
    });
    const subject = await curriculum.createSubject(adminId, {
      slug: `future-student-subject-${crypto.randomUUID()}`,
      name: "مادة النشر المجدول",
      description: null,
      status: "active",
    });
    classId = classRecord.id;
    subjectId = subject.id;
    await curriculum.createOffering(adminId, {
      classId,
      subjectId,
      position: 0,
      status: "active",
    });
    const lesson = await curriculum.createLesson(adminId, {
      classId,
      subjectId,
      slug: `future-student-lesson-${crypto.randomUUID()}`,
      title: "درس سيُنشر لاحقًا",
      summary: null,
      position: 0,
      status: "active",
    });
    lessonId = lesson.id;
    await db.query("update lessons set published_at = now() + interval '1 day' where id = $1", [lessonId]);
    await db.query(
      `insert into student_entitlements (profile_id, scope, class_id, source, starts_at, expires_at)
       values ($1, 'class', $2, 'admin', now() - interval '1 day', now() + interval '30 days')`,
      [studentId, classId],
    );

    const quizRows = await db.query<{ id: string }>(
      `insert into quizzes (title, description, status, class_id, subject_id, created_by_profile_id)
       values ('اختبار مجدول', null, 'draft', $1, $2, $3)
       returning id`,
      [classId, subjectId, adminId],
    );
    quizId = quizRows[0]?.id;
    assert.ok(quizId);
    await db.query("insert into quiz_lessons (quiz_id, lesson_id, position) values ($1, $2, 0)", [
      quizId,
      lessonId,
    ]);
    const versionRows = await db.query<{ id: string }>(
      `insert into quiz_versions (quiz_id, version_number, label, shuffle_questions, shuffle_options)
       values ($1, 1, 'النموذج المجدول', false, false)
       returning id`,
      [quizId],
    );
    const versionId = versionRows[0]?.id;
    assert.ok(versionId);
    const questionRows = await db.query<{ id: string }>(
      `insert into questions (quiz_version_id, lesson_id, type, prompt, explanation, position)
       values ($1, $2, 'true_false', 'الطاقة تقاس بالجول.', 'الجول وحدة طاقة.', 0)
       returning id`,
      [versionId, lessonId],
    );
    const questionId = questionRows[0]?.id;
    assert.ok(questionId);
    await db.query(
      `insert into question_options (question_id, label, is_correct, position)
       values ($1, 'صح', true, 0), ($1, 'خطأ', false, 1)`,
      [questionId],
    );
    await db.query(
      `update quizzes
       set status = 'published', submitted_for_review_by_profile_id = $2,
           submitted_for_review_at = now(), published_by_profile_id = $2, published_at = now()
       where id = $1`,
      [quizId, adminId],
    );

    const reader = new StudentReaderService(
      db,
      new FileSystemMediaStorage("./.stage15-publication-time-media"),
    );
    await assert.rejects(() => reader.lesson(studentId, lessonId as string), /الدرس غير متاح/);

    const assessment = new StudentAssessmentService(db);
    assert.deepEqual(await assessment.catalog(studentId), []);
  } finally {
    if (profileIds.length > 0) {
      await db
        .query("delete from practice_sessions where profile_id = any($1::uuid[])", [profileIds])
        .catch(() => undefined);
      await db
        .query("delete from student_entitlements where profile_id = any($1::uuid[])", [profileIds])
        .catch(() => undefined);
    }
    if (quizId) {
      await db.query("update quizzes set status = 'archived' where id = $1", [quizId]).catch(() => undefined);
      await db.query("delete from quizzes where id = $1", [quizId]).catch(() => undefined);
    }
    if (lessonId) await db.query("delete from lessons where id = $1", [lessonId]).catch(() => undefined);
    if (classId && subjectId) {
      await db
        .query("delete from subject_class_links where class_id = $1 and subject_id = $2", [
          classId,
          subjectId,
        ])
        .catch(() => undefined);
    }
    if (classId) await db.query("delete from classes where id = $1", [classId]).catch(() => undefined);
    if (subjectId) await db.query("delete from subjects where id = $1", [subjectId]).catch(() => undefined);
    if (profileIds.length > 0) {
      await db.query("delete from profiles where id = any($1::uuid[])", [profileIds]).catch(() => undefined);
    }
    await db.close();
  }
});
