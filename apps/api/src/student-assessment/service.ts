import { randomInt } from "node:crypto";
import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

export type StudentAssessmentMode = "practice" | "test";

export interface StudentAssessmentCatalogFilters {
  classId?: string;
  subjectId?: string;
}

export interface StudentAssessmentCatalogItem {
  id: string;
  title: string;
  description: string | null;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  shuffleVersions: boolean;
  versions: Array<{ id: string; versionNumber: number; label: string }>;
}

export interface StartStudentAssessmentInput {
  mode: StudentAssessmentMode;
  versionId?: string;
  restart?: boolean;
}

export interface StudentAssessmentQuestionView {
  id: string;
  position: number;
  lessonId: string | null;
  type: "multiple_choice" | "true_false" | "direct";
  prompt: string;
  options: Array<{ id: string; label: string; position: number }>;
  sourcePage: number | null;
  questionBankItemId: string | null;
  questionBankRevisionId: string | null;
  answer: null | { selectedOptionId: string | null; directAnswerText: string | null };
  feedback: null | {
    correct: boolean;
    correctOptionId: string | null;
    correctAnswerText: string | null;
    explanation: string | null;
    method: string | null;
  };
}

export interface StudentAssessmentSessionView {
  session: {
    id: string;
    mode: StudentAssessmentMode;
    status: "in_progress" | "completed" | "abandoned";
    currentQuestionId: string | null;
    startedAt: Date;
    completedAt: Date | null;
  };
  quiz: {
    id: string;
    title: string;
    description: string | null;
    classId: string;
    subjectId: string;
  };
  version: {
    id: string;
    versionNumber: number;
    label: string;
  };
  progress: {
    questionCount: number;
    answeredCount: number;
  };
  questions: StudentAssessmentQuestionView[];
  attempt: StudentAssessmentAttemptView | null;
}

export interface StudentAssessmentAnswerInput {
  selectedOptionId?: string | null;
  directAnswerText?: string | null;
}

export interface StudentAssessmentAttemptView {
  id: string;
  sessionId: string;
  quizId: string;
  quizTitle: string;
  versionId: string;
  versionLabel: string;
  mode: StudentAssessmentMode;
  correctCount: number;
  questionCount: number;
  scorePercent: number;
  completedAt: Date;
}

interface AccessibleQuizRow {
  id: string;
  title: string;
  description: string | null;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  shuffle_versions: boolean;
}

interface VersionRow {
  id: string;
  version_number: number;
  label: string | null;
  shuffle_questions: boolean;
  shuffle_options: boolean;
}

interface SessionRow {
  id: string;
  profile_id: string;
  mode: StudentAssessmentMode;
  status: "in_progress" | "completed" | "abandoned";
  current_question_id: string | null;
  started_at: Date;
  completed_at: Date | null;
  quiz_id: string;
  quiz_title: string;
  quiz_description: string | null;
  class_id: string;
  subject_id: string;
  quiz_version_id: string;
  version_number: number;
  version_label: string | null;
}

interface SessionQuestionRow {
  id: string;
  position: number;
  lesson_id: string | null;
  type: StudentAssessmentQuestionView["type"];
  prompt: string;
  answer_text: string | null;
  explanation: string | null;
  source_page: number | null;
  question_bank_item_id: string | null;
  question_bank_revision_id: string | null;
  method: string | null;
  selected_option_id: string | null;
  direct_answer_text: string | null;
}

interface SessionOptionRow {
  question_id: string;
  id: string;
  label: string;
  position: number;
  is_correct: boolean;
}

interface AttemptRow {
  id: string;
  session_id: string;
  quiz_id: string;
  quiz_title: string;
  quiz_version_id: string;
  version_label: string | null;
  mode: StudentAssessmentMode;
  correct_count: number;
  question_count: number;
  score_percent: string;
  completed_at: Date;
}

const ACCESSIBLE_QUIZ_FROM = `
  from quizzes q
  join classes c on c.id = q.class_id and c.status = 'active'
  join subjects s on s.id = q.subject_id and s.status = 'active'
  join subject_class_links scl
    on scl.class_id = q.class_id
   and scl.subject_id = q.subject_id
   and scl.status = 'active'
  where q.status = 'published'
    and q.published_at is not null
    and q.published_at <= now()
    and q.class_id is not null
    and q.subject_id is not null
    and exists (
      select 1
      from student_entitlements e
      where e.profile_id = $1
        and e.status = 'active'
        and e.starts_at <= now()
        and (e.expires_at is null or e.expires_at > now())
        and (
          e.scope = 'all_content'
          or (e.scope = 'class' and e.class_id = q.class_id)
        )
    )
    and exists (
      select 1
      from quiz_versions qv
      join questions qq on qq.quiz_version_id = qv.id
      where qv.quiz_id = q.id
    )
    and not exists (
      select 1
      from quiz_lessons ql
      join lessons l on l.id = ql.lesson_id
      left join curriculum_sections cs
        on cs.id = l.section_id
       and cs.class_id = l.class_id
       and cs.subject_id = l.subject_id
      where ql.quiz_id = q.id
        and (
          l.status <> 'active'
          or l.published_at is null
          or l.published_at > now()
          or (l.section_id is not null and (cs.id is null or cs.status <> 'active'))
        )
    )`;

function shuffle<T>(values: readonly T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = randomInt(index + 1);
    [result[index], result[target]] = [result[target] as T, result[index] as T];
  }
  return result;
}

function normalizeDirectAnswer(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}

function attemptView(row: AttemptRow): StudentAssessmentAttemptView {
  return {
    id: row.id,
    sessionId: row.session_id,
    quizId: row.quiz_id,
    quizTitle: row.quiz_title,
    versionId: row.quiz_version_id,
    versionLabel: row.version_label ?? "نموذج الاختبار",
    mode: row.mode,
    correctCount: row.correct_count,
    questionCount: row.question_count,
    scorePercent: Number(row.score_percent),
    completedAt: row.completed_at,
  };
}

export class StudentAssessmentService {
  constructor(private readonly db: Database) {}

  async catalog(
    profileId: string,
    filters: StudentAssessmentCatalogFilters = {},
  ): Promise<StudentAssessmentCatalogItem[]> {
    const quizzes = await this.db.query<AccessibleQuizRow>(
      `select q.id, q.title, q.description, q.class_id, c.name as class_name,
              q.subject_id, s.name as subject_name, q.shuffle_versions
       ${ACCESSIBLE_QUIZ_FROM}
         and ($2::uuid is null or q.class_id = $2)
         and ($3::uuid is null or q.subject_id = $3)
       order by c.position, c.id, s.name, s.id, q.created_at, q.id`,
      [profileId, filters.classId ?? null, filters.subjectId ?? null],
    );
    if (quizzes.length === 0) return [];

    const quizIds = quizzes.map((quiz) => quiz.id);
    const versions = await this.db.query<VersionRow & { quiz_id: string }>(
      `select v.quiz_id, v.id, v.version_number, v.label, v.shuffle_questions, v.shuffle_options
       from quiz_versions v
       where v.quiz_id = any($1::uuid[])
         and exists (select 1 from questions q where q.quiz_version_id = v.id)
       order by v.quiz_id, v.version_number, v.id`,
      [quizIds],
    );
    const versionsByQuiz = new Map<string, StudentAssessmentCatalogItem["versions"]>();
    for (const version of versions) {
      const list = versionsByQuiz.get(version.quiz_id) ?? [];
      list.push({
        id: version.id,
        versionNumber: version.version_number,
        label: version.label ?? `النموذج ${version.version_number}`,
      });
      versionsByQuiz.set(version.quiz_id, list);
    }

    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      classId: quiz.class_id,
      className: quiz.class_name,
      subjectId: quiz.subject_id,
      subjectName: quiz.subject_name,
      shuffleVersions: quiz.shuffle_versions,
      versions: versionsByQuiz.get(quiz.id) ?? [],
    }));
  }

  async start(
    profileId: string,
    quizId: string,
    input: StartStudentAssessmentInput,
  ): Promise<StudentAssessmentSessionView> {
    return this.db.transaction(async (tx) => {
      await tx.query("select pg_advisory_xact_lock(hashtextextended($1, 0))", [
        `student-assessment:${profileId}:${quizId}:${input.mode}`,
      ]);
      const quiz = await this.accessibleQuiz(tx, profileId, quizId);

      const existing = await tx.query<{ id: string }>(
        `select ps.id
         from practice_sessions ps
         join quiz_versions v on v.id = ps.quiz_version_id
         where ps.profile_id = $1
           and ps.mode = $2
           and ps.status = 'in_progress'
           and v.quiz_id = $3
         order by ps.started_at desc, ps.id
         limit 1
         for update of ps`,
        [profileId, input.mode, quizId],
      );
      if (existing[0] && !input.restart) {
        return this.sessionView(tx, profileId, existing[0].id, false);
      }
      if (input.restart) {
        await tx.query(
          `update practice_sessions ps
           set status = 'abandoned', current_question_id = null
           from quiz_versions v
           where v.id = ps.quiz_version_id
             and ps.profile_id = $1
             and ps.mode = $2
             and ps.status = 'in_progress'
             and v.quiz_id = $3`,
          [profileId, input.mode, quizId],
        );
      }

      const versions = await tx.query<VersionRow>(
        `select v.id, v.version_number, v.label, v.shuffle_questions, v.shuffle_options
         from quiz_versions v
         where v.quiz_id = $1
           and exists (select 1 from questions q where q.quiz_version_id = v.id)
         order by v.version_number, v.id`,
        [quizId],
      );
      if (versions.length === 0) throw new AppError("NOT_FOUND", "لا يوجد نموذج اختبار متاح", 404);

      let version: VersionRow | undefined;
      if (input.versionId) {
        version = versions.find((candidate) => candidate.id === input.versionId);
        if (!version) throw new AppError("BAD_REQUEST", "نموذج الاختبار غير صالح", 400);
      } else {
        version = quiz.shuffle_versions ? versions[randomInt(versions.length)] : versions[0];
      }
      if (!version) throw new AppError("NOT_FOUND", "لا يوجد نموذج اختبار متاح", 404);

      const questions = await tx.query<{
        id: string;
        position: number;
        type: StudentAssessmentQuestionView["type"];
      }>(
        `select id, position, type
         from questions
         where quiz_version_id = $1
         order by position, id`,
        [version.id],
      );
      if (questions.length === 0) throw new AppError("CONFLICT", "نموذج الاختبار لا يحتوي أسئلة", 409);
      const presentedQuestions = version.shuffle_questions ? shuffle(questions) : [...questions];

      const sessionRows = await tx.query<{ id: string }>(
        `insert into practice_sessions (profile_id, quiz_version_id, mode, status)
         values ($1, $2, $3, 'in_progress')
         returning id`,
        [profileId, version.id, input.mode],
      );
      const sessionId = sessionRows[0]?.id;
      if (!sessionId) throw new AppError("INTERNAL_ERROR", "تعذر بدء جلسة الاختبار", 500);

      await tx.query(
        `insert into practice_session_questions (session_id, question_id, position)
         select $1, x.question_id, x.position
         from jsonb_to_recordset($2::jsonb) as x(question_id uuid, position integer)`,
        [
          sessionId,
          JSON.stringify(
            presentedQuestions.map((question, position) => ({ question_id: question.id, position })),
          ),
        ],
      );

      const choiceQuestionIds = presentedQuestions
        .filter((question) => question.type !== "direct")
        .map((question) => question.id);
      if (choiceQuestionIds.length > 0) {
        const options = await tx.query<{ id: string; question_id: string; position: number }>(
          `select id, question_id, position
           from question_options
           where question_id = any($1::uuid[])
           order by question_id, position, id`,
          [choiceQuestionIds],
        );
        const byQuestion = new Map<string, Array<{ id: string; position: number }>>();
        for (const option of options) {
          const list = byQuestion.get(option.question_id) ?? [];
          list.push({ id: option.id, position: option.position });
          byQuestion.set(option.question_id, list);
        }
        const presentation: Array<{ question_id: string; option_id: string; position: number }> = [];
        for (const questionId of choiceQuestionIds) {
          const source = byQuestion.get(questionId) ?? [];
          if (source.length < 2) throw new AppError("CONFLICT", "خيارات أحد أسئلة الاختبار غير مكتملة", 409);
          const ordered = version.shuffle_options ? shuffle(source) : source;
          ordered.forEach((option, position) => {
            presentation.push({ question_id: questionId, option_id: option.id, position });
          });
        }
        await tx.query(
          `insert into practice_session_options (session_id, question_id, option_id, position)
           select $1, x.question_id, x.option_id, x.position
           from jsonb_to_recordset($2::jsonb) as x(question_id uuid, option_id uuid, position integer)`,
          [sessionId, JSON.stringify(presentation)],
        );
      }

      await tx.query("update practice_sessions set current_question_id = $2 where id = $1", [
        sessionId,
        presentedQuestions[0]?.id ?? null,
      ]);

      return this.sessionView(tx, profileId, sessionId, false);
    });
  }

  async session(profileId: string, sessionId: string): Promise<StudentAssessmentSessionView> {
    return this.sessionView(this.db, profileId, sessionId, true);
  }

  async answer(
    profileId: string,
    sessionId: string,
    questionId: string,
    input: StudentAssessmentAnswerInput,
  ): Promise<StudentAssessmentSessionView> {
    return this.db.transaction(async (tx) => {
      const session = await this.sessionRow(tx, profileId, sessionId, true);
      if (session.status !== "in_progress") {
        throw new AppError("CONFLICT", "جلسة الاختبار ليست قيد التقدم", 409);
      }
      await this.accessibleQuiz(tx, profileId, session.quiz_id);

      const questions = await tx.query<{
        type: StudentAssessmentQuestionView["type"];
        selected_option_id: string | null;
        direct_answer_text: string | null;
      }>(
        `select q.type, pa.selected_option_id, pa.direct_answer_text
         from practice_session_questions psq
         join questions q on q.id = psq.question_id
         left join practice_answers pa
           on pa.session_id = psq.session_id and pa.question_id = psq.question_id
         where psq.session_id = $1 and psq.question_id = $2`,
        [sessionId, questionId],
      );
      const question = questions[0];
      if (!question) throw new AppError("NOT_FOUND", "السؤال غير موجود في هذه الجلسة", 404);

      const selectedOptionId = input.selectedOptionId ?? null;
      const directAnswerText = input.directAnswerText?.normalize("NFC").trim() || null;
      if (question.type === "direct") {
        if (selectedOptionId !== null || directAnswerText === null) {
          throw new AppError("BAD_REQUEST", "السؤال المباشر يحتاج إجابة نصية", 400);
        }
        if (directAnswerText.length > 10_000) {
          throw new AppError("BAD_REQUEST", "الإجابة النصية تتجاوز الحد المسموح", 400);
        }
      } else {
        if (selectedOptionId === null || directAnswerText !== null) {
          throw new AppError("BAD_REQUEST", "اختر أحد الخيارات المعروضة", 400);
        }
        const presented = await tx.query<{ option_id: string }>(
          `select option_id
           from practice_session_options
           where session_id = $1 and question_id = $2 and option_id = $3`,
          [sessionId, questionId, selectedOptionId],
        );
        if (!presented[0]) throw new AppError("BAD_REQUEST", "الخيار لم يُعرض في هذه الجلسة", 400);
      }

      const alreadyAnswered = question.selected_option_id !== null || question.direct_answer_text !== null;
      if (alreadyAnswered && session.mode === "practice") {
        const same =
          question.type === "direct"
            ? normalizeDirectAnswer(question.direct_answer_text ?? "") ===
              normalizeDirectAnswer(directAnswerText ?? "")
            : question.selected_option_id === selectedOptionId;
        if (!same) throw new AppError("CONFLICT", "لا يمكن تغيير إجابة التدريب بعد إظهار نتيجتها", 409);
      } else {
        await tx.query(
          `insert into practice_answers (
             session_id, question_id, selected_option_id, direct_answer_text, answered_at
           ) values ($1, $2, $3, $4, now())
           on conflict (session_id, question_id) do update
             set selected_option_id = excluded.selected_option_id,
                 direct_answer_text = excluded.direct_answer_text,
                 answered_at = now()`,
          [sessionId, questionId, selectedOptionId, directAnswerText],
        );
      }

      const nextRows = await tx.query<{ question_id: string }>(
        `select psq.question_id
         from practice_session_questions psq
         left join practice_answers pa
           on pa.session_id = psq.session_id and pa.question_id = psq.question_id
         where psq.session_id = $1 and pa.question_id is null
         order by psq.position
         limit 1`,
        [sessionId],
      );
      await tx.query("update practice_sessions set current_question_id = $2 where id = $1", [
        sessionId,
        nextRows[0]?.question_id ?? null,
      ]);

      return this.sessionView(tx, profileId, sessionId, false);
    });
  }

  async finalize(profileId: string, sessionId: string): Promise<StudentAssessmentSessionView> {
    return this.db.transaction(async (tx) => {
      const session = await this.sessionRow(tx, profileId, sessionId, true);
      const previous = await this.attemptForSession(tx, profileId, sessionId);
      if (previous) return this.sessionView(tx, profileId, sessionId, false);
      if (session.status === "abandoned") throw new AppError("CONFLICT", "جلسة الاختبار متروكة", 409);
      if (session.status !== "in_progress") {
        throw new AppError("CONFLICT", "تعذر إنهاء جلسة الاختبار", 409);
      }
      await this.accessibleQuiz(tx, profileId, session.quiz_id);

      const rows = await tx.query<{
        question_id: string;
        type: StudentAssessmentQuestionView["type"];
        answer_text: string | null;
        selected_option_id: string | null;
        direct_answer_text: string | null;
        correct_option_id: string | null;
      }>(
        `select psq.question_id, q.type, q.answer_text,
                pa.selected_option_id, pa.direct_answer_text,
                correct_option.id as correct_option_id
         from practice_session_questions psq
         join questions q on q.id = psq.question_id
         left join practice_answers pa
           on pa.session_id = psq.session_id and pa.question_id = psq.question_id
         left join lateral (
           select qo.id from question_options qo
           where qo.question_id = q.id and qo.is_correct = true
           limit 1
         ) correct_option on true
         where psq.session_id = $1
         order by psq.position`,
        [sessionId],
      );
      if (rows.length === 0) throw new AppError("CONFLICT", "جلسة الاختبار لا تحتوي أسئلة", 409);

      let correctCount = 0;
      for (const row of rows) {
        const correct =
          row.type === "direct"
            ? row.direct_answer_text !== null &&
              row.answer_text !== null &&
              normalizeDirectAnswer(row.direct_answer_text) === normalizeDirectAnswer(row.answer_text)
            : row.selected_option_id !== null && row.selected_option_id === row.correct_option_id;
        if (correct) correctCount += 1;
      }

      await tx.query(
        `update practice_sessions
         set status = 'completed', completed_at = now(), current_question_id = null
         where id = $1`,
        [sessionId],
      );
      await tx.query(
        `insert into quiz_attempts (
           profile_id, quiz_id, quiz_version_id, session_id,
           status, correct_count, question_count, completed_at
         ) values ($1, $2, $3, $4, 'completed', $5, $6, now())`,
        [profileId, session.quiz_id, session.quiz_version_id, sessionId, correctCount, rows.length],
      );

      return this.sessionView(tx, profileId, sessionId, false);
    });
  }

  async abandon(profileId: string, sessionId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const session = await this.sessionRow(tx, profileId, sessionId, true);
      if (session.status === "completed")
        throw new AppError("CONFLICT", "المحاولة المكتملة لا يمكن تركها", 409);
      if (session.status === "abandoned") return;
      await tx.query(
        `update practice_sessions
         set status = 'abandoned', current_question_id = null
         where id = $1`,
        [sessionId],
      );
    });
  }

  async history(profileId: string, limit = 50): Promise<StudentAssessmentAttemptView[]> {
    const rows = await this.db.query<AttemptRow>(
      `select a.id, a.session_id, a.quiz_id, q.title as quiz_title,
              a.quiz_version_id, coalesce(v.label, 'النموذج ' || v.version_number::text) as version_label,
              ps.mode, a.correct_count, a.question_count, a.score_percent::text, a.completed_at
       from quiz_attempts a
       join quizzes q on q.id = a.quiz_id
       join quiz_versions v on v.id = a.quiz_version_id
       join practice_sessions ps on ps.id = a.session_id and ps.profile_id = a.profile_id
       where a.profile_id = $1 and a.status = 'completed'
       order by a.completed_at desc, a.id desc
       limit $2`,
      [profileId, Math.min(Math.max(limit, 1), 100)],
    );
    return rows.map(attemptView);
  }

  private async accessibleQuiz(
    executor: QueryExecutor,
    profileId: string,
    quizId: string,
  ): Promise<AccessibleQuizRow> {
    const rows = await executor.query<AccessibleQuizRow>(
      `select q.id, q.title, q.description, q.class_id, c.name as class_name,
              q.subject_id, s.name as subject_name, q.shuffle_versions
       ${ACCESSIBLE_QUIZ_FROM}
         and q.id = $2
       limit 1`,
      [profileId, quizId],
    );
    const quiz = rows[0];
    if (!quiz) throw new AppError("NOT_FOUND", "الاختبار غير متاح", 404);
    return quiz;
  }

  private async sessionRow(
    executor: QueryExecutor,
    profileId: string,
    sessionId: string,
    lock: boolean,
  ): Promise<SessionRow> {
    const rows = await executor.query<SessionRow>(
      `select ps.id, ps.profile_id, ps.mode, ps.status, ps.current_question_id,
              ps.started_at, ps.completed_at,
              q.id as quiz_id, q.title as quiz_title, q.description as quiz_description,
              q.class_id, q.subject_id,
              v.id as quiz_version_id, v.version_number, v.label as version_label
       from practice_sessions ps
       join quiz_versions v on v.id = ps.quiz_version_id
       join quizzes q on q.id = v.quiz_id
       where ps.id = $2 and ps.profile_id = $1
       ${lock ? "for update of ps" : ""}`,
      [profileId, sessionId],
    );
    const session = rows[0];
    if (!session) throw new AppError("NOT_FOUND", "جلسة الاختبار غير موجودة", 404);
    return session;
  }

  private async sessionView(
    executor: QueryExecutor,
    profileId: string,
    sessionId: string,
    recheckAccess: boolean,
  ): Promise<StudentAssessmentSessionView> {
    const session = await this.sessionRow(executor, profileId, sessionId, false);
    // Completed results remain historical; leaving unfinished work must not restore access.
    if (recheckAccess && session.status !== "completed") {
      await this.accessibleQuiz(executor, profileId, session.quiz_id);
    }

    const questions = await executor.query<SessionQuestionRow>(
      `select q.id, psq.position, q.lesson_id, q.type, q.prompt, q.answer_text,
              q.explanation, q.source_page, q.question_bank_item_id, q.question_bank_revision_id,
              nullif(q.metadata ->> 'method', '') as method,
              pa.selected_option_id, pa.direct_answer_text
       from practice_session_questions psq
       join questions q on q.id = psq.question_id
       left join practice_answers pa
         on pa.session_id = psq.session_id and pa.question_id = psq.question_id
       where psq.session_id = $1
       order by psq.position`,
      [sessionId],
    );
    const options = await executor.query<SessionOptionRow>(
      `select pso.question_id, qo.id, qo.label, pso.position, qo.is_correct
       from practice_session_options pso
       join question_options qo on qo.id = pso.option_id and qo.question_id = pso.question_id
       where pso.session_id = $1
       order by pso.question_id, pso.position`,
      [sessionId],
    );
    const optionMap = new Map<string, SessionOptionRow[]>();
    for (const option of options) {
      const list = optionMap.get(option.question_id) ?? [];
      list.push(option);
      optionMap.set(option.question_id, list);
    }

    const answeredCount = questions.filter(
      (question) => question.selected_option_id !== null || question.direct_answer_text !== null,
    ).length;
    const views = questions.map<StudentAssessmentQuestionView>((question) => {
      const questionOptions = optionMap.get(question.id) ?? [];
      const hasAnswer = question.selected_option_id !== null || question.direct_answer_text !== null;
      const canReveal = session.status === "completed" || (session.mode === "practice" && hasAnswer);
      const correctOption = questionOptions.find((option) => option.is_correct) ?? null;
      const correct =
        question.type === "direct"
          ? hasAnswer &&
            question.answer_text !== null &&
            normalizeDirectAnswer(question.direct_answer_text ?? "") ===
              normalizeDirectAnswer(question.answer_text)
          : hasAnswer && question.selected_option_id === correctOption?.id;

      return {
        id: question.id,
        position: question.position,
        lessonId: question.lesson_id,
        type: question.type,
        prompt: question.prompt,
        options: questionOptions.map((option) => ({
          id: option.id,
          label: option.label,
          position: option.position,
        })),
        sourcePage: question.source_page,
        questionBankItemId: question.question_bank_item_id,
        questionBankRevisionId: question.question_bank_revision_id,
        answer: hasAnswer
          ? {
              selectedOptionId: question.selected_option_id,
              directAnswerText: question.direct_answer_text,
            }
          : null,
        feedback: canReveal
          ? {
              correct,
              correctOptionId: question.type === "direct" ? null : (correctOption?.id ?? null),
              correctAnswerText: question.type === "direct" ? question.answer_text : null,
              explanation: question.explanation,
              method: question.method,
            }
          : null,
      };
    });

    const attempt = await this.attemptForSession(executor, profileId, sessionId);
    return {
      session: {
        id: session.id,
        mode: session.mode,
        status: session.status,
        currentQuestionId: session.current_question_id,
        startedAt: session.started_at,
        completedAt: session.completed_at,
      },
      quiz: {
        id: session.quiz_id,
        title: session.quiz_title,
        description: session.quiz_description,
        classId: session.class_id,
        subjectId: session.subject_id,
      },
      version: {
        id: session.quiz_version_id,
        versionNumber: session.version_number,
        label: session.version_label ?? `النموذج ${session.version_number}`,
      },
      progress: { questionCount: questions.length, answeredCount },
      questions: views,
      attempt,
    };
  }

  private async attemptForSession(
    executor: QueryExecutor,
    profileId: string,
    sessionId: string,
  ): Promise<StudentAssessmentAttemptView | null> {
    const rows = await executor.query<AttemptRow>(
      `select a.id, a.session_id, a.quiz_id, q.title as quiz_title,
              a.quiz_version_id, coalesce(v.label, 'النموذج ' || v.version_number::text) as version_label,
              ps.mode, a.correct_count, a.question_count, a.score_percent::text, a.completed_at
       from quiz_attempts a
       join quizzes q on q.id = a.quiz_id
       join quiz_versions v on v.id = a.quiz_version_id
       join practice_sessions ps on ps.id = a.session_id
       where a.profile_id = $1 and a.session_id = $2
       limit 1`,
      [profileId, sessionId],
    );
    return rows[0] ? attemptView(rows[0]) : null;
  }
}
