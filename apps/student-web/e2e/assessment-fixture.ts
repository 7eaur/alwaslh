import { hashToken } from "../../api/src/auth/crypto.js";
import { loadConfig } from "../../api/src/config.js";
import { CurriculumService } from "../../api/src/curriculum/service.js";
import { createDatabase } from "../../api/src/db.js";
import { QuestionBankService } from "../../api/src/question-bank/service.js";
import { QuizBuilderService } from "../../api/src/quiz-builder/service.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Student assessment browser fixture");

const config = loadConfig(process.env);
const db = createDatabase(databaseUrl);

try {
  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'Stage15 assessment browser fixture') returning id",
  );
  const adminId = adminRows[0]?.id;
  if (!adminId) throw new Error("failed to create Stage15 browser Admin");

  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب تقييم Stage15') returning id",
  );
  const studentId = studentRows[0]?.id;
  if (!studentId) throw new Error("failed to create Stage15 browser Student");

  const deviceMaterial = `stage15-assessment-browser-${crypto.randomUUID()}`;
  const deviceRows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'Stage15 assessment browser device')
     returning id`,
    [studentId, `fixture-${deviceMaterial}`.padEnd(96, "x"), hashToken(deviceMaterial)],
  );
  const deviceId = deviceRows[0]?.id;
  if (!deviceId) throw new Error("failed to create Stage15 browser device");

  const sessionToken = `stage15-assessment-session-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  await db.query(
    `insert into auth_sessions (profile_id, token_hash_sha256, device_id, expires_at)
     values ($1, $2, $3, now() + interval '1 hour')`,
    [studentId, hashToken(sessionToken), deviceId],
  );

  const curriculum = new CurriculumService(db);
  const classRecord = await curriculum.createClass(adminId, {
    slug: `stage15-assessment-class-${crypto.randomUUID()}`,
    name: "صف التقييم التجريبي",
    description: "صف مخصص لاختبار تدريب واختبار الطالب",
    position: 0,
    status: "active",
  });
  const subject = await curriculum.createSubject(adminId, {
    slug: `stage15-assessment-subject-${crypto.randomUUID()}`,
    name: "فيزياء التقييم",
    description: "مادة مخصصة لاختبار Stage15",
    status: "active",
  });
  await curriculum.createOffering(adminId, {
    classId: classRecord.id,
    subjectId: subject.id,
    position: 0,
    status: "active",
  });
  const lesson = await curriculum.createLesson(adminId, {
    classId: classRecord.id,
    subjectId: subject.id,
    slug: `stage15-assessment-lesson-${crypto.randomUUID()}`,
    title: "الطاقة والشغل",
    summary: "درس منشور لاختبار التقييم.",
    position: 0,
    status: "active",
  });
  await db.query("update lessons set published_at = now() - interval '1 minute' where id = $1", [lesson.id]);
  await db.query(
    `insert into student_entitlements (profile_id, scope, class_id, source, starts_at, expires_at)
     values ($1, 'class', $2, 'admin', now() - interval '1 day', now() + interval '30 days')`,
    [studentId, classRecord.id],
  );

  const bank = new QuestionBankService(db);
  const mcqPrompt = "ما وحدة قياس الطاقة؟";
  const mcqCorrect = "الجول";
  const mcqWrong = "المتر";
  const mcqExplanation = "الجول هو وحدة قياس الطاقة في النظام الدولي.";
  const mcqMethod = "حدّد الكمية الفيزيائية ثم اختر وحدتها المعتمدة.";
  const mcq = await bank.createManual(adminId, {
    classId: classRecord.id,
    subjectId: subject.id,
    lessonIds: [lesson.id],
    question: {
      prompt: mcqPrompt,
      type: "multiple_choice",
      options: [mcqCorrect, mcqWrong, "الثانية", "الأمبير"],
      correctOptionIndex: 0,
      answerText: mcqCorrect,
      answerStatus: "known",
      difficulty: "easy",
      explanation: mcqExplanation,
      method: mcqMethod,
    },
  });
  await bank.submitForReview(adminId, mcq.itemId);
  await bank.publish(adminId, mcq.itemId);

  const directPrompt = "ما تعريف الطاقة؟";
  const directAnswer = "القدرة على بذل شغل";
  const directExplanation = "هذا هو التعريف المعتمد في سؤال التقييم التجريبي.";
  const direct = await bank.createManual(adminId, {
    classId: classRecord.id,
    subjectId: subject.id,
    lessonIds: [lesson.id],
    question: {
      prompt: directPrompt,
      type: "direct",
      options: [],
      correctOptionIndex: null,
      answerText: directAnswer,
      answerStatus: "known",
      difficulty: "medium",
      explanation: directExplanation,
      method: "اكتب التعريف النصي مباشرة.",
    },
  });
  await bank.submitForReview(adminId, direct.itemId);
  await bank.publish(adminId, direct.itemId);

  const mcqDetail = await bank.itemDetail(mcq.itemId, 10, 0, 10, 0);
  const directDetail = await bank.itemDetail(direct.itemId, 10, 0, 10, 0);
  const mcqPublished = mcqDetail.revisions.find((revision) => revision.status === "published");
  const directPublished = directDetail.revisions.find((revision) => revision.status === "published");
  if (!mcqPublished || !directPublished) throw new Error("failed to publish Stage15 browser questions");

  const quizzes = new QuizBuilderService(db);
  const quizTitle = "اختبار الطاقة Stage15";
  const created = await quizzes.create(adminId, {
    classId: classRecord.id,
    subjectId: subject.id,
    lessonIds: [lesson.id],
    title: quizTitle,
    description: "نموذجان منشوران للتحقق من التدريب والاختبار.",
    shuffleVersions: true,
  });
  const versionA = await quizzes.addVersion(adminId, created.quizId, {
    label: "النموذج أ",
    shuffleOptions: false,
    questions: [
      { questionBankItemId: mcq.itemId, questionBankRevisionId: mcqPublished.id },
      { questionBankItemId: direct.itemId, questionBankRevisionId: directPublished.id },
    ],
  });
  const versionB = await quizzes.addVersion(adminId, created.quizId, {
    label: "النموذج ب",
    shuffleOptions: false,
    questions: [
      { questionBankItemId: direct.itemId, questionBankRevisionId: directPublished.id },
      { questionBankItemId: mcq.itemId, questionBankRevisionId: mcqPublished.id },
    ],
  });
  await db.query(
    "update quiz_versions set shuffle_questions = false, shuffle_options = false where id = any($1::uuid[])",
    [[versionA.versionId, versionB.versionId]],
  );
  await quizzes.submitForReview(adminId, created.quizId);
  await quizzes.publish(adminId, created.quizId);

  process.stdout.write(
    JSON.stringify({
      sessionCookieName: config.SESSION_COOKIE_NAME,
      sessionToken,
      className: classRecord.name,
      subjectName: subject.name,
      quizId: created.quizId,
      quizTitle,
      versionAId: versionA.versionId,
      versionALabel: "النموذج أ",
      versionBLabel: "النموذج ب",
      mcqPrompt,
      mcqCorrect,
      mcqWrong,
      mcqExplanation,
      mcqMethod,
      directPrompt,
      directAnswer,
      directExplanation,
    }),
  );
} finally {
  await db.close();
}
