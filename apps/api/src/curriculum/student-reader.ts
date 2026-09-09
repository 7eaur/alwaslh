import { createHash } from "node:crypto";
import type { Database } from "../db.js";
import { AppError } from "../errors.js";
import type { MediaStorage } from "../media/storage.js";

export interface StudentReaderAssetView {
  id: string;
  kind: "image" | "pdf_page" | "document" | "audio" | "video";
  position: number;
  mimeType: string;
  byteSize: number | null;
  width: number | null;
  height: number | null;
  checksumSha256: string | null;
  sourcePageNumber: number | null;
  text: string | null;
}

export interface StudentLessonReaderView {
  lesson: {
    id: string;
    title: string;
    summary: string | null;
    contentRevision: number;
    publishedAt: Date;
  };
  assets: StudentReaderAssetView[];
}

export interface StudentAssetContent {
  bytes: Buffer;
  mimeType: string;
  byteSize: number;
  checksumSha256: string;
}

interface AccessibleLessonRow {
  id: string;
  title: string;
  summary: string | null;
  content_revision: number;
  published_at: Date;
}

interface ReaderAssetRow {
  id: string;
  kind: StudentReaderAssetView["kind"];
  position: number;
  mime_type: string;
  byte_size: string | null;
  width: number | null;
  height: number | null;
  checksum_sha256: string | null;
  source_page_number: number | null;
  text: string | null;
}

interface AssetContentRow {
  storage_key: string;
  mime_type: string;
  byte_size: string | null;
  checksum_sha256: string | null;
}

const ACCESSIBLE_LESSON_SQL = `
  from lessons l
  join classes c on c.id = l.class_id and c.status = 'active'
  join subjects s on s.id = l.subject_id and s.status = 'active'
  join subject_class_links scl
    on scl.class_id = l.class_id
   and scl.subject_id = l.subject_id
   and scl.status = 'active'
  left join curriculum_sections cs
    on cs.id = l.section_id
   and cs.class_id = l.class_id
   and cs.subject_id = l.subject_id
  where l.id = $2
    and l.status = 'active'
    and l.published_at is not null
    and (l.section_id is null or cs.status = 'active')
    and exists (
      select 1
      from student_entitlements e
      where e.profile_id = $1
        and e.status = 'active'
        and e.starts_at <= now()
        and (e.expires_at is null or e.expires_at > now())
        and (
          e.scope = 'all_content'
          or (e.scope = 'class' and e.class_id = l.class_id)
        )
    )`;

export class StudentReaderService {
  constructor(
    private readonly db: Database,
    private readonly storage: MediaStorage,
  ) {}

  private async accessibleLesson(profileId: string, lessonId: string): Promise<AccessibleLessonRow> {
    const rows = await this.db.query<AccessibleLessonRow>(
      `select l.id, l.title, l.summary, l.content_revision, l.published_at
       ${ACCESSIBLE_LESSON_SQL}`,
      [profileId, lessonId],
    );
    const lesson = rows[0];
    if (!lesson) throw new AppError("NOT_FOUND", "الدرس غير متاح", 404);
    return lesson;
  }

  async lesson(profileId: string, lessonId: string): Promise<StudentLessonReaderView> {
    const lesson = await this.accessibleLesson(profileId, lessonId);
    const assets = await this.db.query<ReaderAssetRow>(
      `select la.id, la.kind, la.position, la.mime_type, la.byte_size::text,
              la.width, la.height, la.checksum_sha256, la.source_page_number,
              safe_ocr.text
       from lesson_assets la
       join media_assets ma on ma.id = la.media_asset_id and ma.status = 'ready'
       left join lateral (
         select coalesce(nullif(e.normalized_text, ''), nullif(e.raw_text, '')) as text
         from ocr_extractions e
         join media_variants mv on mv.id = e.input_media_variant_id
         where mv.media_asset_id = ma.id
           and e.status = 'completed'
           and e.review_status in ('not_required', 'approved')
           and coalesce(nullif(e.normalized_text, ''), nullif(e.raw_text, '')) is not null
         order by
           case when e.review_status = 'approved' then 0 else 1 end,
           e.completed_at desc nulls last,
           e.created_at desc,
           e.id
         limit 1
       ) safe_ocr on true
       where la.lesson_id = $1
         and la.publication_status = 'published'
       order by la.position, la.id`,
      [lessonId],
    );

    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        summary: lesson.summary,
        contentRevision: Number(lesson.content_revision),
        publishedAt: lesson.published_at,
      },
      assets: assets.map((asset) => ({
        id: asset.id,
        kind: asset.kind,
        position: asset.position,
        mimeType: asset.mime_type,
        byteSize: asset.byte_size === null ? null : Number(asset.byte_size),
        width: asset.width,
        height: asset.height,
        checksumSha256: asset.checksum_sha256,
        sourcePageNumber: asset.source_page_number,
        text: asset.text,
      })),
    };
  }

  async assetContent(profileId: string, assetId: string): Promise<StudentAssetContent> {
    const rows = await this.db.query<AssetContentRow>(
      `select la.storage_key, la.mime_type, la.byte_size::text, la.checksum_sha256
       from lesson_assets la
       join lessons l on l.id = la.lesson_id
       join classes c on c.id = l.class_id and c.status = 'active'
       join subjects s on s.id = l.subject_id and s.status = 'active'
       join subject_class_links scl
         on scl.class_id = l.class_id
        and scl.subject_id = l.subject_id
        and scl.status = 'active'
       left join curriculum_sections cs
         on cs.id = l.section_id
        and cs.class_id = l.class_id
        and cs.subject_id = l.subject_id
       join media_assets ma on ma.id = la.media_asset_id and ma.status = 'ready'
       where la.id = $2
         and la.publication_status = 'published'
         and l.status = 'active'
         and l.published_at is not null
         and (l.section_id is null or cs.status = 'active')
         and exists (
           select 1
           from student_entitlements e
           where e.profile_id = $1
             and e.status = 'active'
             and e.starts_at <= now()
             and (e.expires_at is null or e.expires_at > now())
             and (
               e.scope = 'all_content'
               or (e.scope = 'class' and e.class_id = l.class_id)
             )
         )
       limit 1`,
      [profileId, assetId],
    );
    const asset = rows[0];
    if (!asset) throw new AppError("NOT_FOUND", "محتوى الدرس غير متاح", 404);
    if (asset.byte_size === null || asset.checksum_sha256 === null) {
      throw new AppError("SERVICE_UNAVAILABLE", "محتوى الدرس غير جاهز للعرض", 503);
    }

    let bytes: Buffer;
    try {
      bytes = await this.storage.read(asset.storage_key);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new AppError("SERVICE_UNAVAILABLE", "ملف الدرس غير متاح مؤقتًا", 503);
      }
      throw error;
    }

    const byteSize = Number(asset.byte_size);
    const checksumSha256 = asset.checksum_sha256.toLowerCase();
    const actualChecksum = createHash("sha256").update(bytes).digest("hex");
    if (bytes.byteLength !== byteSize || actualChecksum !== checksumSha256) {
      throw new AppError("SERVICE_UNAVAILABLE", "تعذر التحقق من سلامة ملف الدرس", 503);
    }

    return {
      bytes,
      mimeType: asset.mime_type,
      byteSize,
      checksumSha256,
    };
  }
}
