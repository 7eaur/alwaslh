import type { Database } from "../db.js";
import { AppError } from "../errors.js";

export interface QuizQuestionCandidate {
  itemId: string;
  revisionId: string;
  revisionNumber: number;
  prompt: string;
  type: "multiple_choice" | "true_false" | "direct";
  difficulty: "easy" | "medium" | "hard";
  lessonIds: string[];
  sourcePages: number[];
}

export class QuizQuestionCandidateService {
  constructor(private readonly database: Database) {}

  async list(
    quizId: string,
    input: { search?: string; limit: number; offset: number },
  ): Promise<{ items: QuizQuestionCandidate[]; pagination: { total: number; limit: number; offset: number } }> {
    const quizzes = await this.database.query<{ class_id: string | null; subject_id: string | null }>(
      "select class_id, subject_id from quizzes where id = $1",
      [quizId],
    );
    const quiz = quizzes[0];
    if (!quiz) throw new AppError("NOT_FOUND", "الاختبار غير موجود", 404);
    if (!quiz.class_id || !quiz.subject_id) {
      throw new AppError("CONFLICT", "هذا الاختبار لا يستخدم نطاق Quiz Builder الجديد", 409);
    }
    const search = input.search?.trim() || null;
    const rows = await this.database.query<{
      item_id: string;
      revision_id: string;
      revision_number: number;
      prompt: string;
      type: QuizQuestionCandidate["type"];
      difficulty: QuizQuestionCandidate["difficulty"];
      lesson_ids: string[];
      source_pages: number[];
      total_count: string;
    }>(
      `select r.item_id, r.id as revision_id, r.revision_number, r.prompt, r.type, r.difficulty,
              array(
                select rl.lesson_id
                from question_bank_revision_lessons rl
                join quiz_lessons ql on ql.quiz_id = $1 and ql.lesson_id = rl.lesson_id
                where rl.revision_id = r.id
                order by rl.position
              ) as lesson_ids,
              array(
                select distinct s.page_number
                from question_bank_revision_sources s
                where s.revision_id = r.id
                order by s.page_number
              ) as source_pages,
              count(*) over()::text as total_count
       from question_bank_revisions r
       join question_bank_items i on i.id = r.item_id
       where i.class_id = $2
         and i.subject_id = $3
         and i.archived_at is null
         and r.status = 'published'
         and r.answer_status = 'known'
         and ($4::text is null or r.prompt ilike '%' || $4 || '%')
         and exists (
           select 1
           from question_bank_revision_lessons rl
           join quiz_lessons ql on ql.quiz_id = $1 and ql.lesson_id = rl.lesson_id
           where rl.revision_id = r.id
         )
       order by r.created_at desc, r.id desc
       limit $5 offset $6`,
      [quizId, quiz.class_id, quiz.subject_id, search, input.limit, input.offset],
    );
    return {
      items: rows.map((row) => ({
        itemId: row.item_id,
        revisionId: row.revision_id,
        revisionNumber: row.revision_number,
        prompt: row.prompt,
        type: row.type,
        difficulty: row.difficulty,
        lessonIds: row.lesson_ids,
        sourcePages: row.source_pages,
      })),
      pagination: { total: Number(rows[0]?.total_count ?? 0), limit: input.limit, offset: input.offset },
    };
  }
}
