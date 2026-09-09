import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "./admin-api";
import {
  type QuizBuilderDetail,
  type QuizBuilderListItem,
  type QuizBuilderStatus,
  type QuizBuilderVersion,
  type QuizQuestionCandidate,
  type QuizVersionQuestionRef,
  addQuizVersion,
  archiveQuiz,
  createQuiz,
  fetchQuiz,
  fetchQuizCandidates,
  fetchQuizzes,
  publishQuiz,
  rejectQuizReview,
  removeQuizVersion,
  replaceQuizVersionQuestions,
  submitQuizForReview,
} from "./quiz-builder-api";
import "./quiz-builder.css";

interface Props {
  onSessionExpired: () => void;
}

interface ListFilters {
  search: string;
  classId: string;
  subjectId: string;
  status: "" | QuizBuilderStatus;
}

interface QuizDraft {
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  lessonIds: string[];
  shuffleVersions: boolean;
}

interface VersionEditorState {
  mode: "add" | "replace";
  versionId: string | null;
  label: string;
  shuffleOptions: boolean;
  selected: QuizVersionQuestionRef[];
}

const PAGE_SIZE = 30;
const CANDIDATE_PAGE_SIZE = 50;

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

function statusLabel(status: QuizBuilderStatus): string {
  if (status === "draft") return "مسودة";
  if (status === "review") return "قيد المراجعة";
  if (status === "published") return "منشور";
  return "مؤرشف";
}

function typeLabel(type: QuizQuestionCandidate["type"]): string {
  if (type === "multiple_choice") return "اختيار متعدد";
  if (type === "true_false") return "صح / خطأ";
  return "مباشر";
}

function difficultyLabel(value: QuizQuestionCandidate["difficulty"]): string {
  if (value === "easy") return "سهل";
  if (value === "hard") return "صعب";
  return "متوسط";
}

function localDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function QuizBuilderWorkspace({ onSessionExpired }: Props) {
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [items, setItems] = useState<QuizBuilderListItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [filters, setFilters] = useState<ListFilters>({ search: "", classId: "", subjectId: "", status: "" });
  const [appliedFilters, setAppliedFilters] = useState<ListFilters>(filters);
  const [offset, setOffset] = useState(0);
  const [listState, setListState] = useState<"loading" | "ready" | "error">("loading");
  const [listError, setListError] = useState("");
  const [detail, setDetail] = useState<QuizBuilderDetail | null>(null);
  const [detailState, setDetailState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [detailError, setDetailError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [quizDraft, setQuizDraft] = useState<QuizDraft>(emptyQuizDraft);
  const [versionEditor, setVersionEditor] = useState<VersionEditorState | null>(null);
  const [candidates, setCandidates] = useState<QuizQuestionCandidate[]>([]);
  const [candidatePagination, setCandidatePagination] = useState({ total: 0, limit: CANDIDATE_PAGE_SIZE, offset: 0 });
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateOffset, setCandidateOffset] = useState(0);
  const [candidateState, setCandidateState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [candidateError, setCandidateError] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [mutationState, setMutationState] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

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
      setCurriculum(await fetchAdminCurriculum());
    } catch (cause) {
      handleError(cause, setListError);
    }
  }, [handleError]);

  const loadList = useCallback(async () => {
    setListState("loading");
    setListError("");
    try {
      const result = await fetchQuizzes({
        ...(appliedFilters.search.trim() ? { search: appliedFilters.search.trim() } : {}),
        ...(appliedFilters.classId ? { classId: appliedFilters.classId } : {}),
        ...(appliedFilters.subjectId ? { subjectId: appliedFilters.subjectId } : {}),
        ...(appliedFilters.status ? { status: appliedFilters.status } : {}),
        limit: PAGE_SIZE,
        offset,
      });
      setItems(result.items);
      setPagination(result.pagination);
      setListState("ready");
    } catch (cause) {
      setListState("error");
      handleError(cause, setListError);
    }
  }, [appliedFilters, handleError, offset]);

  const loadDetail = useCallback(
    async (quizId: string) => {
      setDetailState("loading");
      setDetailError("");
      setVersionEditor(null);
      try {
        const result = await fetchQuiz(quizId);
        setDetail(result);
        setDetailState("ready");
      } catch (cause) {
        setDetailState("error");
        handleError(cause, setDetailError);
      }
    },
    [handleError],
  );

  const loadCandidates = useCallback(
    async (quizId: string, search: string, candidatePageOffset: number) => {
      setCandidateState("loading");
      setCandidateError("");
      try {
        const result = await fetchQuizCandidates(quizId, {
          ...(search.trim() ? { search: search.trim() } : {}),
          limit: CANDIDATE_PAGE_SIZE,
          offset: candidatePageOffset,
        });
        setCandidates(result.items);
        setCandidatePagination(result.pagination);
        setCandidateState("ready");
      } catch (cause) {
        setCandidateState("error");
        handleError(cause, setCandidateError);
      }
    },
    [handleError],
  );

  useEffect(() => {
    void loadCurriculum();
  }, [loadCurriculum]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const classOptions = useMemo(
    () => curriculum?.classes.filter((item) => item.status !== "archived") ?? [],
    [curriculum],
  );
  const filterSubjects = useMemo(() => {
    if (!curriculum) return [];
    if (!filters.classId) return curriculum.subjects.filter((item) => item.status !== "archived");
    const ids = new Set(
      curriculum.offerings
        .filter((offering) => offering.classId === filters.classId && offering.status !== "archived")
        .map((offering) => offering.subjectId),
    );
    return curriculum.subjects.filter((subject) => ids.has(subject.id) && subject.status !== "archived");
  }, [curriculum, filters.classId]);
  const draftSubjects = useMemo(() => {
    if (!curriculum) return [];
    const ids = new Set(
      curriculum.offerings
        .filter((offering) => offering.classId === quizDraft.classId && offering.status !== "archived")
        .map((offering) => offering.subjectId),
    );
    return curriculum.subjects.filter((subject) => ids.has(subject.id) && subject.status !== "archived");
  }, [curriculum, quizDraft.classId]);
  const draftLessons = useMemo(
    () =>
      curriculum?.lessons.filter(
        (lesson) =>
          lesson.classId === quizDraft.classId &&
          lesson.subjectId === quizDraft.subjectId &&
          lesson.status !== "archived",
      ) ?? [],
    [curriculum, quizDraft.classId, quizDraft.subjectId],
  );

  const canPrevious = offset > 0;
  const canNext = offset + items.length < pagination.total;
  const candidateCanPrevious = candidateOffset > 0;
  const candidateCanNext = candidateOffset + candidates.length < candidatePagination.total;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
  }

  async function refreshAfterMutation(quizId?: string) {
    await loadList();
    if (quizId) await loadDetail(quizId);
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
      setCreateOpen(false);
      setQuizDraft(emptyQuizDraft);
      setFeedback({ kind: "success", text: "تم إنشاء الاختبار كمسودة. أضف نموذجًا من الأسئلة المنشورة قبل المراجعة." });
      await refreshAfterMutation(created.quizId);
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function openVersionEditor(version?: QuizBuilderVersion) {
    if (!detail || detail.quiz.status !== "draft") return;
    const selected = version
      ? version.questions.flatMap((question) =>
          question.questionBankItemId && question.questionBankRevisionId
            ? [
                {
                  questionBankItemId: question.questionBankItemId,
                  questionBankRevisionId: question.questionBankRevisionId,
                },
              ]
            : [],
        )
      : [];
    setCandidateSearch("");
    setCandidateOffset(0);
    setVersionEditor({
      mode: version ? "replace" : "add",
      versionId: version?.id ?? null,
      label: version?.label ?? `النموذج ${detail.versions.length + 1}`,
      shuffleOptions: version?.shuffleOptions ?? true,
      selected,
    });
    await loadCandidates(detail.quiz.id, "", 0);
  }

  function toggleCandidate(candidate: QuizQuestionCandidate) {
    setVersionEditor((current) => {
      if (!current) return current;
      const exists = current.selected.some((item) => item.questionBankRevisionId === candidate.revisionId);
      return {
        ...current,
        selected: exists
          ? current.selected.filter((item) => item.questionBankRevisionId !== candidate.revisionId)
          : [
              ...current.selected,
              { questionBankItemId: candidate.itemId, questionBankRevisionId: candidate.revisionId },
            ],
      };
    });
  }

  async function submitVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail || !versionEditor) return;
    setFeedback(null);
    if (!versionEditor.label.trim() || versionEditor.selected.length === 0) {
      setFeedback({ kind: "error", text: "اكتب اسم النموذج واختر سؤالًا منشورًا واحدًا على الأقل." });
      return;
    }
    setMutationState("saving");
    try {
      if (versionEditor.mode === "add") {
        await addQuizVersion(detail.quiz.id, {
          label: versionEditor.label.trim(),
          shuffleOptions: versionEditor.shuffleOptions,
          questions: versionEditor.selected,
        });
        setFeedback({ kind: "success", text: "تم إنشاء نموذج الاختبار من revisions منشورة وثابتة." });
      } else if (versionEditor.versionId) {
        await replaceQuizVersionQuestions(detail.quiz.id, versionEditor.versionId, versionEditor.selected);
        setFeedback({ kind: "success", text: "تم تحديث أسئلة النموذج وهو ما يزال مسودة." });
      }
      setVersionEditor(null);
      await refreshAfterMutation(detail.quiz.id);
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function deleteVersion(versionId: string) {
    if (!detail) return;
    setMutationState("saving");
    setFeedback(null);
    try {
      await removeQuizVersion(detail.quiz.id, versionId);
      setFeedback({ kind: "success", text: "تم حذف النموذج من المسودة." });
      await refreshAfterMutation(detail.quiz.id);
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function lifecycle(action: "submit" | "publish" | "reject" | "archive") {
    if (!detail) return;
    if (action === "reject" && !rejectNote.trim()) {
      setFeedback({ kind: "error", text: "اكتب سبب إعادة الاختبار من المراجعة إلى المسودة." });
      return;
    }
    setMutationState("saving");
    setFeedback(null);
    try {
      if (action === "submit") await submitQuizForReview(detail.quiz.id);
      else if (action === "publish") await publishQuiz(detail.quiz.id);
      else if (action === "reject") await rejectQuizReview(detail.quiz.id, rejectNote);
      else await archiveQuiz(detail.quiz.id);
      setRejectNote("");
      setFeedback({
        kind: "success",
        text:
          action === "submit"
            ? "أُرسل الاختبار للمراجعة."
            : action === "publish"
              ? "تم نشر الاختبار. أصبحت نماذجه snapshots غير قابلة للتعديل."
              : action === "reject"
                ? "أُعيد الاختبار إلى المسودة مع حفظ سبب القرار."
                : "تمت أرشفة الاختبار.",
      });
      await refreshAfterMutation(detail.quiz.id);
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function searchCandidates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail) return;
    setCandidateOffset(0);
    await loadCandidates(detail.quiz.id, candidateSearch, 0);
  }

  async function changeCandidatePage(nextOffset: number) {
    if (!detail) return;
    setCandidateOffset(nextOffset);
    await loadCandidates(detail.quiz.id, candidateSearch, nextOffset);
  }

  return (
    <section className="quiz-builder" aria-labelledby="quiz-builder-title">
      <header className="page-header">
        <div>
          <p className="eyebrow">المحتوى التقييمي</p>
          <h1 id="quiz-builder-title">منشئ الاختبارات والنماذج</h1>
          <p className="page-description">
            ابنِ اختبارات من نسخ بنك الأسئلة المنشورة فقط. كل نموذج يحفظ snapshot ثابتة حتى لا تتغير نتائج الطالب بعد النشر.
          </p>
        </div>
        <div className="qz-header-actions">
          <button className="secondary-button" type="button" onClick={() => void loadList()} disabled={listState === "loading"}>
            تحديث
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setCreateOpen(true);
              setQuizDraft(emptyQuizDraft);
              setFeedback(null);
            }}
          >
            اختبار جديد
          </button>
        </div>
      </header>

      {feedback ? (
        <div className={`mutation-feedback is-${feedback.kind}`} role="status">
          {feedback.text}
        </div>
      ) : null}

      <form className="qz-filter-bar" onSubmit={applyFilters} aria-label="فلترة الاختبارات">
        <label>
          <span>بحث بالعنوان</span>
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="مثال: اختبار الطاقة"
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
            {classOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>المادة</span>
          <select
            value={filters.subjectId}
            onChange={(event) => setFilters((current) => ({ ...current, subjectId: event.target.value }))}
          >
            <option value="">كل المواد</option>
            {filterSubjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>الحالة</span>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ListFilters["status"] }))}
          >
            <option value="">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="review">قيد المراجعة</option>
            <option value="published">منشور</option>
            <option value="archived">مؤرشف</option>
          </select>
        </label>
        <button className="primary-button" type="submit">
          تطبيق
        </button>
      </form>

      {createOpen ? (
        <EditorPanel title="إنشاء اختبار جديد" onClose={() => setCreateOpen(false)}>
          <form className="qz-editor-form" onSubmit={submitCreate}>
            <div className="qz-form-grid">
              <label className="qz-wide-field">
                <span>عنوان الاختبار</span>
                <input
                  value={quizDraft.title}
                  onChange={(event) => setQuizDraft((current) => ({ ...current, title: event.target.value }))}
                  maxLength={500}
                  required
                />
              </label>
              <label className="qz-wide-field">
                <span>الوصف</span>
                <textarea
                  value={quizDraft.description}
                  onChange={(event) => setQuizDraft((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  maxLength={4000}
                />
              </label>
              <label>
                <span>الصف</span>
                <select
                  value={quizDraft.classId}
                  onChange={(event) =>
                    setQuizDraft((current) => ({
                      ...current,
                      classId: event.target.value,
                      subjectId: "",
                      lessonIds: [],
                    }))
                  }
                  required
                >
                  <option value="">اختر الصف</option>
                  {classOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>المادة</span>
                <select
                  value={quizDraft.subjectId}
                  onChange={(event) =>
                    setQuizDraft((current) => ({ ...current, subjectId: event.target.value, lessonIds: [] }))
                  }
                  disabled={!quizDraft.classId}
                  required
                >
                  <option value="">اختر المادة</option>
                  {draftSubjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="qz-lesson-picker">
                <legend>الدروس الداخلة في الاختبار</legend>
                {draftLessons.length === 0 ? <p>اختر الصف والمادة لعرض الدروس.</p> : null}
                {draftLessons.map((lesson) => (
                  <label className="qz-check" key={lesson.id}>
                    <input
                      type="checkbox"
                      checked={quizDraft.lessonIds.includes(lesson.id)}
                      onChange={() =>
                        setQuizDraft((current) => ({
                          ...current,
                          lessonIds: current.lessonIds.includes(lesson.id)
                            ? current.lessonIds.filter((id) => id !== lesson.id)
                            : [...current.lessonIds, lesson.id],
                        }))
                      }
                    />
                    <span>{lesson.title}</span>
                  </label>
                ))}
              </fieldset>
              <label className="qz-check qz-wide-field">
                <input
                  type="checkbox"
                  checked={quizDraft.shuffleVersions}
                  onChange={(event) =>
                    setQuizDraft((current) => ({ ...current, shuffleVersions: event.target.checked }))
                  }
                />
                <span>السماح بتوزيع النماذج عشوائيًا لاحقًا</span>
              </label>
            </div>
            <div className="qz-form-actions">
              <button className="secondary-button" type="button" onClick={() => setCreateOpen(false)}>
                إلغاء
              </button>
              <button className="primary-button" type="submit" disabled={mutationState === "saving"}>
                حفظ كمسودة
              </button>
            </div>
          </form>
        </EditorPanel>
      ) : null}

      <div className="qz-workspace-grid">
        <section className="qz-list-panel" aria-label="قائمة الاختبارات">
          <div className="qz-section-heading">
            <div>
              <p className="section-kicker">النتائج الحالية</p>
              <h2>الاختبارات</h2>
            </div>
            <span className="count-pill">{pagination.total}</span>
          </div>

          {listState === "loading" ? <StatePanel title="جارٍ تحميل الاختبارات" body="نقرأ الحالة الحالية من الخادم." /> : null}
          {listState === "error" ? (
            <StatePanel
              title="تعذر تحميل الاختبارات"
              body={listError}
              action={
                <button className="secondary-button" type="button" onClick={() => void loadList()}>
                  إعادة المحاولة
                </button>
              }
            />
          ) : null}
          {listState === "ready" && items.length === 0 ? (
            <StatePanel title="لا توجد اختبارات مطابقة" body="غيّر الفلاتر أو أنشئ اختبارًا جديدًا." />
          ) : null}
          {listState === "ready" && items.length > 0 ? (
            <div className="qz-list">
              {items.map((item) => (
                <button
                  className={`qz-quiz-card${detail?.quiz.id === item.id ? " is-selected" : ""}`}
                  type="button"
                  key={item.id}
                  onClick={() => void loadDetail(item.id)}
                >
                  <div className="qz-card-topline">
                    <span className={`status-badge qb-status-${item.status}`}>{statusLabel(item.status)}</span>
                    <small>{localDate(item.updatedAt)}</small>
                  </div>
                  <strong>{item.title}</strong>
                  <span>{item.description || "بدون وصف"}</span>
                </button>
              ))}
            </div>
          ) : null}

          <nav className="qz-pagination" aria-label="صفحات الاختبارات">
            <button
              className="secondary-button small-button"
              type="button"
              disabled={!canPrevious || listState === "loading"}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              السابق
            </button>
            <span>
              {pagination.total === 0
                ? "0 من 0"
                : `${pagination.offset + 1}–${Math.min(pagination.offset + items.length, pagination.total)} من ${pagination.total}`}
            </span>
            <button
              className="secondary-button small-button"
              type="button"
              disabled={!canNext || listState === "loading"}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              التالي
            </button>
          </nav>
        </section>

        <aside className="qz-detail-panel" aria-label="تفاصيل الاختبار">
          {detailState === "idle" ? <StatePanel title="اختر اختبارًا" body="افتح اختبارًا لعرض النماذج وسجل القرارات." /> : null}
          {detailState === "loading" ? <StatePanel title="جارٍ تحميل الاختبار" body="نقرأ النماذج من الخادم." /> : null}
          {detailState === "error" ? <StatePanel title="تعذر تحميل الاختبار" body={detailError} /> : null}
          {detailState === "ready" && detail ? (
            <QuizDetail
              detail={detail}
              busy={mutationState === "saving"}
              rejectNote={rejectNote}
              setRejectNote={setRejectNote}
              onAddVersion={() => void openVersionEditor()}
              onEditVersion={(version) => void openVersionEditor(version)}
              onRemoveVersion={(versionId) => void deleteVersion(versionId)}
              onSubmit={() => void lifecycle("submit")}
              onPublish={() => void lifecycle("publish")}
              onReject={() => void lifecycle("reject")}
              onArchive={() => void lifecycle("archive")}
            />
          ) : null}
        </aside>
      </div>

      {versionEditor && detail ? (
        <EditorPanel
          title={versionEditor.mode === "add" ? "إضافة نموذج اختبار" : "تعديل أسئلة النموذج"}
          onClose={() => setVersionEditor(null)}
        >
          <form className="qz-editor-form" onSubmit={submitVersion}>
            <div className="qz-version-toolbar">
              <label>
                <span>اسم النموذج</span>
                <input
                  value={versionEditor.label}
                  onChange={(event) =>
                    setVersionEditor((current) => (current ? { ...current, label: event.target.value } : current))
                  }
                  disabled={versionEditor.mode === "replace"}
                  maxLength={200}
                  required
                />
              </label>
              <label className="qz-check">
                <input
                  type="checkbox"
                  checked={versionEditor.shuffleOptions}
                  onChange={(event) =>
                    setVersionEditor((current) =>
                      current ? { ...current, shuffleOptions: event.target.checked } : current,
                    )
                  }
                  disabled={versionEditor.mode === "replace"}
                />
                <span>خلط الخيارات</span>
              </label>
              <strong>{versionEditor.selected.length} سؤال محدد</strong>
            </div>

            <form className="qz-candidate-search" onSubmit={searchCandidates}>
              <label>
                <span>بحث في الأسئلة المنشورة</span>
                <input
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                  placeholder="ابحث في نص السؤال"
                />
              </label>
              <button className="secondary-button" type="submit" disabled={candidateState === "loading"}>
                بحث
              </button>
            </form>

            {candidateState === "loading" ? <StatePanel title="جارٍ تحميل الأسئلة" body="نقرأ فقط revisions المنشورة المطابقة للدروس." /> : null}
            {candidateState === "error" ? <StatePanel title="تعذر تحميل الأسئلة" body={candidateError} /> : null}
            {candidateState === "ready" && candidates.length === 0 ? (
              <StatePanel title="لا توجد أسئلة منشورة مطابقة" body="انشر أسئلة مناسبة في بنك الأسئلة أو غيّر البحث." />
            ) : null}
            {candidateState === "ready" && candidates.length > 0 ? (
              <div className="qz-candidate-list" aria-label="الأسئلة المنشورة المتاحة">
                {candidates.map((candidate) => {
                  const checked = versionEditor.selected.some(
                    (item) => item.questionBankRevisionId === candidate.revisionId,
                  );
                  return (
                    <label className={`qz-candidate-card${checked ? " is-selected" : ""}`} key={candidate.revisionId}>
                      <input type="checkbox" checked={checked} onChange={() => toggleCandidate(candidate)} />
                      <span className="qz-candidate-body">
                        <strong>{candidate.prompt}</strong>
                        <small>
                          {typeLabel(candidate.type)} · {difficultyLabel(candidate.difficulty)} · revision {candidate.revisionNumber}
                          {candidate.sourcePages.length > 0 ? ` · ص ${candidate.sourcePages.join("، ")}` : ""}
                        </small>
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : null}

            <nav className="qz-pagination" aria-label="صفحات الأسئلة المتاحة">
              <button
                className="secondary-button small-button"
                type="button"
                disabled={!candidateCanPrevious || candidateState === "loading"}
                onClick={() => void changeCandidatePage(Math.max(0, candidateOffset - CANDIDATE_PAGE_SIZE))}
              >
                السابق
              </button>
              <span>{candidatePagination.total} سؤال متاح</span>
              <button
                className="secondary-button small-button"
                type="button"
                disabled={!candidateCanNext || candidateState === "loading"}
                onClick={() => void changeCandidatePage(candidateOffset + CANDIDATE_PAGE_SIZE)}
              >
                التالي
              </button>
            </nav>

            <div className="qz-form-actions">
              <button className="secondary-button" type="button" onClick={() => setVersionEditor(null)}>
                إلغاء
              </button>
              <button className="primary-button" type="submit" disabled={mutationState === "saving"}>
                {versionEditor.mode === "add" ? "إنشاء النموذج" : "حفظ أسئلة النموذج"}
              </button>
            </div>
          </form>
        </EditorPanel>
      ) : null}
    </section>
  );
}

function QuizDetail({
  detail,
  busy,
  rejectNote,
  setRejectNote,
  onAddVersion,
  onEditVersion,
  onRemoveVersion,
  onSubmit,
  onPublish,
  onReject,
  onArchive,
}: {
  detail: QuizBuilderDetail;
  busy: boolean;
  rejectNote: string;
  setRejectNote: (value: string) => void;
  onAddVersion: () => void;
  onEditVersion: (version: QuizBuilderVersion) => void;
  onRemoveVersion: (versionId: string) => void;
  onSubmit: () => void;
  onPublish: () => void;
  onReject: () => void;
  onArchive: () => void;
}) {
  const { quiz } = detail;
  return (
    <div className="qz-detail" data-testid="quiz-builder-detail">
      <div className="qz-detail-heading">
        <div>
          <p className="section-kicker">الاختبار المحدد</p>
          <h2>{quiz.title}</h2>
        </div>
        <span className={`status-badge qb-status-${quiz.status}`} data-testid="quiz-status">
          {statusLabel(quiz.status)}
        </span>
      </div>
      <p className="qz-description">{quiz.description || "بدون وصف"}</p>
      <dl className="qz-facts">
        <div>
          <dt>الدروس</dt>
          <dd>{detail.lessons.length}</dd>
        </div>
        <div>
          <dt>النماذج</dt>
          <dd>{detail.versions.length}</dd>
        </div>
        <div>
          <dt>النشر</dt>
          <dd>{localDate(quiz.publishedAt)}</dd>
        </div>
      </dl>
      <div className="qz-lesson-tags">
        {detail.lessons.map((lesson) => (
          <span key={lesson.id}>{lesson.title}</span>
        ))}
      </div>

      <div className="qz-lifecycle-actions">
        {quiz.status === "draft" ? (
          <>
            <button className="secondary-button" type="button" onClick={onAddVersion} disabled={busy}>
              إضافة نموذج
            </button>
            <button className="primary-button" type="button" onClick={onSubmit} disabled={busy}>
              إرسال للمراجعة
            </button>
          </>
        ) : null}
        {quiz.status === "review" ? (
          <>
            <label className="qz-reject-field">
              <span>سبب الإرجاع للمسودة</span>
              <textarea value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} rows={2} />
            </label>
            <button className="secondary-button" type="button" onClick={onReject} disabled={busy}>
              إعادة للمسودة
            </button>
            <button className="primary-button" type="button" onClick={onPublish} disabled={busy}>
              نشر الاختبار
            </button>
          </>
        ) : null}
        {quiz.status === "published" ? (
          <button className="secondary-button" type="button" onClick={onArchive} disabled={busy}>
            أرشفة
          </button>
        ) : null}
      </div>

      <section className="qz-versions" aria-label="نماذج الاختبار">
        <div className="qz-section-heading">
          <h3>النماذج</h3>
          {quiz.status === "published" ? <small>snapshots ثابتة بعد النشر</small> : null}
        </div>
        {detail.versions.length === 0 ? <StatePanel title="لا توجد نماذج" body="أضف نموذجًا واحدًا على الأقل قبل المراجعة." /> : null}
        {detail.versions.map((version) => (
          <article className="qz-version-card" key={version.id}>
            <div className="qz-version-heading">
              <div>
                <strong>{version.label}</strong>
                <small>النموذج {version.versionNumber} · {version.questions.length} سؤال</small>
              </div>
              {quiz.status === "draft" ? (
                <div className="qz-version-actions">
                  <button className="secondary-button small-button" type="button" onClick={() => onEditVersion(version)} disabled={busy}>
                    تعديل الأسئلة
                  </button>
                  <button className="danger-button small-button" type="button" onClick={() => onRemoveVersion(version.id)} disabled={busy}>
                    حذف
                  </button>
                </div>
              ) : null}
            </div>
            <ol className="qz-version-questions">
              {version.questions.map((question) => (
                <li key={question.id}>
                  <strong>{question.prompt}</strong>
                  <small>
                    {question.type === "multiple_choice" ? "اختيار متعدد" : question.type === "true_false" ? "صح / خطأ" : "مباشر"}
                    {question.sourcePage ? ` · ص ${question.sourcePage}` : ""}
                  </small>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>

      <details className="qz-audit">
        <summary>سجل القرارات ({detail.events.length})</summary>
        <div className="qz-timeline">
          {detail.events.map((event) => (
            <article key={event.id}>
              <strong>{event.action}</strong>
              <small>{localDate(event.createdAt)}</small>
              {event.note ? <p>{event.note}</p> : null}
            </article>
          ))}
        </div>
      </details>
    </div>
  );
}

function EditorPanel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <section className="qz-editor-panel">
      <div className="qz-editor-heading">
        <h2>{title}</h2>
        <button className="secondary-button small-button" type="button" onClick={onClose}>
          إغلاق
        </button>
      </div>
      {children}
    </section>
  );
}

function StatePanel({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="empty-state" role="status">
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}
