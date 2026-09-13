import { createHash } from "node:crypto";
import sharp from "sharp";
import { normalizeIdentifier } from "../auth/crypto.js";
import type { Database } from "../db.js";
import { CurriculumService } from "../curriculum/service.js";
import { StudentReaderService } from "../curriculum/student-reader.js";
import { FileSystemMediaStorage } from "../media/storage.js";
import { QuestionBankService } from "../question-bank/service.js";
import { QuizBuilderService } from "../quiz-builder/service.js";
import { StudentAssessmentService } from "../student-assessment/service.js";
import { AdminContentIngestionService } from "./ingestion-service.js";

export const PUBLISHED_STUDENT_DEMO_MARKER = "DEMO-PUBLISHED-CONTENT";
export const PUBLISHED_STUDENT_DEMO_SLUGS = {
  class: "demo-published-content-class",
  subject: "demo-published-content-subject",
  section: "demo-published-content-section",
  lesson: "demo-published-content-lesson",
} as const;

const DEMO_QUIZ_TITLE = `${PUBLISHED_STUDENT_DEMO_MARKER} — اختبار الدرس`;
const DEMO_INGESTION_REQUEST_ID = "demo-published-content-ingestion-v1";

interface ProfileRow {
  id: string;
  role: "admin" | "student";
  display_name: string | null;
}

interface DemoIds {
  classId: string;
  subjectId: string;
  sectionId: string;
  lessonId: string;
}

export interface PublishedStudentDemoIdentityInput {
  adminIdentifier: string;
  studentIdentifier: string;
}

export interface PublishedStudentDemoVerification {
  marker: string;
  studentProfileId: string;
  adminProfileId: string;
  ids: DemoIds & {
    ingestionTaskId: string;
    mediaAssetIds: string[];
    lessonAssetIds: string[];
    questionBankItemIds: string[];
    questionBankRevisionIds: string[];
    quizId: string;
    quizVersionIds: string[];
  };
  checks: {
    catalog: boolean;
    reader: boolean;
    media: boolean;
    questionBank: boolean;
    quizCatalog: boolean;
    entitlement: boolean;
    legacyIsolation: boolean;
  };
  counts: {
    readerAssets: number;
    publishedQuestionRevisions: number;
    quizVersions: number;
  };
}

export interface PublishedStudentDemoSeedResult extends PublishedStudentDemoVerification {
  replayed: boolean;
  databaseDelta: Record<string, number>;
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function findProfileByIdentifier(
  db: Database,
  role: ProfileRow["role"],
  identifier: string,
): Promise<ProfileRow> {
  const rows = await db.query<ProfileRow>(
    `select p.id, p.role, p.display_name
       from profiles p
       join auth_credentials c on c.profile_id = p.id
      where p.role = $1
        and p.status = 'active'
        and c.normalized_identifier = $2
      limit 2`,
    [role, normalizeIdentifier(identifier)],
  );
  if (rows.length !== 1 || !rows[0]) {
    throw new Error(`demo_${role}_identifier_not_resolved`);
  }
  return rows[0];
}

async function findDemoIds(db: Database): Promise<DemoIds | null> {
  const rows = await db.query<{
    class_id: string;
    subject_id: string;
    section_id: string;
    lesson_id: string;
  }>(
    `select c.id as class_id, s.id as subject_id, cs.id as section_id, l.id as lesson_id
       from classes c
       join subject_class_links scl on scl.class_id = c.id
       join subjects s on s.id = scl.subject_id
       join curriculum_sections cs on cs.class_id = c.id and cs.subject_id = s.id
       join lessons l on l.class_id = c.id and l.subject_id = s.id and l.section_id = cs.id
      where c.slug = $1 and s.slug = $2 and cs.slug = $3 and l.slug = $4`,
    [
      PUBLISHED_STUDENT_DEMO_SLUGS.class,
      PUBLISHED_STUDENT_DEMO_SLUGS.subject,
      PUBLISHED_STUDENT_DEMO_SLUGS.section,
      PUBLISHED_STUDENT_DEMO_SLUGS.lesson,
    ],
  );
  const row = rows[0];
  if (!row) return null;
  if (rows.length !== 1) throw new Error("demo_marker_is_not_unique");
  return {
    classId: row.class_id,
    subjectId: row.subject_id,
    sectionId: row.section_id,
    lessonId: row.lesson_id,
  };
}

async function tableCounts(db: Database): Promise<Record<string, number>> {
  const tables = [
    "classes",
    "subjects",
    "subject_class_links",
    "curriculum_sections",
    "lessons",
    "content_ingestion_tasks",
    "content_ingestion_items",
    "content_ingestion_media",
    "media_assets",
    "media_variants",
    "lesson_assets",
    "question_bank_items",
    "question_bank_revisions",
    "question_bank_revision_lessons",
    "quizzes",
    "quiz_versions",
    "quiz_lessons",
    "questions",
    "question_options",
    "student_entitlements",
  ] as const;
  const result: Record<string, number> = {};
  for (const table of tables) {
    const rows = await db.query<{ count: string }>(`select count(*)::text as count from ${table}`);
    result[table] = Number(rows[0]?.count ?? 0);
  }
  return result;
}

function diffCounts(before: Record<string, number>, after: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.keys(after).map((key) => [key, (after[key] ?? 0) - (before[key] ?? 0)]),
  );
}

async function buildDemoPage(page: number): Promise<Buffer> {
  const accents = ["#14305f", "#0e8889", "#096b70"];
  const accent = accents[(page - 1) % accents.length] ?? accents[0];
  const svg = `
    <svg width="900" height="1200" viewBox="0 0 900 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="1200" fill="#ffffff"/>
      <rect x="70" y="70" width="760" height="1060" rx="34" fill="#f7f9fb" stroke="#d9e1e8" stroke-width="4"/>
      <rect x="70" y="70" width="760" height="170" rx="34" fill="${accent}"/>
      <circle cx="210" cy="470" r="105" fill="${accent}" opacity="0.18"/>
      <circle cx="450" cy="470" r="105" fill="${accent}" opacity="0.34"/>
      <circle cx="690" cy="470" r="105" fill="${accent}" opacity="0.5"/>
      <path d="M170 780 C300 620 600 940 735 745" fill="none" stroke="${accent}" stroke-width="22" stroke-linecap="round"/>
      <rect x="165" y="930" width="570" height="34" rx="17" fill="${accent}" opacity="0.45"/>
      <rect x="250" y="1010" width="400" height="34" rx="17" fill="${accent}" opacity="0.25"/>
      <text x="450" y="175" text-anchor="middle" font-family="sans-serif" font-size="50" font-weight="700" fill="#ffffff">Demo Page ${page}</text>
      <text x="450" y="665" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#14305f">Alwaslh Published Content</text>
    </svg>`;
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

async function ensureEntitlement(db: Database, studentProfileId: string, classId: string): Promise<void> {
  const existing = await db.query<{ id: string }>(
    `select id
       from student_entitlements
      where profile_id = $1
        and scope = 'class'
        and class_id = $2
        and status = 'active'
        and starts_at <= now()
        and (expires_at is null or expires_at > now())
      limit 1`,
    [studentProfileId, classId],
  );
  if (existing[0]) return;
  await db.query(
    `insert into student_entitlements (
       profile_id, scope, class_id, source, starts_at, expires_at
     ) values ($1, 'class', $2, 'admin', now() - interval '1 minute', now() + interval '30 days')`,
    [studentProfileId, classId],
  );
}

async function createPublishedQuestions(
  db: Database,
  adminProfileId: string,
  ids: DemoIds,
): Promise<Array<{ itemId: string; revisionId: string }>> {
  const bank = new QuestionBankService(db);
  const definitions = [
    {
      prompt: "أي لون يمثل الهوية الأساسية في صفحة الدرس التجريبية؟",
      type: "multiple_choice" as const,
      options: ["الكحلي", "الأحمر", "البرتقالي", "البنفسجي"],
      correctOptionIndex: 0,
      answerText: "الكحلي",
      answerStatus: "known" as const,
      difficulty: "easy" as const,
      explanation: "الصفحات التجريبية تستخدم الكحلي ضمن الهوية البصرية.",
      method: "اختر اللون المطابق للصفحات المعروضة.",
    },
    {
      prompt: "الدرس التجريبي يحتوي على ثلاث صفحات مرئية.",
      type: "true_false" as const,
      options: ["صح", "خطأ"],
      correctOptionIndex: 0,
      answerText: "صح",
      answerStatus: "known" as const,
      difficulty: "easy" as const,
      explanation: "تم نشر ثلاث صور عبر مسار الوسائط الحقيقي.",
      method: "تحقق من عدد صفحات القارئ.",
    },
    {
      prompt: "ما اسم العلامة المستخدمة لتمييز هذه البيانات التجريبية؟",
      type: "direct" as const,
      options: [],
      correctOptionIndex: null,
      answerText: PUBLISHED_STUDENT_DEMO_MARKER,
      answerStatus: "known" as const,
      difficulty: "medium" as const,
      explanation: "تسمح العلامة بإثبات الملكية والتنظيف الآمن لاحقًا.",
      method: "اكتب علامة البيانات التجريبية كما تظهر في عنوان الاختبار.",
    },
  ];

  const result: Array<{ itemId: string; revisionId: string }> = [];
  for (const question of definitions) {
    const created = await bank.createManual(adminProfileId, {
      classId: ids.classId,
      subjectId: ids.subjectId,
      lessonIds: [ids.lessonId],
      question,
    });
    await bank.submitForReview(adminProfileId, created.itemId);
    await bank.publish(adminProfileId, created.itemId);
    const detail = await bank.itemDetail(created.itemId, 10, 0, 10, 0);
    const revision = detail.revisions.find((candidate) => candidate.status === "published");
    if (!revision || revision.question.answerStatus !== "known") {
      throw new Error("demo_question_publication_failed");
    }
    result.push({ itemId: created.itemId, revisionId: revision.id });
  }
  return result;
}

async function createPublishedQuiz(
  db: Database,
  adminProfileId: string,
  ids: DemoIds,
  questions: Array<{ itemId: string; revisionId: string }>,
): Promise<{ quizId: string; versionId: string }> {
  const quizzes = new QuizBuilderService(db);
  const created = await quizzes.create(adminProfileId, {
    classId: ids.classId,
    subjectId: ids.subjectId,
    lessonIds: [ids.lessonId],
    title: DEMO_QUIZ_TITLE,
    description: "Quiz حقيقي مرتبط بالدرس التجريبي للتحقق من مسار التدريب والاختبار.",
    shuffleVersions: false,
  });
  const version = await quizzes.addVersion(adminProfileId, created.quizId, {
    label: "النموذج التجريبي",
    shuffleOptions: false,
    questions: questions.map((question) => ({
      questionBankItemId: question.itemId,
      questionBankRevisionId: question.revisionId,
    })),
  });
  await db.query(
    "update quiz_versions set shuffle_questions = false, shuffle_options = false where id = $1",
    [version.versionId],
  );
  await quizzes.submitForReview(adminProfileId, created.quizId);
  await quizzes.publish(adminProfileId, created.quizId);
  return { quizId: created.quizId, versionId: version.versionId };
}

export async function verifyPublishedStudentDemo(
  db: Database,
  mediaStorageRoot: string,
  identity: PublishedStudentDemoIdentityInput,
): Promise<PublishedStudentDemoVerification> {
  const admin = await findProfileByIdentifier(db, "admin", identity.adminIdentifier);
  const student = await findProfileByIdentifier(db, "student", identity.studentIdentifier);
  const ids = await findDemoIds(db);
  if (!ids) throw new Error("demo_not_seeded");

  const entitlementRows = await db.query<{ count: string }>(
    `select count(*)::text as count
       from student_entitlements
      where profile_id = $1 and scope = 'class' and class_id = $2
        and status = 'active' and starts_at <= now()
        and (expires_at is null or expires_at > now())`,
    [student.id, ids.classId],
  );
  const entitlement = Number(entitlementRows[0]?.count ?? 0) > 0;

  const curriculum = new CurriculumService(db);
  const catalog = await curriculum.studentCatalog(student.id);
  const classRecord = catalog.classes.find((candidate) => candidate.id === ids.classId);
  const subject = classRecord?.subjects.find((candidate) => candidate.id === ids.subjectId);
  const section = subject?.sections.find((candidate) => candidate.id === ids.sectionId);
  const lesson = section?.lessons.find((candidate) => candidate.id === ids.lessonId);
  const catalogVisible = Boolean(classRecord && subject && section && lesson);

  const storage = new FileSystemMediaStorage(mediaStorageRoot);
  const readerService = new StudentReaderService(db, storage);
  const reader = await readerService.lesson(student.id, ids.lessonId);
  if (reader.assets.length !== 3) throw new Error("demo_reader_asset_count_mismatch");
  for (const asset of reader.assets) {
    const content = await readerService.assetContent(student.id, asset.id);
    if (content.bytes.byteLength !== asset.byteSize || sha256(content.bytes) !== asset.checksumSha256) {
      throw new Error("demo_reader_media_integrity_failed");
    }
  }

  const taskRows = await db.query<{ id: string }>(
    `select id from content_ingestion_tasks
      where lesson_id = $1 and client_request_id = $2 and status = 'completed' and linked_at is not null`,
    [ids.lessonId, DEMO_INGESTION_REQUEST_ID],
  );
  const ingestionTaskId = taskRows[0]?.id;
  if (!ingestionTaskId || taskRows.length !== 1) throw new Error("demo_ingestion_task_missing");

  const assetRows = await db.query<{ lesson_asset_id: string; media_asset_id: string; publication_status: string }>(
    `select la.id as lesson_asset_id, la.media_asset_id, la.publication_status
       from lesson_assets la
      where la.lesson_id = $1 and la.ingestion_task_id = $2
      order by la.position`,
    [ids.lessonId, ingestionTaskId],
  );
  const mediaAssetIds = assetRows.map((row) => row.media_asset_id);
  const lessonAssetIds = assetRows.map((row) => row.lesson_asset_id);
  const mediaPublished =
    assetRows.length === 3 &&
    assetRows.every((row) => row.publication_status === "published") &&
    mediaAssetIds.every(Boolean);

  const questionRows = await db.query<{ item_id: string; revision_id: string; answer_status: string; status: string }>(
    `select qbi.id as item_id, qbr.id as revision_id, qbr.answer_status, qbr.status
       from question_bank_items qbi
       join question_bank_revisions qbr on qbr.item_id = qbi.id
       join question_bank_revision_lessons qbl on qbl.revision_id = qbr.id
      where qbi.class_id = $1 and qbi.subject_id = $2 and qbl.lesson_id = $3
        and qbr.status = 'published'
      order by qbi.created_at, qbi.id`,
    [ids.classId, ids.subjectId, ids.lessonId],
  );
  const questionBankPublished =
    questionRows.length === 3 && questionRows.every((row) => row.answer_status === "known" && row.status === "published");

  const quizRows = await db.query<{ id: string }>(
    `select q.id from quizzes q
       join quiz_lessons ql on ql.quiz_id = q.id
      where q.class_id = $1 and q.subject_id = $2 and ql.lesson_id = $3
        and q.title = $4 and q.status = 'published'`,
    [ids.classId, ids.subjectId, ids.lessonId, DEMO_QUIZ_TITLE],
  );
  const quizId = quizRows[0]?.id;
  if (!quizId || quizRows.length !== 1) throw new Error("demo_quiz_missing");
  const versionRows = await db.query<{ id: string }>(
    `select qv.id from quiz_versions qv
      where qv.quiz_id = $1
        and exists (select 1 from questions q where q.quiz_version_id = qv.id)
      order by qv.version_number`,
    [quizId],
  );
  const assessments = new StudentAssessmentService(db);
  const assessmentCatalog = await assessments.catalog(student.id, {
    classId: ids.classId,
    subjectId: ids.subjectId,
  });
  const quizCatalogVisible = assessmentCatalog.some((candidate) => candidate.id === quizId);

  const unexpectedLegacyRows = await db.query<{ count: string }>(
    `select count(*)::text as count
       from lesson_assets la
       join lessons l on l.id = la.lesson_id
      where l.class_id = $1
        and la.publication_status = 'published'
        and la.ingestion_task_id is null`,
    [ids.classId],
  );
  const legacyIsolation = Number(unexpectedLegacyRows[0]?.count ?? 0) === 0;

  const verification: PublishedStudentDemoVerification = {
    marker: PUBLISHED_STUDENT_DEMO_MARKER,
    studentProfileId: student.id,
    adminProfileId: admin.id,
    ids: {
      ...ids,
      ingestionTaskId,
      mediaAssetIds,
      lessonAssetIds,
      questionBankItemIds: questionRows.map((row) => row.item_id),
      questionBankRevisionIds: questionRows.map((row) => row.revision_id),
      quizId,
      quizVersionIds: versionRows.map((row) => row.id),
    },
    checks: {
      catalog: catalogVisible,
      reader: reader.lesson.id === ids.lessonId && reader.assets.length === 3,
      media: mediaPublished,
      questionBank: questionBankPublished,
      quizCatalog: quizCatalogVisible,
      entitlement,
      legacyIsolation,
    },
    counts: {
      readerAssets: reader.assets.length,
      publishedQuestionRevisions: questionRows.length,
      quizVersions: versionRows.length,
    },
  };

  if (Object.values(verification.checks).some((value) => !value)) {
    throw new Error(`demo_verification_failed:${JSON.stringify(verification.checks)}`);
  }
  return verification;
}

export async function seedPublishedStudentDemo(
  db: Database,
  mediaStorageRoot: string,
  identity: PublishedStudentDemoIdentityInput,
): Promise<PublishedStudentDemoSeedResult> {
  const existing = await findDemoIds(db);
  if (existing) {
    const verification = await verifyPublishedStudentDemo(db, mediaStorageRoot, identity);
    return { ...verification, replayed: true, databaseDelta: {} };
  }

  const admin = await findProfileByIdentifier(db, "admin", identity.adminIdentifier);
  const student = await findProfileByIdentifier(db, "student", identity.studentIdentifier);
  const before = await tableCounts(db);
  const curriculum = new CurriculumService(db);

  const classRecord = await curriculum.createClass(admin.id, {
    slug: PUBLISHED_STUDENT_DEMO_SLUGS.class,
    name: `${PUBLISHED_STUDENT_DEMO_MARKER} — الصف التجريبي`,
    description: "بيانات تجريبية منشورة قابلة للحذف للتحقق من تجربة الطالب الحقيقية.",
    position: 9000,
    status: "active",
  });
  const subject = await curriculum.createSubject(admin.id, {
    slug: PUBLISHED_STUDENT_DEMO_SLUGS.subject,
    name: `${PUBLISHED_STUDENT_DEMO_MARKER} — المادة التجريبية`,
    description: "مادة معزولة مخصصة للتحقق End-to-End فقط.",
    status: "active",
  });
  await curriculum.createOffering(admin.id, {
    classId: classRecord.id,
    subjectId: subject.id,
    position: 0,
    status: "active",
  });
  const section = await curriculum.createSection(admin.id, {
    classId: classRecord.id,
    subjectId: subject.id,
    slug: PUBLISHED_STUDENT_DEMO_SLUGS.section,
    title: "الوحدة التجريبية المنشورة",
    description: "وحدة واحدة لاختبار الكتالوج والقارئ والتدريب.",
    position: 0,
    status: "active",
  });
  const lesson = await curriculum.createLesson(admin.id, {
    classId: classRecord.id,
    subjectId: subject.id,
    sectionId: section.id,
    slug: PUBLISHED_STUDENT_DEMO_SLUGS.lesson,
    title: "الدرس التجريبي المنشور",
    summary: "درس تجريبي كامل يمر عبر النشر والوسائط وبنك الأسئلة والتدريب وفق العقود الحالية.",
    position: 0,
    status: "active",
  });
  const ids: DemoIds = {
    classId: classRecord.id,
    subjectId: subject.id,
    sectionId: section.id,
    lessonId: lesson.id,
  };

  await ensureEntitlement(db, student.id, classRecord.id);

  const pages = await Promise.all([buildDemoPage(1), buildDemoPage(2), buildDemoPage(3)]);
  const storage = new FileSystemMediaStorage(mediaStorageRoot);
  const ingestion = new AdminContentIngestionService(db, storage);
  let task = await ingestion.createTask(admin.id, {
    lessonId: lesson.id,
    clientRequestId: DEMO_INGESTION_REQUEST_ID,
    items: pages.map((bytes, index) => ({
      filename: `demo-page-${index + 1}.png`,
      mimeType: "image/png",
      byteSize: bytes.byteLength,
    })),
  });
  for (const [index, bytes] of pages.entries()) {
    const item = task.items[index];
    if (!item) throw new Error("demo_ingestion_item_missing");
    task = await ingestion.uploadItem(task.id, item.id, bytes);
  }
  task = await ingestion.processTask(task.id);
  if (task.status !== "completed" || task.media.length !== 3) {
    throw new Error("demo_media_processing_failed");
  }
  task = await ingestion.linkTaskToLesson(admin.id, task.id);
  task = await ingestion.transitionPublication(admin.id, task.id, "submit_review");
  task = await ingestion.transitionPublication(admin.id, task.id, "publish");
  if (task.lessonAssets.length !== 3 || task.lessonAssets.some((asset) => asset.publicationStatus !== "published")) {
    throw new Error("demo_lesson_asset_publication_failed");
  }

  const questions = await createPublishedQuestions(db, admin.id, ids);
  await createPublishedQuiz(db, admin.id, ids, questions);

  const verification = await verifyPublishedStudentDemo(db, mediaStorageRoot, identity);
  const after = await tableCounts(db);
  return {
    ...verification,
    replayed: false,
    databaseDelta: diffCounts(before, after),
  };
}

export async function cleanupPublishedStudentDemo(
  db: Database,
  mediaStorageRoot: string,
): Promise<{ marker: string; removed: boolean; storageKeysRemoved: number }> {
  const ids = await findDemoIds(db);
  if (!ids) return { marker: PUBLISHED_STUDENT_DEMO_MARKER, removed: false, storageKeysRemoved: 0 };

  const keyRows = await db.query<{ storage_key: string }>(
    `select distinct storage_key from (
       select mv.storage_key
         from media_variants mv
         join media_assets ma on ma.id = mv.media_asset_id
         join lesson_assets la on la.media_asset_id = ma.id
        where la.lesson_id = $1
       union all
       select cii.source_storage_key as storage_key
         from content_ingestion_items cii
         join content_ingestion_tasks cit on cit.id = cii.task_id
        where cit.lesson_id = $1 and cii.source_storage_key is not null
     ) keys
     where storage_key is not null`,
    [ids.lessonId],
  );
  const mediaRows = await db.query<{ id: string }>(
    `select distinct ma.id
       from media_assets ma
       join lesson_assets la on la.media_asset_id = ma.id
      where la.lesson_id = $1`,
    [ids.lessonId],
  );

  await db.transaction(async (tx) => {
    await tx.query(
      `delete from practice_sessions ps
        using quiz_versions qv, quizzes q
        where ps.quiz_version_id = qv.id and qv.quiz_id = q.id and q.class_id = $1`,
      [ids.classId],
    );
    await tx.query("delete from quizzes where class_id = $1 and subject_id = $2", [ids.classId, ids.subjectId]);
    await tx.query("delete from question_bank_items where class_id = $1 and subject_id = $2", [
      ids.classId,
      ids.subjectId,
    ]);
    await tx.query("delete from lesson_assets where lesson_id = $1", [ids.lessonId]);
    await tx.query("delete from content_ingestion_tasks where lesson_id = $1", [ids.lessonId]);
    if (mediaRows.length > 0) {
      await tx.query("delete from media_assets where id = any($1::uuid[])", [mediaRows.map((row) => row.id)]);
    }
    await tx.query("delete from student_entitlements where class_id = $1", [ids.classId]);
    await tx.query(
      "delete from curriculum_events where resource_key = any($1::text[])",
      [[ids.classId, ids.subjectId, ids.sectionId, ids.lessonId]],
    );
    await tx.query("delete from lessons where id = $1", [ids.lessonId]);
    await tx.query("delete from curriculum_sections where id = $1", [ids.sectionId]);
    await tx.query("delete from subject_class_links where class_id = $1 and subject_id = $2", [
      ids.classId,
      ids.subjectId,
    ]);
    await tx.query("delete from subjects where id = $1", [ids.subjectId]);
    await tx.query("delete from classes where id = $1", [ids.classId]);
  });

  const storage = new FileSystemMediaStorage(mediaStorageRoot);
  let storageKeysRemoved = 0;
  for (const row of keyRows) {
    await storage.remove(row.storage_key);
    storageKeysRemoved += 1;
  }
  return { marker: PUBLISHED_STUDENT_DEMO_MARKER, removed: true, storageKeysRemoved };
}
