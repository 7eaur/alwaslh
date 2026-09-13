import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "../../admin-api";
import {
  type QuestionBankAnswerStatus,
  type QuestionBankDifficulty,
  type QuestionBankQuestionInput,
  type QuestionBankQuestionType,
  createManualQuestion,
  importApprovedAiQuestions,
} from "../../question-bank-api";
import "../../question-bank.css";

interface Props {
  onSessionExpired: () => void;
}

interface ScopeDraft {
  classId: string;
  subjectId: string;
  lessonIds: string[];
}

type Mode = "closed" | "manual" | "import";

type Feedback = { kind: "success" | "error"; text: string } | null;

const EMPTY_QUESTION: QuestionBankQuestionInput = {
  prompt: "",
  type: "multiple_choice",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  answerText: "",
  answerStatus: "known",
  difficulty: "medium",
  explanation: null,
  method: null,
};

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال العملية. أعد المحاولة.";
}

export function QuestionBankCreatePage({ onSessionExpired }: Props) {
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("closed");
  const [questionDraft, setQuestionDraft] = useState<QuestionBankQuestionInput>(EMPTY_QUESTION);
  const [scope, setScope] = useState<ScopeDraft>({ classId: "", subjectId: "", lessonIds: [] });
  const [outputId, setOutputId] = useState("");
  const [mutationState, setMutationState] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<Feedback>(null);

  const loadCurriculum = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      setCurriculum(await fetchAdminCurriculum());
      setState("ready");
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setError(messageFor(cause));
      setState("error");
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void loadCurriculum();
  }, [loadCurriculum]);

  const subjectOptions = useMemo(() => {
    if (!curriculum || !scope.classId) return [];
    const subjectIds = new Set(
      curriculum.offerings
        .filter((offering) => offering.classId === scope.classId && offering.status !== "archived")
        .map((offering) => offering.subjectId),
    );
    return curriculum.subjects.filter((subject) => subjectIds.has(subject.id) && subject.status !== "archived");
  }, [curriculum, scope.classId]);

  const lessonOptions = useMemo(
    () =>
      curriculum?.lessons.filter(
        (lesson) =>
          lesson.classId === scope.classId &&
          lesson.subjectId === scope.subjectId &&
          lesson.status !== "archived",
      ) ?? [],
    [curriculum, scope.classId, scope.subjectId],
  );

  function resetScope() {
    setScope({ classId: "", subjectId: "", lessonIds: [] });
  }

  function beginManual() {
    resetScope();
    setQuestionDraft(EMPTY_QUESTION);
    setOutputId("");
    setFeedback(null);
    setMode("manual");
  }

  function beginImport() {
    resetScope();
    setOutputId("");
    setFeedback(null);
    setMode("import");
  }

  async function submitManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const validation = validateDraft(questionDraft, scope);
    if (validation) {
      setFeedback({ kind: "error", text: validation });
      return;
    }

    setMutationState("saving");
    try {
      await createManualQuestion({ ...scope, question: normalizedDraft(questionDraft) });
      setFeedback({ kind: "success", text: "تم إنشاء السؤال كمسودة. لم يصل إلى النشر بعد." });
      setMode("closed");
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function submitImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    if (!outputId.trim() || !scope.classId || !scope.subjectId || scope.lessonIds.length === 0) {
      setFeedback({ kind: "error", text: "حدد مخرج AI المعتمد والصف والمادة ودرسًا واحدًا على الأقل." });
      return;
    }

    setMutationState("saving");
    try {
      const result = await importApprovedAiQuestions(outputId.trim(), scope);
      setFeedback({
        kind: "success",
        text: result.replayed
          ? "هذا المخرج سبق استيراده؛ عُرضت الروابط الموجودة بدون إنشاء نسخ مكررة."
          : `تم استيراد ${result.imports.length} سؤال كمسودات قابلة للمراجعة.`,
      });
      setMode("closed");
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  return (
    <section className="question-bank" aria-labelledby="question-bank-create-title">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">المحتوى التعليمي</p>
          <h1 id="question-bank-create-title">بنك الأسئلة</h1>
          <p>أضف سؤالًا يدويًا أو استورد مخرج AI معتمدًا. المراجعة والنشر تتم من صفحة السؤال المستقلة.</p>
        </div>
        <div className="qb-header-actions">
          <button className="primary-button" type="button" onClick={beginManual} disabled={state !== "ready" || mutationState === "saving"}>
            سؤال يدوي جديد
          </button>
          <button className="secondary-button" type="button" onClick={beginImport} disabled={state !== "ready" || mutationState === "saving"}>
            استيراد مخرج AI
          </button>
        </div>
      </header>

      {state === "loading" ? <StatePanel title="جارٍ تحميل السياق المنهجي" body="نقرأ الصفوف والمواد والدروس المتاحة." /> : null}
      {state === "error" ? (
        <StatePanel
          title="تعذر تحميل السياق المنهجي"
          body={error}
          action={<button className="secondary-button" type="button" onClick={() => void loadCurriculum()}>إعادة المحاولة</button>}
        />
      ) : null}

      {feedback ? (
        <div className={`qb-feedback ${feedback.kind === "error" ? "is-error" : "is-success"}`} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.text}
        </div>
      ) : null}

      {mode === "closed" && state === "ready" ? (
        <div className="qb-list-panel" role="status">
          <strong>اختر طريقة الإضافة</strong>
          <p>الإنشاء اليدوي ينشئ Draft مباشرة، والاستيراد يقبل فقط مخرج AI معتمدًا من الخادم.</p>
        </div>
      ) : null}

      {mode === "manual" ? (
        <EditorPanel title="إنشاء سؤال يدوي" onClose={() => setMode("closed")}>
          <form className="qb-editor-form" onSubmit={submitManual}>
            <ScopeFields curriculum={curriculum} scope={scope} setScope={setScope} subjects={subjectOptions} lessons={lessonOptions} />
            <QuestionFields question={questionDraft} setQuestion={setQuestionDraft} />
            <div className="qb-form-actions">
              <button className="secondary-button" type="button" onClick={() => setMode("closed")}>إلغاء</button>
              <button className="primary-button" type="submit" disabled={mutationState === "saving"}>حفظ كمسودة</button>
            </div>
          </form>
        </EditorPanel>
      ) : null}

      {mode === "import" ? (
        <EditorPanel title="استيراد مخرج AI معتمد" onClose={() => setMode("closed")}>
          <p className="qb-editor-note">يقبل الخادم فقط أحدث قرار اعتماد. أي مخرج غير معتمد يُرفض قبل إنشاء أسئلة البنك.</p>
          <form className="qb-editor-form" onSubmit={submitImport}>
            <label className="qb-wide-field">
              <span>معرف مخرج AI</span>
              <input value={outputId} onChange={(event) => setOutputId(event.target.value)} placeholder="UUID للمخرج المعتمد" />
            </label>
            <ScopeFields curriculum={curriculum} scope={scope} setScope={setScope} subjects={subjectOptions} lessons={lessonOptions} />
            <div className="qb-form-actions">
              <button className="secondary-button" type="button" onClick={() => setMode("closed")}>إلغاء</button>
              <button className="primary-button" type="submit" disabled={mutationState === "saving"}>استيراد كمسودات</button>
            </div>
          </form>
        </EditorPanel>
      ) : null}
    </section>
  );
}

function ScopeFields({
  curriculum,
  scope,
  setScope,
  subjects,
  lessons,
}: {
  curriculum: AdminCurriculumSnapshot | null;
  scope: ScopeDraft;
  setScope: Dispatch<SetStateAction<ScopeDraft>>;
  subjects: AdminCurriculumSnapshot["subjects"];
  lessons: AdminCurriculumSnapshot["lessons"];
}) {
  return (
    <fieldset className="qb-scope-fields">
      <legend>السياق المنهجي</legend>
      <label>
        <span>الصف</span>
        <select value={scope.classId} onChange={(event) => setScope({ classId: event.target.value, subjectId: "", lessonIds: [] })}>
          <option value="">اختر الصف</option>
          {curriculum?.classes
            .filter((item) => item.status !== "archived")
            .map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label>
        <span>المادة</span>
        <select
          value={scope.subjectId}
          disabled={!scope.classId}
          onChange={(event) => setScope((current) => ({ ...current, subjectId: event.target.value, lessonIds: [] }))}
        >
          <option value="">اختر المادة</option>
          {subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <div className="qb-lesson-picker">
        <span>الدروس المرتبطة</span>
        {scope.subjectId && lessons.length === 0 ? <p>لا توجد دروس متاحة لهذه المادة.</p> : null}
        {lessons.map((lesson) => (
          <label className="qb-check" key={lesson.id}>
            <input
              type="checkbox"
              checked={scope.lessonIds.includes(lesson.id)}
              onChange={(event) =>
                setScope((current) => ({
                  ...current,
                  lessonIds: event.target.checked
                    ? [...current.lessonIds, lesson.id]
                    : current.lessonIds.filter((id) => id !== lesson.id),
                }))
              }
            />
            <span>{lesson.title}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function QuestionFields({
  question,
  setQuestion,
}: {
  question: QuestionBankQuestionInput;
  setQuestion: Dispatch<SetStateAction<QuestionBankQuestionInput>>;
}) {
  function changeType(type: QuestionBankQuestionType) {
    setQuestion((current) => {
      if (type === "multiple_choice") return { ...current, type, options: ["", "", "", ""], correctOptionIndex: 0, answerText: "" };
      if (type === "true_false") return { ...current, type, options: ["صح", "خطأ"], correctOptionIndex: 0, answerText: "صح" };
      return { ...current, type, options: [], correctOptionIndex: null, answerText: current.answerStatus === "known" ? "" : null };
    });
  }

  function changeAnswerStatus(answerStatus: QuestionBankAnswerStatus) {
    setQuestion((current) => {
      if (answerStatus !== "known") return { ...current, answerStatus, correctOptionIndex: null, answerText: null };
      if (current.type === "direct") return { ...current, answerStatus, correctOptionIndex: null, answerText: "" };
      return { ...current, answerStatus, correctOptionIndex: 0, answerText: current.options[0] ?? "" };
    });
  }

  function updateOption(index: number, value: string) {
    setQuestion((current) => {
      const options = [...current.options];
      options[index] = value;
      return {
        ...current,
        options,
        answerText: current.answerStatus === "known" && current.correctOptionIndex === index ? value : current.answerText,
      };
    });
  }

  return (
    <fieldset className="qb-question-fields">
      <legend>محتوى السؤال</legend>
      <label className="qb-wide-field">
        <span>نص السؤال</span>
        <textarea value={question.prompt} onChange={(event) => setQuestion((current) => ({ ...current, prompt: event.target.value }))} rows={3} />
      </label>
      <label>
        <span>النوع</span>
        <select value={question.type} onChange={(event) => changeType(event.target.value as QuestionBankQuestionType)}>
          <option value="multiple_choice">اختيار متعدد</option>
          <option value="true_false">صح / خطأ</option>
          <option value="direct">سؤال مباشر</option>
        </select>
      </label>
      <label>
        <span>الصعوبة</span>
        <select value={question.difficulty} onChange={(event) => setQuestion((current) => ({ ...current, difficulty: event.target.value as QuestionBankDifficulty }))}>
          <option value="easy">سهل</option>
          <option value="medium">متوسط</option>
          <option value="hard">صعب</option>
        </select>
      </label>
      <label>
        <span>حالة الإجابة</span>
        <select value={question.answerStatus} onChange={(event) => changeAnswerStatus(event.target.value as QuestionBankAnswerStatus)}>
          <option value="known">محسومة</option>
          <option value="review_required">تحتاج مراجعة</option>
          <option value="unknown">غير معروفة</option>
        </select>
      </label>

      {question.type !== "direct" ? (
        <div className="qb-options-editor">
          <span>الخيارات</span>
          {question.options.map((option, index) => (
            <div className="qb-option-row" key={index}>
              <input
                aria-label={`الخيار ${index + 1}`}
                value={option}
                disabled={question.type === "true_false"}
                onChange={(event) => updateOption(index, event.target.value)}
              />
              {question.answerStatus === "known" ? (
                <label className="qb-correct-choice">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={question.correctOptionIndex === index}
                    onChange={() => setQuestion((current) => ({ ...current, correctOptionIndex: index, answerText: current.options[index] ?? "" }))}
                  />
                  <span>الصحيح</span>
                </label>
              ) : null}
            </div>
          ))}
        </div>
      ) : question.answerStatus === "known" ? (
        <label className="qb-wide-field">
          <span>الإجابة النصية</span>
          <textarea value={question.answerText ?? ""} onChange={(event) => setQuestion((current) => ({ ...current, answerText: event.target.value }))} rows={2} />
        </label>
      ) : null}

      <label className="qb-wide-field">
        <span>التوضيح (اختياري)</span>
        <textarea value={question.explanation ?? ""} onChange={(event) => setQuestion((current) => ({ ...current, explanation: event.target.value || null }))} rows={2} />
      </label>
      <label className="qb-wide-field">
        <span>طريقة الحل (اختياري)</span>
        <textarea value={question.method ?? ""} onChange={(event) => setQuestion((current) => ({ ...current, method: event.target.value || null }))} rows={2} />
      </label>
    </fieldset>
  );
}

function EditorPanel({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <section className="qb-editor-panel" aria-labelledby="qb-editor-title">
      <div className="qb-editor-heading">
        <h2 id="qb-editor-title">{title}</h2>
        <button className="secondary-button small-button" type="button" onClick={onClose}>إغلاق</button>
      </div>
      {children}
    </section>
  );
}

function StatePanel({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="workspace-state" role="status">
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}

function validateDraft(question: QuestionBankQuestionInput, scope: ScopeDraft): string | null {
  if (!scope.classId || !scope.subjectId || scope.lessonIds.length === 0) return "حدد الصف والمادة ودرسًا واحدًا على الأقل.";
  if (!question.prompt.trim()) return "نص السؤال مطلوب.";
  if (question.type === "multiple_choice" && (question.options.length !== 4 || question.options.some((option) => !option.trim()))) {
    return "سؤال الاختيار المتعدد يحتاج أربعة خيارات مكتملة.";
  }
  if (question.type === "true_false" && (question.options[0] !== "صح" || question.options[1] !== "خطأ")) {
    return "سؤال الصح والخطأ يجب أن يستخدم صح وخطأ فقط.";
  }
  if (question.type === "direct" && question.options.length !== 0) return "السؤال المباشر لا يقبل خيارات.";
  if (question.answerStatus === "known") {
    if (question.type === "direct" && !question.answerText?.trim()) return "اكتب الإجابة النصية للسؤال المباشر.";
    if (question.type !== "direct" && question.correctOptionIndex === null) return "اختر الإجابة الصحيحة.";
  }
  return null;
}

function normalizedDraft(question: QuestionBankQuestionInput): QuestionBankQuestionInput {
  const prompt = question.prompt.trim();
  const options = question.options.map((option) => option.trim());
  const correctOptionIndex = question.answerStatus === "known" ? question.correctOptionIndex : null;
  const answerText =
    question.answerStatus !== "known"
      ? null
      : question.type === "direct"
        ? question.answerText?.trim() || null
        : correctOptionIndex === null
          ? null
          : options[correctOptionIndex] ?? null;
  return {
    ...question,
    prompt,
    options,
    correctOptionIndex,
    answerText,
    explanation: question.explanation?.trim() || null,
    method: question.method?.trim() || null,
  };
}
