import { createHash } from "node:crypto";
import type { Database } from "../db.js";
import { AppError } from "../errors.js";
import type { QuestionBankService } from "../question-bank/service.js";
import type {
  AiGenerationMode,
  AiGenerationRequest,
  AiQuestionTarget,
  AiSourceChunk,
  AiSubjectDomain,
} from "./contracts.js";
import { aiGenerationRequestSchema } from "./contracts.js";
import { AiExecutionRepository, type AiJobRecord } from "./execution-repository.js";
import { getPromptDefinition } from "./prompt-registry.js";
import { validateAdminApprovalOutput } from "./review-validation.js";

const LESSON_MODES = new Set<AiGenerationMode>([
  "lesson_summary",
  "question_generation",
  "comprehensive_lesson_content",
  "exact_question_extraction",
  "replica_question_extraction",
]);
const QUIZ_MODES = new Set<AiGenerationMode>([
  "question_generation",
  "exact_question_extraction",
  "exact_exam_extraction",
  "replica_question_extraction",
]);
const EXACT_MODES = new Set<AiGenerationMode>([
  "exact_question_extraction",
  "exact_exam_extraction",
  "replica_question_extraction",
]);

export interface LessonGenerationInput {
  lessonIds: readonly string[];
  mode: AiGenerationMode;
  subjectDomain: AiSubjectDomain;
  target?: AiQuestionTarget;
  expectedQuestionCount?: number;
  clientRequestId: string;
  priority?: number;
}

export interface QuizVersionGenerationInput {
  key: string;
  label: string;
  lessonIds: readonly string[];
  shuffleOptions: boolean;
  target?: AiQuestionTarget;
  expectedQuestionCount?: number;
}

export interface QuizGenerationInput {
  mode: AiGenerationMode;
  subjectDomain: AiSubjectDomain;
  versions: readonly QuizVersionGenerationInput[];
  clientRequestId: string;
  priority?: number;
}

export interface AuthoringPlanResult {
  jobId: string;
  status: AiJobRecord["status"];
  totalUnits: number;
  replayed: boolean;
}

export interface LessonApplyResult {
  lessonId: string;
  summaryApplied: boolean;
  summaryReplayed: boolean;
  questionBankItemIds: string[];
  questionImportReplayed: boolean;
}

interface RequestBase {
  language: "ar";
  subjectDomain: AiSubjectDomain;
  sourceSensitivity: "standard" | "exact_source";
  notationPolicy: "arabic_visible_numerals" | "preserve_source_exactly";
  sourceChunks: AiSourceChunk[];
}

interface SourceRow {
  lesson_id: string;
  media_asset_id: string;
  page_number: number;
  input_checksum_sha256: string;
  content_source_asset_id: string | null;
  ocr_extraction_id: string | null;
  normalized_text: string | null;
  raw_text: string | null;
  review_status: "not_required" | "approved" | null;
}

interface LessonIdentity {
  id: string;
  class_id: string;
  subject_id: string;
  title: string;
}

interface OutputContextRow {
  unit_key: string;
  input_payload: unknown;
  prompt_key: string;
  prompt_version: string;
}

interface ReviewRow {
  revision: number;
  action: "edit" | "approve" | "reject";
  reviewed_output: unknown;
}

interface PublishedQuestionRow {
  revision_id: string;
  prompt: string;
  type: "multiple_choice" | "true_false" | "direct";
  difficulty: "easy" | "medium" | "hard";
}

interface PublishedQuestionSourceRow {
  media_asset_id: string;
  page_number: number;
  input_checksum_sha256: string;
  ocr_extraction_id: string | null;
  content_source_asset_id: string | null;
  normalized_text: string | null;
  raw_text: string | null;
  review_status: "not_required" | "approved" | null;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function fingerprint(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function planView(result: { job: AiJobRecord; replayed: boolean }): AuthoringPlanResult {
  return {
    jobId: result.job.id,
    status: result.job.status,
    totalUnits: result.job.total_units,
    replayed: result.replayed,
  };
}

function sourceRowToChunk(source: PublishedQuestionSourceRow): AiSourceChunk {
  const text = source.normalized_text?.trim() || source.raw_text?.trim() || null;
  const approved = Boolean(text && source.ocr_extraction_id && source.review_status);
  return {
    mediaAssetId: source.media_asset_id,
    pageNumber: source.page_number,
    inputChecksumSha256: source.input_checksum_sha256,
    inputKind: approved ? "approved_ocr" : "vision_fallback",
    ocrExtractionId: approved ? source.ocr_extraction_id : null,
    approvedText: approved ? text : null,
    ocrReviewStatus: approved ? source.review_status : null,
    contentSourceAssetId: source.content_source_asset_id,
  } as AiSourceChunk;
}

function baseRequest(
  mode: AiGenerationMode,
  subjectDomain: AiSubjectDomain,
  sourceChunks: AiSourceChunk[],
): RequestBase {
  const exact = EXACT_MODES.has(mode);
  return {
    language: "ar",
    subjectDomain,
    sourceSensitivity: exact ? "exact_source" : "standard",
    notationPolicy: exact ? "preserve_source_exactly" : "arabic_visible_numerals",
    sourceChunks,
  };
}

function generationRequest(
  mode: AiGenerationMode,
  subjectDomain: AiSubjectDomain,
  sourceChunks: AiSourceChunk[],
  options: {
    lessonTitle?: string;
    target?: AiQuestionTarget;
    expectedQuestionCount?: number;
  },
): AiGenerationRequest {
  const base = baseRequest(mode, subjectDomain, sourceChunks);
  if (mode === "lesson_summary") {
    return aiGenerationRequestSchema.parse({
      ...base,
      mode,
      ...(options.lessonTitle ? { lessonTitle: options.lessonTitle } : {}),
    });
  }
  if (mode === "question_generation") {
    if (!options.target) {
      throw new AppError("BAD_REQUEST", "أعداد أنواع الأسئلة مطلوبة", 400);
    }
    return aiGenerationRequestSchema.parse({ ...base, mode, target: options.target });
  }
  if (mode === "comprehensive_lesson_content") {
    if (!options.target) {
      throw new AppError("BAD_REQUEST", "أعداد أنواع الأسئلة مطلوبة", 400);
    }
    return aiGenerationRequestSchema.parse({
      ...base,
      mode,
      ...(options.lessonTitle ? { lessonTitle: options.lessonTitle } : {}),
      target: options.target,
    });
  }
  if (EXACT_MODES.has(mode)) {
    return aiGenerationRequestSchema.parse({
      ...base,
      mode,
      ...(options.expectedQuestionCount
        ? { expectedQuestionCount: options.expectedQuestionCount }
        : {}),
    });
  }
  throw new AppError("BAD_REQUEST", "وضع التوليد غير مدعوم في هذا السياق", 400);
}

export class AdminAiAuthoringService {
  private readonly repository = new AiExecutionRepository();

  constructor(
    private readonly database: Database,
    private readonly questionBank: QuestionBankService,
  ) {}

  async enqueueLessons(
    actorProfileId: string,
    input: LessonGenerationInput,
  ): Promise<AuthoringPlanResult> {
    if (!LESSON_MODES.has(input.mode)) {
      throw new AppError("BAD_REQUEST", "وضع توليد الدروس غير مدعوم", 400);
    }
    const lessonIds = [...new Set(input.lessonIds)];
    if (lessonIds.length === 0 || lessonIds.length > 32) {
      throw new AppError("BAD_REQUEST", "اختر من درس واحد إلى 32 درسًا", 400);
    }
    const sourceMap = await this.lessonSources(lessonIds);
    const identities = await this.lessonIdentities(lessonIds);
    const identityMap = new Map(identities.map((lesson) => [lesson.id, lesson]));
    const units = lessonIds.map((lessonId) => {
      const lesson = identityMap.get(lessonId);
      const sourceChunks = sourceMap.get(lessonId) ?? [];
      if (!lesson || sourceChunks.length === 0) {
        throw new AppError(
          "CONFLICT",
          "كل درس مختار يحتاج أصولًا منشورة وجاهزة للذكاء الاصطناعي",
          409,
        );
      }
      return {
        unitKey: `lesson:${lessonId}`,
        request: generationRequest(input.mode, input.subjectDomain, sourceChunks, {
          lessonTitle: lesson.title,
          ...(input.target ? { target: input.target } : {}),
          ...(input.expectedQuestionCount
            ? { expectedQuestionCount: input.expectedQuestionCount }
            : {}),
        }),
      };
    });
    const authoring = {
      kind: "lesson_generation",
      mode: input.mode,
      lessonIds,
    } as const;
    return planView(
      await this.createPlan(
        actorProfileId,
        `admin-authoring:${input.clientRequestId}`,
        input.priority ?? 5,
        units,
        authoring,
      ),
    );
  }

  async enqueueQuiz(
    actorProfileId: string,
    quizId: string,
    input: QuizGenerationInput,
  ): Promise<AuthoringPlanResult> {
    if (!QUIZ_MODES.has(input.mode)) {
      throw new AppError("BAD_REQUEST", "وضع توليد الاختبار غير مدعوم", 400);
    }
    if (input.versions.length === 0 || input.versions.length > 20) {
      throw new AppError("BAD_REQUEST", "عدد النماذج يجب أن يكون بين 1 و20", 400);
    }
    const quizRows = await this.database.query<{
      class_id: string | null;
      subject_id: string | null;
      status: string;
    }>("select class_id, subject_id, status::text from quizzes where id = $1", [quizId]);
    const quiz = quizRows[0];
    if (!quiz) throw new AppError("NOT_FOUND", "الاختبار غير موجود", 404);
    if (quiz.status !== "draft" || !quiz.class_id || !quiz.subject_id) {
      throw new AppError(
        "CONFLICT",
        "التوليد متاح فقط لاختبار Quiz Builder في حالة مسودة",
        409,
      );
    }

    const scopedRows = await this.database.query<{ lesson_id: string }>(
      "select lesson_id from quiz_lessons where quiz_id = $1",
      [quizId],
    );
    const quizLessons = new Set(scopedRows.map((row) => row.lesson_id));
    const keys = new Set<string>();
    const versions = input.versions.map((version, position) => {
      const key = version.key.trim();
      const label = version.label.trim();
      const lessonIds = [...new Set(version.lessonIds)];
      if (!key || keys.has(key)) {
        throw new AppError("BAD_REQUEST", "مفتاح كل نموذج يجب أن يكون فريدًا", 400);
      }
      keys.add(key);
      if (!label) throw new AppError("BAD_REQUEST", "اسم النموذج مطلوب", 400);
      if (
        lessonIds.length === 0 ||
        lessonIds.some((lessonId) => !quizLessons.has(lessonId))
      ) {
        throw new AppError(
          "BAD_REQUEST",
          "مصادر كل نموذج يجب أن تكون من دروس الاختبار المحددة",
          400,
        );
      }
      return { ...version, key, label, lessonIds, position };
    });

    const allLessonIds = [...new Set(versions.flatMap((version) => version.lessonIds))];
    const sourceMap = await this.lessonSources(allLessonIds);
    const units = versions.map((version) => {
      const sourceChunks = version.lessonIds.flatMap(
        (lessonId) => sourceMap.get(lessonId) ?? [],
      );
      if (sourceChunks.length === 0 || sourceChunks.length > 64) {
        throw new AppError(
          "CONFLICT",
          "مصادر النموذج غير جاهزة أو تتجاوز حد 64 صفحة",
          409,
        );
      }
      return {
        unitKey: `quiz-version:${version.key}`,
        request: generationRequest(input.mode, input.subjectDomain, sourceChunks, {
          ...(version.target ? { target: version.target } : {}),
          ...(version.expectedQuestionCount
            ? { expectedQuestionCount: version.expectedQuestionCount }
            : {}),
        }),
      };
    });
    const authoring = {
      kind: "quiz_generation",
      quizId,
      mode: input.mode,
      versions: versions.map((version) => ({
        unitKey: `quiz-version:${version.key}`,
        label: version.label,
        lessonIds: version.lessonIds,
        shuffleOptions: version.shuffleOptions,
      })),
    } as const;
    return planView(
      await this.createPlan(
        actorProfileId,
        `admin-authoring:${input.clientRequestId}`,
        input.priority ?? 5,
        units,
        authoring,
      ),
    );
  }

  async enqueueQuestionRegeneration(
    actorProfileId: string,
    itemId: string,
    input: {
      clientRequestId: string;
      subjectDomain: AiSubjectDomain;
      priority?: number;
    },
  ): Promise<AuthoringPlanResult> {
    const rows = await this.database.query<PublishedQuestionRow>(
      `select r.id as revision_id, r.prompt, r.type, r.difficulty
       from question_bank_items i
       join question_bank_revisions r on r.item_id = i.id and r.status = 'published'
       where i.id = $1 and i.archived_at is null`,
      [itemId],
    );
    const question = rows[0];
    if (!question) {
      throw new AppError(
        "CONFLICT",
        "إعادة التوليد تتطلب سؤالًا منشورًا وغير مؤرشف",
        409,
      );
    }
    const sourceRows = await this.database.query<PublishedQuestionSourceRow>(
      `select s.media_asset_id, s.page_number, s.input_checksum_sha256,
              s.ocr_extraction_id, s.content_source_asset_id,
              e.normalized_text, e.raw_text,
              case when e.review_status in ('not_required','approved')
                then e.review_status::text end as review_status
       from question_bank_revision_sources s
       left join ocr_extractions e on e.id = s.ocr_extraction_id
       where s.revision_id = $1
       order by s.position`,
      [question.revision_id],
    );
    if (sourceRows.length === 0) {
      throw new AppError("CONFLICT", "السؤال المنشور لا يملك مصادر موثقة", 409);
    }
    const request = aiGenerationRequestSchema.parse({
      ...baseRequest(
        "regenerate_question",
        input.subjectDomain,
        sourceRows.map(sourceRowToChunk),
      ),
      mode: "regenerate_question",
      originalQuestion: {
        prompt: question.prompt,
        type: question.type,
        difficulty: question.difficulty,
      },
    });
    return planView(
      await this.createPlan(
        actorProfileId,
        `admin-authoring:${input.clientRequestId}`,
        input.priority ?? 5,
        [{ unitKey: `question-bank:${itemId}`, request }],
        {
          kind: "question_regeneration",
          itemId,
          publishedRevisionId: question.revision_id,
        },
      ),
    );
  }

  async applyLessonOutput(
    actorProfileId: string,
    outputId: string,
  ): Promise<LessonApplyResult> {
    const { context, review, request, output } = await this.approvedOutput(outputId);
    if (!context.unit_key.startsWith("lesson:")) {
      throw new AppError("BAD_REQUEST", "المخرج لا يتبع عملية توليد درس", 400);
    }
    const lessonId = context.unit_key.slice("lesson:".length);
    const lesson = (await this.lessonIdentities([lessonId]))[0];
    if (!lesson) throw new AppError("NOT_FOUND", "الدرس المرتبط بالمخرج غير موجود", 404);

    let questionBankItemIds: string[] = [];
    let questionImportReplayed = false;
    if (output.kind === "question_set" || output.kind === "lesson_content") {
      const imported = await this.questionBank.importApprovedAiOutput(actorProfileId, {
        classId: lesson.class_id,
        subjectId: lesson.subject_id,
        lessonIds: [lessonId],
        outputId,
      });
      questionBankItemIds = imported.imports.map((item) => item.itemId);
      questionImportReplayed = imported.replayed;
    }

    let summaryApplied = false;
    let summaryReplayed = false;
    if (output.kind === "summary" || output.kind === "lesson_content") {
      const result = await this.applySummary(
        actorProfileId,
        lessonId,
        output.summary.trim(),
        outputId,
        review.revision,
        context,
        request.mode,
      );
      summaryApplied = true;
      summaryReplayed = result.replayed;
    }
    if (!summaryApplied && questionBankItemIds.length === 0) {
      throw new AppError(
        "BAD_REQUEST",
        "المخرج المعتمد لا يحتوي محتوى قابلًا للتطبيق على الدرس",
        400,
      );
    }
    return {
      lessonId,
      summaryApplied,
      summaryReplayed,
      questionBankItemIds,
      questionImportReplayed,
    };
  }

  async archiveQuestion(
    actorProfileId: string,
    itemId: string,
  ): Promise<{ replayed: boolean }> {
    return this.database.transaction(async (tx) => {
      const rows = await tx.query<{ archived_at: Date | null }>(
        "select archived_at from question_bank_items where id = $1 for update",
        [itemId],
      );
      const item = rows[0];
      if (!item) throw new AppError("NOT_FOUND", "السؤال غير موجود", 404);
      if (item.archived_at) return { replayed: true };
      const review = await tx.query<{ id: string }>(
        `select id from question_bank_revisions
         where item_id = $1 and status = 'review' limit 1`,
        [itemId],
      );
      if (review[0]) {
        throw new AppError("CONFLICT", "أعد السؤال من المراجعة قبل أرشفته", 409);
      }
      await tx.query(
        "update question_bank_items set archived_at = now() where id = $1",
        [itemId],
      );
      await tx.query(
        `update question_bank_revisions set status = 'archived'
         where item_id = $1 and status <> 'archived'`,
        [itemId],
      );
      await tx.query(
        `insert into question_bank_events (item_id, action, actor_profile_id, note)
         values ($1, 'archive', $2, 'non_destructive_archive')`,
        [itemId, actorProfileId],
      );
      return { replayed: false };
    });
  }

  async archiveQuiz(
    actorProfileId: string,
    quizId: string,
  ): Promise<{ replayed: boolean }> {
    return this.database.transaction(async (tx) => {
      const rows = await tx.query<{ status: string }>(
        "select status::text from quizzes where id = $1 for update",
        [quizId],
      );
      const quiz = rows[0];
      if (!quiz) throw new AppError("NOT_FOUND", "الاختبار غير موجود", 404);
      if (quiz.status === "archived") return { replayed: true };
      if (quiz.status === "review") {
        throw new AppError("CONFLICT", "أعد الاختبار من المراجعة قبل أرشفته", 409);
      }
      await tx.query("update quizzes set status = 'archived' where id = $1", [quizId]);
      await tx.query(
        `insert into quiz_builder_events (quiz_id, action, actor_profile_id, note)
         values ($1, 'archive', $2, 'non_destructive_archive')`,
        [quizId, actorProfileId],
      );
      return { replayed: false };
    });
  }

  private async createPlan(
    actorProfileId: string,
    idempotencyKey: string,
    priority: number,
    units: readonly { unitKey: string; request: AiGenerationRequest }[],
    authoring: Record<string, unknown>,
  ) {
    if (!Number.isInteger(priority) || priority < 1 || priority > 10) {
      throw new AppError("BAD_REQUEST", "أولوية التوليد يجب أن تكون بين 1 و10", 400);
    }
    const first = units[0];
    if (!first) throw new AppError("BAD_REQUEST", "خطة التوليد فارغة", 400);
    const definition = getPromptDefinition(first.request.mode);
    for (const unit of units) {
      const current = getPromptDefinition(unit.request.mode);
      if (current.key !== definition.key || current.version !== definition.version) {
        throw new AppError(
          "BAD_REQUEST",
          "لا يمكن خلط عقود prompts مختلفة في نفس المهمة",
          400,
        );
      }
    }
    const planFingerprint = fingerprint({
      promptKey: definition.key,
      promptVersion: definition.version,
      authoring,
      units,
    });
    return this.database.transaction(async (tx) => {
      const result = await this.repository.createPlan(tx, {
        createdByProfileId: actorProfileId,
        jobType: first.request.mode,
        promptKey: definition.key,
        promptVersion: definition.version,
        priority,
        idempotencyKey,
        planFingerprint,
        maxAttempts: 3,
        units: units.map((unit, position) => ({
          unitKey: unit.unitKey,
          position,
          request: unit.request,
        })),
      });
      if (!result.replayed) {
        await tx.query(
          `update ai_jobs
           set input_manifest = input_manifest || jsonb_build_object('authoring', $2::jsonb)
           where id = $1`,
          [result.job.id, JSON.stringify(authoring)],
        );
      }
      return result;
    });
  }

  private async approvedOutput(outputId: string) {
    const contexts = await this.database.query<OutputContextRow>(
      `select u.unit_key, u.input_payload, j.prompt_key, j.prompt_version
       from ai_outputs o
       join ai_job_units u on u.id = o.job_unit_id
       join ai_jobs j on j.id = u.job_id
       where o.id = $1`,
      [outputId],
    );
    const context = contexts[0];
    if (!context) {
      throw new AppError("NOT_FOUND", "مخرج الذكاء الاصطناعي غير موجود", 404);
    }
    const reviews = await this.database.query<ReviewRow>(
      `select revision, action, reviewed_output
       from ai_output_review_events
       where ai_output_id = $1
       order by revision desc
       limit 1`,
      [outputId],
    );
    const review = reviews[0];
    if (!review || review.action !== "approve" || review.reviewed_output === null) {
      throw new AppError(
        "CONFLICT",
        "يجب اعتماد المخرج في مراجعة AI قبل تطبيقه",
        409,
      );
    }
    const parsed = aiGenerationRequestSchema.safeParse(context.input_payload);
    if (!parsed.success) {
      throw new AppError("INTERNAL_ERROR", "طلب AI المخزن لا يطابق العقد", 500);
    }
    return {
      context,
      review,
      request: parsed.data,
      output: validateAdminApprovalOutput(parsed.data, review.reviewed_output),
    };
  }

  private applySummary(
    actorProfileId: string,
    lessonId: string,
    summary: string,
    outputId: string,
    reviewRevision: number,
    context: OutputContextRow,
    mode: AiGenerationMode,
  ): Promise<{ replayed: boolean }> {
    return this.database.transaction(async (tx) => {
      const prior = await tx.query<{ id: string }>(
        `select id::text from curriculum_events
         where resource_type = 'lesson'
           and resource_key = $1
           and event_type = 'ai_summary_applied'
           and metadata->>'outputId' = $2
           and metadata->>'reviewRevision' = $3
         limit 1`,
        [lessonId, outputId, String(reviewRevision)],
      );
      if (prior[0]) return { replayed: true };
      const updated = await tx.query<{ id: string }>(
        `update lessons
         set summary = $2, content_revision = content_revision + 1
         where id = $1
         returning id`,
        [lessonId, summary],
      );
      if (!updated[0]) throw new AppError("NOT_FOUND", "الدرس غير موجود", 404);
      await tx.query(
        `insert into curriculum_events (
           actor_profile_id, resource_type, resource_key, event_type, metadata
         ) values ($1, 'lesson', $2, 'ai_summary_applied', $3::jsonb)`,
        [
          actorProfileId,
          lessonId,
          JSON.stringify({
            outputId,
            reviewRevision,
            promptKey: context.prompt_key,
            promptVersion: context.prompt_version,
            mode,
          }),
        ],
      );
      return { replayed: false };
    });
  }

  private lessonIdentities(lessonIds: readonly string[]): Promise<LessonIdentity[]> {
    if (lessonIds.length === 0) return Promise.resolve([]);
    return this.database.query<LessonIdentity>(
      `select id, class_id, subject_id, title
       from lessons
       where id = any($1::uuid[]) and status <> 'archived'`,
      [lessonIds],
    );
  }

  private async lessonSources(
    lessonIds: readonly string[],
  ): Promise<Map<string, AiSourceChunk[]>> {
    const rows = await this.database.query<SourceRow>(
      `select l.id as lesson_id,
              ma.id as media_asset_id,
              coalesce(la.source_page_number, ma.source_page_number, la.position + 1) as page_number,
              v.checksum_sha256 as input_checksum_sha256,
              ma.content_source_asset_id,
              o.id as ocr_extraction_id,
              o.normalized_text,
              o.raw_text,
              case when o.review_status in ('not_required','approved')
                then o.review_status::text end as review_status
       from lessons l
       join lesson_assets la
         on la.lesson_id = l.id and la.publication_status = 'published'
       join media_assets ma on ma.id = la.media_asset_id and ma.status = 'ready'
       join media_variants v on v.media_asset_id = ma.id and v.kind = 'ai'
       left join lateral (
         select e.id, e.normalized_text, e.raw_text, e.review_status
         from ocr_extractions e
         where e.input_media_variant_id = v.id
           and e.status = 'completed'
           and e.review_status in ('not_required','approved')
         order by e.completed_at desc nulls last, e.created_at desc, e.id desc
         limit 1
       ) o on true
       where l.id = any($1::uuid[]) and l.status <> 'archived'
       order by l.id, la.position, la.id`,
      [lessonIds],
    );
    const map = new Map<string, AiSourceChunk[]>();
    for (const row of rows) {
      const chunks = map.get(row.lesson_id) ?? [];
      chunks.push(sourceRowToChunk(row));
      if (chunks.length > 64) {
        throw new AppError(
          "CONFLICT",
          "مصادر الدرس تتجاوز حد 64 صفحة للمهمة الواحدة",
          409,
        );
      }
      map.set(row.lesson_id, chunks);
    }
    return map;
  }
}
