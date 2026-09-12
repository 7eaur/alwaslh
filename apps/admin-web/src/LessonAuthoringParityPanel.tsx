import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiRequestError,
  fetchAdminCurriculum,
  isMissingSessionError,
  type CurriculumLesson,
} from "./admin-api";
import {
  exportLessonAuthoring,
  type LessonHistorySource,
  updateLessonSummary,
} from "./lesson-authoring-parity-api";
import "./stage13g-parity.css";

function message(error: unknown): string {
  return error instanceof ApiRequestError ? error.message : "تعذر إكمال العملية. حاول مرة أخرى.";
}

function downloadText(filename: string, value: string, type: string): void {
  const blob = new Blob([value], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function asIso(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function LessonAuthoringParityPanel({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [lessons, setLessons] = useState<CurriculumLesson[]>([]);
  const [lessonId, setLessonId] = useState("");
  const [summary, setSummary] = useState("");
  const [historySource, setHistorySource] = useState<LessonHistorySource>("all");
  const [eventType, setEventType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "saving" | "exporting" | "error">("loading");
  const [notice, setNotice] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const selected = useMemo(() => lessons.find((lesson) => lesson.id === lessonId) ?? null, [lessons, lessonId]);

  const load = useCallback(async () => {
    setState("loading");
    setNotice("");
    try {
      const curriculum = await fetchAdminCurriculum();
      setLessons(curriculum.lessons);
      setLessonId((current) =>
        current && curriculum.lessons.some((lesson) => lesson.id === current)
          ? current
          : (curriculum.lessons[0]?.id ?? ""),
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
    void load();
  }, [load]);

  useEffect(() => {
    setSummary(selected?.summary ?? "");
    setConfirmClear(false);
  }, [selected?.id, selected?.summary]);

  async function saveSummary(value: string | null) {
    if (!selected) return;
    setState("saving");
    setNotice("");
    try {
      await updateLessonSummary(selected.id, value);
      await load();
      setNotice(value === null ? "تم مسح الملخص وتحديث نسخة المحتوى." : "تم حفظ الملخص وتحديث نسخة المحتوى عند وجود تغيير فعلي.");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setNotice(message(error));
      setState("ready");
    }
  }

  async function exportBundle(kind: "content" | "history" | "print") {
    if (!selected) return;
    setState("exporting");
    setNotice("");
    try {
      const bundle = await exportLessonAuthoring({
        lessonIds: [selected.id],
        historySource,
        ...(eventType.trim() ? { eventType: eventType.trim() } : {}),
        ...(asIso(from) ? { from: asIso(from) } : {}),
        ...(asIso(to) ? { to: asIso(to) } : {}),
      });
      if (kind === "content") {
        downloadText(`${bundle.filenameBase}-content.csv`, bundle.contentCsv, "text/csv;charset=utf-8");
      } else if (kind === "history") {
        downloadText(`${bundle.filenameBase}-history.csv`, bundle.historyCsv, "text/csv;charset=utf-8");
      } else {
        downloadText(`${bundle.filenameBase}-print.html`, bundle.printHtml, "text/html;charset=utf-8");
      }
      setNotice(`جاهز: ${bundle.counts.lessons} درس، ${bundle.counts.questions} سؤال، ${bundle.counts.historyEvents} حدث سجل.`);
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

  const busy = state === "loading" || state === "saving" || state === "exporting";

  return (
    <section className="parity-panel" aria-labelledby="lesson-content-tools-title">
      <div className="parity-panel-heading">
        <div>
          <p className="parity-eyebrow">أدوات الدرس</p>
          <h2 id="lesson-content-tools-title">ملخص الدرس والتصدير</h2>
          <p>حرّر ملخص الدرس أو صدّر محتواه وسجل التغييرات من سياق المحتوى نفسه.</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => void load()} disabled={busy}>
          تحديث
        </button>
      </div>

      {state === "error" ? (
        <div className="parity-state" role="alert">{notice}</div>
      ) : lessons.length === 0 && !busy ? (
        <div className="parity-state">لا توجد دروس متاحة بعد.</div>
      ) : (
        <>
          <div className="parity-grid">
            <label>
              <span>الدرس</span>
              <select value={lessonId} onChange={(event) => setLessonId(event.target.value)} disabled={busy}>
                {lessons.map((lesson) => (
                  <option value={lesson.id} key={lesson.id}>{lesson.title}</option>
                ))}
              </select>
            </label>
            <div className="parity-metric" aria-live="polite">
              <span>نسخة المحتوى</span>
              <strong>{selected?.contentRevision ?? "—"}</strong>
            </div>
          </div>

          <label className="parity-field-full">
            <span>ملخص الدرس</span>
            <textarea
              value={summary}
              maxLength={4000}
              rows={6}
              onChange={(event) => setSummary(event.target.value)}
              disabled={!selected || busy}
              placeholder="اكتب الملخص المحرر هنا…"
            />
          </label>
          <div className="parity-actions">
            <button
              type="button"
              className="primary-button"
              disabled={!selected || busy || !summary.trim()}
              onClick={() => void saveSummary(summary.trim())}
            >
              حفظ الملخص
            </button>
            {!confirmClear ? (
              <button
                type="button"
                className="secondary-button"
                disabled={!selected?.summary || busy}
                onClick={() => setConfirmClear(true)}
              >
                مسح الملخص
              </button>
            ) : (
              <>
                <button type="button" className="danger-button" disabled={busy} onClick={() => void saveSummary(null)}>
                  تأكيد المسح
                </button>
                <button type="button" className="secondary-button" disabled={busy} onClick={() => setConfirmClear(false)}>
                  إلغاء
                </button>
              </>
            )}
          </div>

          <div className="parity-divider" />
          <h3>تصدير المحتوى والسجل</h3>
          <details>
            <summary>خيارات سجل متقدمة</summary>
            <div className="parity-grid parity-grid-4">
              <label>
                <span>مصدر السجل</span>
                <select value={historySource} onChange={(event) => setHistorySource(event.target.value as LessonHistorySource)} disabled={busy}>
                  <option value="all">الكل</option>
                  <option value="curriculum">المنهج</option>
                  <option value="question_bank">بنك الأسئلة</option>
                  <option value="ai">الذكاء الاصطناعي</option>
                </select>
              </label>
              <label>
                <span>نوع الحدث الداخلي</span>
                <input value={eventType} maxLength={80} onChange={(event) => setEventType(event.target.value)} disabled={busy} />
              </label>
              <label>
                <span>من</span>
                <input type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} disabled={busy} />
              </label>
              <label>
                <span>إلى</span>
                <input type="datetime-local" value={to} onChange={(event) => setTo(event.target.value)} disabled={busy} />
              </label>
            </div>
          </details>
          <div className="parity-actions">
            <button type="button" className="secondary-button" disabled={!selected || busy} onClick={() => void exportBundle("content")}>
              تنزيل المحتوى CSV
            </button>
            <button type="button" className="secondary-button" disabled={!selected || busy} onClick={() => void exportBundle("history")}>
              تنزيل السجل CSV
            </button>
            <button type="button" className="secondary-button" disabled={!selected || busy} onClick={() => void exportBundle("print")}>
              قالب طباعة / PDF
            </button>
          </div>
        </>
      )}
      {notice && state !== "error" ? <p className="parity-notice" aria-live="polite">{notice}</p> : null}
    </section>
  );
}
