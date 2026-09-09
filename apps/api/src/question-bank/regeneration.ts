import type { AiQuestion, AiSourceChunk } from "../ai/contracts.js";
import { aiGenerationRequestSchema } from "../ai/contracts.js";
import { validateAdminApprovalOutput } from "../ai/review-validation.js";
import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

interface ItemRow {
  id: string;
  archived_at: Date | null;
}

interface PublishedRevisionRow {
  id: string;
  revision_number: number;
  prompt: string;
  type: AiQuestion["type"];
  difficulty: AiQuestion["difficulty"];
}

interface AiContextRow {
  input_payload: unknown;
  prompt_key: string;
  prompt_version: string;
}

interface ReviewRow {
  revision: number;
  action: "edit" | "approve" | "reject";
  reviewed_output: unknown;
}

interface ImportRow {
  item_id: string;
  revision_id: string;
}

interface SourceRow {
  media_asset_id: string;
  page_number: number;
  input_checksum_sha256: string;
}

function sourceKey(source: Pick<AiSourceChunk, "mediaAssetId" | "pageNumber" | "inputChecksumSha256">): string {
  return `${source.mediaAssetId}:${source.pageNumber}:${source.inputChecksumSha256}`;
}

function normalizePrompt(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export class QuestionBankRegenerationService {
  constructor(private readonly database: Database) {}

  async applyApprovedOutput(
    actorProfileId: string,
    itemId: string,
    outputId: string,
  ): Promise<{ itemId: string; revisionId: string; replayed: boolean }> {
    return this.database.transaction(async (tx) => {
      const items = await tx.query<ItemRow>(
        "select id, archived_at from question_bank_items where id = $1 for update",
        [itemId],
      );
      const item = items[0];
      if (!item) throw new AppError("NOT_FOUND", "سؤال بنك الأسئلة غير موجود", 404);
      if (item.archived_at) throw new AppError("CONFLICT", "لا يمكن إعادة توليد سؤال مؤرشف", 409);

      const open = await tx.query<{ id: string }>(
        "select id from question_bank_revisions where item_id = $1 and status in ('draft','review') limit 1 for update",
        [itemId],
      );
      if (open[0]) {
        throw new AppError("CONFLICT", "أغلق المسودة أو المراجعة الحالية قبل إنشاء إعادة توليد جديدة", 409);
      }

      const publishedRows = await tx.query<PublishedRevisionRow>(
        `select id, revision_number, prompt, type, difficulty
         from question_bank_revisions
         where item_id = $1 and status = 'published'
         for update`,
        [itemId],
      );
      const published = publishedRows[0];
      if (!published) {
        throw new AppError("CONFLICT", "إعادة التوليد تتطلب نسخة منشورة حالية للسؤال", 409);
      }

      const contexts = await tx.query<AiContextRow>(
        `select u.input_payload, j.prompt_key, j.prompt_version
         from ai_outputs o
         join ai_job_units u on u.id = o.job_unit_id
         join ai_jobs j on j.id = u.job_id
         where o.id = $1
         for update of o`,
        [outputId],
      );
      const context = contexts[0];
      if (!context) throw new AppError("NOT_FOUND", "مخرج إعادة التوليد غير موجود", 404);

      const latestRows = await tx.query<ReviewRow>(
        `select revision, action, reviewed_output
         from ai_output_review_events
         where ai_output_id = $1
         order by revision desc
         limit 1
         for update`,
        [outputId],
      );
      const latest = latestRows[0];
      if (!latest || latest.action !== "approve" || latest.reviewed_output === null) {
        throw new AppError("CONFLICT", "لا يمكن تطبيق إعادة التوليد قبل اعتماد المخرج نهائيًا", 409);
      }

      const requestResult = aiGenerationRequestSchema.safeParse(context.input_payload);
      if (!requestResult.success) {
        throw new AppError("INTERNAL_ERROR", "طلب إعادة التوليد المخزن لا يطابق عقد Stage11", 500);
      }
      const request = requestResult.data;
      if (request.mode !== "regenerate_question") {
        throw new AppError("BAD_REQUEST", "المخرج المحدد ليس عملية إعادة توليد سؤال واحد", 400);
      }
      if (
        normalizePrompt(request.originalQuestion.prompt) !== normalizePrompt(published.prompt) ||
        request.originalQuestion.type !== published.type ||
        request.originalQuestion.difficulty !== published.difficulty
      ) {
        throw new AppError("CONFLICT", "طلب إعادة التوليد لا يستهدف النسخة المنشورة الحالية لهذا السؤال", 409);
      }

      const existing = await tx.query<ImportRow>(
        `select item_id, revision_id
         from question_bank_ai_imports
         where ai_output_id = $1 and approved_review_revision = $2 and question_locator = 'questions.0'`,
        [outputId, latest.revision],
      );
      if (existing[0]) {
        if (existing[0].item_id !== itemId) {
          throw new AppError("CONFLICT", "مخرج إعادة التوليد مرتبط بسؤال آخر", 409);
        }
        return { itemId, revisionId: existing[0].revision_id, replayed: true };
      }

      await this.assertRequestUsesPublishedSources(tx, published.id, request.sourceChunks);
      const output = validateAdminApprovalOutput(request, latest.reviewed_output);
      if (output.kind !== "question_set" || output.questions.length !== 1) {
        throw new AppError("CONFLICT", "إعادة التوليد المعتمدة يجب أن تحتوي سؤالًا واحدًا فقط", 409);
      }
      const question = output.questions[0];
      if (!question) throw new AppError("CONFLICT", "إعادة التوليد لا تحتوي سؤالًا صالحًا", 409);
      if (question.type !== published.type || question.difficulty !== published.difficulty) {
        throw new AppError("CONFLICT", "السؤال المعاد توليده غيّر النوع أو مستوى الصعوبة", 409);
      }
      if (normalizePrompt(question.prompt) === normalizePrompt(published.prompt)) {
        throw new AppError("CONFLICT", "إعادة التوليد يجب أن تنتج صياغة مختلفة فعلًا", 409);
      }

      const lessons = await tx.query<{ lesson_id: string; position: number }>(
        `select lesson_id, position
         from question_bank_revision_lessons
         where revision_id = $1
         order by position`,
        [published.id],
      );
      const nextRows = await tx.query<{ next_revision: number }>(
        "select coalesce(max(revision_number), 0)::int + 1 as next_revision from question_bank_revisions where item_id = $1",
        [itemId],
      );
      const nextRevision = nextRows[0]?.next_revision ?? published.revision_number + 1;
      const revisionRows = await tx.query<{ id: string }>(
        `insert into question_bank_revisions (
           item_id, revision_number, status, type, prompt, options, correct_option_index,
           answer_text, answer_status, difficulty, explanation, method, created_by_profile_id
         ) values ($1, $2, 'draft', $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12)
         returning id`,
        [
          itemId,
          nextRevision,
          question.type,
          question.prompt.trim(),
          JSON.stringify(question.options),
          question.correctOptionIndex,
          question.answerText?.trim() || null,
          question.answerStatus,
          question.difficulty,
          question.explanation?.trim() || null,
          question.method?.trim() || null,
          actorProfileId,
        ],
      );
      const revisionId = revisionRows[0]?.id;
      if (!revisionId) throw new AppError("INTERNAL_ERROR", "تعذر حفظ نسخة إعادة التوليد", 500);

      if (lessons.length > 0) {
        await tx.query(
          `insert into question_bank_revision_lessons (revision_id, lesson_id, position)
           select $1, x.lesson_id, x.position
           from jsonb_to_recordset($2::jsonb) as x(lesson_id uuid, position integer)`,
          [revisionId, JSON.stringify(lessons)],
        );
      }

      const requestSources = new Map(request.sourceChunks.map((source) => [sourceKey(source), source]));
      const sources = question.sourceEvidence.map((evidence, position) => {
        const requestSource = [...requestSources.values()].find(
          (source) => source.mediaAssetId === evidence.mediaAssetId && source.pageNumber === evidence.pageNumber,
        );
        if (!requestSource) {
          throw new AppError("INTERNAL_ERROR", "مصدر السؤال المعاد توليده لا يطابق طلب Stage11", 500);
        }
        return {
          position,
          media_asset_id: evidence.mediaAssetId,
          page_number: evidence.pageNumber,
          input_checksum_sha256: requestSource.inputChecksumSha256,
          ocr_extraction_id: evidence.ocrExtractionId ?? requestSource.ocrExtractionId,
          content_source_asset_id: requestSource.contentSourceAssetId ?? null,
          source_quote: evidence.quote?.trim() || null,
        };
      });
      if (sources.length > 0) {
        await tx.query(
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
          [revisionId, JSON.stringify(sources)],
        );
      }

      await tx.query(
        `insert into question_bank_ai_imports (
           ai_output_id, approved_review_revision, question_locator, item_id, revision_id,
           prompt_key, prompt_version, generation_mode, imported_by_profile_id
         ) values ($1, $2, 'questions.0', $3, $4, $5, $6, 'regenerate_question', $7)`,
        [outputId, latest.revision, itemId, revisionId, context.prompt_key, context.prompt_version, actorProfileId],
      );
      await tx.query(
        `insert into question_bank_events (item_id, revision_id, action, actor_profile_id, note)
         values ($1, $2, 'import', $3, 'regenerate_question')`,
        [itemId, revisionId, actorProfileId],
      );

      return { itemId, revisionId, replayed: false };
    });
  }

  private async assertRequestUsesPublishedSources(
    tx: QueryExecutor,
    revisionId: string,
    requestSources: readonly AiSourceChunk[],
  ): Promise<void> {
    const sourceRows = await tx.query<SourceRow>(
      `select media_asset_id, page_number, input_checksum_sha256
       from question_bank_revision_sources
       where revision_id = $1`,
      [revisionId],
    );
    if (sourceRows.length === 0) {
      throw new AppError("CONFLICT", "إعادة التوليد تتطلب سؤالًا منشورًا مرتبطًا بمصدر موثق", 409);
    }
    const allowed = new Set(
      sourceRows.map((source) => `${source.media_asset_id}:${source.page_number}:${source.input_checksum_sha256}`),
    );
    if (requestSources.length === 0 || requestSources.some((source) => !allowed.has(sourceKey(source)))) {
      throw new AppError("CONFLICT", "مصادر طلب إعادة التوليد لا تطابق مصادر النسخة المنشورة", 409);
    }
  }
}
