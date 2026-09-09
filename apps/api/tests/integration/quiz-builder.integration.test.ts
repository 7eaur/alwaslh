import assert from "node:assert/strict";
import test from "node:test";
import { createDatabase } from "../../src/db.js";
import { QuestionBankService } from "../../src/question-bank/service.js";
import { QuizVersionExportService } from "../../src/quiz-builder/export.js";
import { QuizBuilderService } from "../../src/quiz-builder/service.js";

const databaseUrl = process.env.DATABASE_URL;

test("Stage13F Quiz Builder snapshots only published Question Bank revisions and freezes published versions", {
  skip: !databaseUrl,
}, async () => {
  assert.ok(databaseUrl);
  const db = createDatabase(databaseUrl);
  try {
    const adminRows = await db.query<{ id: string }>(
      `insert into profiles (role, display_name, status)
       values ('admin', 'Stage13F Quiz Builder Admin', 'active') returning id`,
    );
    const adminId = adminRows[0]?.id;
    assert.ok(adminId);
    const classRows = await db.query<{ id: string }>(
      `insert into classes (slug, name, status) values ('stage13f-quiz-grade', 'صف الاختبار', 'active') returning id`,
    );
    const subjectRows = await db.query<{ id: string }>(
      `insert into subjects (slug, name, status) values ('stage13f-quiz-subject', 'مادة الاختبار', 'active') returning id`,
    );
    const classId = classRows[0]?.id;
    const subjectId = subjectRows[0]?.id;
    assert.ok(classId && subjectId);
    await db.query(
      `insert into subject_class_links (class_id, subject_id, position, status)
       values ($1, $2, 0, 'active')`,
      [classId, subjectId],
    );
    const lessonRows = await db.query<{ id: string }>(
      `insert into lessons (class_id, subject_id, slug, title, status)
       values ($1, $2, 'stage13f-quiz-lesson', 'درس الاختبار', 'active') returning id`,
      [classId, subjectId],
    );
    const lessonId = lessonRows[0]?.id;
    assert.ok(lessonId);

    const bank = new QuestionBankService(db);
    const direct = await bank.createManual(adminId, {
      classId,
      subjectId,
      lessonIds: [lessonId],
      question: {
        prompt: "ما تعريف الطاقة؟",
        type: "direct",
        options: [],
        correctOptionIndex: null,
        answerText: "القدرة على بذل شغل",
        answerStatus: "known",
        difficulty: "medium",
        explanation: "تعريف مباشر.",
        method: null,
      },
    });
    await bank.submitForReview(adminId, direct.itemId);
    await bank.publish(adminId, direct.itemId);

    const mcq = await bank.createManual(adminId, {
      classId,
      subjectId,
      lessonIds: [lessonId],
      question: {
        prompt: "ما وحدة قياس الطاقة؟",
        type: "multiple_choice",
        options: ["الجول", "المتر", "الثانية", "الأمبير"],
        correctOptionIndex: 0,
        answerText: "الجول",
        answerStatus: "known",
        difficulty: "easy",
        explanation: "الجول هو وحدة الطاقة.",
        method: null,
      },
    });
    await bank.submitForReview(adminId, mcq.itemId);
    await bank.publish(adminId, mcq.itemId);

    const draftOnly = await bank.createManual(adminId, {
      classId,
      subjectId,
      lessonIds: [lessonId],
      question: {
        prompt: "سؤال غير منشور",
        type: "direct",
        options: [],
        correctOptionIndex: null,
        answerText: "إجابة",
        answerStatus: "known",
        difficulty: "easy",
        explanation: null,
        method: null,
      },
    });

    const quizzes = new QuizBuilderService(db);
    const exports = new QuizVersionExportService(quizzes);
    const created = await quizzes.create(adminId, {
      classId,
      subjectId,
      lessonIds: [lessonId],
      title: "اختبار الطاقة",
      description: "اختبار مبني من بنك الأسئلة المنشور",
      shuffleVersions: true,
    });

    await assert.rejects(
      () =>
        quizzes.addVersion(adminId, created.quizId, {
          label: "نموذج غير صالح",
          questions: [{ questionBankItemId: draftOnly.itemId, questionBankRevisionId: draftOnly.revisionId }],
        }),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "CONFLICT");
        return true;
      },
    );

    const directDetail = await bank.itemDetail(direct.itemId, 10, 0, 10, 0);
    const mcqDetail = await bank.itemDetail(mcq.itemId, 10, 0, 10, 0);
    const directPublished = directDetail.revisions.find((revision) => revision.status === "published");
    const mcqPublished = mcqDetail.revisions.find((revision) => revision.status === "published");
    assert.ok(directPublished && mcqPublished);

    const version = await quizzes.addVersion(adminId, created.quizId, {
      label: "النموذج أ",
      shuffleOptions: true,
      questions: [
        { questionBankItemId: direct.itemId, questionBankRevisionId: directPublished.id },
        { questionBankItemId: mcq.itemId, questionBankRevisionId: mcqPublished.id },
      ],
    });
    const detail = await quizzes.detail(created.quizId);
    assert.equal(detail.versions.length, 1);
    assert.equal(detail.versions[0]?.id, version.versionId);
    assert.equal(detail.versions[0]?.questions.length, 2);
    assert.equal(detail.versions[0]?.questions[0]?.type, "direct");
    assert.equal(detail.versions[0]?.questions[0]?.answerText, "القدرة على بذل شغل");
    assert.equal(detail.versions[0]?.questions[1]?.options.filter((option) => option.isCorrect).length, 1);
    assert.equal(detail.versions[0]?.questions[1]?.questionBankRevisionId, mcqPublished.id);

    await assert.rejects(
      () => exports.bundle(created.quizId, version.versionId),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "CONFLICT");
        return true;
      },
    );

    await quizzes.submitForReview(adminId, created.quizId);
    assert.equal((await quizzes.detail(created.quizId)).quiz.status, "review");
    const reviewedExport = await exports.bundle(created.quizId, version.versionId);
    assert.ok(reviewedExport.csv.startsWith("\uFEFF"));
    assert.match(reviewedExport.csv, /ما تعريف الطاقة؟/);
    assert.match(reviewedExport.csv, /الجول/);
    assert.match(reviewedExport.csv, new RegExp(mcqPublished.id));
    assert.match(reviewedExport.printHtml, /<html lang="ar" dir="rtl">/);
    assert.match(reviewedExport.printHtml, /القدرة على بذل شغل/);
    assert.match(reviewedExport.filenameBase, /اختبار الطاقة-النموذج أ/);

    await quizzes.publish(adminId, created.quizId);
    assert.equal((await quizzes.detail(created.quizId)).quiz.status, "published");
    const publishedExport = await exports.bundle(created.quizId, version.versionId);
    assert.equal(publishedExport.csv, reviewedExport.csv);

    await assert.rejects(
      () =>
        quizzes.replaceVersionQuestions(adminId, created.quizId, version.versionId, [
          { questionBankItemId: mcq.itemId, questionBankRevisionId: mcqPublished.id },
        ]),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "CONFLICT");
        return true;
      },
    );

    const snapshotId = detail.versions[0]?.questions[0]?.id;
    assert.ok(snapshotId);
    await assert.rejects(
      () => db.query("update questions set prompt = 'tampered' where id = $1", [snapshotId]),
      (error: unknown) => {
        assert.equal((error as { code?: string }).code, "23514");
        return true;
      },
    );
  } finally {
    await db.close();
  }
});
