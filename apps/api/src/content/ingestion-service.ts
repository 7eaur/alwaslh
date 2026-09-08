import { createHash, randomUUID } from "node:crypto";
import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";
import { MediaPipelineService } from "../media/service.js";
import type { MediaStorage } from "../media/storage.js";

export type ContentIngestionTaskStatus = "uploading" | "ready" | "processing" | "completed" | "failed";
export type ContentIngestionItemStatus =
  | "pending_upload"
  | "uploaded"
  | "processing"
  | "completed"
  | "failed";
export type LessonAssetPublicationStatus = "draft" | "review" | "published";

const SUPPORTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
const MAX_PDF_BYTES = 100 * 1024 * 1024;
const PROCESSING_LEASE_MINUTES = 30;

export interface CreateContentIngestionInput {
  lessonId: string;
  clientRequestId: string;
  items: readonly {
    filename: string;
    mimeType: string;
    byteSize: number;
  }[];
}

export interface ContentIngestionTaskSummary {
  id: string;
  lessonId: string;
  lessonTitle: string;
  createdByProfileId: string;
  clientRequestId: string;
  status: ContentIngestionTaskStatus;
  itemCount: number;
  uploadedCount: number;
  processedItemCount: number;
  mediaAssetCount: number;
  failedItemCount: number;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  linkedAt: Date | null;
  completedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentIngestionItemView {
  id: string;
  position: number;
  filename: string;
  mimeType: string;
  declaredByteSize: number;
  byteSize: number | null;
  sourceChecksumSha256: string | null;
  status: ContentIngestionItemStatus;
  outputCount: number;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  uploadedAt: Date | null;
  processedAt: Date | null;
}

export interface ContentIngestionMediaView {
  itemId: string;
  mediaAssetId: string;
  sourcePosition: number;
  sourcePageNumber: number | null;
  mediaStatus: "processing" | "ready" | "failed";
}

export interface LessonAssetPublicationView {
  id: string;
  mediaAssetId: string | null;
  position: number;
  publicationStatus: LessonAssetPublicationStatus;
  submittedForReviewAt: Date | null;
  assetPublishedAt: Date | null;
}

export interface ContentIngestionTaskDetail extends ContentIngestionTaskSummary {
  items: ContentIngestionItemView[];
  media: ContentIngestionMediaView[];
  lessonAssets: LessonAssetPublicationView[];
}

interface TaskRow {
  id: string;
  lesson_id: string;
  lesson_title: string;
  created_by_profile_id: string;
  client_request_id: string;
  status: ContentIngestionTaskStatus;
  item_count: number;
  uploaded_count: number;
  processed_item_count: number;
  media_asset_count: number;
  failed_item_count: number;
  processing_token: string | null;
  lease_expires_at: Date | null;
  last_error_code: string | null;
  last_error_message: string | null;
  linked_at: Date | null;
  completed_at: Date | null;
  archived_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface ItemRow {
  id: string;
  task_id: string;
  position: number;
  filename: string;
  mime_type: string;
  declared_byte_size: string;
  byte_size: string | null;
  source_checksum_sha256: string | null;
  source_storage_key: string | null;
  status: ContentIngestionItemStatus;
  output_count: number;
  last_error_code: string | null;
  last_error_message: string | null;
  uploaded_at: Date | null;
  processed_at: Date | null;
}

interface MediaRow {
  item_id: string;
  media_asset_id: string;
  source_position: number;
  source_page_number: number | null;
  media_status: "processing" | "ready" | "failed";
}

interface LessonAssetRow {
  id: string;
  media_asset_id: string | null;
  position: number;
  publication_status: LessonAssetPublicationStatus;
  submitted_for_review_at: Date | null;
  asset_published_at: Date | null;
}

interface LinkableMediaRow {
  item_id: string;
  media_asset_id: string;
  source_position: number;
  source_filename: string;
  source_page_number: number | null;
  source_key: string | null;
  display_key: string | null;
  thumbnail_key: string | null;
  ai_key: string | null;
  display_mime_type: string | null;
  display_byte_size: string | null;
  display_width: number | null;
  display_height: number | null;
  display_checksum: string | null;
  variant_count: string;
}

const taskColumns = `
  t.id, t.lesson_id, l.title as lesson_title, t.created_by_profile_id, t.client_request_id,
  t.status, t.item_count, t.uploaded_count, t.processed_item_count, t.media_asset_count,
  t.failed_item_count, t.processing_token, t.lease_expires_at, t.last_error_code,
  t.last_error_message, t.linked_at, t.completed_at, t.archived_at, t.created_at, t.updated_at`;

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizedFilename(value: string): string {
  const filename = value.trim();
  if (!filename || filename.length > 255 || filename.includes("\0")) {
    throw new AppError("BAD_REQUEST", "اسم الملف غير صالح", 400);
  }
  return filename;
}

function maxBytesForMime(mimeType: string): number {
  return mimeType === "application/pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
}

function validateDescriptor(filename: string, mimeType: string, byteSize: number): void {
  normalizedFilename(filename);
  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    throw new AppError("BAD_REQUEST", "نوع الملف غير مدعوم. استخدم JPG أو PNG أو WebP أو PDF", 400);
  }
  if (!Number.isInteger(byteSize) || byteSize <= 0 || byteSize > maxBytesForMime(mimeType)) {
    throw new AppError("BAD_REQUEST", "حجم الملف خارج الحد المسموح", 400);
  }
}

function sourceExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    default:
      throw new AppError("BAD_REQUEST", "نوع الملف غير مدعوم", 400);
  }
}

function taskView(row: TaskRow): ContentIngestionTaskSummary {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    lessonTitle: row.lesson_title,
    createdByProfileId: row.created_by_profile_id,
    clientRequestId: row.client_request_id,
    status: row.status,
    itemCount: row.item_count,
    uploadedCount: row.uploaded_count,
    processedItemCount: row.processed_item_count,
    mediaAssetCount: row.media_asset_count,
    failedItemCount: row.failed_item_count,
    lastErrorCode: row.last_error_code,
    lastErrorMessage: row.last_error_message,
    linkedAt: row.linked_at,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function itemView(row: ItemRow): ContentIngestionItemView {
  return {
    id: row.id,
    position: row.position,
    filename: row.filename,
    mimeType: row.mime_type,
    declaredByteSize: Number(row.declared_byte_size),
    byteSize: row.byte_size === null ? null : Number(row.byte_size),
    sourceChecksumSha256: row.source_checksum_sha256,
    status: row.status,
    outputCount: row.output_count,
    lastErrorCode: row.last_error_code,
    lastErrorMessage: row.last_error_message,
    uploadedAt: row.uploaded_at,
    processedAt: row.processed_at,
  };
}

function mediaView(row: MediaRow): ContentIngestionMediaView {
  return {
    itemId: row.item_id,
    mediaAssetId: row.media_asset_id,
    sourcePosition: row.source_position,
    sourcePageNumber: row.source_page_number,
    mediaStatus: row.media_status,
  };
}

function lessonAssetView(row: LessonAssetRow): LessonAssetPublicationView {
  return {
    id: row.id,
    mediaAssetId: row.media_asset_id,
    position: row.position,
    publicationStatus: row.publication_status,
    submittedForReviewAt: row.submitted_for_review_at,
    assetPublishedAt: row.asset_published_at,
  };
}

function processingErrorCode(error: unknown): string {
  if (!(error instanceof Error)) return "processing_failed";
  const code = error.message.split(":", 1)[0]?.trim();
  return code && /^[a-z0-9_]+$/.test(code) ? code : "processing_failed";
}

function processingErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message.slice(0, 2000) : String(error).slice(0, 2000);
}

async function recordCurriculumEvent(
  tx: QueryExecutor,
  actorProfileId: string,
  lessonId: string,
  eventType: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  await tx.query(
    `insert into curriculum_events (actor_profile_id, resource_type, resource_key, event_type, metadata)
     values ($1, 'lesson', $2, $3, $4::jsonb)`,
    [actorProfileId, lessonId, eventType, JSON.stringify(metadata)],
  );
}

export class AdminContentIngestionService {
  private readonly pipeline: MediaPipelineService;

  constructor(
    private readonly db: Database,
    private readonly storage: MediaStorage,
  ) {
    this.pipeline = new MediaPipelineService(db, storage);
  }

  async listTasks(input: {
    status?: ContentIngestionTaskStatus;
    lessonId?: string;
    includeArchived?: boolean;
    limit: number;
    offset: number;
  }): Promise<{ tasks: ContentIngestionTaskSummary[]; total: number }> {
    const values: unknown[] = [];
    const where: string[] = [];
    if (input.status) {
      values.push(input.status);
      where.push(`t.status = $${values.length}`);
    }
    if (input.lessonId) {
      values.push(input.lessonId);
      where.push(`t.lesson_id = $${values.length}`);
    }
    if (!input.includeArchived) where.push("t.archived_at is null");
    const clause = where.length > 0 ? `where ${where.join(" and ")}` : "";

    const countRows = await this.db.query<{ count: string }>(
      `select count(*)::text as count from content_ingestion_tasks t ${clause}`,
      values,
    );
    values.push(input.limit, input.offset);
    const rows = await this.db.query<TaskRow>(
      `select ${taskColumns}
         from content_ingestion_tasks t
         join lessons l on l.id = t.lesson_id
         ${clause}
        order by t.created_at desc, t.id desc
        limit $${values.length - 1} offset $${values.length}`,
      values,
    );
    return { tasks: rows.map(taskView), total: Number(countRows[0]?.count ?? 0) };
  }

  async detail(taskId: string): Promise<ContentIngestionTaskDetail> {
    const taskRows = await this.db.query<TaskRow>(
      `select ${taskColumns}
         from content_ingestion_tasks t
         join lessons l on l.id = t.lesson_id
        where t.id = $1`,
      [taskId],
    );
    const task = taskRows[0];
    if (!task) throw new AppError("NOT_FOUND", "مهمة الرفع غير موجودة", 404);

    const [items, media, lessonAssets] = await Promise.all([
      this.db.query<ItemRow>(
        `select id, task_id, position, filename, mime_type, declared_byte_size, byte_size,
                source_checksum_sha256, source_storage_key, status, output_count,
                last_error_code, last_error_message, uploaded_at, processed_at
           from content_ingestion_items
          where task_id = $1
          order by position, id`,
        [taskId],
      ),
      this.db.query<MediaRow>(
        `select cim.item_id, cim.media_asset_id, cim.source_position, cim.source_page_number,
                ma.status as media_status
           from content_ingestion_media cim
           join media_assets ma on ma.id = cim.media_asset_id
          where cim.task_id = $1
          order by cim.source_position, cim.media_asset_id`,
        [taskId],
      ),
      this.db.query<LessonAssetRow>(
        `select id, media_asset_id, position, publication_status,
                submitted_for_review_at, asset_published_at
           from lesson_assets
          where ingestion_task_id = $1
          order by position, id`,
        [taskId],
      ),
    ]);

    return {
      ...taskView(task),
      items: items.map(itemView),
      media: media.map(mediaView),
      lessonAssets: lessonAssets.map(lessonAssetView),
    };
  }

  async createTask(actorProfileId: string, input: CreateContentIngestionInput): Promise<ContentIngestionTaskDetail> {
    if (input.items.length < 1 || input.items.length > 100) {
      throw new AppError("BAD_REQUEST", "يجب اختيار ملف واحد على الأقل وبحد أقصى 100 ملف", 400);
    }
    input.items.forEach((item) => validateDescriptor(item.filename, item.mimeType, item.byteSize));

    const taskId = await this.db.transaction(async (tx) => {
      const lessonRows = await tx.query<{ status: "active" | "inactive" | "archived" }>(
        "select status from lessons where id = $1 for update",
        [input.lessonId],
      );
      const lesson = lessonRows[0];
      if (!lesson) throw new AppError("NOT_FOUND", "الدرس غير موجود", 404);
      if (lesson.status === "archived") {
        throw new AppError("CONFLICT", "لا يمكن رفع محتوى إلى درس مؤرشف", 409);
      }

      const existingRows = await tx.query<{ id: string }>(
        `select id from content_ingestion_tasks
          where created_by_profile_id = $1 and client_request_id = $2
          for update`,
        [actorProfileId, input.clientRequestId],
      );
      const existing = existingRows[0];
      if (existing) return existing.id;

      const taskRows = await tx.query<{ id: string }>(
        `insert into content_ingestion_tasks (
           lesson_id, created_by_profile_id, client_request_id, item_count
         ) values ($1, $2, $3, $4)
         returning id`,
        [input.lessonId, actorProfileId, input.clientRequestId, input.items.length],
      );
      const task = taskRows[0];
      if (!task) throw new Error("content_ingestion_task_create_failed");

      for (let position = 0; position < input.items.length; position += 1) {
        const item = input.items[position];
        if (!item) continue;
        await tx.query(
          `insert into content_ingestion_items (
             task_id, position, filename, mime_type, declared_byte_size
           ) values ($1, $2, $3, $4, $5)`,
          [task.id, position, normalizedFilename(item.filename), item.mimeType, item.byteSize],
        );
      }
      await recordCurriculumEvent(tx, actorProfileId, input.lessonId, "content_ingestion_created", {
        taskId: task.id,
        itemCount: input.items.length,
      });
      return task.id;
    });

    return this.detail(taskId);
  }

  async uploadItem(taskId: string, itemId: string, bytes: Buffer): Promise<ContentIngestionTaskDetail> {
    const rows = await this.db.query<ItemRow & { task_archived_at: Date | null }>(
      `select i.id, i.task_id, i.position, i.filename, i.mime_type, i.declared_byte_size, i.byte_size,
              i.source_checksum_sha256, i.source_storage_key, i.status, i.output_count,
              i.last_error_code, i.last_error_message, i.uploaded_at, i.processed_at,
              t.archived_at as task_archived_at
         from content_ingestion_items i
         join content_ingestion_tasks t on t.id = i.task_id
        where i.id = $1 and i.task_id = $2`,
      [itemId, taskId],
    );
    const item = rows[0];
    if (!item) throw new AppError("NOT_FOUND", "عنصر الرفع غير موجود", 404);
    if (item.task_archived_at) throw new AppError("CONFLICT", "مهمة الرفع مؤرشفة", 409);
    const declaredSize = Number(item.declared_byte_size);
    if (bytes.byteLength !== declaredSize || bytes.byteLength > maxBytesForMime(item.mime_type)) {
      throw new AppError("BAD_REQUEST", "حجم الملف المرفوع لا يطابق الوصف المعتمد", 400);
    }

    const checksum = sha256(bytes);
    if (item.status !== "pending_upload") {
      if (item.source_checksum_sha256 === checksum && Number(item.byte_size) === bytes.byteLength) {
        return this.detail(taskId);
      }
      throw new AppError("CONFLICT", "تم رفع محتوى مختلف لهذا العنصر بالفعل", 409);
    }

    const storageKey = `ingestion/${taskId}/${itemId}/source/${checksum}.${sourceExtension(item.mime_type)}`;
    await this.storage.put(storageKey, bytes);
    try {
      await this.db.transaction(async (tx) => {
        const lockedRows = await tx.query<ItemRow>(
          `select id, task_id, position, filename, mime_type, declared_byte_size, byte_size,
                  source_checksum_sha256, source_storage_key, status, output_count,
                  last_error_code, last_error_message, uploaded_at, processed_at
             from content_ingestion_items
            where id = $1 and task_id = $2
            for update`,
          [itemId, taskId],
        );
        const locked = lockedRows[0];
        if (!locked) throw new AppError("NOT_FOUND", "عنصر الرفع غير موجود", 404);
        if (locked.status !== "pending_upload") {
          if (locked.source_checksum_sha256 === checksum && Number(locked.byte_size) === bytes.byteLength) return;
          throw new AppError("CONFLICT", "تم رفع محتوى مختلف لهذا العنصر بالفعل", 409);
        }

        await tx.query(
          `update content_ingestion_items
              set byte_size = $3,
                  source_checksum_sha256 = $4,
                  source_storage_key = $5,
                  status = 'uploaded',
                  uploaded_at = now(),
                  last_error_code = null,
                  last_error_message = null
            where id = $1 and task_id = $2`,
          [itemId, taskId, bytes.byteLength, checksum, storageKey],
        );
        const counts = await tx.query<{ uploaded: string; total: string }>(
          `select count(*) filter (where status <> 'pending_upload')::text as uploaded,
                  count(*)::text as total
             from content_ingestion_items
            where task_id = $1`,
          [taskId],
        );
        const count = counts[0];
        const uploaded = Number(count?.uploaded ?? 0);
        const total = Number(count?.total ?? 0);
        await tx.query(
          `update content_ingestion_tasks
              set uploaded_count = $2,
                  status = case when $2 = $3 then 'ready'::content_ingestion_task_status
                                else 'uploading'::content_ingestion_task_status end
            where id = $1 and status in ('uploading', 'ready')`,
          [taskId, uploaded, total],
        );
      });
    } catch (error) {
      await this.storage.remove(storageKey).catch(() => undefined);
      throw error;
    }
    return this.detail(taskId);
  }

  private async claimProcessing(taskId: string): Promise<string | null> {
    return this.db.transaction(async (tx) => {
      const rows = await tx.query<{
        status: ContentIngestionTaskStatus;
        archived_at: Date | null;
        lease_expires_at: Date | null;
      }>(
        `select status, archived_at, lease_expires_at
           from content_ingestion_tasks
          where id = $1
          for update`,
        [taskId],
      );
      const task = rows[0];
      if (!task) throw new AppError("NOT_FOUND", "مهمة الرفع غير موجودة", 404);
      if (task.archived_at) throw new AppError("CONFLICT", "مهمة الرفع مؤرشفة", 409);
      if (task.status === "completed") return null;
      if (task.status === "uploading") {
        throw new AppError("CONFLICT", "يجب إكمال رفع جميع الملفات قبل المعالجة", 409);
      }
      if (task.status === "processing" && task.lease_expires_at && task.lease_expires_at > new Date()) {
        throw new AppError("CONFLICT", "المهمة قيد المعالجة بالفعل", 409);
      }

      const token = randomUUID();
      await tx.query(
        `update content_ingestion_tasks
            set status = 'processing',
                processing_token = $2,
                lease_expires_at = now() + make_interval(mins => $3),
                last_error_code = null,
                last_error_message = null,
                failed_item_count = 0
          where id = $1`,
        [taskId, token, PROCESSING_LEASE_MINUTES],
      );
      return token;
    });
  }

  private async heartbeat(taskId: string, token: string): Promise<void> {
    const rows = await this.db.query<{ id: string }>(
      `update content_ingestion_tasks
          set lease_expires_at = now() + make_interval(mins => $3)
        where id = $1 and status = 'processing' and processing_token = $2
        returning id`,
      [taskId, token, PROCESSING_LEASE_MINUTES],
    );
    if (!rows[0]) throw new AppError("CONFLICT", "فقدت عملية المعالجة ملكية المهمة", 409);
  }

  async processTask(taskId: string): Promise<ContentIngestionTaskDetail> {
    const token = await this.claimProcessing(taskId);
    if (!token) return this.detail(taskId);

    const items = await this.db.query<ItemRow>(
      `select id, task_id, position, filename, mime_type, declared_byte_size, byte_size,
              source_checksum_sha256, source_storage_key, status, output_count,
              last_error_code, last_error_message, uploaded_at, processed_at
         from content_ingestion_items
        where task_id = $1
        order by position, id`,
      [taskId],
    );

    let cursor = 0;
    for (const item of items) {
      if (item.status === "completed") {
        cursor += item.output_count;
        continue;
      }
      try {
        await this.heartbeat(taskId, token);
        if (!item.source_storage_key || !item.source_checksum_sha256 || item.byte_size === null) {
          throw new Error("source_upload_missing");
        }
        const sourceBytes = await this.storage.read(item.source_storage_key);
        if (
          sourceBytes.byteLength !== Number(item.byte_size) ||
          sha256(sourceBytes) !== item.source_checksum_sha256
        ) {
          throw new Error("source_storage_integrity_failed");
        }

        await this.db.query(
          `update content_ingestion_items
              set status = 'processing', last_error_code = null, last_error_message = null
            where id = $1 and task_id = $2`,
          [item.id, taskId],
        );

        const outputs =
          item.mime_type === "application/pdf"
            ? await this.pipeline.processPdf({
                idempotencyKey: `admin-ingestion:${taskId}:item:${item.id}`,
                sourcePositionStart: cursor,
                sourceFilename: item.filename,
                sourceMimeType: "application/pdf",
                bytes: sourceBytes,
              })
            : [
                await this.pipeline.processImage({
                  idempotencyKey: `admin-ingestion:${taskId}:item:${item.id}`,
                  sourcePosition: cursor,
                  sourceFilename: item.filename,
                  sourceMimeType: item.mime_type,
                  bytes: sourceBytes,
                }),
              ];

        await this.heartbeat(taskId, token);
        await this.db.transaction(async (tx) => {
          const leaseRows = await tx.query<{ id: string }>(
            `select id from content_ingestion_tasks
              where id = $1 and status = 'processing' and processing_token = $2
              for update`,
            [taskId, token],
          );
          if (!leaseRows[0]) throw new AppError("CONFLICT", "فقدت عملية المعالجة ملكية المهمة", 409);

          for (const output of outputs) {
            await tx.query(
              `insert into content_ingestion_media (
                 task_id, item_id, media_asset_id, source_position, source_page_number
               ) values ($1, $2, $3, $4, $5)
               on conflict (task_id, media_asset_id) do nothing`,
              [taskId, item.id, output.mediaAssetId, output.sourcePosition, output.sourcePageNumber ?? null],
            );
          }
          await tx.query(
            `update content_ingestion_items
                set status = 'completed', output_count = $3, processed_at = now(),
                    last_error_code = null, last_error_message = null
              where id = $1 and task_id = $2`,
            [item.id, taskId, outputs.length],
          );
          await tx.query(
            `update content_ingestion_tasks
                set processed_item_count = (
                      select count(*) from content_ingestion_items
                       where task_id = $1 and status = 'completed'
                    ),
                    failed_item_count = (
                      select count(*) from content_ingestion_items
                       where task_id = $1 and status = 'failed'
                    ),
                    media_asset_count = (
                      select count(*) from content_ingestion_media where task_id = $1
                    ),
                    lease_expires_at = now() + make_interval(mins => $3)
              where id = $1 and processing_token = $2`,
            [taskId, token, PROCESSING_LEASE_MINUTES],
          );
        });
        cursor += outputs.length;
      } catch (error) {
        const code = processingErrorCode(error);
        const message = processingErrorMessage(error);
        await this.db.transaction(async (tx) => {
          await tx.query(
            `update content_ingestion_items
                set status = 'failed', last_error_code = $3, last_error_message = $4
              where id = $1 and task_id = $2`,
            [item.id, taskId, code, message],
          );
          await tx.query(
            `update content_ingestion_tasks
                set status = 'failed', processing_token = null, lease_expires_at = null,
                    failed_item_count = (
                      select count(*) from content_ingestion_items
                       where task_id = $1 and status = 'failed'
                    ),
                    processed_item_count = (
                      select count(*) from content_ingestion_items
                       where task_id = $1 and status = 'completed'
                    ),
                    media_asset_count = (
                      select count(*) from content_ingestion_media where task_id = $1
                    ),
                    last_error_code = $3,
                    last_error_message = $4
              where id = $1 and processing_token = $2`,
            [taskId, token, code, message],
          );
        });
        return this.detail(taskId);
      }
    }

    await this.db.query(
      `update content_ingestion_tasks
          set status = 'completed', processing_token = null, lease_expires_at = null,
              processed_item_count = item_count,
              failed_item_count = 0,
              media_asset_count = (select count(*) from content_ingestion_media where task_id = $1),
              completed_at = now(), last_error_code = null, last_error_message = null
        where id = $1 and status = 'processing' and processing_token = $2`,
      [taskId, token],
    );
    return this.detail(taskId);
  }

  async linkTaskToLesson(actorProfileId: string, taskId: string): Promise<ContentIngestionTaskDetail> {
    await this.db.transaction(async (tx) => {
      const taskRows = await tx.query<{
        lesson_id: string;
        status: ContentIngestionTaskStatus;
        archived_at: Date | null;
        media_asset_count: number;
      }>(
        `select lesson_id, status, archived_at, media_asset_count
           from content_ingestion_tasks
          where id = $1
          for update`,
        [taskId],
      );
      const task = taskRows[0];
      if (!task) throw new AppError("NOT_FOUND", "مهمة الرفع غير موجودة", 404);
      if (task.archived_at) throw new AppError("CONFLICT", "مهمة الرفع مؤرشفة", 409);
      if (task.status !== "completed") {
        throw new AppError("CONFLICT", "لا يمكن ربط المهمة قبل اكتمال المعالجة", 409);
      }

      const lessonRows = await tx.query<{ id: string; status: "active" | "inactive" | "archived" }>(
        "select id, status from lessons where id = $1 for update",
        [task.lesson_id],
      );
      const lesson = lessonRows[0];
      if (!lesson) throw new AppError("NOT_FOUND", "الدرس غير موجود", 404);
      if (lesson.status === "archived") throw new AppError("CONFLICT", "الدرس مؤرشف", 409);

      const media = await tx.query<LinkableMediaRow>(
        `select cim.item_id, ma.id as media_asset_id, cim.source_position,
                ma.source_filename, ma.source_page_number,
                max(mv.storage_key) filter (where mv.kind = 'source') as source_key,
                max(mv.storage_key) filter (where mv.kind = 'display') as display_key,
                max(mv.storage_key) filter (where mv.kind = 'thumbnail') as thumbnail_key,
                max(mv.storage_key) filter (where mv.kind = 'ai') as ai_key,
                max(mv.mime_type) filter (where mv.kind = 'display') as display_mime_type,
                max(mv.byte_size)::text filter (where mv.kind = 'display') as display_byte_size,
                max(mv.width) filter (where mv.kind = 'display') as display_width,
                max(mv.height) filter (where mv.kind = 'display') as display_height,
                max(mv.checksum_sha256) filter (where mv.kind = 'display') as display_checksum,
                count(mv.id)::text as variant_count
           from content_ingestion_media cim
           join media_assets ma on ma.id = cim.media_asset_id and ma.status = 'ready'
           join media_variants mv on mv.media_asset_id = ma.id
          where cim.task_id = $1
          group by cim.item_id, ma.id, cim.source_position, ma.source_filename, ma.source_page_number
          order by cim.source_position, ma.id`,
        [taskId],
      );
      if (media.length !== task.media_asset_count || media.some((row) => Number(row.variant_count) !== 4)) {
        throw new AppError("CONFLICT", "بعض الوسائط غير جاهزة أو تفتقد النسخ المطلوبة", 409);
      }

      const positionRows = await tx.query<{ next_position: number }>(
        `select coalesce(max(position), -1) + 1 as next_position
           from lesson_assets
          where lesson_id = $1`,
        [task.lesson_id],
      );
      let nextPosition = positionRows[0]?.next_position ?? 0;
      let inserted = 0;
      for (const output of media) {
        const existingRows = await tx.query<{ id: string }>(
          "select id from lesson_assets where lesson_id = $1 and media_asset_id = $2",
          [task.lesson_id, output.media_asset_id],
        );
        if (existingRows[0]) continue;
        if (
          !output.source_key ||
          !output.display_key ||
          !output.thumbnail_key ||
          !output.ai_key ||
          !output.display_mime_type ||
          output.display_byte_size === null ||
          !output.display_checksum
        ) {
          throw new AppError("CONFLICT", "بيانات النسخ المشتقة للوسائط غير مكتملة", 409);
        }

        const metadata = {
          ingestionTaskId: taskId,
          ingestionItemId: output.item_id,
          mediaAssetId: output.media_asset_id,
          sourceFilename: output.source_filename,
          sourcePosition: output.source_position,
          sourcePageNumber: output.source_page_number,
        };
        await tx.query(
          `insert into lesson_assets (
             lesson_id, kind, position, storage_key, source_storage_key, thumbnail_storage_key,
             ai_storage_key, mime_type, byte_size, width, height, checksum_sha256,
             source_page_number, source_metadata, media_asset_id, ingestion_task_id,
             ingestion_item_id, publication_status
           ) values (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb,
             $15, $16, $17, 'draft'
           )`,
          [
            task.lesson_id,
            output.source_page_number === null ? "image" : "pdf_page",
            nextPosition,
            output.display_key,
            output.source_key,
            output.thumbnail_key,
            output.ai_key,
            output.display_mime_type,
            Number(output.display_byte_size),
            output.display_width,
            output.display_height,
            output.display_checksum,
            output.source_page_number,
            JSON.stringify(metadata),
            output.media_asset_id,
            taskId,
            output.item_id,
          ],
        );
        nextPosition += 1;
        inserted += 1;
      }

      const linkedRows = await tx.query<{ count: string }>(
        "select count(*)::text as count from lesson_assets where ingestion_task_id = $1",
        [taskId],
      );
      if (Number(linkedRows[0]?.count ?? 0) !== task.media_asset_count) {
        throw new Error("lesson_media_link_incomplete");
      }
      await tx.query(
        "update content_ingestion_tasks set linked_at = coalesce(linked_at, now()) where id = $1",
        [taskId],
      );
      if (inserted > 0) {
        await recordCurriculumEvent(tx, actorProfileId, task.lesson_id, "content_ingestion_linked", {
          taskId,
          mediaAssetCount: task.media_asset_count,
        });
      }
    });
    return this.detail(taskId);
  }

  async transitionPublication(
    actorProfileId: string,
    taskId: string,
    action: "submit_review" | "return_to_draft" | "publish",
  ): Promise<ContentIngestionTaskDetail> {
    await this.db.transaction(async (tx) => {
      const taskRows = await tx.query<{ lesson_id: string; archived_at: Date | null; linked_at: Date | null }>(
        `select lesson_id, archived_at, linked_at
           from content_ingestion_tasks
          where id = $1
          for update`,
        [taskId],
      );
      const task = taskRows[0];
      if (!task) throw new AppError("NOT_FOUND", "مهمة الرفع غير موجودة", 404);
      if (task.archived_at) throw new AppError("CONFLICT", "مهمة الرفع مؤرشفة", 409);
      if (!task.linked_at) throw new AppError("CONFLICT", "اربط الوسائط بالدرس أولًا", 409);

      const lessonRows = await tx.query<{ status: "active" | "inactive" | "archived" }>(
        "select status from lessons where id = $1 for update",
        [task.lesson_id],
      );
      const lesson = lessonRows[0];
      if (!lesson) throw new AppError("NOT_FOUND", "الدرس غير موجود", 404);
      if (lesson.status === "archived") throw new AppError("CONFLICT", "الدرس مؤرشف", 409);

      const assetRows = await tx.query<{ id: string; publication_status: LessonAssetPublicationStatus }>(
        `select id, publication_status
           from lesson_assets
          where ingestion_task_id = $1 and lesson_id = $2
          order by position
          for update`,
        [taskId, task.lesson_id],
      );
      if (assetRows.length === 0) throw new AppError("CONFLICT", "لا توجد وسائط مرتبطة بهذه المهمة", 409);

      if (action === "submit_review") {
        if (assetRows.some((asset) => asset.publication_status !== "draft")) {
          throw new AppError("CONFLICT", "يمكن إرسال المسودات فقط إلى المراجعة", 409);
        }
        await tx.query(
          `update lesson_assets
              set publication_status = 'review',
                  submitted_for_review_by_profile_id = $2,
                  submitted_for_review_at = now()
            where ingestion_task_id = $1`,
          [taskId, actorProfileId],
        );
        await recordCurriculumEvent(tx, actorProfileId, task.lesson_id, "lesson_content_submitted_for_review", {
          taskId,
          assetCount: assetRows.length,
        });
      } else if (action === "return_to_draft") {
        if (assetRows.some((asset) => asset.publication_status !== "review")) {
          throw new AppError("CONFLICT", "يمكن إعادة محتوى المراجعة فقط إلى مسودة", 409);
        }
        await tx.query(
          `update lesson_assets
              set publication_status = 'draft',
                  submitted_for_review_by_profile_id = null,
                  submitted_for_review_at = null
            where ingestion_task_id = $1`,
          [taskId],
        );
        await recordCurriculumEvent(tx, actorProfileId, task.lesson_id, "lesson_content_returned_to_draft", {
          taskId,
          assetCount: assetRows.length,
        });
      } else {
        if (assetRows.some((asset) => asset.publication_status !== "review")) {
          throw new AppError("CONFLICT", "يجب أن يكون كل المحتوى في المراجعة قبل النشر", 409);
        }
        const readiness = await tx.query<{ expected: string; ready: string }>(
          `select count(*)::text as expected,
                  count(*) filter (where ma.status = 'ready')::text as ready
             from lesson_assets la
             join media_assets ma on ma.id = la.media_asset_id
            where la.ingestion_task_id = $1`,
          [taskId],
        );
        if (readiness[0]?.expected !== readiness[0]?.ready) {
          throw new AppError("CONFLICT", "لا يمكن النشر لأن بعض الوسائط لم تعد جاهزة", 409);
        }
        await tx.query(
          `update lesson_assets
              set publication_status = 'published',
                  published_by_profile_id = $2,
                  asset_published_at = now()
            where ingestion_task_id = $1`,
          [taskId, actorProfileId],
        );
        await tx.query(
          `update lessons
              set content_revision = content_revision + 1,
                  published_at = now()
            where id = $1`,
          [task.lesson_id],
        );
        await recordCurriculumEvent(tx, actorProfileId, task.lesson_id, "lesson_content_published", {
          taskId,
          assetCount: assetRows.length,
        });
      }
    });
    return this.detail(taskId);
  }

  async archiveTask(taskId: string): Promise<ContentIngestionTaskDetail> {
    const rows = await this.db.query<{ id: string }>(
      `update content_ingestion_tasks
          set archived_at = coalesce(archived_at, now())
        where id = $1 and status <> 'processing'
        returning id`,
      [taskId],
    );
    if (!rows[0]) {
      const existing = await this.db.query<{ status: ContentIngestionTaskStatus }>(
        "select status from content_ingestion_tasks where id = $1",
        [taskId],
      );
      if (!existing[0]) throw new AppError("NOT_FOUND", "مهمة الرفع غير موجودة", 404);
      throw new AppError("CONFLICT", "لا يمكن أرشفة مهمة أثناء المعالجة", 409);
    }
    return this.detail(taskId);
  }
}
