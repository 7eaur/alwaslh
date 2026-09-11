import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "./admin-api";
import {
  fetchQuiz,
  fetchQuizzes,
  type QuizBuilderListItem,
  updateQuiz,
} from "./quiz-builder-api";
import "./stage13g-parity.css";

function message(error: unknown): string {
  return error instanceof ApiRequestError ? error.message : "تعذر إكمال العملية. حاول مرة أخرى.";
}

export function QuizMetadataPanel({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [quizzes, setQuizzes] = useState<QuizBuilderListItem[]>([]);
  const [quizId, setQuizId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shuffleVersions, setShuffleVersions] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [notice, setNotice] = useState("");

  const selected = useMemo(() => quizzes.find((quiz) => quiz.id === quizId) ?? null, [quizzes, quizId]);

  const loadList = useCallback(async () => {
    setState("loading");
    setNotice("");
    try {
      const result = await fetchQuizzes({ limit: 100, offset: 0 });
      setQuizzes(result.items);
      setQuizId((current) =>
        current && result.items.some((quiz) => quiz.id === current) ? current : (result.items[0]?.id ?? ""),
      );
      setState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setNotice(message(error));
      setState("error");
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selected) {
      setTitle("");
      setDescription("");
      setShuffleVersions(false);
      return;
    }
    setTitle(selected.title);
    setDescription(selected.description ?? "");
    setShuffleVersions(selected.shuffleVersions);
  }, [selected?.id, selected?.title, selected?.description, selected?.shuffleVersions]);

  async function save() {
    if (!selected || selected.status !== "draft" || !title.trim()) return;
    setState("saving");
    setNotice("");
    try {
      await updateQuiz(selected.id, {
        title: title.trim(),
        description: description.trim() || null,
        shuffleVersions,
      });
      const detail = await fetchQuiz(selected.id);
      setQuizzes((current) => current.map((quiz) => (quiz.id === selected.id ? detail.quiz : quiz)));
      setNotice("تم تحديث بيانات الاختبار دون تغيير النماذج أو دورة المراجعة.");
      setState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setNotice(message(error));
      setState("ready");
    }
  }

  const busy = state === "loading" || state === "saving";
  const editable = selected?.status === "draft";

  return (
    <section className="parity-panel" aria-labelledby="quiz-metadata-title">
      <div className="parity-panel-heading">
        <div>
          <p className="parity-eyebrow">Quiz parity</p>
          <h2 id="quiz-metadata-title">بيانات الاختبار</h2>
          <p>تحرير العنوان والوصف وسياسة ترتيب النماذج للاختبارات المسودة فقط، مع الحفاظ على lifecycle الحالي.</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => void loadList()} disabled={busy}>
          تحديث
        </button>
      </div>

      {state === "error" ? (
        <div className="parity-state" role="alert">{notice}</div>
      ) : quizzes.length === 0 && !busy ? (
        <div className="parity-state">لا توجد اختبارات بعد.</div>
      ) : (
        <>
          <div className="parity-grid">
            <label>
              <span>الاختبار</span>
              <select value={quizId} onChange={(event) => setQuizId(event.target.value)} disabled={busy}>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>{quiz.title} — {quiz.status}</option>
                ))}
              </select>
            </label>
            <div className="parity-metric">
              <span>الحالة</span>
              <strong>{selected?.status ?? "—"}</strong>
            </div>
          </div>

          <div className="parity-grid">
            <label>
              <span>العنوان</span>
              <input value={title} maxLength={180} onChange={(event) => setTitle(event.target.value)} disabled={!editable || busy} />
            </label>
            <label>
              <span>الوصف</span>
              <input value={description} maxLength={1000} onChange={(event) => setDescription(event.target.value)} disabled={!editable || busy} />
            </label>
          </div>
          <label className="parity-check">
            <input
              type="checkbox"
              checked={shuffleVersions}
              onChange={(event) => setShuffleVersions(event.target.checked)}
              disabled={!editable || busy}
            />
            <span>السماح بترتيب/توزيع النماذج وفق إعداد الاختبار</span>
          </label>
          {!editable && selected ? (
            <p className="parity-hint">التعديل متاح في حالة المسودة فقط. أعد الاختبار للمسودة عبر lifecycle المعتمد قبل تغيير بياناته.</p>
          ) : null}
          <div className="parity-actions">
            <button type="button" className="primary-button" disabled={!editable || busy || !title.trim()} onClick={() => void save()}>
              حفظ بيانات الاختبار
            </button>
          </div>
        </>
      )}
      {notice && state !== "error" ? <p className="parity-notice" aria-live="polite">{notice}</p> : null}
    </section>
  );
}
