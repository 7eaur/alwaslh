import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { hashToken } from "../../src/auth/crypto.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";
import { QuestionBankService } from "../../src/question-bank/service.js";
import { QuizBuilderService } from "../../src/quiz-builder/service.js";
import type { StudentAssessmentSessionView } from "../../src/student-assessment/service.js";

const databaseUrl = process.env.DATABASE_URL;
const origin = "http://127.0.0.1:5174";

type TestDatabase = ReturnType<typeof createDatabase>;

async function createStudentDevice(db: TestDatabase, profileId: string): Promise<string> {
  const keyMaterial = `stage15-device-${crypto.randomUUID()}`;
  const rows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'Stage15 assessment integration fixture')
     returning id`,
    [profileId, `fixture-${keyMaterial}`.padEnd(96, "x"), hashToken(keyMaterial)],
  );
  const id = rows[0]?.id;
  assert.ok(id);
  return id;
}

async function sessionCookie(
  db: TestDatabase,
  cookieName: string,
  profileId: string,
  deviceId: string | null = null,
): Promise<string> {
  const token = `stage15-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  await db.query(
    `insert into auth_sessions (profile_id, token_hash_sha256, device_id, expires_at)
     values ($1, $2, $3, now() + interval '1 hour')`,
    [profileId, hashToken(token), deviceId],
  );
  return `${cookieName}=${encodeURIComponent(token)}`;
}

function assessmentBody(response: { json(): unknown }): StudentAssessmentSessionView {
  const body = response.json() as { assessment?: StudentAssessmentSessionView };
  assert.ok(body.assessment);
  return body.assessment;
}

test("Stage15 Student assessment runtime is entitlement-safe, answer-safe, resumable and deterministic", {
  skip: !databaseUrl,
}, async () => {
  assert.ok(databaseUrl);
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  let app: ReturnType<typeof buildApp> | undefined;

  const profileIds: string[] = [];
  const bankItemIds: string[] = [];
  let classId: string | undefined;
  let subjectId: string | undefined;
  let lessonId: string | undefined;
  let quizId: string | undefined;

  try {
    const adminRows = await db.query<{ id: string }>(
      `insert into profiles (role, display_name, status)
         values ('admin', 'Stage15 assessment admin', 'active') returning id`,
    );
    const studentRows = await db.query<{ id: string }>(
      `insert into profiles (role, display_name, status)
         values ('student', 'طالب Stage15', 'active') returning id`,
    );
    const outsiderRows = await db.query<{ id: string }>(
      `insert into profiles (role, display_name, status)
         values ('student', 'طالب بلا صلاحية', 'active') returning id`,
    );
    const adminId = adminRows[0]?.id;
    const studentId = studentRows[0]?.id;
    const outsiderId = outsiderRows[0]?.id;
    assert.ok(adminId && studentId && outsiderId);
    profileIds.push(adminId, studentId, outsiderId);

    const classRows = await db.query<{ id: string }>(
      `insert into classes (slug, name, status)
         values ($1, 'صف Stage15', 'active') returning id`,
      [`stage15-class-${crypto.randomUUID()}`],
    );
    const subjectRows = await db.query<{ id: string }>(
      `insert into subjects (slug, name, status)
         values ($1, 'مادة Stage15', 'active') returning id`,
      [`stage15-subject-${crypto.randomUUID()}`],
    );
    classId = classRows[0]?.id;
    subjectId = subjectRows[0]?.id;
    assert.ok(classId && subjectId);

    await db.query(
      `insert into subject_class_links (class_id, subject_id, position, status)
         values ($1, $2, 0, 'active')`,
      [classId, subjectId],
    );
    const lessonRows = await db.query<{ id: string }>(
      `insert into lessons (class_id, subject_id, slug, title, status, published_at)
         values ($1, $2, $3, 'درس Stage15', 'active', now() - interval '1 minute') returning id`,
      [classId, subjectId, `stage15-lesson-${crypto.randomUUID()}`],
    );
    lessonId = lessonRows[0]?.id;
    assert.ok(lessonId);

    await db.query(
      `insert into student_entitlements (profile_id, scope, class_id, source, starts_at, expires_at)
         values ($1, 'class', $2, 'admin', now() - interval '1 day', now() + interval '30 days')`,
      [studentId, classId],
    );

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
        explanation: "تعريف الطاقة المعتمد في هذا السؤال.",
        method: "تطابق الإجابة النصية بعد التطبيع المحافظ للمسافات.",
      },
    });
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
        explanation: "الجول هو وحدة قياس الطاقة.",
        method: "اختر وحدة الطاقة من الوحدات المعروضة.",
      },
    });
    bankItemIds.push(direct.itemId, mcq.itemId);
    await bank.submitForReview(adminId, direct.itemId);
    await bank.publish(adminId, direct.itemId);
    await bank.submitForReview(adminId, mcq.itemId);
    await bank.publish(adminId, mcq.itemId);

    const directDetail = await bank.itemDetail(direct.itemId, 10, 0, 10, 0);
    const mcqDetail = await bank.itemDetail(mcq.itemId, 10, 0, 10, 0);
    const directPublished = directDetail.revisions.find((revision) => revision.status === "published");
    const mcqPublished = mcqDetail.revisions.find((revision) => revision.status === "published");
    assert.ok(directPublished && mcqPublished);

    const quizzes = new QuizBuilderService(db);
    const created = await quizzes.create(adminId, {
      classId,
      subjectId,
      lessonIds: [lessonId],
      title: "اختبار Stage15 للطاقة",
      description: "اختبار منشور لاستهلاك الطالب",
      shuffleVersions: true,
    });
    quizId = created.quizId;
    const versionA = await quizzes.addVersion(adminId, quizId, {
      label: "النموذج أ",
      shuffleOptions: true,
      questions: [
        { questionBankItemId: direct.itemId, questionBankRevisionId: directPublished.id },
        { questionBankItemId: mcq.itemId, questionBankRevisionId: mcqPublished.id },
      ],
    });
    const versionB = await quizzes.addVersion(adminId, quizId, {
      label: "النموذج ب",
      shuffleOptions: true,
      questions: [
        { questionBankItemId: mcq.itemId, questionBankRevisionId: mcqPublished.id },
        { questionBankItemId: direct.itemId, questionBankRevisionId: directPublished.id },
      ],
    });
    await quizzes.submitForReview(adminId, quizId);
    await quizzes.publish(adminId, quizId);

    const studentDeviceId = await createStudentDevice(db, studentId);
    const outsiderDeviceId = await createStudentDevice(db, outsiderId);
    const studentCookie = await sessionCookie(db, config.SESSION_COOKIE_NAME, studentId, studentDeviceId);
    const outsiderCookie = await sessionCookie(db, config.SESSION_COOKIE_NAME, outsiderId, outsiderDeviceId);
    const adminCookie = await sessionCookie(db, config.SESSION_COOKIE_NAME, adminId);
    const authHeaders = { cookie: studentCookie, origin };
    app = buildApp({ config, database: db });

    const unauthenticated = await app.inject({ method: "GET", url: "/v1/student/quizzes" });
    assert.equal(unauthenticated.statusCode, 401);

    const adminRejected = await app.inject({
      method: "GET",
      url: "/v1/student/quizzes",
      headers: { cookie: adminCookie },
    });
    assert.equal(adminRejected.statusCode, 403);

    const outsiderCatalog = await app.inject({
      method: "GET",
      url: "/v1/student/quizzes",
      headers: { cookie: outsiderCookie },
    });
    assert.equal(outsiderCatalog.statusCode, 200);
    assert.deepEqual((outsiderCatalog.json() as { quizzes: unknown[] }).quizzes, []);

    const catalog = await app.inject({
      method: "GET",
      url: `/v1/student/quizzes?classId=${classId}&subjectId=${subjectId}`,
      headers: { cookie: studentCookie },
    });
    assert.equal(catalog.statusCode, 200);
    const catalogBody = catalog.json() as {
      quizzes: Array<{ id: string; versions: Array<{ id: string; label: string }> }>;
    };
    assert.equal(catalogBody.quizzes.length, 1);
    assert.equal(catalogBody.quizzes[0]?.id, quizId);
    assert.deepEqual(
      catalogBody.quizzes[0]?.versions.map((version) => version.id),
      [versionA.versionId, versionB.versionId],
    );

    const practiceStartResponse = await app.inject({
      method: "POST",
      url: `/v1/student/quizzes/${quizId}/sessions`,
      headers: authHeaders,
      payload: { mode: "practice", versionId: versionA.versionId },
    });
    assert.equal(practiceStartResponse.statusCode, 200);
    const practiceStart = assessmentBody(practiceStartResponse);
    assert.equal(practiceStart.session.mode, "practice");
    assert.equal(practiceStart.version.id, versionA.versionId);
    assert.equal(practiceStart.progress.questionCount, 2);
    assert.equal(practiceStart.progress.answeredCount, 0);
    assert.equal(
      practiceStart.questions.every((question) => question.feedback === null),
      true,
    );
    assert.equal(JSON.stringify(practiceStart).includes('"isCorrect"'), false);
    assert.equal(JSON.stringify(practiceStart).includes("correctAnswerText"), false);

    const practiceChoice = practiceStart.questions.find((question) => question.type === "multiple_choice");
    const practiceDirect = practiceStart.questions.find((question) => question.type === "direct");
    assert.ok(practiceChoice && practiceDirect);
    const practiceCorrectOption = practiceChoice.options.find((option) => option.label === "الجول");
    const practiceWrongOption = practiceChoice.options.find((option) => option.label === "المتر");
    assert.ok(practiceCorrectOption && practiceWrongOption);
    const presentedOptionOrder = practiceChoice.options.map((option) => option.id);

    const resumedResponse = await app.inject({
      method: "GET",
      url: `/v1/student/assessment-sessions/${practiceStart.session.id}`,
      headers: { cookie: studentCookie },
    });
    assert.equal(resumedResponse.statusCode, 200);
    const resumed = assessmentBody(resumedResponse);
    const resumedChoice = resumed.questions.find((question) => question.id === practiceChoice.id);
    assert.ok(resumedChoice);
    assert.deepEqual(
      resumedChoice.options.map((option) => option.id),
      presentedOptionOrder,
    );

    const practiceChoiceAnsweredResponse = await app.inject({
      method: "PUT",
      url: `/v1/student/assessment-sessions/${practiceStart.session.id}/questions/${practiceChoice.id}/answer`,
      headers: authHeaders,
      payload: { selectedOptionId: practiceCorrectOption.id },
    });
    assert.equal(practiceChoiceAnsweredResponse.statusCode, 200);
    const practiceChoiceAnswered = assessmentBody(practiceChoiceAnsweredResponse);
    const choiceFeedback = practiceChoiceAnswered.questions.find(
      (question) => question.id === practiceChoice.id,
    );
    assert.equal(choiceFeedback?.feedback?.correct, true);
    assert.equal(choiceFeedback?.feedback?.correctOptionId, practiceCorrectOption.id);
    assert.equal(choiceFeedback?.feedback?.explanation, "الجول هو وحدة قياس الطاقة.");
    assert.equal(choiceFeedback?.feedback?.method, "اختر وحدة الطاقة من الوحدات المعروضة.");

    const blockedPracticeChange = await app.inject({
      method: "PUT",
      url: `/v1/student/assessment-sessions/${practiceStart.session.id}/questions/${practiceChoice.id}/answer`,
      headers: authHeaders,
      payload: { selectedOptionId: practiceWrongOption.id },
    });
    assert.equal(blockedPracticeChange.statusCode, 409);

    const practiceDirectAnsweredResponse = await app.inject({
      method: "PUT",
      url: `/v1/student/assessment-sessions/${practiceStart.session.id}/questions/${practiceDirect.id}/answer`,
      headers: authHeaders,
      payload: { directAnswerText: "  القدرة   على بذل شغل  " },
    });
    assert.equal(practiceDirectAnsweredResponse.statusCode, 200);
    const practiceDirectAnswered = assessmentBody(practiceDirectAnsweredResponse);
    const directFeedback = practiceDirectAnswered.questions.find(
      (question) => question.id === practiceDirect.id,
    );
    assert.equal(directFeedback?.feedback?.correct, true);
    assert.equal(directFeedback?.feedback?.correctAnswerText, "القدرة على بذل شغل");
    assert.equal(practiceDirectAnswered.progress.answeredCount, 2);

    const finalizedPracticeResponse = await app.inject({
      method: "POST",
      url: `/v1/student/assessment-sessions/${practiceStart.session.id}/finalize`,
      headers: authHeaders,
    });
    assert.equal(finalizedPracticeResponse.statusCode, 200);
    const finalizedPractice = assessmentBody(finalizedPracticeResponse);
    assert.equal(finalizedPractice.session.status, "completed");
    assert.equal(finalizedPractice.attempt?.correctCount, 2);
    assert.equal(finalizedPractice.attempt?.questionCount, 2);
    assert.equal(finalizedPractice.attempt?.scorePercent, 100);
    const practiceAttemptId = finalizedPractice.attempt?.id;
    assert.ok(practiceAttemptId);

    const finalizedPracticeAgainResponse = await app.inject({
      method: "POST",
      url: `/v1/student/assessment-sessions/${practiceStart.session.id}/finalize`,
      headers: authHeaders,
    });
    assert.equal(finalizedPracticeAgainResponse.statusCode, 200);
    assert.equal(assessmentBody(finalizedPracticeAgainResponse).attempt?.id, practiceAttemptId);

    const testStartResponse = await app.inject({
      method: "POST",
      url: `/v1/student/quizzes/${quizId}/sessions`,
      headers: authHeaders,
      payload: { mode: "test", versionId: versionB.versionId },
    });
    assert.equal(testStartResponse.statusCode, 200);
    const testStart = assessmentBody(testStartResponse);
    assert.equal(testStart.session.mode, "test");
    assert.equal(testStart.version.id, versionB.versionId);
    const testChoice = testStart.questions.find((question) => question.type === "multiple_choice");
    const testDirect = testStart.questions.find((question) => question.type === "direct");
    assert.ok(testChoice && testDirect);
    const testCorrectOption = testChoice.options.find((option) => option.label === "الجول");
    const testWrongOption = testChoice.options.find((option) => option.label === "المتر");
    assert.ok(testCorrectOption && testWrongOption);

    const testWrongResponse = await app.inject({
      method: "PUT",
      url: `/v1/student/assessment-sessions/${testStart.session.id}/questions/${testChoice.id}/answer`,
      headers: authHeaders,
      payload: { selectedOptionId: testWrongOption.id },
    });
    assert.equal(testWrongResponse.statusCode, 200);
    assert.equal(
      assessmentBody(testWrongResponse).questions.find((question) => question.id === testChoice.id)?.feedback,
      null,
    );

    const testCorrectedResponse = await app.inject({
      method: "PUT",
      url: `/v1/student/assessment-sessions/${testStart.session.id}/questions/${testChoice.id}/answer`,
      headers: authHeaders,
      payload: { selectedOptionId: testCorrectOption.id },
    });
    assert.equal(testCorrectedResponse.statusCode, 200);
    assert.equal(
      assessmentBody(testCorrectedResponse).questions.find((question) => question.id === testChoice.id)
        ?.feedback,
      null,
    );

    const testDirectWrongResponse = await app.inject({
      method: "PUT",
      url: `/v1/student/assessment-sessions/${testStart.session.id}/questions/${testDirect.id}/answer`,
      headers: authHeaders,
      payload: { directAnswerText: "إجابة غير صحيحة" },
    });
    assert.equal(testDirectWrongResponse.statusCode, 200);
    const testDirectWrong = assessmentBody(testDirectWrongResponse);
    assert.equal(testDirectWrong.questions.find((question) => question.id === testDirect.id)?.feedback, null);
    assert.equal(JSON.stringify(testDirectWrong).includes("القدرة على بذل شغل"), false);

    const testDirectCorrectedResponse = await app.inject({
      method: "PUT",
      url: `/v1/student/assessment-sessions/${testStart.session.id}/questions/${testDirect.id}/answer`,
      headers: authHeaders,
      payload: { directAnswerText: "القدرة على بذل شغل" },
    });
    assert.equal(testDirectCorrectedResponse.statusCode, 200);
    assert.equal(
      assessmentBody(testDirectCorrectedResponse).questions.find((question) => question.id === testDirect.id)
        ?.feedback,
      null,
    );

    const finalizedTestResponse = await app.inject({
      method: "POST",
      url: `/v1/student/assessment-sessions/${testStart.session.id}/finalize`,
      headers: authHeaders,
    });
    assert.equal(finalizedTestResponse.statusCode, 200);
    const finalizedTest = assessmentBody(finalizedTestResponse);
    assert.equal(finalizedTest.session.status, "completed");
    assert.equal(finalizedTest.attempt?.scorePercent, 100);
    assert.equal(
      finalizedTest.questions.every((question) => question.feedback !== null),
      true,
    );

    const historyResponse = await app.inject({
      method: "GET",
      url: "/v1/student/attempts?limit=10",
      headers: { cookie: studentCookie },
    });
    assert.equal(historyResponse.statusCode, 200);
    const attempts = (historyResponse.json() as { attempts: Array<{ id: string; mode: string }> }).attempts;
    assert.equal(attempts.length, 2);
    assert.equal(new Set(attempts.map((attempt) => attempt.mode)).size, 2);

    const randomStartResponse = await app.inject({
      method: "POST",
      url: `/v1/student/quizzes/${quizId}/sessions`,
      headers: authHeaders,
      payload: { mode: "practice" },
    });
    assert.equal(randomStartResponse.statusCode, 200);
    const randomStart = assessmentBody(randomStartResponse);
    assert.ok([versionA.versionId, versionB.versionId].includes(randomStart.version.id));

    const randomResumeResponse = await app.inject({
      method: "POST",
      url: `/v1/student/quizzes/${quizId}/sessions`,
      headers: authHeaders,
      payload: { mode: "practice" },
    });
    assert.equal(randomResumeResponse.statusCode, 200);
    const randomResume = assessmentBody(randomResumeResponse);
    assert.equal(randomResume.session.id, randomStart.session.id);
    assert.equal(randomResume.version.id, randomStart.version.id);

    const restartedResponse = await app.inject({
      method: "POST",
      url: `/v1/student/quizzes/${quizId}/sessions`,
      headers: authHeaders,
      payload: { mode: "practice", restart: true },
    });
    assert.equal(restartedResponse.statusCode, 200);
    const restarted = assessmentBody(restartedResponse);
    assert.notEqual(restarted.session.id, randomStart.session.id);

    const abandonedOldResponse = await app.inject({
      method: "GET",
      url: `/v1/student/assessment-sessions/${randomStart.session.id}`,
      headers: { cookie: studentCookie },
    });
    assert.equal(abandonedOldResponse.statusCode, 200);
    assert.equal(assessmentBody(abandonedOldResponse).session.status, "abandoned");

    const abandonRestarted = await app.inject({
      method: "POST",
      url: `/v1/student/assessment-sessions/${restarted.session.id}/abandon`,
      headers: authHeaders,
    });
    assert.equal(abandonRestarted.statusCode, 204);

    const accessRecheckStartResponse = await app.inject({
      method: "POST",
      url: `/v1/student/quizzes/${quizId}/sessions`,
      headers: authHeaders,
      payload: { mode: "test", versionId: versionA.versionId },
    });
    assert.equal(accessRecheckStartResponse.statusCode, 200);
    const accessRecheckStart = assessmentBody(accessRecheckStartResponse);

    await db.query(
      `update student_entitlements
         set expires_at = now() - interval '1 minute'
         where profile_id = $1 and class_id = $2 and status = 'active'`,
      [studentId, classId],
    );
    const accessRevokedResponse = await app.inject({
      method: "GET",
      url: `/v1/student/assessment-sessions/${accessRecheckStart.session.id}`,
      headers: { cookie: studentCookie },
    });
    assert.equal(accessRevokedResponse.statusCode, 404);

    // FPA-002: abandoned sessions are unfinished content, not completed history.
    const abandonedAfterExpiry = await app.inject({
      method: "GET",
      url: `/v1/student/assessment-sessions/${randomStart.session.id}`,
      headers: { cookie: studentCookie },
    });
    assert.equal(abandonedAfterExpiry.statusCode, 404);

    // Cancellation remains possible after expiry, but must not restore content access.
    const abandonExpired = await app.inject({
      method: "POST",
      url: `/v1/student/assessment-sessions/${accessRecheckStart.session.id}/abandon`,
      headers: authHeaders,
    });
    assert.equal(abandonExpired.statusCode, 204);
    const expiredAbandonedRead = await app.inject({
      method: "GET",
      url: `/v1/student/assessment-sessions/${accessRecheckStart.session.id}`,
      headers: { cookie: studentCookie },
    });
    assert.equal(expiredAbandonedRead.statusCode, 404);

    // The existing completed-result history contract is intentionally preserved.
    const completedAfterExpiry = await app.inject({
      method: "GET",
      url: `/v1/student/assessment-sessions/${finalizedPractice.session.id}`,
      headers: { cookie: studentCookie },
    });
    assert.equal(completedAfterExpiry.statusCode, 200);
    assert.equal(assessmentBody(completedAfterExpiry).attempt?.id, practiceAttemptId);

    const attemptCountRows = await db.query<{ count: string }>(
      "select count(*)::text as count from quiz_attempts where profile_id = $1 and quiz_id = $2",
      [studentId, quizId],
    );
    assert.equal(Number(attemptCountRows[0]?.count ?? 0), 2);
  } finally {
    if (profileIds.length > 0) {
      await db
        .query("delete from quiz_attempts where profile_id = any($1::uuid[])", [profileIds])
        .catch(() => undefined);
      await db
        .query("delete from practice_sessions where profile_id = any($1::uuid[])", [profileIds])
        .catch(() => undefined);
    }
    if (quizId) {
      await db.query("update quizzes set status = 'archived' where id = $1", [quizId]).catch(() => undefined);
      await db.query("delete from quizzes where id = $1", [quizId]).catch(() => undefined);
    }
    if (bankItemIds.length > 0) {
      await db
        .query("delete from question_bank_items where id = any($1::uuid[])", [bankItemIds])
        .catch(() => undefined);
    }
    if (profileIds.length > 0) {
      await db
        .query("delete from student_entitlements where profile_id = any($1::uuid[])", [profileIds])
        .catch(() => undefined);
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
    if (app) await app.close();
    else await db.close();
  }
});
