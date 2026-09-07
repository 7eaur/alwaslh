import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

export type CurriculumRecordStatus = "active" | "inactive" | "archived";

export interface CurriculumClassView {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  status: CurriculumRecordStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurriculumSubjectView {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: CurriculumRecordStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectOfferingView {
  classId: string;
  subjectId: string;
  position: number;
  status: CurriculumRecordStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurriculumSectionView {
  id: string;
  classId: string;
  subjectId: string;
  slug: string;
  title: string;
  description: string | null;
  position: number;
  status: CurriculumRecordStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurriculumLessonView {
  id: string;
  classId: string;
  subjectId: string;
  sectionId: string | null;
  slug: string;
  title: string;
  summary: string | null;
  position: number;
  status: CurriculumRecordStatus;
  contentRevision: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCurriculumSnapshot {
  classes: CurriculumClassView[];
  subjects: CurriculumSubjectView[];
  offerings: SubjectOfferingView[];
  sections: CurriculumSectionView[];
  lessons: CurriculumLessonView[];
}

export interface CreateClassInput {
  slug: string;
  name: string;
  description?: string | null | undefined;
  position?: number | undefined;
  status?: CurriculumRecordStatus | undefined;
}

export interface UpdateClassInput {
  name?: string | undefined;
  description?: string | null | undefined;
  position?: number | undefined;
  status?: CurriculumRecordStatus | undefined;
}

export interface CreateSubjectInput {
  slug: string;
  name: string;
  description?: string | null | undefined;
  status?: CurriculumRecordStatus | undefined;
}

export interface UpdateSubjectInput {
  name?: string | undefined;
  description?: string | null | undefined;
  status?: CurriculumRecordStatus | undefined;
}

export interface CreateOfferingInput {
  classId: string;
  subjectId: string;
  position?: number | undefined;
  status?: CurriculumRecordStatus | undefined;
}

export interface UpdateOfferingInput {
  position?: number | undefined;
  status?: CurriculumRecordStatus | undefined;
}

export interface CreateSectionInput {
  classId: string;
  subjectId: string;
  slug: string;
  title: string;
  description?: string | null | undefined;
  position?: number | undefined;
  status?: CurriculumRecordStatus | undefined;
}

export interface UpdateSectionInput {
  title?: string | undefined;
  description?: string | null | undefined;
  position?: number | undefined;
  status?: CurriculumRecordStatus | undefined;
}

export interface CreateLessonInput {
  classId: string;
  subjectId: string;
  sectionId?: string | null | undefined;
  slug: string;
  title: string;
  summary?: string | null | undefined;
  position?: number | undefined;
  status?: CurriculumRecordStatus | undefined;
}

export interface UpdateLessonInput {
  sectionId?: string | null | undefined;
  title?: string | undefined;
  summary?: string | null | undefined;
  position?: number | undefined;
  status?: CurriculumRecordStatus | undefined;
}

interface ClassRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  status: CurriculumRecordStatus;
  created_at: Date;
  updated_at: Date;
}

interface SubjectRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: CurriculumRecordStatus;
  created_at: Date;
  updated_at: Date;
}

interface OfferingRow {
  class_id: string;
  subject_id: string;
  position: number;
  status: CurriculumRecordStatus;
  created_at: Date;
  updated_at: Date;
}

interface SectionRow {
  id: string;
  class_id: string;
  subject_id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number;
  status: CurriculumRecordStatus;
  created_at: Date;
  updated_at: Date;
}

interface LessonRow {
  id: string;
  class_id: string;
  subject_id: string;
  section_id: string | null;
  slug: string;
  title: string;
  summary: string | null;
  position: number;
  status: CurriculumRecordStatus;
  content_revision: number;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const classColumns = "id, slug, name, description, position, status, created_at, updated_at";
const subjectColumns = "id, slug, name, description, status, created_at, updated_at";
const offeringColumns = "class_id, subject_id, position, status, created_at, updated_at";
const sectionColumns =
  "id, class_id, subject_id, slug, title, description, position, status, created_at, updated_at";
const lessonColumns =
  "id, class_id, subject_id, section_id, slug, title, summary, position, status, content_revision, published_at, created_at, updated_at";

function requiredText(value: string): string {
  return value.trim();
}

function slug(value: string): string {
  return requiredText(value).toLowerCase().replace(/\s+/g, "-");
}

function nullableText(value: string | null): string | null {
  if (value === null) return null;
  const normalized = value.trim();
  return normalized.length === 0 ? null : normalized;
}

function classView(row: ClassRow): CurriculumClassView {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    position: row.position,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function subjectView(row: SubjectRow): CurriculumSubjectView {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function offeringView(row: OfferingRow): SubjectOfferingView {
  return {
    classId: row.class_id,
    subjectId: row.subject_id,
    position: row.position,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sectionView(row: SectionRow): CurriculumSectionView {
  return {
    id: row.id,
    classId: row.class_id,
    subjectId: row.subject_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    position: row.position,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function lessonView(row: LessonRow): CurriculumLessonView {
  return {
    id: row.id,
    classId: row.class_id,
    subjectId: row.subject_id,
    sectionId: row.section_id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    position: row.position,
    status: row.status,
    contentRevision: row.content_revision,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function addPatch(sets: string[], values: unknown[], column: string, value: unknown): void {
  values.push(value);
  sets.push(`${column} = $${values.length}`);
}

async function recordEvent(
  tx: QueryExecutor,
  actorProfileId: string,
  resourceType: string,
  resourceKey: string,
  eventType: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await tx.query(
    `insert into curriculum_events (
       actor_profile_id, resource_type, resource_key, event_type, metadata
     ) values ($1, $2, $3, $4, $5::jsonb)`,
    [actorProfileId, resourceType, resourceKey, eventType, JSON.stringify(metadata)],
  );
}

async function assertClassAvailable(tx: QueryExecutor, classId: string): Promise<void> {
  const rows = await tx.query<{ status: CurriculumRecordStatus }>(
    "select status from classes where id = $1 for update",
    [classId],
  );
  const row = rows[0];
  if (!row) throw new AppError("NOT_FOUND", "الصف غير موجود", 404);
  if (row.status === "archived") throw new AppError("CONFLICT", "لا يمكن استخدام صف مؤرشف", 409);
}

async function assertSubjectAvailable(tx: QueryExecutor, subjectId: string): Promise<void> {
  const rows = await tx.query<{ status: CurriculumRecordStatus }>(
    "select status from subjects where id = $1 for update",
    [subjectId],
  );
  const row = rows[0];
  if (!row) throw new AppError("NOT_FOUND", "المادة غير موجودة", 404);
  if (row.status === "archived") throw new AppError("CONFLICT", "لا يمكن استخدام مادة مؤرشفة", 409);
}

async function assertOfferingAvailable(tx: QueryExecutor, classId: string, subjectId: string): Promise<void> {
  const rows = await tx.query<{
    offering_status: CurriculumRecordStatus;
    class_status: CurriculumRecordStatus;
    subject_status: CurriculumRecordStatus;
  }>(
    `select o.status as offering_status, c.status as class_status, s.status as subject_status
       from subject_class_links o
       join classes c on c.id = o.class_id
       join subjects s on s.id = o.subject_id
      where o.class_id = $1 and o.subject_id = $2
      for update of o, c, s`,
    [classId, subjectId],
  );
  const row = rows[0];
  if (!row) throw new AppError("NOT_FOUND", "عرض المادة غير موجود لهذا الصف", 404);
  if (
    row.class_status === "archived" ||
    row.subject_status === "archived" ||
    row.offering_status === "archived"
  ) {
    throw new AppError("CONFLICT", "لا يمكن الإضافة إلى عرض مادة مؤرشف", 409);
  }
}

async function assertSectionScope(
  tx: QueryExecutor,
  sectionId: string,
  classId: string,
  subjectId: string,
): Promise<void> {
  const rows = await tx.query<{ status: CurriculumRecordStatus }>(
    `select status
       from curriculum_sections
      where id = $1 and class_id = $2 and subject_id = $3
      for update`,
    [sectionId, classId, subjectId],
  );
  const row = rows[0];
  if (!row) throw new AppError("CONFLICT", "الوحدة أو القسم لا يتبع عرض المادة نفسه", 409);
  if (row.status === "archived") throw new AppError("CONFLICT", "لا يمكن ربط الدرس بوحدة أو قسم مؤرشف", 409);
}

export class CurriculumService {
  constructor(private readonly db: Database) {}

  async snapshot(): Promise<AdminCurriculumSnapshot> {
    const [classes, subjects, offerings, sections, lessons] = await Promise.all([
      this.db.query<ClassRow>(`select ${classColumns} from classes order by position, name, id`),
      this.db.query<SubjectRow>(`select ${subjectColumns} from subjects order by name, id`),
      this.db.query<OfferingRow>(
        `select ${offeringColumns} from subject_class_links order by class_id, position, subject_id`,
      ),
      this.db.query<SectionRow>(
        `select ${sectionColumns}
           from curriculum_sections
          order by class_id, subject_id, position, title, id`,
      ),
      this.db.query<LessonRow>(
        `select ${lessonColumns}
           from lessons
          order by class_id, subject_id, section_id nulls first, position, title, id`,
      ),
    ]);

    return {
      classes: classes.map(classView),
      subjects: subjects.map(subjectView),
      offerings: offerings.map(offeringView),
      sections: sections.map(sectionView),
      lessons: lessons.map(lessonView),
    };
  }

  async createClass(actorProfileId: string, input: CreateClassInput): Promise<CurriculumClassView> {
    return this.db.transaction(async (tx) => {
      const normalizedSlug = slug(input.slug);
      const rows = await tx.query<ClassRow>(
        `insert into classes (slug, name, description, position, status)
         values ($1, $2, $3, $4, $5)
         on conflict (slug) do nothing
         returning ${classColumns}`,
        [
          normalizedSlug,
          requiredText(input.name),
          input.description === undefined ? null : nullableText(input.description),
          input.position ?? 0,
          input.status ?? "active",
        ],
      );
      const row = rows[0];
      if (!row) throw new AppError("CONFLICT", "يوجد صف بنفس المعرّف المختصر", 409);
      await recordEvent(tx, actorProfileId, "class", row.id, "created", { slug: row.slug });
      return classView(row);
    });
  }

  async updateClass(
    actorProfileId: string,
    classId: string,
    input: UpdateClassInput,
  ): Promise<CurriculumClassView> {
    return this.db.transaction(async (tx) => {
      const values: unknown[] = [classId];
      const sets: string[] = [];
      if (input.name !== undefined) addPatch(sets, values, "name", requiredText(input.name));
      if (input.description !== undefined)
        addPatch(sets, values, "description", nullableText(input.description));
      if (input.position !== undefined) addPatch(sets, values, "position", input.position);
      if (input.status !== undefined) addPatch(sets, values, "status", input.status);
      if (sets.length === 0) throw new AppError("BAD_REQUEST", "لم يتم إرسال أي تغيير", 400);

      const rows = await tx.query<ClassRow>(
        `update classes set ${sets.join(", ")} where id = $1 returning ${classColumns}`,
        values,
      );
      const row = rows[0];
      if (!row) throw new AppError("NOT_FOUND", "الصف غير موجود", 404);
      await recordEvent(tx, actorProfileId, "class", row.id, "updated", { fields: Object.keys(input) });
      return classView(row);
    });
  }

  async createSubject(actorProfileId: string, input: CreateSubjectInput): Promise<CurriculumSubjectView> {
    return this.db.transaction(async (tx) => {
      const normalizedSlug = slug(input.slug);
      const rows = await tx.query<SubjectRow>(
        `insert into subjects (slug, name, description, status)
         values ($1, $2, $3, $4)
         on conflict (slug) do nothing
         returning ${subjectColumns}`,
        [
          normalizedSlug,
          requiredText(input.name),
          input.description === undefined ? null : nullableText(input.description),
          input.status ?? "active",
        ],
      );
      const row = rows[0];
      if (!row) throw new AppError("CONFLICT", "توجد مادة بنفس المعرّف المختصر", 409);
      await recordEvent(tx, actorProfileId, "subject", row.id, "created", { slug: row.slug });
      return subjectView(row);
    });
  }

  async updateSubject(
    actorProfileId: string,
    subjectId: string,
    input: UpdateSubjectInput,
  ): Promise<CurriculumSubjectView> {
    return this.db.transaction(async (tx) => {
      const values: unknown[] = [subjectId];
      const sets: string[] = [];
      if (input.name !== undefined) addPatch(sets, values, "name", requiredText(input.name));
      if (input.description !== undefined)
        addPatch(sets, values, "description", nullableText(input.description));
      if (input.status !== undefined) addPatch(sets, values, "status", input.status);
      if (sets.length === 0) throw new AppError("BAD_REQUEST", "لم يتم إرسال أي تغيير", 400);

      const rows = await tx.query<SubjectRow>(
        `update subjects set ${sets.join(", ")} where id = $1 returning ${subjectColumns}`,
        values,
      );
      const row = rows[0];
      if (!row) throw new AppError("NOT_FOUND", "المادة غير موجودة", 404);
      await recordEvent(tx, actorProfileId, "subject", row.id, "updated", { fields: Object.keys(input) });
      return subjectView(row);
    });
  }

  async createOffering(actorProfileId: string, input: CreateOfferingInput): Promise<SubjectOfferingView> {
    return this.db.transaction(async (tx) => {
      await assertClassAvailable(tx, input.classId);
      await assertSubjectAvailable(tx, input.subjectId);
      const rows = await tx.query<OfferingRow>(
        `insert into subject_class_links (class_id, subject_id, position, status)
         values ($1, $2, $3, $4)
         on conflict (class_id, subject_id) do nothing
         returning ${offeringColumns}`,
        [input.classId, input.subjectId, input.position ?? 0, input.status ?? "active"],
      );
      const row = rows[0];
      if (!row) throw new AppError("CONFLICT", "المادة مرتبطة بهذا الصف بالفعل", 409);
      await recordEvent(tx, actorProfileId, "offering", `${row.class_id}:${row.subject_id}`, "created");
      return offeringView(row);
    });
  }

  async updateOffering(
    actorProfileId: string,
    classId: string,
    subjectId: string,
    input: UpdateOfferingInput,
  ): Promise<SubjectOfferingView> {
    return this.db.transaction(async (tx) => {
      const values: unknown[] = [classId, subjectId];
      const sets: string[] = [];
      if (input.position !== undefined) addPatch(sets, values, "position", input.position);
      if (input.status !== undefined) addPatch(sets, values, "status", input.status);
      if (sets.length === 0) throw new AppError("BAD_REQUEST", "لم يتم إرسال أي تغيير", 400);

      const rows = await tx.query<OfferingRow>(
        `update subject_class_links
            set ${sets.join(", ")}
          where class_id = $1 and subject_id = $2
          returning ${offeringColumns}`,
        values,
      );
      const row = rows[0];
      if (!row) throw new AppError("NOT_FOUND", "عرض المادة غير موجود لهذا الصف", 404);
      await recordEvent(tx, actorProfileId, "offering", `${classId}:${subjectId}`, "updated", {
        fields: Object.keys(input),
      });
      return offeringView(row);
    });
  }

  async createSection(actorProfileId: string, input: CreateSectionInput): Promise<CurriculumSectionView> {
    return this.db.transaction(async (tx) => {
      await assertOfferingAvailable(tx, input.classId, input.subjectId);
      const normalizedSlug = slug(input.slug);
      const rows = await tx.query<SectionRow>(
        `insert into curriculum_sections (
           class_id, subject_id, slug, title, description, position, status
         ) values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (class_id, subject_id, slug) do nothing
         returning ${sectionColumns}`,
        [
          input.classId,
          input.subjectId,
          normalizedSlug,
          requiredText(input.title),
          input.description === undefined ? null : nullableText(input.description),
          input.position ?? 0,
          input.status ?? "active",
        ],
      );
      const row = rows[0];
      if (!row) throw new AppError("CONFLICT", "توجد وحدة أو قسم بنفس المعرّف داخل عرض المادة", 409);
      await recordEvent(tx, actorProfileId, "section", row.id, "created", {
        classId: row.class_id,
        subjectId: row.subject_id,
        slug: row.slug,
      });
      return sectionView(row);
    });
  }

  async updateSection(
    actorProfileId: string,
    sectionId: string,
    input: UpdateSectionInput,
  ): Promise<CurriculumSectionView> {
    return this.db.transaction(async (tx) => {
      const values: unknown[] = [sectionId];
      const sets: string[] = [];
      if (input.title !== undefined) addPatch(sets, values, "title", requiredText(input.title));
      if (input.description !== undefined)
        addPatch(sets, values, "description", nullableText(input.description));
      if (input.position !== undefined) addPatch(sets, values, "position", input.position);
      if (input.status !== undefined) addPatch(sets, values, "status", input.status);
      if (sets.length === 0) throw new AppError("BAD_REQUEST", "لم يتم إرسال أي تغيير", 400);

      const rows = await tx.query<SectionRow>(
        `update curriculum_sections set ${sets.join(", ")} where id = $1 returning ${sectionColumns}`,
        values,
      );
      const row = rows[0];
      if (!row) throw new AppError("NOT_FOUND", "الوحدة أو القسم غير موجود", 404);
      await recordEvent(tx, actorProfileId, "section", row.id, "updated", { fields: Object.keys(input) });
      return sectionView(row);
    });
  }

  async createLesson(actorProfileId: string, input: CreateLessonInput): Promise<CurriculumLessonView> {
    return this.db.transaction(async (tx) => {
      await assertOfferingAvailable(tx, input.classId, input.subjectId);
      if (input.sectionId) await assertSectionScope(tx, input.sectionId, input.classId, input.subjectId);
      const normalizedSlug = slug(input.slug);
      const rows = await tx.query<LessonRow>(
        `insert into lessons (
           class_id, subject_id, section_id, slug, title, summary, position, status
         ) values ($1, $2, $3, $4, $5, $6, $7, $8)
         on conflict (class_id, subject_id, slug) do nothing
         returning ${lessonColumns}`,
        [
          input.classId,
          input.subjectId,
          input.sectionId ?? null,
          normalizedSlug,
          requiredText(input.title),
          input.summary === undefined ? null : nullableText(input.summary),
          input.position ?? 0,
          input.status ?? "active",
        ],
      );
      const row = rows[0];
      if (!row) throw new AppError("CONFLICT", "يوجد درس بنفس المعرّف داخل عرض المادة", 409);
      await recordEvent(tx, actorProfileId, "lesson", row.id, "created", {
        classId: row.class_id,
        subjectId: row.subject_id,
        sectionId: row.section_id,
        slug: row.slug,
      });
      return lessonView(row);
    });
  }

  async updateLesson(
    actorProfileId: string,
    lessonId: string,
    input: UpdateLessonInput,
  ): Promise<CurriculumLessonView> {
    return this.db.transaction(async (tx) => {
      const currentRows = await tx.query<Pick<LessonRow, "class_id" | "subject_id">>(
        "select class_id, subject_id from lessons where id = $1 for update",
        [lessonId],
      );
      const current = currentRows[0];
      if (!current) throw new AppError("NOT_FOUND", "الدرس غير موجود", 404);

      if (input.sectionId !== undefined && input.sectionId !== null) {
        await assertSectionScope(tx, input.sectionId, current.class_id, current.subject_id);
      }

      const values: unknown[] = [lessonId];
      const sets: string[] = [];
      if (input.sectionId !== undefined) addPatch(sets, values, "section_id", input.sectionId);
      if (input.title !== undefined) addPatch(sets, values, "title", requiredText(input.title));
      if (input.summary !== undefined) addPatch(sets, values, "summary", nullableText(input.summary));
      if (input.position !== undefined) addPatch(sets, values, "position", input.position);
      if (input.status !== undefined) addPatch(sets, values, "status", input.status);
      if (sets.length === 0) throw new AppError("BAD_REQUEST", "لم يتم إرسال أي تغيير", 400);

      const rows = await tx.query<LessonRow>(
        `update lessons set ${sets.join(", ")} where id = $1 returning ${lessonColumns}`,
        values,
      );
      const row = rows[0];
      if (!row) throw new AppError("NOT_FOUND", "الدرس غير موجود", 404);
      await recordEvent(tx, actorProfileId, "lesson", row.id, "updated", { fields: Object.keys(input) });
      return lessonView(row);
    });
  }
}
