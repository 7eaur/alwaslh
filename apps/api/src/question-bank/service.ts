import type { AiGenerationOutput, AiGenerationRequest, AiQuestion } from "../ai/contracts.js";
import { aiGenerationRequestSchema, aiQuestionSchema } from "../ai/contracts.js";
import { validateAdminApprovalOutput } from "../ai/review-validation.js";
import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

export type QuestionBankOrigin = "manual" | "ai";
export type QuestionBankRevisionStatus = "draft" | "review" | "published" | "archived";

export interface QuestionBankScopeInput {
  classId: string;
  subjectId: string;
  lessonIds: readonly string[];
}

export interface QuestionBankQuestionInput {
  prompt: string;
  type: AiQuestion["type"];
  options: readonly string[];
  correctOptionIndex: number | null;
  answerText: string | null;
  answerStatus: AiQuestion["answerStatus"];
  difficulty: AiQuestion["difficulty"];
  explanation: string | null;
  method: string | null;
}

export interface CreateManualQuestionInput extends QuestionBankScopeInput {
  question: QuestionBankQuestionInput;
}

export interface ImportApprovedAiOutputInput extends QuestionBankScopeInput {
  outputId: string;
}

export interface QuestionBankListFilters {
  classId?: string;
  subjectId?: string;
  origin?: QuestionBankOrigin;
  status?: Exclude<QuestionBankRevisionStatus, "archived">;
  search?: string;
  limit: number;
  offset: number;
}

export interface QuestionBankSourceView {
  position: number;
  mediaAssetId: string;
  pageNumber: number;
  inputChecksumSha256: string;
  ocrExtractionId: string | null;
  contentSourceAssetId: string | null;
  quote: string | null;
}

export interface QuestionBankRevisionView {
  id: string;
  revisionNumber: number;
  status: QuestionBankRevisionStatus;
  question: QuestionBankQuestionInput;
  lessonIds: string[];
  sources: QuestionBankSourceView[];
  createdByProfileId: string;
  submittedForReviewByProfileId: string | null;
  submittedForReviewAt: Date | null;
  publishedByProfileId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface QuestionBankListItem {
  id: string;
  classId: string;
  subjectId: string;
  origin: QuestionBankOrigin;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  currentRevision: null | {
    id: string;
    revisionNumber: number;
    status: QuestionBankRevisionStatus;
    type: AiQuestion["type"];
    prompt: string;
    difficulty: AiQuestion["difficulty"];
    answerStatus: AiQuestion["answerStatus"];
  };
}

export interface QuestionBankEventView {
  id: number;
  revisionId: string | null;
  action: "create" | "import" | "edit" | "submit_review" | "reject" | "publish" | "archive";
  actorProfileId: string;
  note: string | null;
  createdAt: Date;
}

export interface QuestionBankAiImportView {
  aiOutputId: string;
  approvedReviewRevision: number;
  questionLocator: string;
  itemId: string;
  revisionId: string;
  promptKey: string;
  promptVersion: string;
  generationMode: string;
  importedByProfileId: string;
  importedAt: Date;
}

interface ItemRow {
  id: string;
  class_id: string;
  subject_id: string;
  origin: QuestionBankOrigin;
  created_by_profile_id: string;
  archived_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface ItemListRow extends ItemRow {
  revision_id: string | null;
  revision_number: number | null;
  revision_status: QuestionBankRevisionStatus | null;
  revision_type: AiQuestion["type"] | null;
  revision_prompt: string | null;
  revision_difficulty: AiQuestion["difficulty"] | null;
  revision_answer_status: AiQuestion["answerStatus"] | null;
}

interface RevisionRow {
  id: string;
  item_id: string;
  revision_number: number;
  status: QuestionBankRevisionStatus;
  type: AiQuestion["type"];
  prompt: string;
  options: unknown;
  correct_option_index: number | null;
  answer_text: string | null;
  answer_status: AiQuestion["answerStatus"];
  difficulty: AiQuestion["difficulty"];
  explanation: string | null;
  method: string | null;
  created_by_profile_id: string;
  submitted_for_review_by_profile_id: string | null;
  submitted_for_review_at: Date | null;
  published_by_profile_id: string | null;
  published_at: Date | null;
  created_at: Date;
}

interface LessonLinkRow {
  revision_id: string;
  lesson_id: string;
  position: number;
}

interface SourceRow {
  revision_id: string;
  position: number;
  media_asset_id: string;
  page_number: number;
  input_checksum_sha256: string;
  ocr_extraction_id: string | null;
  content_source_asset_id: string | null;
  source_quote: string | null;
}

interface EventRow {
  id: string;
  item_id: string;
  revision_id: string | null;
  action: QuestionBankEventView["action"];
  actor_profile_id: string;
  note: string | null;
  created_at: Date;
}

interface ImportRow {
  ai_output_id: string;
  approved_review_revision: number;
  question_locator: string;
  item_id: string;
  revision_id: string;
  prompt_key: string;
  prompt_version: string;
  generation_mode: string;
  imported_by_profile_id: string;
  imported_at: Date;
}

interface AiOutputContextRow {
  output_id: string;
  input_payload: unknown;
  prompt_key: string;
  prompt_version: string;
}

interface ReviewRow {
  revision: number;
  action: "edit" | "approve" | "reject";
  reviewed_output: unknown;
}

function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function normalizedQuestion(input: QuestionBankQuestionInput | AiQuestion): AiQuestion {
  const parsed = aiQuestionSchema.safeParse({
    ...input,
    sourceEvidence: "sourceEvidence" in input ? input.sourceEvidence : [],
  });
  if (!parsed.success) {
    throw new AppError("BAD_REQUEST", "بيانات السؤال لا تطابق عقد الأسئلة المعتمد", 400);
  }
  const question = parsed.data;
  if (question.type === "multiple_choice" && question.options.length !== 4) {
    throw new AppError("BAD_REQUEST", "سؤال الاختيار المتعدد يحتاج أربعة خيارات", 400);
  }
  if (
    question.type === "true_false" &&
    (question.options.length !== 2 || question.options[0] !== "صح" || question.options[1] !== "خطأ")
  ) {
    throw new AppError("BAD_REQUEST", "سؤال الصح والخطأ يجب أن يستخدم الخيارين صح وخطأ", 400);
  }
  if (question.type === "direct" && question.options.length !== 0) {
    throw new AppError("BAD_REQUEST", "السؤال المباشر لا يقبل خيارات", 400);
  }
  if (question.answerStatus === "known") {
    if (question.type === "direct") {
      if (question.correctOptionIndex !== null || !question.answerText?.trim()) {
        throw new AppError("BAD_REQUEST", "إجابة السؤال المباشر المعروفة يجب أن تكون نصية", 400);
      }
    } else {
      const index = question.correctOptionIndex;
      if (
        index === null ||
        index < 0 ||
        index >= question.options.length ||
        question.answerText !== question.options[index]
      ) {
        throw new AppError("BAD_REQUEST", "إجابة السؤال لا تطابق الخيار الصحيح", 400);
      }
    }
  } else if (question.correctOptionIndex !== null || question.answerText !== null) {
    throw new AppError("BAD_REQUEST", "الإجابة غير المحسومة لا يجوز أن تدّعي إجابة صحيحة", 400);
  }
  return question;
}

function questionInput(question: AiQuestion): QuestionBankQuestionInput {
  return {
    prompt: question.prompt,
    type: question.type,
    options: [...question.options],
    correctOptionIndex: question.correctOptionIndex,
    answerText: question.answerText,
    answerStatus: question.answerStatus,
    difficulty: question.difficulty,
    explanation: question.explanation,
    method: question.method,
  };
}

function mapListItem(row: ItemListRow): QuestionBankListItem {
  return {
    id: row.id,
    classId: row.class_id,
    subjectId: row.subject_id,
    origin: row.origin,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    currentRevision:
      row.revision_id &&
      row.revision_number !== null &&
      row.revision_status &&
      row.revision_type &&
      row.revision_prompt &&
      row.revision_difficulty &&
      row.revision_answer_status
        ? {
            id: row.revision_id,
            revisionNumber: row.revision_number,
            status: row.revision_status,
            type: row.revision_type,
            prompt: row.revision_prompt,
            difficulty: row.revision_difficulty,
            answerStatus: row.revision_answer_status,
          }
        : null,
  };
}

function mapImport(row: ImportRow): QuestionBankAiImportView {
  return {
    aiOutputId: row.ai_output_id,
    approvedReviewRevision: row.approved_review_revision,
    questionLocator: row.question_locator,
    itemId: row.item_id,
    revisionId: row.revision_id,
    promptKey: row.prompt_key,
    promptVersion: row.prompt_version,
    generationMode: row.generation_mode,
    importedByProfileId: row.imported_by_profile_id,
    importedAt: row.imported_at,
  };
}

function questionEntries(output: AiGenerationOutput): Array<{ locator: string; question: AiQuestion }> {
  if (output.kind === "question_set") {
    return output.questions.map((question, index) => ({ locator: `questions.${index}`, question }));
  }
  if (output.kind === "lesson_content") {
    return output.questions.map((question, index) => ({ locator: `questions.${index}`, question }));
  }
  if (output.kind === "multi_version_quiz") {
    return output.versions.flatMap((version, versionIndex) =>
      version.questions.map((question, questionIndex) => ({
        locator: `versions.${versionIndex}.questions.${questionIndex}`,
        question,
      })),
    );
  }
  return [];
}

function sourceChunk(
  request: AiGenerationRequest,
  evidence: AiQuestion["sourceEvidence"][number],
): AiGenerationRequest["sourceChunks"][number] {
  const source = request.sourceChunks.find(
    (candidate) =>
      candidate.mediaAssetId === evidence.mediaAssetId && candidate.pageNumber === evidence.pageNumber,
  );
  if (!source) {
    throw new AppError("INTERNAL_ERROR", "مصدر السؤال المعتمد لا يطابق طلب الذكاء الاصطناعي", 500);
  }
  return source;
}

export class QuestionBankService {
  constructor(private readonly database: Database) {}

  async listItems(filters: QuestionBankListFilters): Promise<{
    items: QuestionBankListItem[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const classId = filters.classId ?? null;
    const subjectId = filters.subjectId ?? null;
    const origin = filters.origin ?? null;
    const status = filters.status ?? null;
    const search = filters.search?.trim() || null;
    const where = `
      ($1::uuid is null or i.class_id = $1)
      and ($2::uuid is null or i.subject_id = $2)
      and ($3::text is null or i.origin::text = $3)
      and ($4::text is null or current_revision.status::text = $4)
      and ($5::text is null or current_revision.prompt ilike '%' || $5 || '%')`;
    return this.readSnapshot(async (tx) => {
      const items = await tx.query<ItemListRow>(
        `select i.id, i.class_id, i.subject_id, i.origin, i.created_by_profile_id,
                i.archived_at, i.created_at, i.updated_at,
                current_revision.id as revision_id,
                current_revision.revision_number,
                current_revision.status as revision_status,
                current_revision.type as revision_type,
                current_revision.prompt as revision_prompt,
                current_revision.difficulty as revision_difficulty,
                current_revision.answer_status as revision_answer_status
         from question_bank_items i
         left join lateral (
           select r.id, r.revision_number, r.status, r.type, r.prompt, r.difficulty, r.answer_status
           from question_bank_revisions r
           where r.item_id = i.id
           order by case r.status when 'review' then 0 when 'draft' then 1 when 'published' then 2 else 3 end,
                    r.revision_number desc
           limit 1
         ) current_revision on true
         where ${where}
         order by i.created_at desc, i.id desc
         limit $6 offset $7`,
        [classId, subjectId, origin, status, search, filters.limit, filters.offset],
      );
      const totals = await tx.query<{ count: string }>(
        `select count(*)
         from question_bank_items i
         left join lateral (
           select r.status, r.prompt
           from question_bank_revisions r
           where r.item_id = i.id
           order by case r.status when 'review' then 0 when 'draft' then 1 when 'published' then 2 else 3 end,
                    r.revision_number desc
           limit 1
         ) current_revision on true
         where ${where}`,
        [classId, subjectId, origin, status, search],
      );
      return {
        items: items.map(mapListItem),
        pagination: { total: Number(totals[0]?.count ?? 0), limit: filters.limit, offset: filters.offset },
      };
    });
  }

  async itemDetail(
    itemId: string,
    revisionLimit = 50,
    revisionOffset = 0,
    eventLimit = 50,
    eventOffset = 0,
  ): Promise<{
    item: QuestionBankListItem;
    revisions: QuestionBankRevisionView[];
    revisionPagination: { total: number; limit: number; offset: number };
    events: QuestionBankEventView[];
    eventPagination: { total: number; limit: number; offset: number };
    aiImports: QuestionBankAiImportView[];
  }> {
    return this.readSnapshot(async (tx) => {
      const itemRows = await tx.query<ItemListRow>(
        `select i.id, i.class_id, i.subject_id, i.origin, i.created_by_profile_id,
                i.archived_at, i.created_at, i.updated_at,
                current_revision.id as revision_id,
                current_revision.revision_number,
                current_revision.status as revision_status,
                current_revision.type as revision_type,
                current_revision.prompt as revision_prompt,
                current_revision.difficulty as revision_difficulty,
                current_revision.answer_status as revision_answer_status
         from question_bank_items i
         left join lateral (
           select r.id, r.revision_number, r.status, r.type, r.prompt, r.difficulty, r.answer_status
           from question_bank_revisions r
           where r.item_id = i.id
           order by case r.status when 'review' then 0 when 'draft' then 1 when 'published' then 2 else 3 end,
                    r.revision_number desc
           limit 1
         ) current_revision on true
         where i.id = $1`,
        [itemId],
      );
      const item = itemRows[0];
      if (!item) throw new AppError("NOT_FOUND", "سؤال بنك الأسئلة غير موجود", 404);

      const revisions = await tx.query<RevisionRow>(
        `select id, item_id, revision_number, status, type, prompt, options, correct_option_index,
                answer_text, answer_status, difficulty, explanation, method, created_by_profile_id,
                submitted_for_review_by_profile_id, submitted_for_review_at,
                published_by_profile_id, published_at, created_at
         from question_bank_revisions
         where item_id = $1
         order by revision_number desc
         limit $2 offset $3`,
        [itemId, revisionLimit, revisionOffset],
      );
      const revisionTotals = await tx.query<{ count: string }>(
        "select count(*) from question_bank_revisions where item_id = $1",
        [itemId],
      );
      const revisionIds = revisions.map((revision) => revision.id);
      const lessons = revisionIds.length
        ? await tx.query<LessonLinkRow>(
            `select revision_id, lesson_id, position
             from question_bank_revision_lessons
             where revision_id = any($1::uuid[])
             order by revision_id, position`,
            [revisionIds],
          )
        : [];
      const sources = revisionIds.length
        ? await tx.query<SourceRow>(
            `select revision_id, position, media_asset_id, page_number, input_checksum_sha256,
                    ocr_extraction_id, content_source_asset_id, source_quote
             from question_bank_revision_sources
             where revision_id = any($1::uuid[])
             order by revision_id, position`,
            [revisionIds],
          )
        : [];
      const events = await tx.query<EventRow>(
        `select id, item_id, revision_id, action, actor_profile_id, note, created_at
         from question_bank_events where item_id = $1
         order by created_at desc, id desc limit $2 offset $3`,
        [itemId, eventLimit, eventOffset],
      );
      const eventTotals = await tx.query<{ count: string }>(
        "select count(*) from question_bank_events where item_id = $1",
        [itemId],
      );
      const imports = await tx.query<ImportRow>(
        `select ai_output_id, approved_review_revision, question_locator, item_id, revision_id,
                prompt_key, prompt_version, generation_mode, imported_by_profile_id, imported_at
         from question_bank_ai_imports where item_id = $1 order by imported_at desc`,
        [itemId],
      );

      const lessonMap = new Map<string, string[]>();
      for (const link of lessons) {
        const list = lessonMap.get(link.revision_id) ?? [];
        list.push(link.lesson_id);
        lessonMap.set(link.revision_id, list);
      }
      const sourceMap = new Map<string, QuestionBankSourceView[]>();
      for (const source of sources) {
        const list = sourceMap.get(source.revision_id) ?? [];
        list.push({
          position: source.position,
          mediaAssetId: source.media_asset_id,
          pageNumber: source.page_number,
          inputChecksumSha256: source.input_checksum_sha256,
          ocrExtractionId: source.ocr_extraction_id,
          contentSourceAssetId: source.content_source_asset_id,
          quote: source.source_quote,
        });
        sourceMap.set(source.revision_id, list);
      }

      return {
        item: mapListItem(item),
        revisions: revisions.map((revision) => ({
          id: revision.id,
          revisionNumber: revision.revision_number,
          status: revision.status,
          question: questionInput(
            normalizedQuestion({
              prompt: revision.prompt,
              type: revision.type,
              options: Array.isArray(revision.options)
                ? revision.options.filter((value): value is string => typeof value === "string")
                : [],
              correctOptionIndex: revision.correct_option_index,
              answerText: revision.answer_text,
              answerStatus: revision.answer_status,
              difficulty: revision.difficulty,
              explanation: revision.explanation,
              method: revision.method,
            }),
          ),
          lessonIds: lessonMap.get(revision.id) ?? [],
          sources: sourceMap.get(revision.id) ?? [],
          createdByProfileId: revision.created_by_profile_id,
          submittedForReviewByProfileId: revision.submitted_for_review_by_profile_id,
          submittedForReviewAt: revision.submitted_for_review_at,
          publishedByProfileId: revision.published_by_profile_id,
          publishedAt: revision.published_at,
          createdAt: revision.created_at,
        })),
        revisionPagination: {
          total: Number(revisionTotals[0]?.count ?? 0),
          limit: revisionLimit,
          offset: revisionOffset,
        },
        events: events.map((event) => ({
          id: Number(event.id),
          revisionId: event.revision_id,
          action: event.action,
          actorProfileId: event.actor_profile_id,
          note: event.note,
          createdAt: event.created_at,
        })),
        eventPagination: {
          total: Number(eventTotals[0]?.count ?? 0),
          limit: eventLimit,
          offset: eventOffset,
        },
        aiImports: imports.map(mapImport),
      };
    });
  }

  async createManual(
    actorProfileId: string,
    input: CreateManualQuestionInput,
  ): Promise<{ itemId: string; revisionId: string }> {
    const question = normalizedQuestion(input.question);
    const lessonIds = await this.normalizeAndValidateScope(this.database, input);
    return this.database.transaction(async (tx) => {
      await this.assertOfferingAndLessons(tx, input.classId, input.subjectId, lessonIds);
      const items = await tx.query<{ id: string }>(
        `insert into question_bank_items (class_id, subject_id, origin, created_by_profile_id)
         values ($1, $2, 'manual', $3) returning id`,
        [input.classId, input.subjectId, actorProfileId],
      );
      const itemId = items[0]?.id;
      if (!itemId) throw new AppError("INTERNAL_ERROR", "تعذر إنشاء سؤال بنك الأسئلة", 500);
      const revisionId = await this.insertRevision(tx, itemId, 1, actorProfileId, question, lessonIds, []);
      await this.insertEvent(tx, itemId, revisionId, "create", actorProfileId, null);
      return { itemId, revisionId };
    });
  }

  async importApprovedAiOutput(
    actorProfileId: string,
    input: ImportApprovedAiOutputInput,
  ): Promise<{ imports: QuestionBankAiImportView[]; replayed: boolean }> {
    const lessonIds = await this.normalizeAndValidateScope(this.database, input);
    return this.database.transaction(async (tx) => {
      await this.assertOfferingAndLessons(tx, input.classId, input.subjectId, lessonIds);
      const contexts = await tx.query<AiOutputContextRow>(
        `select o.id as output_id, u.input_payload, j.prompt_key, j.prompt_version
         from ai_outputs o
         join ai_job_units u on u.id = o.job_unit_id
         join ai_jobs j on j.id = u.job_id
         where o.id = $1
         for update of o`,
        [input.outputId],
      );
      const context = contexts[0];
      if (!context) throw new AppError("NOT_FOUND", "مخرج الذكاء الاصطناعي غير موجود", 404);
      const latestRows = await tx.query<ReviewRow>(
        `select revision, action, reviewed_output
         from ai_output_review_events
         where ai_output_id = $1
         order by revision desc limit 1
         for update`,
        [input.outputId],
      );
      const latest = latestRows[0];
      if (!latest || latest.action !== "approve" || latest.reviewed_output === null) {
        throw new AppError("CONFLICT", "لا يمكن الاستيراد قبل الاعتماد النهائي للمخرج", 409);
      }
      const requestResult = aiGenerationRequestSchema.safeParse(context.input_payload);
      if (!requestResult.success) {
        throw new AppError("INTERNAL_ERROR", "طلب الذكاء الاصطناعي المخزن لا يطابق العقد", 500);
      }
      const request = requestResult.data;
      const output = validateAdminApprovalOutput(request, latest.reviewed_output);
      const entries = questionEntries(output);
      if (entries.length === 0) {
        throw new AppError("BAD_REQUEST", "المخرج المعتمد لا يحتوي أسئلة قابلة للإضافة إلى البنك", 400);
      }

      const existing = await tx.query<ImportRow>(
        `select ai_output_id, approved_review_revision, question_locator, item_id, revision_id,
                prompt_key, prompt_version, generation_mode, imported_by_profile_id, imported_at
         from question_bank_ai_imports
         where ai_output_id = $1 and approved_review_revision = $2
         order by question_locator`,
        [input.outputId, latest.revision],
      );
      if (existing.length > 0) {
        const expected = [...entries.map((entry) => entry.locator)].sort();
        const actual = existing.map((row) => row.question_locator).sort();
        if (
          expected.length !== actual.length ||
          expected.some((locator, index) => locator !== actual[index])
        ) {
          throw new AppError("INTERNAL_ERROR", "سجل استيراد بنك الأسئلة غير متسق", 500);
        }
        return { imports: existing.map(mapImport), replayed: true };
      }

      const imports: QuestionBankAiImportView[] = [];
      for (const entry of entries) {
        const question = normalizedQuestion(entry.question);
        const items = await tx.query<{ id: string }>(
          `insert into question_bank_items (class_id, subject_id, origin, created_by_profile_id)
           values ($1, $2, 'ai', $3) returning id`,
          [input.classId, input.subjectId, actorProfileId],
        );
        const itemId = items[0]?.id;
        if (!itemId) throw new AppError("INTERNAL_ERROR", "تعذر إنشاء سؤال مستورد", 500);
        const sources = question.sourceEvidence.map((evidence, position) => {
          const source = sourceChunk(request, evidence);
          return {
            position,
            mediaAssetId: evidence.mediaAssetId,
            pageNumber: evidence.pageNumber,
            inputChecksumSha256: source.inputChecksumSha256,
            ocrExtractionId: evidence.ocrExtractionId ?? source.ocrExtractionId,
            contentSourceAssetId: source.contentSourceAssetId ?? null,
            quote: evidence.quote?.trim() || null,
          };
        });
        const revisionId = await this.insertRevision(
          tx,
          itemId,
          1,
          actorProfileId,
          question,
          lessonIds,
          sources,
        );
        const inserted = await tx.query<ImportRow>(
          `insert into question_bank_ai_imports (
             ai_output_id, approved_review_revision, question_locator, item_id, revision_id,
             prompt_key, prompt_version, generation_mode, imported_by_profile_id
           ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           returning ai_output_id, approved_review_revision, question_locator, item_id, revision_id,
                     prompt_key, prompt_version, generation_mode, imported_by_profile_id, imported_at`,
          [
            input.outputId,
            latest.revision,
            entry.locator,
            itemId,
            revisionId,
            context.prompt_key,
            context.prompt_version,
            request.mode,
            actorProfileId,
          ],
        );
        const importRow = inserted[0];
        if (!importRow) throw new AppError("INTERNAL_ERROR", "تعذر حفظ مصدر السؤال المستورد", 500);
        await this.insertEvent(tx, itemId, revisionId, "import", actorProfileId, null);
        imports.push(mapImport(importRow));
      }
      return { imports, replayed: false };
    });
  }

  async editItem(
    actorProfileId: string,
    itemId: string,
    questionInputValue: QuestionBankQuestionInput,
  ): Promise<{ revisionId: string }> {
    const question = normalizedQuestion(questionInputValue);
    return this.database.transaction(async (tx) => {
      const item = await this.lockItem(tx, itemId);
      if (item.archived_at) throw new AppError("CONFLICT", "السؤال مؤرشف ولا يمكن تعديله", 409);
      const currentRows = await tx.query<RevisionRow>(
        `select id, item_id, revision_number, status, type, prompt, options, correct_option_index,
                answer_text, answer_status, difficulty, explanation, method, created_by_profile_id,
                submitted_for_review_by_profile_id, submitted_for_review_at,
                published_by_profile_id, published_at, created_at
         from question_bank_revisions
         where item_id = $1 and status in ('review', 'draft', 'published')
         order by case status when 'review' then 0 when 'draft' then 1 else 2 end, revision_number desc
         limit 1 for update`,
        [itemId],
      );
      const current = currentRows[0];
      if (!current) throw new AppError("INTERNAL_ERROR", "لا توجد نسخة قابلة للتعديل", 500);
      if (current.status === "review") {
        throw new AppError("CONFLICT", "أعد السؤال من المراجعة قبل إنشاء تعديل جديد", 409);
      }
      if (current.status === "draft") {
        await tx.query("update question_bank_revisions set status = 'archived' where id = $1", [current.id]);
      }
      const nextRows = await tx.query<{ next_revision: number }>(
        "select coalesce(max(revision_number), 0)::int + 1 as next_revision from question_bank_revisions where item_id = $1",
        [itemId],
      );
      const nextRevision = nextRows[0]?.next_revision ?? current.revision_number + 1;
      const lessonRows = await tx.query<LessonLinkRow>(
        "select revision_id, lesson_id, position from question_bank_revision_lessons where revision_id = $1 order by position",
        [current.id],
      );
      const sourceRows = await tx.query<SourceRow>(
        `select revision_id, position, media_asset_id, page_number, input_checksum_sha256,
                ocr_extraction_id, content_source_asset_id, source_quote
         from question_bank_revision_sources where revision_id = $1 order by position`,
        [current.id],
      );
      const revisionId = await this.insertRevision(
        tx,
        itemId,
        nextRevision,
        actorProfileId,
        question,
        lessonRows.map((row) => row.lesson_id),
        sourceRows.map((row) => ({
          position: row.position,
          mediaAssetId: row.media_asset_id,
          pageNumber: row.page_number,
          inputChecksumSha256: row.input_checksum_sha256,
          ocrExtractionId: row.ocr_extraction_id,
          contentSourceAssetId: row.content_source_asset_id,
          quote: row.source_quote,
        })),
      );
      await this.insertEvent(tx, itemId, revisionId, "edit", actorProfileId, null);
      return { revisionId };
    });
  }

  async submitForReview(actorProfileId: string, itemId: string): Promise<void> {
    await this.database.transaction(async (tx) => {
      await this.lockItem(tx, itemId);
      const rows = await tx.query<{ id: string }>(
        "select id from question_bank_revisions where item_id = $1 and status = 'draft' for update",
        [itemId],
      );
      const revision = rows[0];
      if (!revision) throw new AppError("CONFLICT", "لا توجد مسودة جاهزة للمراجعة", 409);
      await tx.query(
        `update question_bank_revisions
         set status = 'review', submitted_for_review_by_profile_id = $2, submitted_for_review_at = now()
         where id = $1`,
        [revision.id, actorProfileId],
      );
      await this.insertEvent(tx, itemId, revision.id, "submit_review", actorProfileId, null);
    });
  }

  async rejectReview(actorProfileId: string, itemId: string, note: string): Promise<void> {
    const normalizedNote = note.trim();
    if (!normalizedNote) throw new AppError("BAD_REQUEST", "سبب رفض المراجعة مطلوب", 400);
    await this.database.transaction(async (tx) => {
      await this.lockItem(tx, itemId);
      const rows = await tx.query<{ id: string }>(
        "select id from question_bank_revisions where item_id = $1 and status = 'review' for update",
        [itemId],
      );
      const revision = rows[0];
      if (!revision) throw new AppError("CONFLICT", "لا توجد نسخة قيد المراجعة", 409);
      await tx.query("update question_bank_revisions set status = 'draft' where id = $1", [revision.id]);
      await this.insertEvent(tx, itemId, revision.id, "reject", actorProfileId, normalizedNote);
    });
  }

  async publish(actorProfileId: string, itemId: string): Promise<void> {
    await this.database.transaction(async (tx) => {
      await this.lockItem(tx, itemId);
      const rows = await tx.query<{ id: string; answer_status: AiQuestion["answerStatus"] }>(
        `select id, answer_status from question_bank_revisions
         where item_id = $1 and status = 'review' for update`,
        [itemId],
      );
      const revision = rows[0];
      if (!revision) throw new AppError("CONFLICT", "لا توجد نسخة قيد المراجعة للنشر", 409);
      if (revision.answer_status !== "known") {
        throw new AppError("CONFLICT", "لا يمكن نشر سؤال بإجابة غير محسومة", 409);
      }
      await tx.query(
        "update question_bank_revisions set status = 'archived' where item_id = $1 and status = 'published'",
        [itemId],
      );
      await tx.query(
        `update question_bank_revisions
         set status = 'published', published_by_profile_id = $2, published_at = now()
         where id = $1`,
        [revision.id, actorProfileId],
      );
      await this.insertEvent(tx, itemId, revision.id, "publish", actorProfileId, null);
    });
  }

  private async readSnapshot<T>(work: (tx: QueryExecutor) => Promise<T>): Promise<T> {
    return this.database.transaction(async (tx) => {
      await tx.query("set transaction isolation level repeatable read");
      return work(tx);
    });
  }

  private normalizeAndValidateScope(_executor: QueryExecutor, input: QuestionBankScopeInput): string[] {
    const lessonIds = [...new Set(input.lessonIds)];
    if (lessonIds.length === 0) throw new AppError("BAD_REQUEST", "يجب ربط السؤال بدرس واحد على الأقل", 400);
    return lessonIds;
  }

  private async assertOfferingAndLessons(
    executor: QueryExecutor,
    classId: string,
    subjectId: string,
    lessonIds: readonly string[],
  ): Promise<void> {
    const offerings = await executor.query<{ class_id: string }>(
      "select class_id from subject_class_links where class_id = $1 and subject_id = $2",
      [classId, subjectId],
    );
    if (!offerings[0]) throw new AppError("BAD_REQUEST", "الصف والمادة لا يشكلان عرضًا منهجيًا صالحًا", 400);
    const lessons = await executor.query<{ id: string }>(
      `select id from lessons
       where class_id = $1 and subject_id = $2 and id = any($3::uuid[])`,
      [classId, subjectId, lessonIds],
    );
    if (lessons.length !== lessonIds.length) {
      throw new AppError("BAD_REQUEST", "أحد الدروس لا ينتمي إلى الصف والمادة المحددين", 400);
    }
  }

  private async insertRevision(
    executor: QueryExecutor,
    itemId: string,
    revisionNumber: number,
    actorProfileId: string,
    question: AiQuestion,
    lessonIds: readonly string[],
    sources: readonly QuestionBankSourceView[],
  ): Promise<string> {
    const rows = await executor.query<{ id: string }>(
      `insert into question_bank_revisions (
         item_id, revision_number, status, type, prompt, options, correct_option_index,
         answer_text, answer_status, difficulty, explanation, method, created_by_profile_id
       ) values ($1, $2, 'draft', $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12)
       returning id`,
      [
        itemId,
        revisionNumber,
        question.type,
        question.prompt.trim(),
        json(question.options),
        question.correctOptionIndex,
        question.answerText?.trim() || null,
        question.answerStatus,
        question.difficulty,
        question.explanation?.trim() || null,
        question.method?.trim() || null,
        actorProfileId,
      ],
    );
    const revisionId = rows[0]?.id;
    if (!revisionId) throw new AppError("INTERNAL_ERROR", "تعذر حفظ نسخة السؤال", 500);
    if (lessonIds.length > 0) {
      await executor.query(
        `insert into question_bank_revision_lessons (revision_id, lesson_id, position)
         select $1, x.lesson_id, x.position
         from jsonb_to_recordset($2::jsonb) as x(lesson_id uuid, position integer)`,
        [revisionId, json(lessonIds.map((lessonId, position) => ({ lesson_id: lessonId, position })))],
      );
    }
    if (sources.length > 0) {
      await executor.query(
        `insert into question_bank_revision_sources (
           revision_id, position, media_asset_id, page_number, input_checksum_sha256,
           ocr_extraction_id, content_source_asset_id, source_quote
         )
         select $1, x.position, x.media_asset_id, x.page_number, x.input_checksum_sha256,
                x.ocr_extraction_id, x.content_source_asset_id, x.source_quote
         from jsonb_to_recordset($2::jsonb) as x(
           position integer, media_asset_id uuid, page_number integer, input_checksum_sha256 text,
           ocr_extraction_id uuid, content_source_asset_id uuid, source_quote text
         )`,
        [
          revisionId,
          json(
            sources.map((source) => ({
              position: source.position,
              media_asset_id: source.mediaAssetId,
              page_number: source.pageNumber,
              input_checksum_sha256: source.inputChecksumSha256,
              ocr_extraction_id: source.ocrExtractionId,
              content_source_asset_id: source.contentSourceAssetId,
              source_quote: source.quote,
            })),
          ),
        ],
      );
    }
    return revisionId;
  }

  private async insertEvent(
    executor: QueryExecutor,
    itemId: string,
    revisionId: string | null,
    action: QuestionBankEventView["action"],
    actorProfileId: string,
    note: string | null,
  ): Promise<void> {
    await executor.query(
      `insert into question_bank_events (item_id, revision_id, action, actor_profile_id, note)
       values ($1, $2, $3, $4, $5)`,
      [itemId, revisionId, action, actorProfileId, note],
    );
  }

  private async lockItem(executor: QueryExecutor, itemId: string): Promise<ItemRow> {
    const rows = await executor.query<ItemRow>(
      `select id, class_id, subject_id, origin, created_by_profile_id, archived_at, created_at, updated_at
       from question_bank_items where id = $1 for update`,
      [itemId],
    );
    const item = rows[0];
    if (!item) throw new AppError("NOT_FOUND", "سؤال بنك الأسئلة غير موجود", 404);
    return item;
  }
}
