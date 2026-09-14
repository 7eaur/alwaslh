import type { Database } from "../db.js";
import type { StudentOfflineService } from "./service.js";

export type StudentOfflineDeltaEntityType = "lesson" | "lesson_asset";
export type StudentOfflineDeltaChangeType = "upsert" | "delete";

export interface StudentOfflineDeltaEntry {
  revision: string;
  entityType: StudentOfflineDeltaEntityType;
  entityId: string;
  changeType: StudentOfflineDeltaChangeType;
  classId: string | null;
  lessonId: string;
  contentRevision: number | null;
}

export interface StudentOfflineDeltaPage {
  version: 1;
  after: string;
  nextCursor: string;
  hasMore: boolean;
  entries: StudentOfflineDeltaEntry[];
}

interface RevisionRow {
  revision: string;
  entity_type: StudentOfflineDeltaEntityType;
  entity_id: string;
  change_type: StudentOfflineDeltaChangeType;
  class_id: string | null;
  lesson_id: string;
  content_revision: string | number | null;
}

interface MaxRevisionRow {
  revision: string;
}

function safeContentRevision(value: string | number | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : null;
}

export class StudentOfflineSyncService {
  constructor(
    private readonly db: Database,
    private readonly offline: StudentOfflineService,
  ) {}

  async delta(
    profileId: string,
    sessionToken: string | undefined,
    after: string,
    limit: number,
  ): Promise<StudentOfflineDeltaPage> {
    const lease = await this.offline.lease(profileId, sessionToken);
    const allContent = lease.grants.some((grant) => grant.scope === "all_content");
    const classIds = lease.grants.flatMap((grant) =>
      grant.scope === "class" && grant.classId ? [grant.classId] : [],
    );

    const maxRows = await this.db.query<MaxRevisionRow>(
      "select coalesce(max(revision), 0)::text as revision from content_revisions",
    );
    const upperBound = maxRows[0]?.revision ?? after;

    if (!allContent && classIds.length === 0) {
      return {
        version: 1,
        after,
        nextCursor: upperBound,
        hasMore: false,
        entries: [],
      };
    }

    const rows = await this.db.query<RevisionRow>(
      `select
         revision::text,
         entity_type,
         entity_id,
         change_type,
         class_id,
         metadata->>'lessonId' as lesson_id,
         metadata->>'contentRevision' as content_revision
       from content_revisions
       where revision > $1::bigint
         and revision <= $2::bigint
         and entity_type in ('lesson', 'lesson_asset')
         and metadata ? 'lessonId'
         and ($3::boolean or class_id = any($4::uuid[]))
       order by revision asc
       limit $5`,
      [after, upperBound, allContent, classIds, limit + 1],
    );

    const hasMore = rows.length > limit;
    const pageRows = rows.slice(0, limit);
    const nextCursor = hasMore
      ? (pageRows.at(-1)?.revision ?? after)
      : upperBound;

    return {
      version: 1,
      after,
      nextCursor,
      hasMore,
      entries: pageRows.map((row) => ({
        revision: row.revision,
        entityType: row.entity_type,
        entityId: row.entity_id,
        changeType: row.change_type,
        classId: row.class_id,
        lessonId: row.lesson_id,
        contentRevision: safeContentRevision(row.content_revision),
      })),
    };
  }
}
