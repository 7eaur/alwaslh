import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import {
  type QuizBuilderDetail,
  type QuizBuilderStatus,
  type QuizBuilderVersion,
  type QuizQuestionCandidate,
  type QuizVersionQuestionRef,
  addQuizVersion,
  archiveQuiz,
  fetchQuiz,
  fetchQuizCandidates,
  fetchQuizVersionExport,
  publishQuiz,
  rejectQuizReview,
  removeQuizVersion,
  replaceQuizVersionQuestions,
  submitQuizForReview,
} from "../../quiz-builder-api";
import "../../quiz-builder.css";

interface Props {
  onSessionExpired: () => void;
}

interface VersionEditorState {
  mode: "add" | "replace";
  versionId: string | null;
  label: string;
  shuffleOptions: boolean;
  selected: QuizVersionQuestionRef[];
}

const CANDIDATE_PAGE_SIZE = 50;

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

export function QuizBuilderDetailPage({ onSessionExpired }: Props) {
  const { quizId } = useParams<{ quizId: string }>();
  const [detail, setDetail] = useState<QuizBuilderDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [mutationState, setMutationState] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [versionEditor, setVersionEditor] = useState<VersionEditorState | null>(null);
  const [candidates, setCandidates] = useState<QuizQuestionCandidate[]>([]);
  const [candidatePagination, setCandidatePagination] = useState({
    total: 0,
    limit: CANDIDATE_PAGE_SIZE,
    offset: 0,
  });
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateOffset, setCandidateOffset] = useState(0);
  const [candidateState, setCandidateState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [candidateError, setCandidateError] = useState("");

  const loadDetail = useCallback(async () => {
    if (!quizId) {
      setError("معرّف الاختبار غير موجود في الرابط.");
      setState("error");
      return;
    }

    setState("loading");
    setError("");
    try {
      setDetail(await fetchQuiz(quizId));
      setState("ready");
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setError(messageFor(cause));
      setState("error");
    }
  }, [onSessionExpired, quizId]);

  const loadCandidates = useCallback(
    async (search: string, offset: number) => {
      if (!quizId) return;
      setCandidateState("loading");
      setCandidateError("");
      try {
        const result = await fetchQuizCandidates(quizId, {
          ...(search.trim() ? { search: search.trim() } : {}),
          limit: CANDIDATE_PAGE_SIZE,
          offset,
        });
        setCandidates(result.items);
        setCandidatePagination(result.pagination);
        setCandidateState("ready");
      } catch (cause) {
        if (isMissingSessionError(cause)) {
          onSessionExpired();
          return;
        }
        setCandidateError(messageFor(cause));
        setCandidateState("error");
      }
    },
    [onSessionExpired, quizId],
  );

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  async function lifecycle(action: "submit" | "publish" | "reject" | "archive") {
    if (!quizId || !detail) return;
    if (action === "reject" && !rejectNote.trim()) {
      setFeedback({ kind: "error", text: "اكتب سبب إعادة الاختبار من المراجعة إلى المسودة." });
      return;
    }

    setMutationState("saving");
    setFeedback(null);
    try {
      if (action === "submit") await submitQuizForReview(quizId);
      else if (action === "publish") await publishQuiz(quizId);
      else if (action === "reject") await rejectQuizReview(quizId, rejectNote);
      else await archiveQuiz(quizId);

      setRejectNote("");
      setVersionEditor(null);
      setFeedback({
        kind: "success",
        text:
          action === "submit"
            ? "أُرسل الاختبار للمراجعة."
            : action === "publish"
              ? "تم نشر الاختبار. أصبحت النماذج snapshots ثابتة وغير قابلة للتعديل."
              : action === "reject"
                ? "أُعيد الاختبار إلى المسودة مع حفظ سبب القرار."
                : "تمت أرشفة الاختبار.",
      });
      await loadDetail();
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function exportVersion(versionId: string, format: "csv" | "print") {
    if (!quizId) return;
    const printWindow = format === "print" ? window.open("", "_blank") : null;
    setMutationState("saving");
    setFeedback(null);
    try {
      const bundle = await fetchQuizVersionExport(quizId, versionId);
      if (format === "csv") {
        const blob = new Blob([bundle.csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${bundle.filenameBase}.csv`;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setFeedback({ kind: "success", text: "تم تجهيز ملف Excel CSV من النموذج المحدد." });
      } else {
        if (!printWindow) throw new Error("print window unavailable");
        printWindow.document.open();
        printWindow.document.write(bundle.printHtml);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setFeedback({ kind: "success", text: "فُتحت نسخة الطباعة؛ يمكن طباعتها أو حفظها PDF." });
      }
    } catch (cause) {
      printWindow?.close();
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
    await loadCandidates("", 0);
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
    if (!quizId || !detail || !versionEditor || detail.quiz.status !== "draft") return;
    setFeedback(null);
    if (!versionEditor.label.trim() || versionEditor.selected.length === 0) {
      setFeedback({ kind: "error", text: "اكتب اسم النموذج واختر سؤالًا منشورًا واحدًا على الأقل." });
      return;
    }

    setMutationState("saving");
    try {
      if (versionEditor.mode === "add") {
        await addQuizVersion(quizId, {
          label: versionEditor.label.trim(),
          shuffleOptions: versionEditor.shuffleOptions,
          questions: versionEditor.selected,
        });
        setFeedback({ kind: "success", text: "تم إنشاء نموذج الاختبار من revisions منشورة وثابتة." });
      } else if (versionEditor.versionId) {
        await replaceQuizVersionQuestions(quizId, versionEditor.versionId, versionEditor.selected);
        setFeedback({ kind: "success", text: "تم تحديث أسئلة النموذج وهو ما يزال مسودة." });
      }
      setVersionEditor(null);
      await loadDetail();
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function deleteVersion(versionId: string) {
    if (!quizId || !detail || detail.quiz.status !== "draft") return;
    setMutationState("saving");
    setFeedback(null);
    try {
      await removeQuizVersion(quizId, versionId);
      setVersionEditor((current) => (current?.versionId === versionId ? null : current));
      setFeedback({ kind: "success", text: "تم حذف النموذج من المسودة." });
      await loadDetail();
    } catch (cause) {
      if (isMissingSessionError(cause)) onSessionExpired();
      else setFeedback({ kind: "error", text: messageFor(cause) });
    } finally {
      setMutationState("idle");
    }
  }

  async function searchCandidates() {
    setCandidateOffset(0);
    await loadCandidates(candidateSearch, 0);
  }

  async function changeCandidatePage(nextOffset: number) {
    setCandidateOffset(nextOffset);
    await loadCandidates(candidateSearch, nextOffset);
  }

  if (state === "loading") {
    return <StatePanel title="جارٍ تحميل الاختبار" body="نقرأ تفاصيل الاختبار ونماذجه من الخادم." />;
  }

  if (state === "error" || !detail) {
    return (
      <StatePanel
        title="تعذر فتح الاختبار"
        body={error || "لا توجد بيانات متاحة لهذا الاختبار."}
        action={
          <div className="qz-header-actions">
            <button className="secondary-button" type="button" onClick={() => void loadDetail()}>
              إعادة المحاولة
            </button>
            <Link className="secondary-button" to="/app/quizzes">
              العودة إلى الاختبارات
            </Link>
          </div>
        }
      />
    );
  }

  const { quiz, lessons, versions, events } = detail;
  const busy = mutationState === "saving";
  const candidateCanPrevious = candidateOffset > 0;
  const candidateCanNext = candidateOffset + candidates.length < candidatePagination.total;

  return (
    <section className="quiz-builder" aria-labelledby="quiz-builder-detail-title">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">الاختبارات</p>
          <h1 id="quiz-builder-detail-title">{quiz.title}</h1>
          <p>{quiz.description || "لا يوجد وصف مضاف لهذا الاختبار."}</p>
        </div>
        <div className="qz-header-actions">
          <span className={`status-badge qb-status-${quiz.status}`} data-testid="quiz-status">
            {statusLabel(quiz.status)}
          </span>
          <button className="secondary-button" type="button" onClick={() => void loadDetail()} disabled={busy}>
            تحديث
          </button>
          <Link className="secondary-button" to="/app/quizzes">
            العودة إلى القائمة
          </Link>
          {quiz.status === "draft" ? (
            <button className="primary-button" type="button" onClick={() => void openVersionEditor()} disabled={busy}>
              إضافة نموذج
            </button>
          ) : null}
        </div>
      </header>

      {feedback ? (
        <div className={`mutation-feedback is-${feedback.kind}`} role="status">
          {feedback.text}
        </div>
      ) : null}

      <section className="qz-list-panel" aria-label="ملخص الاختبار">
        <div className="qz-card-topline">
          <span>آخر تحديث: {localDate(quiz.updatedAt)}</span>
          <span>النشر: {localDate(quiz.publishedAt)}</span>
        </div>
        <p>
          يتكوّن الاختبار من {versions.length} نموذج، ويرتبط بـ {lessons.length} درس. سلطة دورة النشر وتجميد النماذج
          تبقى في الخادم.
        </p>

        <div className="qz-lifecycle-actions" aria-label="دورة حياة الاختبار">
          {quiz.status === "draft" ? (
            <button className="primary-button" type="button" onClick={() => void lifecycle("submit")} disabled={busy}>
              إرسال للمراجعة
            </button>
          ) : null}
          {quiz.status === "review" ? (
            <>
              <label className="qz-reject-field">
                <span>سبب الإرجاع للمسودة</span>
                <textarea value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} rows={2} disabled={busy} />
              </label>
              <button className="secondary-button" type="button" onClick={() => void lifecycle("reject")} disabled={busy}>
                إعادة للمسودة
              </button>
              <button className="primary-button" type="button" onClick={() => void lifecycle("publish")} disabled={busy}>
                نشر الاختبار
              </button>
            </>
          ) : null}
          {quiz.status === "published" ? (
            <button className="secondary-button" type="button" onClick={() => void lifecycle("archive")} disabled={busy}>
              أرشفة
            </button>
          ) : null}
        </div>
      </section>

      {versionEditor && quiz.status === "draft" ? (
        <section className="qz-list-panel" aria-labelledby="quiz-version-editor-title">
          <div className="workspace-header">
            <div>
              <p className="eyebrow">تركيب النموذج</p>
              <h2 id="quiz-version-editor-title">
                {versionEditor.mode === "add" ? "إضافة نموذج اختبار" : "تعديل أسئلة النموذج"}
              </h2>
            </div>
            <button className="secondary-button" type="button" onClick={() => setVersionEditor(null)} disabled={busy}>
              إغلاق
            </button>
          </div>

          <form className="qz-editor-form" onSubmit={submitVersion}>
            <div className="qz-version-toolbar">
              <label>
                <span>اسم النموذج</span>
                <input
                  value={versionEditor.label}
                  onChange={(event) =>
                    setVersionEditor((current) => (current ? { ...current, label: event.target.value } : current))
                  }
                  disabled={versionEditor.mode === "replace" || busy}
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
                  disabled={versionEditor.mode === "replace" || busy}
                />
                <span>خلط الخيارات</span>
              </label>
              <strong>{versionEditor.selected.length} سؤال محدد</strong>
            </div>

            <div className="qz-candidate-search">
              <label>
                <span>بحث في الأسئلة المنشورة</span>
                <input
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                  placeholder="ابحث في نص السؤال"
                  disabled={busy}
                />
              </label>
              <button
                className="secondary-button"
                type="button"
                disabled={candidateState === "loading" || busy}
                onClick={() => void searchCandidates()}
              >
                بحث
              </button>
            </div>

            {candidateState === "loading" ? <p role="status">جارٍ تحميل الأسئلة المنشورة المطابقة للدروس…</p> : null}
            {candidateState === "error" ? <p role="alert">{candidateError}</p> : null}
            {candidateState === "ready" && candidates.length === 0 ? (
              <p>لا توجد أسئلة منشورة مطابقة. انشر أسئلة مناسبة في بنك الأسئلة أو غيّر البحث.</p>
            ) : null}
            {candidateState === "ready" && candidates.length > 0 ? (
              <div className="qz-candidate-list" aria-label="الأسئلة المنشورة المتاحة">
                {candidates.map((candidate) => {
                  const checked = versionEditor.selected.some(
                    (item) => item.questionBankRevisionId === candidate.revisionId,
                  );
                  return (
                    <label className={`qz-candidate-card${checked ? " is-selected" : ""}`} key={candidate.revisionId}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCandidate(candidate)}
                        disabled={busy}
                      />
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
                disabled={!candidateCanPrevious || candidateState === "loading" || busy}
                onClick={() => void changeCandidatePage(Math.max(0, candidateOffset - CANDIDATE_PAGE_SIZE))}
              >
                السابق
              </button>
              <span>{candidatePagination.total} سؤال متاح</span>
              <button
                className="secondary-button small-button"
                type="button"
                disabled={!candidateCanNext || candidateState === "loading" || busy}
                onClick={() => void changeCandidatePage(candidateOffset + CANDIDATE_PAGE_SIZE)}
              >
                التالي
              </button>
            </nav>

            <div className="qz-form-actions">
              <button className="secondary-button" type="button" onClick={() => setVersionEditor(null)} disabled={busy}>
                إلغاء
              </button>
              <button className="primary-button" type="submit" disabled={busy || candidateState === "loading"}>
                {versionEditor.mode === "add" ? "إنشاء النموذج" : "حفظ أسئلة النموذج"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="qz-list-panel" aria-labelledby="quiz-lessons-title">
        <div className="workspace-header">
          <div>
            <p className="eyebrow">النطاق التعليمي</p>
            <h2 id="quiz-lessons-title">الدروس المرتبطة</h2>
          </div>
        </div>
        {lessons.length === 0 ? (
          <p>لا توجد دروس مرتبطة.</p>
        ) : (
          <div className="qz-list">
            {lessons.map((lesson) => (
              <article className="qz-quiz-card" key={lesson.id}>
                <strong>{lesson.title}</strong>
                <span>الترتيب: {lesson.position}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="qz-list-panel" aria-labelledby="quiz-versions-title">
        <div className="workspace-header">
          <div>
            <p className="eyebrow">النماذج</p>
            <h2 id="quiz-versions-title">نسخ الاختبار</h2>
          </div>
          {quiz.status === "published" ? <small>snapshots ثابتة بعد النشر</small> : null}
        </div>
        {versions.length === 0 ? (
          <p>لم يُضف نموذج للاختبار بعد.</p>
        ) : (
          <div className="qz-list">
            {versions.map((version) => (
              <article className="qz-version-card" key={version.id}>
                <div className="qz-version-heading">
                  <div>
                    <strong>{version.label}</strong>
                    <small>
                      النموذج {version.versionNumber} · {version.questions.length} سؤال
                    </small>
                  </div>
                  {quiz.status === "draft" ? (
                    <div className="qz-version-actions" aria-label={`إدارة ${version.label}`}>
                      <button
                        className="secondary-button small-button"
                        type="button"
                        onClick={() => void openVersionEditor(version)}
                        disabled={busy}
                      >
                        تعديل الأسئلة
                      </button>
                      <button
                        className="secondary-button small-button"
                        type="button"
                        onClick={() => void deleteVersion(version.id)}
                        disabled={busy}
                      >
                        حذف النموذج
                      </button>
                    </div>
                  ) : (
                    <div className="qz-version-actions" aria-label={`تصدير ${version.label}`}>
                      <button
                        className="secondary-button small-button"
                        type="button"
                        onClick={() => void exportVersion(version.id, "csv")}
                        disabled={busy}
                      >
                        Excel CSV
                      </button>
                      <button
                        className="secondary-button small-button"
                        type="button"
                        onClick={() => void exportVersion(version.id, "print")}
                        disabled={busy}
                      >
                        طباعة / PDF
                      </button>
                    </div>
                  )}
                </div>
                <span>{version.shuffleOptions ? "ترتيب الخيارات عشوائي" : "ترتيب الخيارات ثابت"}</span>
                <ol className="qz-version-questions">
                  {version.questions.map((question) => (
                    <li key={question.id}>
                      <strong>{question.prompt}</strong>
                      <small>
                        {question.type === "multiple_choice"
                          ? "اختيار متعدد"
                          : question.type === "true_false"
                            ? "صح / خطأ"
                            : "مباشر"}
                        {question.sourcePage ? ` · ص ${question.sourcePage}` : ""}
                      </small>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="qz-list-panel" aria-labelledby="quiz-events-title">
        <div className="workspace-header">
          <div>
            <p className="eyebrow">السجل</p>
            <h2 id="quiz-events-title">آخر أحداث دورة الاختبار</h2>
          </div>
        </div>
        {events.length === 0 ? (
          <p>لا توجد أحداث مسجلة بعد.</p>
        ) : (
          <div className="qz-list">
            {events.map((event) => (
              <article className="qz-quiz-card" key={event.id}>
                <div className="qz-card-topline">
                  <strong>{event.action}</strong>
                  <small>{localDate(event.createdAt)}</small>
                </div>
                <span>{event.note || "بدون ملاحظة"}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function StatePanel({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <section className="quiz-builder">
      <div className="qz-list-panel" role="status">
        <strong>{title}</strong>
        <p>{body}</p>
        {action}
      </div>
    </section>
  );
}
