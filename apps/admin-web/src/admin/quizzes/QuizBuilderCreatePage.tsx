import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "../../admin-api";
import { createQuiz } from "../../quiz-builder-api";
import "../../quiz-builder.css";

interface Props {
  onSessionExpired: () => void;
}

interface QuizDraft {
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  lessonIds: string[];
  shuffleVersions: boolean;
}

const emptyQuizDraft: QuizDraft = {
  title: "",
  description: "",
  classId: "",
  subjectId: "",
  lessonIds: [],
  shuffleVersions: true,
};

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال العملية. أعد المحاولة.";
}

export function QuizBuilderCreatePage({ onSessionExpired }: Props) {
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [quizDraft, setQuizDraft] = useState<QuizDraft>(emptyQuizDraft);
  const [mutationState, setMutationState] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<{ kind: "error"; text: string } | null>(null);

  const loadCurriculum = useCallback(async () => {
    setLoadState("loading");
    setLoadError("");
    try {
      setCurriculum(await fetchAdminCurriculum());
      setLoadState("ready");
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setLoadError(messageFor(cause));
      setLoadState("error");
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void loadCurriculum();
  }, [loadCurriculum]);

  const classOptions = useMemo(
    () => curriculum?.classes.filter((item) => item.status !== "archived") ?? [],
    [curriculum],
  );

  const subjectOptions = useMemo(() => {
    if (!curriculum || !quizDraft.classId) return [];
    const ids = new Set(
      curriculum.offerings
        .filter((offering) => offering.classId === quizDraft.classId && offering.status !== "archived")
        .map((offering) => offering.subjectId),
    );
    return curriculum.subjects.filter((subject) => ids.has(subject.id) && subject.status !== "archived");
  }, [curriculum, quizDraft.classId]);

  const lessonOptions = useMemo(
    () =>
      curriculum?.lessons.filter(
        (lesson) =>
          lesson.classId === quizDraft.classId &&
          lesson.subjectId === quizDraft.subjectId &&
          lesson.status !== "archived",
      ) ?? [],
    [curriculum, quizDraft.classId, quizDraft.subjectId],
  );

  function resetScope(nextClassId: string) {
    setQuizDraft((current) => ({ ...current, classId: nextClassId, subjectId: "", lessonIds: [] }));
  }

  function resetSubject(nextSubjectId: string) {
    setQuizDraft((current) => ({ ...current, subjectId: nextSubjectId, lessonIds: [] }));
  }

  function toggleLesson(lessonId: string) {
    setQuizDraft((current) => ({
      ...current,
      lessonIds: current.lessonIds.includes(lessonId)
        ? current.lessonIds.filter((id) => id !== lessonId)
        : [...current.lessonIds, lessonId],
    }));
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!quizDraft.title.trim() || !quizDraft.classId || !quizDraft.subjectId || quizDraft.lessonIds.length === 0) {
      setFeedback({ kind: "error", text: "اكتب عنوان الاختبار وحدد الصف والمادة ودرسًا واحدًا على الأقل." });
      return;
    }

    setMutationState("saving");
    try {
      const created = await createQuiz({
        classId: quizDraft.classId,
        subjectId: quizDraft.subjectId,
        lessonIds: quizDraft.lessonIds,
        title: quizDraft.title.trim(),
        description: quizDraft.description.trim() || null,
        shuffleVersions: quizDraft.shuffleVersions,
      });
      navigate(`/app/quizzes/${created.quizId}`);
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  return (
    <section className="quiz-builder" aria-labelledby="quiz-create-heading">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Quiz Builder</p>
          <h1 id="quiz-create-heading">إنشاء اختبار</h1>
          <p className="workspace-lede">
            أنشئ مسودة الاختبار وحدد نطاقها التعليمي. بعد الإنشاء تنتقل إدارة النماذج والمراجعة والنشر إلى صفحة الاختبار نفسها.
          </p>
        </div>
      </header>

      {feedback ? <p className="inline-feedback error" role="status">{feedback.text}</p> : null}
      {loadState === "loading" ? <p className="inline-feedback">جارٍ تحميل الصفوف والمواد والدروس…</p> : null}
      {loadState === "error" ? (
        <div className="qz-editor-panel" role="alert">
          <p>{loadError}</p>
          <button className="secondary-button" type="button" onClick={() => void loadCurriculum()}>
            إعادة المحاولة
          </button>
        </div>
      ) : null}

      {loadState === "ready" ? (
        <div className="qz-editor-panel">
          <div className="qz-editor-heading">
            <div>
              <p className="eyebrow">مسودة جديدة</p>
              <h2>بيانات الاختبار</h2>
            </div>
          </div>
          <form className="qz-editor-form" onSubmit={submitCreate}>
            <div className="qz-form-grid">
              <label className="qz-wide-field">
                <span>عنوان الاختبار</span>
                <input required value={quizDraft.title} onChange={(event) => setQuizDraft((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label className="qz-wide-field">
                <span>الوصف</span>
                <textarea rows={3} value={quizDraft.description} onChange={(event) => setQuizDraft((current) => ({ ...current, description: event.target.value }))} />
              </label>
              <label>
                <span>الصف</span>
                <select required value={quizDraft.classId} onChange={(event) => resetScope(event.target.value)}>
                  <option value="">اختر الصف</option>
                  {classOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>
                <span>المادة</span>
                <select required value={quizDraft.subjectId} onChange={(event) => resetSubject(event.target.value)} disabled={!quizDraft.classId}>
                  <option value="">اختر المادة</option>
                  {subjectOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <fieldset className="qz-lesson-picker">
                <legend>الدروس</legend>
                {!quizDraft.subjectId ? <p>اختر الصف والمادة أولًا.</p> : null}
                {quizDraft.subjectId && lessonOptions.length === 0 ? <p>لا توجد دروس نشطة ضمن هذا النطاق.</p> : null}
                {lessonOptions.map((lesson) => (
                  <label className="qz-check" key={lesson.id}>
                    <input type="checkbox" checked={quizDraft.lessonIds.includes(lesson.id)} onChange={() => toggleLesson(lesson.id)} />
                    <span>{lesson.title}</span>
                  </label>
                ))}
              </fieldset>
              <label className="qz-check qz-wide-field">
                <input type="checkbox" checked={quizDraft.shuffleVersions} onChange={(event) => setQuizDraft((current) => ({ ...current, shuffleVersions: event.target.checked }))} />
                <span>السماح بخلط ترتيب النماذج عند التقديم</span>
              </label>
            </div>
            <div className="qz-form-actions">
              <button className="primary-button" type="submit" disabled={mutationState === "saving"}>
                {mutationState === "saving" ? "جارٍ الإنشاء…" : "إنشاء الاختبار"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
