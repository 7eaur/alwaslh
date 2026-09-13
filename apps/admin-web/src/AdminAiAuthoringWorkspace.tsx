import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "./admin-api";
import {
  type AiAuthoringSubjectDomain,
  type AiQuestionTarget,
  type LessonGenerationMode,
  type QuizGenerationMode,
  type QuizPrintVariant,
  archiveQuestionBankItem,
  enqueueLessonGeneration,
  enqueueQuestionRegeneration,
  enqueueQuizGeneration,
  fetchSpecializedQuizExport,
  specializedQuizPrintUrl,
} from "./admin-ai-authoring-api";
import { fetchQuestionBank, type QuestionBankListItem } from "./question-bank-api";
import {
  fetchQuiz,
  fetchQuizzes,
  type QuizBuilderDetail,
  type QuizBuilderListItem,
} from "./quiz-builder-api";
import "./admin-ai-authoring.css";

interface Props {
  onSessionExpired: () => void;
}

type Feedback = { kind: "success" | "error"; text: string } | null;

interface VersionDraft {
  key: string;
  label: string;
  lessonIds: string[];
  shuffleOptions: boolean;
  target: AiQuestionTarget;
  expectedQuestionCount: number;
}

const emptyTarget: AiQuestionTarget = { multipleChoice: 2, trueFalse: 2, direct: 1 };
const subjectDomains: Array<[AiAuthoringSubjectDomain, string]> = [
  ["general", "عام"],
  ["arabic_language", "لغة عربية"],
  ["religious", "تربية إسلامية"],
  ["mathematics", "رياضيات"],
  ["physics", "فيزياء"],
  ["chemistry", "كيمياء"],
  ["biology", "أحياء"],
  ["history", "تاريخ"],
  ["geography", "جغرافيا"],
  ["other", "أخرى"],
];

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال العملية. أعد المحاولة.";
}

function targetCount(target: AiQuestionTarget): number {
  return target.multipleChoice + target.trueFalse + target.direct;
}

function newVersion(index: number, lessonIds: string[]): VersionDraft {
  return {
    key: crypto.randomUUID(),
    label: `النموذج ${index + 1}`,
    lessonIds,
    shuffleOptions: true,
    target: { ...emptyTarget },
    expectedQuestionCount: 5,
  };
}

export function AdminAiAuthoringWorkspace({ onSessionExpired }: Props) {
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [quizzes, setQuizzes] = useState<QuizBuilderListItem[]>([]);
  const [questions, setQuestions] = useState<QuestionBankListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [domain, setDomain] = useState<AiAuthoringSubjectDomain>("general");

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [lessonIds, setLessonIds] = useState<string[]>([]);
  const [lessonMode, setLessonMode] = useState<LessonGenerationMode>("lesson_summary");
  const [lessonTarget, setLessonTarget] = useState<AiQuestionTarget>({ ...emptyTarget });
  const [lessonExpectedCount, setLessonExpectedCount] = useState(5);

  const [quizId, setQuizId] = useState("");
  const [quizDetail, setQuizDetail] = useState<QuizBuilderDetail | null>(null);
  const [quizMode, setQuizMode] = useState<QuizGenerationMode>("question_generation");
  const [versionDrafts, setVersionDrafts] = useState<VersionDraft[]>([]);

  const [questionId, setQuestionId] = useState("");
  const [exportQuizId, setExportQuizId] = useState("");
  const [exportDetail, setExportDetail] = useState<QuizBuilderDetail | null>(null);
  const [exportVersionIds, setExportVersionIds] = useState<string[]>([]);
  const [printVariant, setPrintVariant] = useState<QuizPrintVariant>("questions_options");

  const handleError = useCallback(
    (error: unknown) => {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setFeedback({ kind: "error", text: messageFor(error) });
    },
    [onSessionExpired],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [curriculumResult, quizResult, questionResult] = await Promise.all([
        fetchAdminCurriculum(),
        fetchQuizzes({ limit: 100, offset: 0 }),
        fetchQuestionBank({ limit: 100, offset: 0 }),
      ]);
      setCurriculum(curriculumResult);
      setQuizzes(quizResult.items);
      setQuestions(questionResult.items);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const subjects = useMemo(() => {
    if (!curriculum || !classId) return [];
    const available = new Set(
      curriculum.offerings
        .filter((item) => item.classId === classId && item.status !== "archived")
        .map((item) => item.subjectId),
    );
    return curriculum.subjects.filter(
      (item) => available.has(item.id) && item.status !== "archived",
    );
  }, [classId, curriculum]);

  const lessons = useMemo(
    () =>
      curriculum?.lessons.filter(
        (lesson) =>
          lesson.classId === classId &&
          lesson.subjectId === subjectId &&
          lesson.status !== "archived",
      ) ?? [],
    [classId, curriculum, subjectId],
  );

  const draftQuizzes = quizzes.filter((quiz) => quiz.status === "draft");
  const exportQuizzes = quizzes.filter(
    (quiz) => quiz.status === "review" || quiz.status === "published",
  );
  const publishedQuestions = questions.filter(
    (item) => item.currentRevision?.status === "published" && item.archivedAt === null,
  );
  const lessonNeedsTarget =
    lessonMode === "question_generation" || lessonMode === "comprehensive_lesson_content";
  const lessonNeedsExpected =
    lessonMode === "exact_question_extraction" || lessonMode === "replica_question_extraction";
  const quizNeedsTarget = quizMode === "question_generation";

  async function submitLessonGeneration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lessonIds.length === 0) {
      setFeedback({ kind: "error", text: "اختر درسًا واحدًا على الأقل." });
      return;
    }
    if (lessonNeedsTarget && targetCount(lessonTarget) === 0) {
      setFeedback({ kind: "error", text: "حدد سؤالًا واحدًا على الأقل للمهمة." });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      const result = await enqueueLessonGeneration({
        lessonIds,
        mode: lessonMode,
        subjectDomain: domain,
        ...(lessonNeedsTarget ? { target: lessonTarget } : {}),
        ...(lessonNeedsExpected ? { expectedQuestionCount: lessonExpectedCount } : {}),
        clientRequestId: crypto.randomUUID(),
      });
      setFeedback({
        kind: "success",
        text: `بدأ تجهيز ${result.totalUnits} نتيجة. راجعها في «مراجعات AI»؛ وعند اعتماد نتيجة قابلة للتطبيق سيظهر الإجراء هناك مباشرة.`,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  }

  async function chooseQuiz(nextQuizId: string) {
    setQuizId(nextQuizId);
    setQuizDetail(null);
    setVersionDrafts([]);
    if (!nextQuizId) return;

    try {
      const detail = await fetchQuiz(nextQuizId);
      setQuizDetail(detail);
      setVersionDrafts([newVersion(0, detail.lessons.map((lesson) => lesson.id))]);
    } catch (error) {
      handleError(error);
    }
  }

  function patchVersion(key: string, patch: Partial<VersionDraft>) {
    setVersionDrafts((current) =>
      current.map((version) => (version.key === key ? { ...version, ...patch } : version)),
    );
  }

  async function submitQuizGeneration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quizDetail || versionDrafts.length === 0) return;

    const invalid = versionDrafts.find(
      (version) =>
        !version.label.trim() ||
        version.lessonIds.length === 0 ||
        (quizNeedsTarget && targetCount(version.target) === 0),
    );
    if (invalid) {
      setFeedback({
        kind: "error",
        text: "كل نموذج يحتاج اسمًا ومصدر درس واحدًا على الأقل وأعداد أسئلة صالحة.",
      });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      const result = await enqueueQuizGeneration(quizDetail.quiz.id, {
        mode: quizMode,
        subjectDomain: domain,
        versions: versionDrafts.map((version) => ({
          key: version.key,
          label: version.label.trim(),
          lessonIds: version.lessonIds,
          shuffleOptions: version.shuffleOptions,
          ...(quizNeedsTarget
            ? { target: version.target }
            : { expectedQuestionCount: version.expectedQuestionCount }),
        })),
        clientRequestId: crypto.randomUUID(),
      });
      setFeedback({
        kind: "success",
        text: `بدأ تجهيز ${result.totalUnits} نموذج. راجع النتائج في «مراجعات AI» ثم طبّق النتيجة المعتمدة من شاشة المراجعة نفسها.`,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  }

  async function regenerateQuestion() {
    if (!questionId) return;

    setBusy(true);
    setFeedback(null);
    try {
      await enqueueQuestionRegeneration(questionId, {
        clientRequestId: crypto.randomUUID(),
        subjectDomain: domain,
      });
      setFeedback({
        kind: "success",
        text: "بدأت إعادة توليد السؤال من مصدره المعتمد. راجع النتيجة الجديدة في «مراجعات AI» قبل اعتمادها.",
      });
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  }

  async function archiveQuestion() {
    if (!questionId) return;

    setBusy(true);
    setFeedback(null);
    try {
      await archiveQuestionBankItem(questionId);
      setQuestionId("");
      setFeedback({
        kind: "success",
        text: "تمت أرشفة السؤال دون حذف تاريخ المراجعات أو الأحداث.",
      });
      await load();
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  }

  async function chooseExportQuiz(nextQuizId: string) {
    setExportQuizId(nextQuizId);
    setExportDetail(null);
    setExportVersionIds([]);
    if (!nextQuizId) return;

    try {
      const detail = await fetchQuiz(nextQuizId);
      setExportDetail(detail);
      setExportVersionIds(detail.versions.map((version) => version.id));
    } catch (error) {
      handleError(error);
    }
  }

  async function downloadCsv() {
    if (!exportDetail || exportVersionIds.length === 0) return;

    setBusy(true);
    try {
      const bundle = await fetchSpecializedQuizExport(
        exportDetail.quiz.id,
        exportVersionIds,
        printVariant,
      );
      const blob = new Blob([bundle.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${bundle.filenameBase}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setFeedback({
        kind: "success",
        text: "تم تجهيز CSV للنماذج المحددة مع حماية خلايا الصيغ.",
      });
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  }

  function openPrint() {
    if (!exportDetail || exportVersionIds.length === 0) return;
    window.open(
      specializedQuizPrintUrl(exportDetail.quiz.id, exportVersionIds, printVariant),
      "_blank",
      "noopener,noreferrer",
    );
  }

  if (loading) {
    return (
      <section className="workspace-state" aria-live="polite">
        <h1>جارٍ تحميل أدوات التوليد</h1>
        <p>نجهز المنهج والاختبارات وبنك الأسئلة المتاح للتأليف.</p>
      </section>
    );
  }

  return (
    <section className="authoring-workspace">
      <header className="page-header authoring-header">
        <div>
          <p className="eyebrow">إنشاء ومساعدة ذكية</p>
          <h1>توليد المحتوى بالذكاء الاصطناعي</h1>
          <p className="page-description">
            ابدأ التوليد من الدرس أو الاختبار، ثم راجع النتيجة بشريًا قبل اعتمادها. الأسئلة
            الناتجة تبقى مسودات حتى تمر بمراجعة بنك الأسئلة ولا تُنشر تلقائيًا للطلاب.
          </p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => void load()}
          disabled={busy}
        >
          تحديث البيانات
        </button>
      </header>

      {feedback ? (
        <div className={`mutation-feedback is-${feedback.kind}`} role="status">
          {feedback.text}
        </div>
      ) : null}

      <section className="authoring-step-strip" aria-label="مسار الاعتماد">
        <strong>مسار الاعتماد:</strong>
        <span>١. إنشاء المهمة</span>
        <span>٢. مراجعة النتيجة</span>
        <span>٣. تطبيق النتيجة المعتمدة</span>
        <span>٤. مراجعة أسئلة البنك</span>
        <span>٥. النشر أو تركيب نموذج الاختبار</span>
      </section>

      <div className="authoring-grid">
        <LessonGenerationPanel
          busy={busy}
          curriculum={curriculum}
          classId={classId}
          subjectId={subjectId}
          lessons={lessons}
          subjects={subjects}
          lessonIds={lessonIds}
          mode={lessonMode}
          domain={domain}
          target={lessonTarget}
          expectedCount={lessonExpectedCount}
          needsTarget={lessonNeedsTarget}
          needsExpected={lessonNeedsExpected}
          onClassChange={(nextClassId) => {
            setClassId(nextClassId);
            setSubjectId("");
            setLessonIds([]);
          }}
          onSubjectChange={(nextSubjectId) => {
            setSubjectId(nextSubjectId);
            setLessonIds([]);
          }}
          onLessonsChange={setLessonIds}
          onModeChange={setLessonMode}
          onDomainChange={setDomain}
          onTargetChange={setLessonTarget}
          onExpectedCountChange={setLessonExpectedCount}
          onSubmit={submitLessonGeneration}
        />

        <section
          className="authoring-panel authoring-wide"
          aria-labelledby="quiz-authoring-title"
        >
          <div className="authoring-panel-heading">
            <div>
              <p className="section-kicker">الاختبارات</p>
              <h2 id="quiz-authoring-title">توليد نماذج بإعدادات مستقلة</h2>
            </div>
            <span className="count-pill">حتى 20 نموذجًا</span>
          </div>
          <form className="authoring-form" onSubmit={submitQuizGeneration}>
            <div className="authoring-form-grid">
              <label>
                <span>اختبار مسودة</span>
                <select value={quizId} onChange={(event) => void chooseQuiz(event.target.value)}>
                  <option value="">اختر الاختبار</option>
                  {draftQuizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>نوع التوليد</span>
                <select
                  value={quizMode}
                  onChange={(event) => setQuizMode(event.target.value as QuizGenerationMode)}
                >
                  <option value="question_generation">توليد أسئلة</option>
                  <option value="exact_question_extraction">استخراج حرفي</option>
                  <option value="exact_exam_extraction">استخراج امتحان حرفي</option>
                  <option value="replica_question_extraction">نسخ مطابق</option>
                </select>
              </label>
            </div>

            {quizDetail ? (
              <div className="authoring-version-list">
                {versionDrafts.map((version, index) => (
                  <VersionEditor
                    key={version.key}
                    index={index}
                    version={version}
                    lessons={quizDetail.lessons}
                    questionMode={quizNeedsTarget}
                    onPatch={(patch) => patchVersion(version.key, patch)}
                    onRemove={
                      versionDrafts.length > 1
                        ? () =>
                            setVersionDrafts((current) =>
                              current.filter((item) => item.key !== version.key),
                            )
                        : undefined
                    }
                  />
                ))}
                <button
                  className="secondary-button authoring-add-version"
                  type="button"
                  disabled={versionDrafts.length >= 20}
                  onClick={() =>
                    setVersionDrafts((current) => [
                      ...current,
                      newVersion(
                        current.length,
                        quizDetail.lessons.map((lesson) => lesson.id),
                      ),
                    ])
                  }
                >
                  إضافة نموذج
                </button>
              </div>
            ) : (
              <p className="authoring-note">
                اختر اختبارًا مسودة لإعداد مصادر كل نموذج وأعداد أسئلته بشكل مستقل.
              </p>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={busy || !quizDetail || versionDrafts.length === 0}
            >
              إنشاء مهام النماذج
            </button>
          </form>
        </section>

        <section className="authoring-panel" aria-labelledby="question-tools-title">
          <div className="authoring-panel-heading">
            <div>
              <p className="section-kicker">بنك الأسئلة</p>
              <h2 id="question-tools-title">إعادة التوليد والأرشفة</h2>
            </div>
          </div>
          <DomainField value={domain} onChange={setDomain} />
          <label className="authoring-select-block">
            <span>سؤال منشور</span>
            <select value={questionId} onChange={(event) => setQuestionId(event.target.value)}>
              <option value="">اختر السؤال</option>
              {publishedQuestions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.currentRevision?.prompt ?? item.id}
                </option>
              ))}
            </select>
          </label>
          <div className="authoring-actions">
            <button
              className="primary-button"
              type="button"
              disabled={busy || !questionId}
              onClick={() => void regenerateQuestion()}
            >
              إعادة توليد السؤال
            </button>
            <button
              className="danger-button"
              type="button"
              disabled={busy || !questionId}
              onClick={() => void archiveQuestion()}
            >
              أرشفة غير إتلافية
            </button>
          </div>
        </section>

        <section
          className="authoring-panel authoring-wide"
          aria-labelledby="special-export-title"
        >
          <div className="authoring-panel-heading">
            <div>
              <p className="section-kicker">التصدير</p>
              <h2 id="special-export-title">تصدير نماذج الاختبار</h2>
            </div>
          </div>
          <div className="authoring-form-grid">
            <label>
              <span>اختبار قيد المراجعة أو منشور</span>
              <select
                value={exportQuizId}
                onChange={(event) => void chooseExportQuiz(event.target.value)}
              >
                <option value="">اختر الاختبار</option>
                {exportQuizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>نسخة الطباعة</span>
              <select
                value={printVariant}
                onChange={(event) => setPrintVariant(event.target.value as QuizPrintVariant)}
              >
                <option value="questions_options">الأسئلة + الخيارات</option>
                <option value="questions_only">الأسئلة فقط</option>
                <option value="questions_answers">الأسئلة + الإجابات</option>
                <option value="answers_explanations">الإجابات + الشرح</option>
                <option value="answer_key">مفتاح الإجابات</option>
                <option value="lesson_names">أسماء الدروس</option>
                <option value="lesson_images">صور الدروس</option>
              </select>
            </label>
          </div>

          {exportDetail ? (
            <>
              <div className="authoring-selection-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setExportVersionIds(exportDetail.versions.map((version) => version.id))
                  }
                >
                  تحديد الكل
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setExportVersionIds([])}
                >
                  إلغاء التحديد
                </button>
              </div>
              <fieldset className="authoring-picker compact">
                <legend>النماذج المحددة</legend>
                {exportDetail.versions.map((version) => (
                  <label key={version.id} className="authoring-check">
                    <input
                      type="checkbox"
                      checked={exportVersionIds.includes(version.id)}
                      onChange={() =>
                        setExportVersionIds((current) =>
                          current.includes(version.id)
                            ? current.filter((id) => id !== version.id)
                            : [...current, version.id],
                        )
                      }
                    />
                    <span>{version.label}</span>
                  </label>
                ))}
              </fieldset>
            </>
          ) : null}

          <div className="authoring-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={busy || exportVersionIds.length === 0}
              onClick={() => void downloadCsv()}
            >
              تنزيل CSV للنماذج المحددة
            </button>
            <button
              className="secondary-button"
              type="button"
              disabled={exportVersionIds.length === 0}
              onClick={openPrint}
            >
              فتح الطباعة / حفظ PDF
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

function LessonGenerationPanel({
  busy,
  curriculum,
  classId,
  subjectId,
  lessons,
  subjects,
  lessonIds,
  mode,
  domain,
  target,
  expectedCount,
  needsTarget,
  needsExpected,
  onClassChange,
  onSubjectChange,
  onLessonsChange,
  onModeChange,
  onDomainChange,
  onTargetChange,
  onExpectedCountChange,
  onSubmit,
}: {
  busy: boolean;
  curriculum: AdminCurriculumSnapshot | null;
  classId: string;
  subjectId: string;
  lessons: Array<{ id: string; title: string }>;
  subjects: Array<{ id: string; name: string }>;
  lessonIds: string[];
  mode: LessonGenerationMode;
  domain: AiAuthoringSubjectDomain;
  target: AiQuestionTarget;
  expectedCount: number;
  needsTarget: boolean;
  needsExpected: boolean;
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onLessonsChange: (value: string[]) => void;
  onModeChange: (value: LessonGenerationMode) => void;
  onDomainChange: (value: AiAuthoringSubjectDomain) => void;
  onTargetChange: (value: AiQuestionTarget) => void;
  onExpectedCountChange: (value: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="authoring-panel" aria-labelledby="lesson-authoring-title">
      <div className="authoring-panel-heading">
        <div>
          <p className="section-kicker">الدروس</p>
          <h2 id="lesson-authoring-title">درس أو مجموعة دروس</h2>
        </div>
        <span className="count-pill">حتى 32</span>
      </div>
      <form className="authoring-form" onSubmit={onSubmit}>
        <div className="authoring-form-grid">
          <label>
            <span>الصف</span>
            <select value={classId} onChange={(event) => onClassChange(event.target.value)}>
              <option value="">اختر الصف</option>
              {curriculum?.classes
                .filter((item) => item.status !== "archived")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>المادة</span>
            <select
              value={subjectId}
              disabled={!classId}
              onChange={(event) => onSubjectChange(event.target.value)}
            >
              <option value="">اختر المادة</option>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>نوع المهمة</span>
            <select
              value={mode}
              onChange={(event) => onModeChange(event.target.value as LessonGenerationMode)}
            >
              <option value="lesson_summary">ملخص درس</option>
              <option value="question_generation">أسئلة تفاعلية</option>
              <option value="comprehensive_lesson_content">ملخص + أسئلة</option>
              <option value="exact_question_extraction">استخراج أسئلة حرفي</option>
              <option value="replica_question_extraction">نسخ أسئلة مطابق</option>
            </select>
          </label>
          <DomainField value={domain} onChange={onDomainChange} />
        </div>
        <LessonPicker lessons={lessons} selected={lessonIds} onChange={onLessonsChange} />
        {needsTarget ? <TargetFields value={target} onChange={onTargetChange} /> : null}
        {needsExpected ? (
          <CountField value={expectedCount} onChange={onExpectedCountChange} />
        ) : null}
        <button className="primary-button" type="submit" disabled={busy || lessonIds.length === 0}>
          إنشاء مهمة التوليد
        </button>
      </form>
    </section>
  );
}

function DomainField({
  value,
  onChange,
}: {
  value: AiAuthoringSubjectDomain;
  onChange: (value: AiAuthoringSubjectDomain) => void;
}) {
  return (
    <label>
      <span>مجال المادة</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AiAuthoringSubjectDomain)}
      >
        {subjectDomains.map(([option, label]) => (
          <option key={option} value={option}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LessonPicker({
  lessons,
  selected,
  onChange,
}: {
  lessons: Array<{ id: string; title: string }>;
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className="authoring-picker">
      <legend>الدروس المحددة</legend>
      {lessons.length === 0 ? <p>اختر الصف والمادة لعرض الدروس.</p> : null}
      {lessons.map((lesson) => (
        <label key={lesson.id} className="authoring-check">
          <input
            type="checkbox"
            checked={selected.includes(lesson.id)}
            onChange={() =>
              onChange(
                selected.includes(lesson.id)
                  ? selected.filter((id) => id !== lesson.id)
                  : [...selected, lesson.id],
              )
            }
          />
          <span>{lesson.title}</span>
        </label>
      ))}
    </fieldset>
  );
}

function VersionEditor({
  index,
  version,
  lessons,
  questionMode,
  onPatch,
  onRemove,
}: {
  index: number;
  version: VersionDraft;
  lessons: Array<{ id: string; title: string }>;
  questionMode: boolean;
  onPatch: (patch: Partial<VersionDraft>) => void;
  onRemove: (() => void) | undefined;
}) {
  return (
    <section className="authoring-version-card">
      <div className="authoring-version-heading">
        <strong>النموذج {index + 1}</strong>
        {onRemove ? (
          <button className="text-button" type="button" onClick={onRemove}>
            إزالة
          </button>
        ) : null}
      </div>
      <div className="authoring-form-grid">
        <label>
          <span>اسم النموذج</span>
          <input
            value={version.label}
            onChange={(event) => onPatch({ label: event.target.value })}
          />
        </label>
        <label className="authoring-check authoring-toggle">
          <input
            type="checkbox"
            checked={version.shuffleOptions}
            onChange={(event) => onPatch({ shuffleOptions: event.target.checked })}
          />
          <span>خلط الخيارات</span>
        </label>
      </div>
      <LessonPicker
        lessons={lessons}
        selected={version.lessonIds}
        onChange={(ids) => onPatch({ lessonIds: ids })}
      />
      {questionMode ? (
        <TargetFields value={version.target} onChange={(target) => onPatch({ target })} />
      ) : (
        <CountField
          value={version.expectedQuestionCount}
          onChange={(expectedQuestionCount) => onPatch({ expectedQuestionCount })}
        />
      )}
    </section>
  );
}

function CountField({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="authoring-count-field">
      <span>العدد المتوقع من الأسئلة</span>
      <input
        type="number"
        min={1}
        max={500}
        value={value}
        onChange={(event) => onChange(Math.min(500, Math.max(1, Number(event.target.value) || 1)))}
      />
    </label>
  );
}

function TargetFields({
  value,
  onChange,
}: {
  value: AiQuestionTarget;
  onChange: (value: AiQuestionTarget) => void;
}) {
  return (
    <fieldset className="authoring-targets">
      <legend>أعداد الأسئلة</legend>
      <TargetNumber
        label="اختيار متعدد"
        value={value.multipleChoice}
        onChange={(multipleChoice) => onChange({ ...value, multipleChoice })}
      />
      <TargetNumber
        label="صح / خطأ"
        value={value.trueFalse}
        onChange={(trueFalse) => onChange({ ...value, trueFalse })}
      />
      <TargetNumber
        label="مباشر"
        value={value.direct}
        onChange={(direct) => onChange({ ...value, direct })}
      />
    </fieldset>
  );
}

function TargetNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        min={0}
        max={500}
        value={value}
        onChange={(event) => onChange(Math.min(500, Math.max(0, Number(event.target.value) || 0)))}
      />
    </label>
  );
}
