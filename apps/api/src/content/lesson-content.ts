import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

export type LessonContentPublicationAction = "submit_review" | "return_to_draft" | "publish";

type LessonAssetPublicationStatus = "draft" | "review" | "published";
type LessonRecordStatus = "active" | "inactive" | "archived";

interface LessonStateRow {
  id: string;
  title: string;
  status: LessonRecordStatus;
  published_at: Date | null;
  total_count: string;
  draft_count: string;
  review_count: string;
  published_count: string;
  review_ready_count: string;
  review_blocked_count: string;
}

interface LessonRow {
  id: string;
  title: string;
  status: LessonRecordStatus;
}

interface PublicationAssetRow {
  id: string;
  media_asset_id: string | null;
  publication_status: LessonAssetPublicationStatus;
  media_status: "processing" | "ready" | "failed" | null;
}

export interface AdminLessonContentState {
  lessonId: string;
  lessonTitle: string;
  lessonStatus: LessonRecordStatus;
  publishedAt: Date | null;
  counts: {
    total: number;
    draft: number;
    review: number;
    published: number;
    reviewReady: number;
    reviewBlocked: number;
  };
}

async function recordLessonContentEvent(
  tx: QueryExecutor,
  actorProfileId: string,
  lessonId: string,
  eventType: string,
  assetCount: number,
): Promise<void> {
  await tx.query(
    `insert into curriculum_events (actor_profile_id, resource_type, resource_key, event_type, metadata)
     values ($1, 'lesson', $2, $3, $4::jsonb)`,
    [actorProfileId, lessonId, eventType, JSON.stringify({ assetCount })],
  );
}

function mapState(row: LessonStateRow): AdminLessonContentState {
  return {
    lessonId: row.id,
    lessonTitle: row.title,
    lessonStatus: row.status,
    publishedAt: row.published_at,
    counts: {
      total: Number(row.total_count),
      draft: Number(row.draft_count),
      review: Number(row.review_count),
      published: Number(row.published_count),
      reviewReady: Number(row.review_ready_count),
      reviewBlocked: Number(row.review_blocked_count),
    },
  };
}

export class AdminLessonContentService {
  constructor(private readonly database: Database) {}

  async state(lessonId: string): Promise<AdminLessonContentState> {
    const rows = await this.database.query<LessonStateRow>(
      `select l.id, l.title, l.status, l.published_at,
              count(la.id)::text as total_count,
              count(la.id) filter (where la.publication_status = 'draft')::text as draft_count,
              count(la.id) filter (where la.publication_status = 'review')::text as review_count,
              count(la.id) filter (where la.publication_status = 'published')::text as published_count,
              count(la.id) filter (
                where la.publication_status = 'review' and ma.status = 'ready'
              )::text as review_ready_count,
              count(la.id) filter (
                where la.publication_status = 'review'
                  and (la.media_asset_id is null or ma.status is distinct from 'ready')
              )::text as review_blocked_count
         from lessons l
         left join lesson_assets la on la.lesson_id = l.id
         left join media_assets ma on ma.id = la.media_asset_id
        where l.id = $1
        group by l.id, l.title, l.status, l.published_at`,
      [lessonId],
    );
    const row = rows[0];
    if (!row) throw new AppError("NOT_FOUND", "الدرس غير موجود", 404);
    return mapState(row);
  }

  async transition(
    actorProfileId: string,
    lessonId: string,
    action: LessonContentPublicationAction,
  ): Promise<AdminLessonContentState> {
    await this.database.transaction(async (tx) => {
      const lessonRows = await tx.query<LessonRow>(
        "select id, title, status from lessons where id = $1 for update",
        [lessonId],
      );
      const lesson = lessonRows[0];
      if (!lesson) throw new AppError("NOT_FOUND", "الدرس غير موجود", 404);
      if (lesson.status === "archived") {
        throw new AppError("CONFLICT", "لا يمكن تغيير نشر محتوى درس مؤرشف", 409);
      }

      const requiredStatus: LessonAssetPublicationStatus = action === "submit_review" ? "draft" : "review";
      const assets = await tx.query<PublicationAssetRow>(
        `select la.id, la.media_asset_id, la.publication_status, ma.status as media_status
           from lesson_assets la
           left join media_assets ma on ma.id = la.media_asset_id
          where la.lesson_id = $1 and la.publication_status = $2::lesson_asset_publication_status
          order by la.position, la.id
          for update of la`,
        [lessonId, requiredStatus],
      );

      if (assets.length === 0) {
        const message =
          action === "submit_review"
            ? "لا توجد مسودات جديدة لإرسالها إلى المراجعة"
            : action === "return_to_draft"
              ? "لا يوجد محتوى قيد المراجعة لإعادته إلى المسودة"
              : "لا يوجد محتوى قيد المراجعة لنشره";
        throw new AppError("CONFLICT", message, 409);
      }

      if (
        action === "publish" &&
        assets.some((asset) => asset.media_asset_id === null || asset.media_status !== "ready")
      ) {
        throw new AppError("CONFLICT", "لا يمكن النشر لأن بعض محتوى المراجعة غير جاهز للعرض", 409);
      }

      if (action === "submit_review") {
        await tx.query(
          `update lesson_assets
              set publication_status = 'review',
                  submitted_for_review_by_profile_id = $2,
                  submitted_for_review_at = now()
            where lesson_id = $1 and publication_status = 'draft'`,
          [lessonId, actorProfileId],
        );
        await recordLessonContentEvent(
          tx,
          actorProfileId,
          lessonId,
          "lesson_content_submitted_for_review",
          assets.length,
        );
        return;
      }

      if (action === "return_to_draft") {
        await tx.query(
          `update lesson_assets
              set publication_status = 'draft',
                  submitted_for_review_by_profile_id = null,
                  submitted_for_review_at = null,
                  published_by_profile_id = null,
                  asset_published_at = null
            where lesson_id = $1 and publication_status = 'review'`,
          [lessonId],
        );
        await recordLessonContentEvent(
          tx,
          actorProfileId,
          lessonId,
          "lesson_content_returned_to_draft",
          assets.length,
        );
        return;
      }

      await tx.query(
        `update lesson_assets
            set publication_status = 'published',
                published_by_profile_id = $2,
                asset_published_at = now()
          where lesson_id = $1 and publication_status = 'review'`,
        [lessonId, actorProfileId],
      );
      await tx.query(
        `update lessons
            set content_revision = content_revision + 1,
                published_at = now()
          where id = $1`,
        [lessonId],
      );
      await recordLessonContentEvent(
        tx,
        actorProfileId,
        lessonId,
        "lesson_content_published",
        assets.length,
      );
    });

    return this.state(lessonId);
  }
}
