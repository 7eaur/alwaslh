import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

export type QuizBuilderStatus = "draft" | "review" | "published" | "archived";

export interface QuizBuilderScopeInput {
  classId: string;
  subjectId: string;
  lessonIds: readonly string[];
}

export interface CreateQuizInput extends QuizBuilderScopeInput {
  title: string;
  description?: string | null;
  shuffleVersions?: boolean;
}

export interface UpdateQuizInput {
  title: string;
  description?: string | null;
  shuffleVersions?: boolean;
}

export interface QuizVersionQuestionRef {
  questionBankItemId: string;
  questionBankRevisionId: string;
}

export interface CreateQuizVersionInput {
  label: string;
  shuffleOptions?: boolean;
  questions: readonly QuizVersionQuestionRef[];
}

export interface QuizBuilderListFilters {
  classId?: string;
  subjectId?: string;
  status?: QuizBuilderStatus;
  search?: string;
  limit: number;
  offset: number;
}

export interface QuizBuilderListItem {
  id: string;
  classId: string | null;
  subjectId: string | null;
  title: string;
  description: string | null;
  status: QuizBuilderStatus;
  shuffleVersions: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizBuilderQuestionView {
  id: string;
  position: number;
  lessonId: string | null;
  type: "multiple_choice" | "true_false" | "direct";
  prompt: string;
  options: Array<{ key: string; text: string; isCorrect: boolean; position: number }>;
  answerText: string | null;
  explanation: string | null;
  difficulty: number | null;
  sourcePage: number | null;
  sourceReference: string | null;
  questionBankItemId: string | null;
  questionBankRevisionId: string | null;
  metadata: unknown;
}

export interface QuizBuilderVersionView {
  id: string;
  versionNumber: number;
  label: string;
  shuffleOptions: boolean;
  questions: QuizBuilderQuestionView[];
}

export interface QuizBuilderDetail {
  quiz: QuizBuilderListItem & {
    submittedForReviewByProfileId: string | null;
    submittedForReviewAt: Date | null;
    publishedByProfileId: string | null;
  };
  lessons: Array<{ id: string; title: string; position: number }>;
  versions: QuizBuilderVersionView[];
  events: Array<{
    id: number;
    versionId: string | null;
    action: string;
    actorProfileId: string;
    note: string | null;
    createdAt: Date;
  }>;
}

interface QuizRow {
  id: string;
  class_id: string | null;
  subject_id: string | null;
  title: string;
  description: string | null;
  status: QuizBuilderStatus;
  shuffle_versions: boolean;
  submitted_for_review_by_profile_id: string | null;
  submitted_for_review_at: Date | null;
  published_by_profile_id: string | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface BankRevisionRow {
  revision_id: string;
  item_id: string;
  revision_number: number;
  class_id: string;
  subject_id: string;
  type: "multiple_choice" | "true_false" | "direct";
  prompt: string;
  options: unknown;
  correct_option_index: number | null;
  answer_text: string | null;
  difficulty: "easy" | "medium" | "hard";
  explanation: string | null;
  method: string | null;
  lesson_ids: string[];
  sources: unknown;
}

function asListItem(row: QuizRow): QuizBuilderListItem {
  return {
    id: row.id,
    classId: row.class_id,
    subjectId: row.subject_id,
    title: row.title,
    description: row.description,
    status: row.status,
    shuffleVersions: row.shuffle_versions,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new AppError("BAD_REQUEST", `${field} مطلوب`, 400);
  return normalized;
}

function difficultyValue(value: BankRevisionRow["difficulty"]): number {
  if (value === "easy") return 1;
  if (value === "hard") return 5;
  return 3;
}

export class QuizBuilderService {
  constructor(private readonly database: Database) {}

  async list(filters: QuizBuilderListFilters): Promise<{
    items: QuizBuilderListItem[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const search = filters.search?.trim() || null;
    const rows = await this.database.query<QuizRow & { total_count: string }>(
      `select q.id, q.class_id, q.subject_id, q.title, q.description, q.status,
              q.shuffle_versions, q.submitted_for_review_by_profile_id, q.submitted_for_review_at,
              q.published_by_profile_id, q.published_at, q.created_at, q.updated_at,
              count(*) over()::text as total_count
       from quizzes q
       where ($1::uuid is null or q.class_id = $1)
         and ($2::uuid is null or q.subject_id = $2)
         and ($3::quiz_status is null or q.status = $3)
         and ($4::text is null or q.title ilike '%' || $4 || '%')
       order by q.created_at desc, q.id
       limit $5 offset $6`,
      [
        filters.classId ?? null,
        filters.subjectId ?? null,
        filters.status ?? null,
        search,
        filters.limit,
        filters.offset,
      ],
    );
    const total = Number(rows[0]?.total_count ?? 0);
    return {
      items: rows.map(asListItem),
      pagination: { total, limit: filters.limit, offset: filters.offset },
    };
  }

  async detail(quizId: string): Promise<QuizBuilderDetail> {
    return this.database.transaction(async (tx) => {
      await tx.query("set transaction isolation level repeatable read");
      const quizRows = await tx.query<QuizRow>(
        `select id, class_id, subject_id, title, description, status, shuffle_versions,
                submitted_for_review_by_profile_id, submitted_for_review_at,
                published_by_profile_id, published_at, created_at, updated_at
         from quizzes where id = $1`,
        [quizId],
      );
      const quiz = quizRows[0];
      if (!quiz) throw new AppError("NOT_FOUND", "الاختبار غير موجود", 404);

      const lessons = await tx.query<{ id: string; title: string; position: number }>(
        `select l.id, l.title, l.position
         from quiz_lessons ql join lessons l on l.id = ql.lesson_id
         where ql.quiz_id = $1 order by ql.position, l.id`,
        [quizId],
      );
      const versions = await tx.query<{
        id: string;
        version_number: number;
        label: string | null;
        shuffle_options: boolean;
      }>(
        `select id, version_number, label, shuffle_options
         from quiz_versions where quiz_id = $1 order by version_number, id`,
        [quizId],
      );
      const versionIds = versions.map((version) => version.id);
      const questions = versionIds.length
        ? await tx.query<{
            id: string;
            quiz_version_id: string;
            position: number;
            lesson_id: string | null;
            type: QuizBuilderQuestionView["type"];
            prompt: string;
            answer_text: string | null;
            explanation: string | null;
            difficulty: number | null;
            source_page: number | null;
            source_reference: string | null;
            question_bank_item_id: string | null;
            question_bank_revision_id: string | null;
            metadata: unknown;
          }>(
            `select id, quiz_version_id, position, lesson_id, type, prompt, answer_text, explanation,
                    difficulty, source_page, source_reference, question_bank_item_id,
                    question_bank_revision_id, metadata
             from questions where quiz_version_id = any($1::uuid[])
             order by quiz_version_id, position, id`,
            [versionIds],
          )
        : [];
      const questionIds = questions.map((question) => question.id);
      const options = questionIds.length
        ? await tx.query<{
            question_id: string;
            label: string;
            is_correct: boolean;
            position: number;
          }>(
            `select question_id, label, is_correct, position
             from question_options where question_id = any($1::uuid[])
             order by question_id, position`,
            [questionIds],
          )
        : [];
      const optionMap = new Map<string, QuizBuilderQuestionView["options"]>();
      for (const option of options) {
        const list = optionMap.get(option.question_id) ?? [];
        list.push({
          key: `option-${option.position + 1}`,
          text: option.label,
          isCorrect: option.is_correct,
          position: option.position,
        });
        optionMap.set(option.question_id, list);
      }
      const questionMap = new Map<string, QuizBuilderQuestionView[]>();
      for (const question of questions) {
        const list = questionMap.get(question.quiz_version_id) ?? [];
        list.push({
          id: question.id,
          position: question.position,
          lessonId: question.lesson_id,
          type: question.type,
          prompt: question.prompt,
          options: optionMap.get(question.id) ?? [],
          answerText: question.answer_text,
          explanation: question.explanation,
          difficulty: question.difficulty,
          sourcePage: question.source_page,
          sourceReference: question.source_reference,
          questionBankItemId: question.question_bank_item_id,
          questionBankRevisionId: question.question_bank_revision_id,
          metadata: question.metadata,
        });
        questionMap.set(question.quiz_version_id, list);
      }
      const events = await tx.query<{
        id: string;
        quiz_version_id: string | null;
        action: string;
        actor_profile_id: string;
        note: string | null;
        created_at: Date;
      }>(
        `select id, quiz_version_id, action, actor_profile_id, note, created_at
         from quiz_builder_events where quiz_id = $1 order by created_at desc, id desc limit 200`,
        [quizId],
      );
      return {
        quiz: {
          ...asListItem(quiz),
          submittedForReviewByProfileId: quiz.submitted_for_review_by_profile_id,
          submittedForReviewAt: quiz.submitted_for_review_at,
          publishedByProfileId: quiz.published_by_profile_id,
        },
        lessons: lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, position: lesson.position })),
        versions: versions.map((version) => ({
          id: version.id,
          versionNumber: version.version_number,
          label: version.label ?? `النموذج ${version.version_number}`,
          shuffleOptions: version.shuffle_options,
          questions: questionMap.get(version.id) ?? [],
        })),
        events: events.map((event) => ({
          id: Number(event.id),
          versionId: event.quiz_version_id,
          action: event.action,
          actorProfileId: event.actor_profile_id,
          note: event.note,
          createdAt: event.created_at,
        })),
      };
    });
  }

  async create(actorProfileId: string, input: CreateQuizInput): Promise<{ quizId: string }> {
    const title = normalizeText(input.title, "عنوان الاختبار");
    const description = input.description?.trim() || null;
    const lessonIds = [...new Set(input.lessonIds)];
    if (lessonIds.length === 0) throw new AppError("BAD_REQUEST", "اختر درسًا واحدًا على الأقل", 400);
    return this.database.transaction(async (tx) => {
      await this.assertScope(tx, input.classId, input.subjectId, lessonIds);
      const rows = await tx.query<{ id: string }>(
        `insert into quizzes (
           title, description, status, shuffle_versions, class_id, subject_id, created_by_profile_id
         ) values ($1, $2, 'draft', $3, $4, $5, $6) returning id`,
        [title, description, input.shuffleVersions ?? true, input.classId, input.subjectId, actorProfileId],
      );
      const quizId = rows[0]?.id;
      if (!quizId) throw new AppError("INTERNAL_ERROR", "تعذر إنشاء الاختبار", 500);
      await this.replaceLessonLinks(tx, quizId, lessonIds);
      await this.event(tx, quizId, null, "create", actorProfileId, null);
      return { quizId };
    });
  }

  async update(actorProfileId: string, quizId: string, input: UpdateQuizInput): Promise<void> {
    const title = normalizeText(input.title, "عنوان الاختبار");
    const description = input.description?.trim() || null;
    await this.database.transaction(async (tx) => {
      await this.lockDraftQuiz(tx, quizId);
      await tx.query(`update quizzes set title = $2, description = $3, shuffle_versions = $4 where id = $1`, [
        quizId,
        title,
        description,
        input.shuffleVersions ?? true,
      ]);
      await this.event(tx, quizId, null, "edit", actorProfileId, null);
    });
  }

  async addVersion(
    actorProfileId: string,
    quizId: string,
    input: CreateQuizVersionInput,
  ): Promise<{ versionId: string }> {
    const label = normalizeText(input.label, "اسم النموذج");
    return this.database.transaction(async (tx) => {
      const quiz = await this.lockDraftQuiz(tx, quizId);
      const nextRows = await tx.query<{ next_number: number }>(
        "select coalesce(max(version_number), 0)::int + 1 as next_number from quiz_versions where quiz_id = $1",
        [quizId],
      );
      const versionRows = await tx.query<{ id: string }>(
        `insert into quiz_versions (quiz_id, version_number, label, shuffle_options)
         values ($1, $2, $3, $4) returning id`,
        [quizId, nextRows[0]?.next_number ?? 1, label, input.shuffleOptions ?? true],
      );
      const versionId = versionRows[0]?.id;
      if (!versionId) throw new AppError("INTERNAL_ERROR", "تعذر إنشاء نموذج الاختبار", 500);
      await this.materializeQuestions(tx, quiz, quizId, versionId, input.questions);
      await this.event(tx, quizId, versionId, "version_add", actorProfileId, null);
      return { versionId };
    });
  }

  async replaceVersionQuestions(
    actorProfileId: string,
    quizId: string,
    versionId: string,
    questions: readonly QuizVersionQuestionRef[],
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      const quiz = await this.lockDraftQuiz(tx, quizId);
      const versions = await tx.query<{ id: string }>(
        "select id from quiz_versions where id = $1 and quiz_id = $2 for update",
        [versionId, quizId],
      );
      if (!versions[0]) throw new AppError("NOT_FOUND", "نموذج الاختبار غير موجود", 404);
      await tx.query("delete from questions where quiz_version_id = $1", [versionId]);
      await this.materializeQuestions(tx, quiz, quizId, versionId, questions);
      await this.event(tx, quizId, versionId, "version_update", actorProfileId, null);
    });
  }

  async removeVersion(actorProfileId: string, quizId: string, versionId: string): Promise<void> {
    await this.database.transaction(async (tx) => {
      await this.lockDraftQuiz(tx, quizId);
      const rows = await tx.query<{ label: string | null }>(
        "select label from quiz_versions where id = $1 and quiz_id = $2 for update",
        [versionId, quizId],
      );
      const version = rows[0];
      if (!version) throw new AppError("NOT_FOUND", "نموذج الاختبار غير موجود", 404);
      await tx.query("delete from quiz_versions where id = $1", [versionId]);
      await this.event(tx, quizId, null, "version_remove", actorProfileId, version.label ?? "نموذج محذوف");
    });
  }

  async submitForReview(actorProfileId: string, quizId: string): Promise<void> {
    await this.database.transaction(async (tx) => {
      await this.lockDraftQuiz(tx, quizId);
      const counts = await tx.query<{ versions: string; empty_versions: string }>(
        `select count(*)::text as versions,
                count(*) filter (where not exists (select 1 from questions q where q.quiz_version_id = v.id))::text as empty_versions
         from quiz_versions v where v.quiz_id = $1`,
        [quizId],
      );
      if (Number(counts[0]?.versions ?? 0) === 0) {
        throw new AppError("CONFLICT", "أضف نموذج اختبار واحدًا على الأقل قبل المراجعة", 409);
      }
      if (Number(counts[0]?.empty_versions ?? 0) > 0) {
        throw new AppError("CONFLICT", "كل نموذج يجب أن يحتوي سؤالًا واحدًا على الأقل", 409);
      }
      await tx.query(
        `update quizzes set status = 'review', submitted_for_review_by_profile_id = $2,
                            submitted_for_review_at = now()
         where id = $1`,
        [quizId, actorProfileId],
      );
      await this.event(tx, quizId, null, "submit_review", actorProfileId, null);
    });
  }

  async rejectReview(actorProfileId: string, quizId: string, note: string): Promise<void> {
    const reason = normalizeText(note, "سبب الرفض");
    await this.database.transaction(async (tx) => {
      const rows = await tx.query<{ id: string }>(
        "select id from quizzes where id = $1 and status = 'review' for update",
        [quizId],
      );
      if (!rows[0]) throw new AppError("CONFLICT", "الاختبار ليس قيد المراجعة", 409);
      await tx.query("update quizzes set status = 'draft' where id = $1", [quizId]);
      await this.event(tx, quizId, null, "reject", actorProfileId, reason);
    });
  }

  async publish(actorProfileId: string, quizId: string): Promise<void> {
    await this.database.transaction(async (tx) => {
      const rows = await tx.query<{ id: string }>(
        "select id from quizzes where id = $1 and status = 'review' for update",
        [quizId],
      );
      if (!rows[0]) throw new AppError("CONFLICT", "الاختبار ليس قيد المراجعة", 409);
      await tx.query(
        `update quizzes set status = 'published', published_by_profile_id = $2, published_at = now()
         where id = $1`,
        [quizId, actorProfileId],
      );
      await this.event(tx, quizId, null, "publish", actorProfileId, null);
    });
  }

  async archive(quizId: string): Promise<void> {
    await this.database.transaction(async (tx) => {
      const rows = await tx.query<{ status: QuizBuilderStatus }>(
        "select status from quizzes where id = $1 for update",
        [quizId],
      );
      const quiz = rows[0];
      if (!quiz) throw new AppError("NOT_FOUND", "الاختبار غير موجود", 404);
      if (quiz.status === "review")
        throw new AppError("CONFLICT", "أعد الاختبار من المراجعة قبل أرشفته", 409);
      await tx.query("update quizzes set status = 'archived' where id = $1", [quizId]);
    });
  }

  private async lockDraftQuiz(executor: QueryExecutor, quizId: string): Promise<QuizRow> {
    const rows = await executor.query<QuizRow>(
      `select id, class_id, subject_id, title, description, status, shuffle_versions,
              submitted_for_review_by_profile_id, submitted_for_review_at,
              published_by_profile_id, published_at, created_at, updated_at
       from quizzes where id = $1 for update`,
      [quizId],
    );
    const quiz = rows[0];
    if (!quiz) throw new AppError("NOT_FOUND", "الاختبار غير موجود", 404);
    if (quiz.status !== "draft") throw new AppError("CONFLICT", "يمكن تعديل الاختبار وهو مسودة فقط", 409);
    if (!quiz.class_id || !quiz.subject_id)
      throw new AppError("CONFLICT", "الاختبار القديم لا يملك نطاق البناء الجديد", 409);
    return quiz;
  }

  private async assertScope(
    executor: QueryExecutor,
    classId: string,
    subjectId: string,
    lessonIds: readonly string[],
  ) {
    const offering = await executor.query<{ class_id: string }>(
      "select class_id from subject_class_links where class_id = $1 and subject_id = $2",
      [classId, subjectId],
    );
    if (!offering[0]) throw new AppError("BAD_REQUEST", "الصف والمادة لا يشكلان عرضًا منهجيًا صالحًا", 400);
    const lessons = await executor.query<{ id: string }>(
      "select id from lessons where class_id = $1 and subject_id = $2 and id = any($3::uuid[])",
      [classId, subjectId, lessonIds],
    );
    if (lessons.length !== lessonIds.length)
      throw new AppError("BAD_REQUEST", "أحد الدروس خارج نطاق الصف والمادة", 400);
  }

  private async replaceLessonLinks(executor: QueryExecutor, quizId: string, lessonIds: readonly string[]) {
    await executor.query("delete from quiz_lessons where quiz_id = $1", [quizId]);
    await executor.query(
      `insert into quiz_lessons (quiz_id, lesson_id, position)
       select $1, x.lesson_id, x.position
       from jsonb_to_recordset($2::jsonb) as x(lesson_id uuid, position integer)`,
      [quizId, JSON.stringify(lessonIds.map((lessonId, position) => ({ lesson_id: lessonId, position })))],
    );
  }

  private async materializeQuestions(
    executor: QueryExecutor,
    quiz: QuizRow,
    quizId: string,
    versionId: string,
    refs: readonly QuizVersionQuestionRef[],
  ): Promise<void> {
    if (refs.length === 0) throw new AppError("BAD_REQUEST", "اختر سؤالًا واحدًا على الأقل للنموذج", 400);
    if (refs.length > 500) throw new AppError("BAD_REQUEST", "عدد أسئلة النموذج يتجاوز الحد المسموح", 400);
    const revisionIds = refs.map((ref) => ref.questionBankRevisionId);
    if (new Set(revisionIds).size !== revisionIds.length)
      throw new AppError("BAD_REQUEST", "لا تكرر السؤال نفسه داخل النموذج", 400);
    const itemByRevision = new Map(refs.map((ref) => [ref.questionBankRevisionId, ref.questionBankItemId]));
    const bankRows = await executor.query<BankRevisionRow>(
      `select r.id as revision_id, r.item_id, r.revision_number, i.class_id, i.subject_id,
              r.type, r.prompt, r.options, r.correct_option_index, r.answer_text,
              r.difficulty, r.explanation, r.method,
              array(select rl.lesson_id from question_bank_revision_lessons rl where rl.revision_id = r.id order by rl.position) as lesson_ids,
              coalesce((
                select jsonb_agg(jsonb_build_object(
                  'position', s.position,
                  'mediaAssetId', s.media_asset_id,
                  'pageNumber', s.page_number,
                  'inputChecksumSha256', s.input_checksum_sha256,
                  'ocrExtractionId', s.ocr_extraction_id,
                  'contentSourceAssetId', s.content_source_asset_id,
                  'quote', s.source_quote
                ) order by s.position)
                from question_bank_revision_sources s where s.revision_id = r.id
              ), '[]'::jsonb) as sources
       from question_bank_revisions r
       join question_bank_items i on i.id = r.item_id
       where r.id = any($1::uuid[]) and r.status = 'published' and r.answer_status = 'known'`,
      [revisionIds],
    );
    if (bankRows.length !== refs.length)
      throw new AppError("CONFLICT", "كل أسئلة النموذج يجب أن تكون منشورة وإجاباتها محسمومة", 409);
    const bankMap = new Map(bankRows.map((row) => [row.revision_id, row]));
    const quizLessons = await executor.query<{ lesson_id: string }>(
      "select lesson_id from quiz_lessons where quiz_id = $1",
      [quizId],
    );
    const quizLessonSet = new Set(quizLessons.map((row) => row.lesson_id));

    for (const [position, ref] of refs.entries()) {
      const row = bankMap.get(ref.questionBankRevisionId);
      if (
        !row ||
        row.item_id !== ref.questionBankItemId ||
        itemByRevision.get(row.revision_id) !== row.item_id
      ) {
        throw new AppError("BAD_REQUEST", "مرجع سؤال بنك الأسئلة غير صحيح", 400);
      }
      if (row.class_id !== quiz.class_id || row.subject_id !== quiz.subject_id) {
        throw new AppError("BAD_REQUEST", "السؤال خارج صف أو مادة الاختبار", 400);
      }
      const lessonId = row.lesson_ids.find((id) => quizLessonSet.has(id));
      if (!lessonId) throw new AppError("BAD_REQUEST", "السؤال لا ينتمي إلى دروس الاختبار المحددة", 400);
      const options = Array.isArray(row.options)
        ? row.options.filter((value): value is string => typeof value === "string")
        : [];
      const sources = Array.isArray(row.sources) ? row.sources : [];
      const firstSource = sources[0] as { pageNumber?: unknown; quote?: unknown } | undefined;
      const questionRows = await executor.query<{ id: string }>(
        `insert into questions (
           quiz_version_id, lesson_id, position, type, prompt, answer_text, explanation,
           difficulty, source_page, source_reference, metadata,
           question_bank_item_id, question_bank_revision_id
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13)
         returning id`,
        [
          versionId,
          lessonId,
          position,
          row.type,
          row.prompt,
          row.type === "direct" ? row.answer_text : null,
          row.explanation,
          difficultyValue(row.difficulty),
          typeof firstSource?.pageNumber === "number" ? firstSource.pageNumber : null,
          typeof firstSource?.quote === "string" ? firstSource.quote : null,
          JSON.stringify({
            questionBankRevisionNumber: row.revision_number,
            method: row.method,
            sources,
          }),
          row.item_id,
          row.revision_id,
        ],
      );
      const questionId = questionRows[0]?.id;
      if (!questionId) throw new AppError("INTERNAL_ERROR", "تعذر إنشاء لقطة السؤال", 500);
      if (row.type !== "direct") {
        await executor.query(
          `insert into question_options (question_id, label, is_correct, position)
           select $1, x.label, x.is_correct, x.position
           from jsonb_to_recordset($2::jsonb) as x(label text, is_correct boolean, position integer)`,
          [
            questionId,
            JSON.stringify(
              options.map((text, optionPosition) => ({
                label: text,
                is_correct: row.correct_option_index === optionPosition,
                position: optionPosition,
              })),
            ),
          ],
        );
      }
    }
  }

  private async event(
    executor: QueryExecutor,
    quizId: string,
    versionId: string | null,
    action: string,
    actorProfileId: string,
    note: string | null,
  ): Promise<void> {
    await executor.query(
      `insert into quiz_builder_events (quiz_id, quiz_version_id, action, actor_profile_id, note)
       values ($1, $2, $3, $4, $5)`,
      [quizId, versionId, action, actorProfileId, note],
    );
  }
}
