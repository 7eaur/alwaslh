import type { Database } from "../db.js";
import { AppError } from "../errors.js";

export type LessonHistorySource = "all" | "curriculum" | "question_bank" | "ai";

export interface LessonAuthoringExportInput {
  lessonIds: string[];
  historySource?: LessonHistorySource | undefined;
  eventType?: string | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
}

export interface LessonAuthoringExportBundle {
  filenameBase: string;
  contentCsv: string;
  historyCsv: string;
  printHtml: string;
  counts: {
    lessons: number;
    questions: number;
    historyEvents: number;
  };
}

interface LessonRow {
  id: string;
  class_name: string;
  subject_name: string;
  title: string;
  summary: string | null;
  status: string;
  content_revision: number;
  updated_at: Date;
}

interface QuestionRow {
  lesson_id: string;
  item_id: string;
  revision_number: number;
  status: string;
  type: string;
  difficulty: string;
  prompt: string;
  answer_text: string | null;
  explanation: string | null;
}

interface HistoryRow {
  source: Exclude<LessonHistorySource, "all">;
  event_type: string;
  status: string | null;
  resource_type: string;
  resource_id: string;
  actor_profile_id: string | null;
  created_at: Date;
}

function safeCsvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function csv(rows: readonly (readonly unknown[])[]): string {
  return `${rows.map((row) => row.map(safeCsvCell).join(",")).join("\n")}\n`;
}

function html(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function filenameDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function withinRange(row: HistoryRow, input: LessonAuthoringExportInput): boolean {
  if (input.historySource && input.historySource !== "all" && row.source !== input.historySource)
    return false;
  if (input.eventType && row.event_type !== input.eventType.trim()) return false;
  if (input.from && row.created_at < input.from) return false;
  if (input.to && row.created_at > input.to) return false;
  return true;
}

export class LessonAuthoringExportService {
  constructor(private readonly db: Database) {}

  async bundle(input: LessonAuthoringExportInput): Promise<LessonAuthoringExportBundle> {
    const lessonIds = [...new Set(input.lessonIds)];
    if (lessonIds.length === 0 || lessonIds.length > 32) {
      throw new AppError("BAD_REQUEST", "اختر من درس واحد إلى 32 درسًا للتصدير", 400);
    }

    const lessons = await this.db.query<LessonRow>(
      `select l.id, c.name as class_name, s.name as subject_name, l.title, l.summary,
              l.status::text, l.content_revision, l.updated_at
         from lessons l
         join classes c on c.id = l.class_id
         join subjects s on s.id = l.subject_id
        where l.id = any($1::uuid[])
        order by c.position, c.name, s.name, l.position, l.title, l.id`,
      [lessonIds],
    );
    if (lessons.length !== lessonIds.length) {
      throw new AppError("NOT_FOUND", "تعذر العثور على أحد الدروس المحددة", 404);
    }

    const questions = await this.db.query<QuestionRow>(
      `with latest_revision as (
         select distinct on (r.item_id)
                r.id, r.item_id, r.revision_number, r.status, r.type, r.difficulty,
                r.prompt, r.answer_text, r.explanation
           from question_bank_revisions r
           join question_bank_items i on i.id = r.item_id
          where i.archived_at is null
          order by r.item_id, r.revision_number desc
       )
       select qbl.lesson_id, lr.item_id, lr.revision_number, lr.status::text,
              lr.type::text, lr.difficulty::text, lr.prompt, lr.answer_text, lr.explanation
         from latest_revision lr
         join question_bank_revision_lessons qbl on qbl.revision_id = lr.id
        where qbl.lesson_id = any($1::uuid[])
        order by qbl.lesson_id, lr.item_id`,
      [lessonIds],
    );

    const history = (await this.history(lessonIds)).filter((row) => withinRange(row, input));
    const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
    const contentRows: unknown[][] = [
      [
        "row_type",
        "class",
        "subject",
        "lesson_id",
        "lesson",
        "lesson_status",
        "content_revision",
        "question_item_id",
        "question_revision",
        "question_status",
        "question_type",
        "difficulty",
        "prompt",
        "answer",
        "explanation",
        "summary",
        "lesson_updated_at",
      ],
    ];
    for (const lesson of lessons) {
      contentRows.push([
        "lesson_summary",
        lesson.class_name,
        lesson.subject_name,
        lesson.id,
        lesson.title,
        lesson.status,
        lesson.content_revision,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        lesson.summary ?? "",
        lesson.updated_at.toISOString(),
      ]);
    }
    for (const question of questions) {
      const lesson = lessonById.get(question.lesson_id);
      if (!lesson) continue;
      contentRows.push([
        "question",
        lesson.class_name,
        lesson.subject_name,
        lesson.id,
        lesson.title,
        lesson.status,
        lesson.content_revision,
        question.item_id,
        question.revision_number,
        question.status,
        question.type,
        question.difficulty,
        question.prompt,
        question.answer_text ?? "",
        question.explanation ?? "",
        "",
        lesson.updated_at.toISOString(),
      ]);
    }

    const historyRows: unknown[][] = [
      ["source", "event_type", "status", "resource_type", "resource_id", "actor_profile_id", "created_at"],
    ];
    for (const event of history) {
      historyRows.push([
        event.source,
        event.event_type,
        event.status ?? "",
        event.resource_type,
        event.resource_id,
        event.actor_profile_id ?? "",
        event.created_at.toISOString(),
      ]);
    }

    const printSections = lessons
      .map((lesson) => {
        const lessonQuestions = questions.filter((question) => question.lesson_id === lesson.id);
        return `<section><h2>${html(lesson.title)}</h2><p class="meta">${html(lesson.class_name)} · ${html(lesson.subject_name)} · revision ${html(lesson.content_revision)}</p><h3>الملخص</h3><p>${html(lesson.summary ?? "لا يوجد ملخص محفوظ")}</p><h3>الأسئلة</h3>${
          lessonQuestions.length === 0
            ? "<p>لا توجد أسئلة مرتبطة بالدرس.</p>"
            : `<ol>${lessonQuestions
                .map(
                  (question) =>
                    `<li><strong>${html(question.prompt)}</strong><div>${html(question.answer_text ?? "الإجابة قيد المراجعة")}</div>${question.explanation ? `<small>${html(question.explanation)}</small>` : ""}</li>`,
                )
                .join("")}</ol>`
        }</section>`;
      })
      .join("");

    return {
      filenameBase: `lesson-authoring-${filenameDate()}`,
      contentCsv: csv(contentRows),
      historyCsv: csv(historyRows),
      printHtml: `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>تصدير محتوى الدروس</title><style>body{font-family:system-ui,sans-serif;max-width:900px;margin:32px auto;padding:0 20px;line-height:1.8;color:#171717}section{break-inside:avoid;border-bottom:1px solid #ddd;padding:0 0 24px;margin:0 0 24px}.meta{color:#666}li{margin-block:12px}small{display:block;color:#555}@media print{body{max-width:none;margin:0}}</style></head><body><h1>محتوى الدروس المحددة</h1>${printSections}</body></html>`,
      counts: {
        lessons: lessons.length,
        questions: questions.length,
        historyEvents: history.length,
      },
    };
  }

  private async history(lessonIds: string[]): Promise<HistoryRow[]> {
    const [curriculum, questionBank, ai] = await Promise.all([
      this.db.query<HistoryRow>(
        `select 'curriculum'::text as source, event_type, null::text as status,
                resource_type, resource_key as resource_id, actor_profile_id, created_at
           from curriculum_events
          where resource_type = 'lesson'
            and resource_key = any($1::text[])`,
        [lessonIds],
      ),
      this.db.query<HistoryRow>(
        `select 'question_bank'::text as source, e.action::text as event_type,
                r.status::text as status, 'question_bank_item'::text as resource_type,
                e.item_id::text as resource_id, e.actor_profile_id, e.created_at
           from question_bank_events e
           left join question_bank_revisions r on r.id = e.revision_id
          where exists (
            select 1
              from question_bank_revisions scoped_revision
              join question_bank_revision_lessons qbl on qbl.revision_id = scoped_revision.id
             where scoped_revision.item_id = e.item_id
               and qbl.lesson_id = any($1::uuid[])
          )`,
        [lessonIds],
      ),
      this.db.query<HistoryRow>(
        `select 'ai'::text as source, j.job_type as event_type, j.status::text as status,
                'ai_job'::text as resource_type, j.id::text as resource_id,
                j.created_by_profile_id as actor_profile_id, j.created_at
           from ai_jobs j
          where j.input_manifest #>> '{authoring,kind}' = 'lesson_generation'
            and exists (
              select 1
                from jsonb_array_elements_text(
                  coalesce(j.input_manifest #> '{authoring,lessonIds}', '[]'::jsonb)
                ) as selected_lesson(lesson_id)
               where selected_lesson.lesson_id = any($1::text[])
            )`,
        [lessonIds],
      ),
    ]);
    return [...curriculum, ...questionBank, ...ai].sort(
      (left, right) => right.created_at.getTime() - left.created_at.getTime(),
    );
  }
}
