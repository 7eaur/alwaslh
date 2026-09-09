import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "./admin-api";
import {
  type QuestionBankAnswerStatus,
  type QuestionBankDetailResponse,
  type QuestionBankDifficulty,
  type QuestionBankListItem,
  type QuestionBankOrigin,
  type QuestionBankQuestionInput,
  type QuestionBankQuestionType,
  type QuestionBankStatus,
  applyApprovedQuestionRegeneration,
  createManualQuestion,
  editQuestionBankItem,
  fetchQuestionBank,
  fetchQuestionBankItem,
  importApprovedAiQuestions,
  publishQuestion,
  rejectQuestionReview,
  submitQuestionForReview,
} from "./question-bank-api";
import "./question-bank.css";

interface Props {
  onSessionExpired: () => void;
}

interface Filters {
  classId: string;
  subjectId: string;
  origin: "" | QuestionBankOrigin;
  status: "" | Exclude<QuestionBankStatus, "archived">;
  search: string;
}

interface ScopeDraft {
  classId: string;
  subjectId: string;
  lessonIds: string[];
}

const PAGE_SIZE = 30;

const emptyQuestion: QuestionBankQuestionInput = {
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

function statusLabel(status: QuestionBankStatus | undefined): string {
  if (status === "draft") return "مسودة";
  if (status === "review") return "قيد المراجعة";
  if (status === "published") return "منشور";
  if (status === "archived") return "مؤرشف";
  return "بدون نسخة";
}

function typeLabel(type: QuestionBankQuestionType | undefined): string {
  if (type === "multiple_choice") return "اختيار متعدد";
  if (type === "true_false") return "صح / خطأ";
  if (type === "direct") return "سؤال مباشر";
  return "غير محدد";
}

function difficultyLabel(value: QuestionBankDifficulty | undefined): string {
  if (value === "easy") return "سهل";
  if (value === "hard") return "صعب";
  return "متوسط";
}

function answerStatusLabel(value: QuestionBankAnswerStatus | undefined): string {
  if (value === "known") return "إجابة محسومة";
  if (value === "unknown") return "غير معروفة";
  return "تحتاج مراجعة";
}

function originLabel(origin: QuestionBankOrigin): string {
  return origin === "ai" ? "مستورد من AI" : "يدوي";
}

function eventLabel(action: string): string {
  if (action === "create") return "إنشاء";
  if (action === "import") return "استيراد AI";
  if (action === "edit") return "تعديل";
  if (action === "submit_review") return "إرسال للمراجعة";
  if (action === "reject") return "إرجاع للمسودة";
  if (action === "publish") return "نشر";
  if (action === "archive") return "أرشفة";
  return action;
}

function localDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function QuestionBankWorkspace({ onSessionExpired }: Props) {
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [items, setItems] = useState<QuestionBankListItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [filters, setFilters] = useState<Filters>({ classId: "", subjectId: "", origin: "", status: "", search: "" });
  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<QuestionBankDetailResponse | null>(null);
  const [detailState, setDetailState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [detailError, setDetailError] = useState("");
  const [editorMode, setEditorMode] = useState<"closed" | "manual" | "edit" | "import" | "regenerate">("closed");
  const [questionDraft, setQuestionDraft] = useState<QuestionBankQuestionInput>(emptyQuestion);
  const [scopeDraft, setScopeDraft] = useState<ScopeDraft>({ classId: "", subjectId: "", lessonIds: [] });
  const [outputId, setOutputId] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [mutationState, setMutationState] = useState<"idle" | "saving">("idle");
  const [mutationFeedback, setMutationFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const handleError = useCallback(
    (cause: unknown, setter: (value: string) => void) => {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setter(messageFor(cause));
    },
    [onSessionExpired],
  );

  const loadCurriculum = useCallback(async () => {
    try {
      const result = await fetchAdminCurriculum();
      setCurriculum(result);
    } catch (cause) {
      handleError(cause, setError);
    }
  }, [handleError]);

  const loadList = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const result = await fetchQuestionBank({
        ...(appliedFilters.classId ? { classId: appliedFilters.classId } : {}),
        ...(appliedFilters.subjectId ? { subjectId: appliedFilters.subjectId } : {}),
        ...(appliedFilters.origin ? { origin: appliedFilters.origin } : {}),
        ...(appliedFilters.status ? { status: appliedFilters.status } : {}),
        ...(appliedFilters.search.trim() ? { search: appliedFilters.search.trim() } : {}),
        limit: PAGE_SIZE,
        offset,
      });
      setItems(result.items);
      setPagination(result.pagination);
      setState("ready");
    } catch (cause) {
      setState("error");
      handleError(cause, setError);
    }
  }, [appliedFilters, handleError, offset]);

  useEffect(() => {
    void loadCurriculum();
  }, [loadCurriculum]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const loadDetail = useCallback(
    async (itemId: string) => {
      setDetailState("loading");
      setDetailError("");
      try {
        const result = await fetchQuestionBankItem(itemId);
        setDetail(result);
        setDetailState("ready");
      } catch (cause) {
        setDetailState("error");
        handleError(cause, setDetailError);
      }
    },
    [handleError],
  );

  const classOptions = useMemo(() => curriculum?.classes.filter((item) => item.status !== "archived") ?? [], [curriculum]);
  const subjectOptions = useMemo(() => {
    if (!curriculum) return [];
    if (!scopeDraft.classId) return curriculum.subjects.filter((item) => item.status !== "archived");
    const subjectIds = new Set(
      curriculum.offerings
        .filter((offering) => offering.classId === scopeDraft.classId && offering.status !== "archived")
        .map((offering) => offering.subjectId),
    );
    return curriculum.subjects.filter((subject) => subjectIds.has(subject.id) && subject.status !== "archived");
  }, [curriculum, scopeDraft.classId]);
  const lessonOptions = useMemo(
    () =>
      curriculum?.lessons.filter(
        (lesson) =>
          lesson.classId === scopeDraft.classId &&
          lesson.subjectId === scopeDraft.subjectId &&
          lesson.status !== "archived",
      ) ?? [],
    [curriculum, scopeDraft.classId, scopeDraft.subjectId],
  );

  const filterSubjects = useMemo(() => {
    if (!curriculum || !filters.classId) return curriculum?.subjects ?? [];
    const allowed = new Set(
      curriculum.offerings.filter((offering) => offering.classId === filters.classId).map((offering) => offering.subjectId),
    );
    return curriculum.subjects.filter((subject) => allowed.has(subject.id));
  }, [curriculum, filters.classId]);

  const currentRevision = detail?.revisions[0] ?? null;
  const canGoNext = pagination.offset + items.length < pagination.total;
  const canGoPrevious = offset > 0;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
    setDetail(null);
    setDetailState("idle");
  }

  function beginManual() {
    setEditorMode("manual");
    setQuestionDraft(emptyQuestion);
    setScopeDraft({ classId: filters.classId, subjectId: filters.subjectId, lessonIds: [] });
    setMutationFeedback(null);
  }

  function beginImport() {
    setEditorMode("import");
    setScopeDraft({ classId: filters.classId, subjectId: filters.subjectId, lessonIds: [] });
    setOutputId("");
    setMutationFeedback(null);
  }

  function beginRegenerate() {
    if (!detail || currentRevision?.status !== "published") return;
    setEditorMode("regenerate");
    setOutputId("");
    setMutationFeedback(null);
  }

  function beginEdit() {
    if (!detail || !currentRevision) return;
    setEditorMode("edit");
    setQuestionDraft({ ...currentRevision.question, options: [...currentRevision.question.options] });
    setScopeDraft({
      classId: detail.item.classId,
      subjectId: detail.item.subjectId,
      lessonIds: [...currentRevision.lessonIds],
    });
    setMutationFeedback(null);
  }

  const refreshAfterMutation = useCallback(
    async (itemId?: string) => {
      await loadList();
      if (itemId) await loadDetail(itemId);
    },
    [loadDetail, loadList],
  );

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMutationFeedback(null);
    const validation = validateDraft(questionDraft, editorMode === "manual" ? scopeDraft : undefined);
    if (validation) {
      setMutationFeedback({ kind: "error", text: validation });
      return;
    }
    setMutationState("saving");
    try {
      if (editorMode === "manual") {
        const created = await createManualQuestion({ ...scopeDraft, question: normalizedDraft(questionDraft) });
        setMutationFeedback({ kind: "success", text: "تم إنشاء السؤال كمسودة. لم يصل إلى النشر بعد." });
        setEditorMode("closed");
        await refreshAfterMutation(created.itemId);
      } else if (editorMode === "edit" && detail) {
        await editQuestionBankItem(detail.item.id, normalizedDraft(questionDraft));
        setMutationFeedback({ kind: "success", text: "حُفظ التعديل في نسخة مسودة جديدة مع إبقاء النسخ السابقة محفوظة." });
        setEditorMode("closed");
        await refreshAfterMutation(detail.item.id);
      }
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setMutationFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function submitImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMutationFeedback(null);
    if (!outputId.trim() || !scopeDraft.classId || !scopeDraft.subjectId || scopeDraft.lessonIds.length === 0) {
      setMutationFeedback({ kind: "error", text: "حدد مخرج AI المعتمد والصف والمادة ودرسًا واحدًا على الأقل." });
      return;
    }
    setMutationState("saving");
    try {
      const result = await importApprovedAiQuestions(outputId.trim(), scopeDraft);
      setMutationFeedback({
        kind: "success",
        text: result.replayed
          ? "هذا المخرج سبق استيراده؛ عُرضت الروابط الموجودة بدون إنشاء نسخ مكررة."
          : `تم استيراد ${result.imports.length} سؤال كمسودات قابلة للمراجعة.`,
      });
      setEditorMode("closed");
      await refreshAfterMutation(result.imports[0]?.itemId);
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setMutationFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function submitRegeneration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMutationFeedback(null);
    if (!detail || currentRevision?.status !== "published" || !outputId.trim()) {
      setMutationFeedback({ kind: "error", text: "حدد مخرج إعادة التوليد المعتمد لسؤال منشور." });
      return;
    }
    setMutationState("saving");
    try {
      const result = await applyApprovedQuestionRegeneration(detail.item.id, outputId.trim());
      setMutationFeedback({
        kind: "success",
        text: result.replayed
          ? "هذا المخرج طُبق سابقًا على السؤال نفسه؛ لم تُنشأ نسخة مكررة."
          : "تم إنشاء Draft revision جديدة لنفس هوية السؤال من مخرج إعادة التوليد المعتمد.",
      });
      setEditorMode("closed");
      await refreshAfterMutation(detail.item.id);
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setMutationFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function lifecycle(action: "submit" | "publish" | "reject") {
    if (!detail) return;
    if (action === "reject" && !rejectNote.trim()) {
      setMutationFeedback({ kind: "error", text: "اكتب سبب إعادة السؤال من المراجعة إلى المسودة." });
      return;
    }
    setMutationState("saving");
    setMutationFeedback(null);
    try {
      if (action === "submit") await submitQuestionForReview(detail.item.id);
      else if (action === "publish") await publishQuestion(detail.item.id);
      else await rejectQuestionReview(detail.item.id, rejectNote);
      setRejectNote("");
      setMutationFeedback({
        kind: "success",
        text:
          action === "submit"
            ? "أُرسل السؤال للمراجعة."
            : action === "publish"
              ? "نُشرت النسخة التي كانت قيد المراجعة."
              : "أُعيد السؤال إلى المسودة مع حفظ سبب القرار.",
      });
      await refreshAfterMutation(detail.item.id);
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else {
        setMutationFeedback({ kind: "error", text: messageFor(cause) });
        await loadDetail(detail.item.id).catch(() => undefined);
      }
    } finally {
      setMutationState("idle");
    }
  }

  return (
    <section className="question-bank" aria-labelledby="question-bank-title">
      <header className="page-header">
        <div>
          <p className="eyebrow">المحتوى التقييمي</p>
          <h1 id="question-bank-title">بنك الأسئلة</h1>
          <p className="page-description">
            إدارة الأسئلة اليدوية والمراجعة بشريًا قبل النشر. مخرجات AI المعتمدة تدخل هنا كمسودات، ولا تصبح سلطة للطالب تلقائيًا.
          </p>
        </div>
        <div className="qb-header-actions">
          <button className="secondary-button" type="button" onClick={() => void loadList()} disabled={state === "loading"}>
            تحديث
          </button>
          <button className="secondary-button" type="button" onClick={beginImport}>استيراد مخرج AI</button>
          <button className="primary-button" type="button" onClick={beginManual}>سؤال يدوي جديد</button>
        </div>
      </header>

      {mutationFeedback ? (
        <div className={`mutation-feedback is-${mutationFeedback.kind}`} role="status">
          {mutationFeedback.text}
        </div>
      ) : null}

      <form className="qb-filter-bar" onSubmit={applyFilters} aria-label="فلترة بنك الأسئلة">
        <label>
          <span>بحث في نص السؤال</span>
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="مثال: الطاقة أو تعريف..."
          />
        </label>
        <label>
          <span>الصف</span>
          <select
            value={filters.classId}
            onChange={(event) => {
              const classId = event.target.value;
              setFilters((current) => ({ ...current, classId, subjectId: "" }));
            }}
          >
            <option value="">كل الصفوف</option>
            {classOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span>المادة</span>
          <select value={filters.subjectId} onChange={(event) => setFilters((current) => ({ ...current, subjectId: event.target.value }))}>
            <option value="">كل المواد</option>
            {filterSubjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span>الحالة</span>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as Filters["status"] }))}>
            <option value="">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="review">قيد المراجعة</option>
            <option value="published">منشور</option>
          </select>
        </label>
        <label>
          <span>المصدر</span>
          <select value={filters.origin} onChange={(event) => setFilters((current) => ({ ...current, origin: event.target.value as Filters["origin"] }))}>
            <option value="">الكل</option>
            <option value="manual">يدوي</option>
            <option value="ai">AI معتمد</option>
          </select>
        </label>
        <button className="primary-button" type="submit">تطبيق</button>
      </form>

      {editorMode === "manual" ? (
        <EditorPanel title="إنشاء سؤال يدوي" onClose={() => setEditorMode("closed")}>
          <form className="qb-editor-form" onSubmit={submitQuestion}>
            <ScopeFields curriculum={curriculum} scope={scopeDraft} setScope={setScopeDraft} subjects={subjectOptions} lessons={lessonOptions} />
            <QuestionFields question={questionDraft} setQuestion={setQuestionDraft} />
            <div className="qb-form-actions">
              <button className="secondary-button" type="button" onClick={() => setEditorMode("closed")}>إلغاء</button>
              <button className="primary-button" type="submit" disabled={mutationState === "saving"}>حفظ كمسودة</button>
            </div>
          </form>
        </EditorPanel>
      ) : null}

      {editorMode === "edit" ? (
        <EditorPanel title="إنشاء نسخة معدلة" onClose={() => setEditorMode("closed")}>
          <p className="qb-editor-note">التعديل لا يغيّر النسخة المنشورة تاريخيًا؛ الخادم ينشئ revision جديدة قابلة للمراجعة.</p>
          <form className="qb-editor-form" onSubmit={submitQuestion}>
            <QuestionFields question={questionDraft} setQuestion={setQuestionDraft} />
            <div className="qb-form-actions">
              <button className="secondary-button" type="button" onClick={() => setEditorMode("closed")}>إلغاء</button>
              <button className="primary-button" type="submit" disabled={mutationState === "saving"}>حفظ النسخة الجديدة</button>
            </div>
          </form>
        </EditorPanel>
      ) : null}

      {editorMode === "import" ? (
        <EditorPanel title="استيراد مخرج AI معتمد" onClose={() => setEditorMode("closed")}>
          <p className="qb-editor-note">يقبل الخادم فقط أحدث قرار اعتماد من مرحلة مراجعة AI. أي مخرج غير معتمد يُرفض.</p>
          <form className="qb-editor-form" onSubmit={submitImport}>
            <label className="qb-wide-field">
              <span>معرف مخرج AI</span>
              <input value={outputId} onChange={(event) => setOutputId(event.target.value)} placeholder="UUID للمخرج المعتمد" />
            </label>
            <ScopeFields curriculum={curriculum} scope={scopeDraft} setScope={setScopeDraft} subjects={subjectOptions} lessons={lessonOptions} />
            <div className="qb-form-actions">
              <button className="secondary-button" type="button" onClick={() => setEditorMode("closed")}>إلغاء</button>
              <button className="primary-button" type="submit" disabled={mutationState === "saving"}>استيراد كمسودات</button>
            </div>
          </form>
        </EditorPanel>
      ) : null}

      {editorMode === "regenerate" && detail && currentRevision ? (
        <EditorPanel title="تطبيق إعادة توليد معتمدة" onClose={() => setEditorMode("closed")}>
          <p className="qb-editor-note">
            استخدم مخرج Stage12 بوضع regenerate_question بعد اعتماده في Stage13E. الخادم يتحقق من أن السؤال الأصلي والمصدر يطابقان النسخة المنشورة الحالية ثم ينشئ Draft revision لنفس item ID.
          </p>
          <form className="qb-editor-form" onSubmit={submitRegeneration}>
            <label className="qb-wide-field">
              <span>معرف مخرج إعادة التوليد المعتمد</span>
              <input value={outputId} onChange={(event) => setOutputId(event.target.value)} placeholder="UUID لمخرج regenerate_question" />
            </label>
            <div className="qb-form-actions">
              <button className="secondary-button" type="button" onClick={() => setEditorMode("closed")}>إلغاء</button>
              <button className="primary-button" type="submit" disabled={mutationState === "saving"}>إنشاء Draft revision</button>
            </div>
          </form>
        </EditorPanel>
      ) : null}

      <div className="qb-workspace-grid">
        <section className="qb-list-panel" aria-label="قائمة أسئلة البنك">
          <div className="qb-section-heading">
            <div>
              <p className="section-kicker">النتائج الحالية</p>
              <h2>الأسئلة</h2>
            </div>
            <span className="count-pill" aria-label={`${pagination.total} نتيجة`}>{pagination.total}</span>
          </div>

          {state === "loading" ? <StatePanel title="جارٍ تحميل بنك الأسئلة" body="نقرأ الحالة الحالية من الخادم." /> : null}
          {state === "error" ? <StatePanel title="تعذر تحميل بنك الأسئلة" body={error} action={<button className="secondary-button" type="button" onClick={() => void loadList()}>إعادة المحاولة</button>} /> : null}
          {state === "ready" && items.length === 0 ? <StatePanel title="لا توجد أسئلة مطابقة" body="غيّر الفلاتر أو أنشئ سؤالًا يدويًا أو استورد مخرج AI معتمدًا." /> : null}

          {state === "ready" && items.length > 0 ? (
            <div className="qb-list">
              {items.map((item) => (
                <QuestionCard key={item.id} item={item} selected={detail?.item.id === item.id} onOpen={() => void loadDetail(item.id)} />
              ))}
            </div>
          ) : null}

          <nav className="qb-pagination" aria-label="صفحات بنك الأسئلة">
            <button className="secondary-button small-button" type="button" disabled={!canGoPrevious || state === "loading"} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>السابق</button>
            <span>{pagination.total === 0 ? "0 من 0" : `${pagination.offset + 1}–${Math.min(pagination.offset + items.length, pagination.total)} من ${pagination.total}`}</span>
            <button className="secondary-button small-button" type="button" disabled={!canGoNext || state === "loading"} onClick={() => setOffset(offset + PAGE_SIZE)}>التالي</button>
          </nav>
        </section>

        <aside className="qb-detail-panel" aria-label="تفاصيل سؤال بنك الأسئلة">
          {detailState === "idle" ? <StatePanel title="اختر سؤالًا" body="افتح سؤالًا لعرض النسخ والمصدر وسجل القرارات." /> : null}
          {detailState === "loading" ? <StatePanel title="جارٍ تحميل التفاصيل" body="نقرأ النسخ وسجل المصدر من الخادم." /> : null}
          {detailState === "error" ? <StatePanel title="تعذر تحميل التفاصيل" body={detailError} /> : null}
          {detailState === "ready" && detail && currentRevision ? (
            <QuestionDetail
              detail={detail}
              revision={currentRevision}
              curriculum={curriculum}
              busy={mutationState === "saving"}
              rejectNote={rejectNote}
              setRejectNote={setRejectNote}
              onEdit={beginEdit}
              onRegenerate={beginRegenerate}
              onSubmit={() => void lifecycle("submit")}
              onPublish={() => void lifecycle("publish")}
              onReject={() => void lifecycle("reject")}
            />
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function QuestionCard({ item, selected, onOpen }: { item: QuestionBankListItem; selected: boolean; onOpen: () => void }) {
  const revision = item.currentRevision;
  return (
    <button className={`qb-question-card${selected ? " is-selected" : ""}`} type="button" onClick={onOpen}>
      <div className="qb-card-topline">
        <span className={`status-badge qb-status-${revision?.status ?? "none"}`}>{statusLabel(revision?.status)}</span>
        <span className="qb-origin">{originLabel(item.origin)}</span>
      </div>
      <strong>{revision?.prompt ?? "سؤال بدون نسخة حالية"}</strong>
      <div className="qb-card-meta">
        <span>{typeLabel(revision?.type)}</span>
        <span>{difficultyLabel(revision?.difficulty)}</span>
        <span>{answerStatusLabel(revision?.answerStatus)}</span>
      </div>
    </button>
  );
}

function QuestionDetail({
  detail,
  revision,
  curriculum,
  busy,
  rejectNote,
  setRejectNote,
  onEdit,
  onRegenerate,
  onSubmit,
  onPublish,
  onReject,
}: {
  detail: QuestionBankDetailResponse;
  revision: QuestionBankDetailResponse["revisions"][number];
  curriculum: AdminCurriculumSnapshot | null;
  busy: boolean;
  rejectNote: string;
  setRejectNote: (value: string) => void;
  onEdit: () => void;
  onRegenerate: () => void;
  onSubmit: () => void;
  onPublish: () => void;
  onReject: () => void;
}) {
  const lessonNames = new Map(curriculum?.lessons.map((lesson) => [lesson.id, lesson.title]) ?? []);
  return (
    <div className="qb-detail">
      <div className="qb-detail-heading">
        <div>
          <p className="section-kicker">النسخة الحالية #{revision.revisionNumber}</p>
          <h2>تفاصيل السؤال</h2>
        </div>
        <span className={`status-badge qb-status-${revision.status}`}>{statusLabel(revision.status)}</span>
      </div>

      <section className="qb-question-content">
        <h3>{revision.question.prompt}</h3>
        <dl className="qb-facts">
          <div><dt>النوع</dt><dd>{typeLabel(revision.question.type)}</dd></div>
          <div><dt>الصعوبة</dt><dd>{difficultyLabel(revision.question.difficulty)}</dd></div>
          <div><dt>الإجابة</dt><dd>{answerStatusLabel(revision.question.answerStatus)}</dd></div>
          <div><dt>المصدر</dt><dd>{originLabel(detail.item.origin)}</dd></div>
        </dl>
        {revision.question.options.length > 0 ? (
          <ol className="qb-options">
            {revision.question.options.map((option, index) => (
              <li className={revision.question.correctOptionIndex === index ? "is-correct" : ""} key={`${option}-${index}`}>
                {option}
              </li>
            ))}
          </ol>
        ) : null}
        {revision.question.answerText ? <p className="qb-answer"><strong>الإجابة:</strong> {revision.question.answerText}</p> : null}
        {revision.question.explanation ? <p><strong>التوضيح:</strong> {revision.question.explanation}</p> : null}
        {revision.question.method ? <p><strong>طريقة الحل:</strong> {revision.question.method}</p> : null}
      </section>

      <div className="qb-lifecycle-actions">
        {revision.status === "draft" ? <button className="primary-button" type="button" onClick={onSubmit} disabled={busy}>إرسال للمراجعة</button> : null}
        {revision.status !== "review" ? <button className="secondary-button" type="button" onClick={onEdit} disabled={busy}>إنشاء نسخة معدلة</button> : null}
        {revision.status === "published" && revision.sources.length > 0 ? (
          <button className="secondary-button" type="button" onClick={onRegenerate} disabled={busy}>
            تطبيق إعادة توليد معتمدة
          </button>
        ) : null}
        {revision.status === "review" ? (
          <>
            <button className="primary-button" type="button" onClick={onPublish} disabled={busy}>نشر النسخة</button>
            <label className="qb-reject-field">
              <span>سبب الإرجاع</span>
              <textarea value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} rows={2} placeholder="سبب واضح للمراجعة اللاحقة" />
            </label>
            <button className="secondary-button" type="button" onClick={onReject} disabled={busy || !rejectNote.trim()}>إرجاع للمسودة</button>
          </>
        ) : null}
      </div>

      <details className="qb-evidence" open>
        <summary>السياق والمصدر</summary>
        <div className="qb-evidence-body">
          <div>
            <h3>الدروس المرتبطة</h3>
            {revision.lessonIds.length > 0 ? <ul>{revision.lessonIds.map((id) => <li key={id}>{lessonNames.get(id) ?? id}</li>)}</ul> : <p>لا يوجد درس مرتبط.</p>}
          </div>
          <div>
            <h3>إثبات المصدر</h3>
            {revision.sources.length > 0 ? (
              <div className="qb-source-list">
                {revision.sources.map((source) => (
                  <article key={`${source.mediaAssetId}-${source.position}`}>
                    <strong>صفحة {source.pageNumber}</strong>
                    <code>{source.inputChecksumSha256}</code>
                    {source.quote ? <p>«{source.quote}»</p> : null}
                    {source.ocrExtractionId ? <small>OCR: <code>{source.ocrExtractionId}</code></small> : null}
                  </article>
                ))}
              </div>
            ) : <p>سؤال يدوي بلا مصدر AI محفوظ.</p>}
          </div>
        </div>
      </details>

      <details className="qb-evidence">
        <summary>سجل النسخ ({detail.revisionPagination.total})</summary>
        <div className="qb-timeline">
          {detail.revisions.map((entry) => (
            <article key={entry.id}>
              <div><strong>نسخة #{entry.revisionNumber}</strong><span className={`status-badge qb-status-${entry.status}`}>{statusLabel(entry.status)}</span></div>
              <p>{entry.question.prompt}</p>
              <small>أُنشئت {localDate(entry.createdAt)} · النشر {localDate(entry.publishedAt)}</small>
            </article>
          ))}
        </div>
      </details>

      <details className="qb-evidence">
        <summary>سجل القرارات ({detail.eventPagination.total})</summary>
        <div className="qb-timeline">
          {detail.events.map((event) => (
            <article key={event.id}>
              <strong>{eventLabel(event.action)}</strong>
              <p>{event.note ?? "بدون ملاحظة"}</p>
              <small>{localDate(event.createdAt)}</small>
            </article>
          ))}
        </div>
      </details>

      {detail.aiImports.length > 0 ? (
        <details className="qb-evidence">
          <summary>مرجع AI</summary>
          <div className="qb-source-list">
            {detail.aiImports.map((entry) => (
              <article key={`${entry.aiOutputId}-${entry.questionLocator}`}>
                <strong>{entry.promptKey} · v{entry.promptVersion}</strong>
                <p>{entry.generationMode} · {entry.questionLocator}</p>
                <code>{entry.aiOutputId}</code>
                <small>قرار اعتماد #{entry.approvedReviewRevision}</small>
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </div>
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
  setScope: React.Dispatch<React.SetStateAction<ScopeDraft>>;
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
          {curriculum?.classes.filter((item) => item.status !== "archived").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label>
        <span>المادة</span>
        <select value={scope.subjectId} disabled={!scope.classId} onChange={(event) => setScope((current) => ({ ...current, subjectId: event.target.value, lessonIds: [] }))}>
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
  setQuestion: React.Dispatch<React.SetStateAction<QuestionBankQuestionInput>>;
}) {
  function changeType(type: QuestionBankQuestionType) {
    setQuestion((current) => {
      if (type === "multiple_choice") {
        return { ...current, type, options: ["", "", "", ""], correctOptionIndex: 0, answerText: "" };
      }
      if (type === "true_false") {
        return { ...current, type, options: ["صح", "خطأ"], correctOptionIndex: 0, answerText: "صح" };
      }
      return { ...current, type, options: [], correctOptionIndex: null, answerText: current.answerStatus === "known" ? "" : null };
    });
  }

  function changeAnswerStatus(answerStatus: QuestionBankAnswerStatus) {
    setQuestion((current) => {
      if (answerStatus !== "known") return { ...current, answerStatus, correctOptionIndex: null, answerText: null };
      if (current.type === "direct") return { ...current, answerStatus, correctOptionIndex: null, answerText: "" };
      const correctOptionIndex = 0;
      return { ...current, answerStatus, correctOptionIndex, answerText: current.options[correctOptionIndex] ?? "" };
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

function validateDraft(question: QuestionBankQuestionInput, scope?: ScopeDraft): string | null {
  if (scope && (!scope.classId || !scope.subjectId || scope.lessonIds.length === 0)) {
    return "حدد الصف والمادة ودرسًا واحدًا على الأقل.";
  }
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
