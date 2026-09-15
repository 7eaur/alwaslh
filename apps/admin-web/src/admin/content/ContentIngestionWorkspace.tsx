import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
} from "../../features/curriculum/public";
import { ApiRequestError, isMissingSessionError } from "../../shared/api/client";
import {
  archiveContentIngestionTask,
  createContentIngestionTask,
  type ContentIngestionItemStatus,
  type ContentIngestionTaskDetail,
  type ContentIngestionTaskStatus,
  fetchContentIngestionHistory,
  fetchContentIngestionTask,
  linkContentIngestionTask,
  processContentIngestionTask,
  uploadContentIngestionItem,
} from "../../features/content/public";
import { LessonPublicationPanel } from "./LessonPublicationPanel";

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
const MAX_PDF_BYTES = 100 * 1024 * 1024;

type BusyAction = "idle" | "uploading" | "processing" | "linking" | "archiving";

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة، وإذا استمر الخطأ راجع سجل التشغيل.";
}

function taskStatusLabel(status: ContentIngestionTaskStatus): string {
  switch (status) {
    case "uploading":
      return "بانتظار اكتمال الرفع";
    case "ready":
      return "جاهز للمعالجة";
    case "processing":
      return "قيد المعالجة";
    case "completed":
      return "اكتملت المعالجة";
    case "failed":
      return "تحتاج إعادة محاولة";
  }
}

function itemStatusLabel(status: ContentIngestionItemStatus): string {
  switch (status) {
    case "pending_upload":
      return "بانتظار الرفع";
    case "uploaded":
      return "مرفوع";
    case "processing":
      return "قيد المعالجة";
    case "processed":
      return "تمت المعالجة";
    case "failed":
      return "فشل";
  }
}

function fileValidationMessage(file: File): string | null {
  if (!SUPPORTED_TYPES.has(file.type)) {
    return "نوع الملف غير مدعوم. استخدم JPG أو PNG أو WebP أو PDF.";
  }
  const maxBytes = file.type === "application/pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return file.type === "application/pdf"
      ? "حجم PDF يتجاوز الحد المسموح (100MB)."
      : "حجم الصورة يتجاوز الحد المسموح (50MB).";
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ar-YE", { dateStyle: "medium", timeStyle: "short" });
}

function firstLessonId(snapshot: AdminCurriculumSnapshot | null): string {
  return snapshot?.subjects[0]?.units[0]?.lessons[0]?.id ?? "";
}

export function ContentIngestionWorkspace() {
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof fetchContentIngestionHistory>>>(null);
  const [task, setTask] = useState<ContentIngestionTaskDetail | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lessonId, setLessonId] = useState("");
  const [busyAction, setBusyAction] = useState<BusyAction>("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionMissing, setSessionMissing] = useState(false);

  const refreshHistory = useCallback(async () => {
    const nextHistory = await fetchContentIngestionHistory({ limit: 40 });
    setHistory(nextHistory);
    return nextHistory;
  }, []);

  const loadTask = useCallback(async (taskId: string) => {
    const detail = await fetchContentIngestionTask(taskId);
    setTask(detail);
    setSelectedTaskId(detail.task.id);
    setLessonId(detail.task.lessonId ?? "");
    return detail;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchAdminCurriculum(), fetchContentIngestionHistory({ limit: 40 })])
      .then(([nextCurriculum, nextHistory]) => {
        if (cancelled) return;
        setCurriculum(nextCurriculum);
        setHistory(nextHistory);
        const initialTaskId = nextHistory.tasks[0]?.id;
        if (initialTaskId) {
          void loadTask(initialTaskId).catch((caught) => {
            if (cancelled) return;
            setError(errorMessage(caught));
          });
        }
      })
      .catch((caught) => {
        if (cancelled) return;
        setSessionMissing(isMissingSessionError(caught));
        setError(errorMessage(caught));
      });
    return () => {
      cancelled = true;
    };
  }, [loadTask]);

  useEffect(() => {
    if (!lessonId) {
      const fallback = firstLessonId(curriculum);
      if (fallback) setLessonId(fallback);
    }
  }, [curriculum, lessonId]);

  const selectedTaskSummary = useMemo(
    () => history?.tasks.find((candidate) => candidate.id === selectedTaskId) ?? null,
    [history, selectedTaskId],
  );

  const runAction = useCallback(async (action: BusyAction, work: () => Promise<unknown>, successMessage: string) => {
    setBusyAction(action);
    setError(null);
    setNotice(null);
    try {
      await work();
      setNotice(successMessage);
      await refreshHistory();
      if (selectedTaskId) await loadTask(selectedTaskId);
    } catch (caught) {
      setSessionMissing(isMissingSessionError(caught));
      setError(errorMessage(caught));
    } finally {
      setBusyAction("idle");
    }
  }, [loadTask, refreshHistory, selectedTaskId]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setNotice(null);
    setError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const validation = fileValidationMessage(file);
    if (validation) {
      setSelectedFile(null);
      setError(validation);
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleCreateAndUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("اختر ملفًا صالحًا قبل بدء الرفع.");
      return;
    }
    setBusyAction("uploading");
    setError(null);
    setNotice(null);
    try {
      const created = await createContentIngestionTask({
        sourceName: selectedFile.name,
        sourceKind: selectedFile.type === "application/pdf" ? "pdf" : "image",
      });
      const createdTask = await fetchContentIngestionTask(created.taskId);
      const item = createdTask.items[0];
      if (!item) throw new Error("Content ingestion task has no item");
      await uploadContentIngestionItem(created.taskId, item.id, selectedFile);
      await refreshHistory();
      await loadTask(created.taskId);
      setSelectedFile(null);
      setNotice("تم رفع المصدر بنجاح. يمكنك الآن تشغيل المعالجة.");
    } catch (caught) {
      setSessionMissing(isMissingSessionError(caught));
      setError(errorMessage(caught));
    } finally {
      setBusyAction("idle");
    }
  };

  if (sessionMissing) {
    return (
      <section className="admin-panel" aria-labelledby="content-ingestion-title">
        <h2 id="content-ingestion-title">إدخال المحتوى</h2>
        <p>انتهت جلسة الإدارة أو لم تعد صالحة. سجّل الدخول مجددًا ثم أعد المحاولة.</p>
      </section>
    );
  }

  return (
    <section className="admin-panel" aria-labelledby="content-ingestion-title">
      <div className="admin-section-heading">
        <div>
          <p className="admin-eyebrow">المحتوى والمصادر</p>
          <h2 id="content-ingestion-title">إدخال المحتوى</h2>
          <p>ارفع المصدر، شغّل المعالجة، ثم اربطه بدرس قبل الانتقال إلى النشر.</p>
        </div>
      </div>

      {error ? <p role="alert" className="admin-alert admin-alert--danger">{error}</p> : null}
      {notice ? <p role="status" className="admin-alert admin-alert--success">{notice}</p> : null}

      <form className="admin-form-grid" onSubmit={handleCreateAndUpload}>
        <label>
          المصدر
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            disabled={busyAction !== "idle"}
          />
        </label>
        <p className="admin-field-hint">
          {selectedFile
            ? `${selectedFile.name} — ${formatBytes(selectedFile.size)}`
            : "JPG/PNG/WebP حتى 50MB، وPDF حتى 100MB."}
        </p>
        <button type="submit" className="admin-primary-action" disabled={!selectedFile || busyAction !== "idle"}>
          {busyAction === "uploading" ? "جارٍ الرفع…" : "رفع المصدر"}
        </button>
      </form>

      <div className="admin-content-grid">
        <section aria-labelledby="ingestion-history-title">
          <h3 id="ingestion-history-title">سجل المصادر</h3>
          {history?.tasks.length ? (
            <div className="admin-list" role="list">
              {history.tasks.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className={candidate.id === selectedTaskId ? "admin-list-row is-active" : "admin-list-row"}
                  onClick={() => void loadTask(candidate.id).catch((caught) => setError(errorMessage(caught)))}
                  aria-pressed={candidate.id === selectedTaskId}
                >
                  <span>{candidate.sourceName}</span>
                  <span>{taskStatusLabel(candidate.status)}</span>
                  <small>{formatDateTime(candidate.updatedAt)}</small>
                </button>
              ))}
            </div>
          ) : (
            <p>لا توجد مصادر مرفوعة بعد.</p>
          )}
        </section>

        <section aria-labelledby="ingestion-detail-title">
          <h3 id="ingestion-detail-title">تفاصيل المصدر</h3>
          {task ? (
            <>
              <dl className="admin-definition-list">
                <div><dt>المصدر</dt><dd>{task.task.sourceName}</dd></div>
                <div><dt>الحالة</dt><dd>{taskStatusLabel(task.task.status)}</dd></div>
                <div><dt>الدرس المرتبط</dt><dd>{task.task.lessonId ?? "غير مرتبط"}</dd></div>
              </dl>

              <div className="admin-list" role="list" aria-label="ملفات المصدر">
                {task.items.map((item) => (
                  <div key={item.id} className="admin-list-row" role="listitem">
                    <span>{item.originalName}</span>
                    <span>{itemStatusLabel(item.status)}</span>
                    <small>{item.sizeBytes == null ? "—" : formatBytes(item.sizeBytes)}</small>
                  </div>
                ))}
              </div>

              <div className="admin-action-row">
                <button
                  type="button"
                  onClick={() => void runAction("processing", () => processContentIngestionTask(task.task.id), "بدأت المعالجة بنجاح.")}
                  disabled={busyAction !== "idle" || task.task.status === "processing" || task.task.status === "completed"}
                >
                  تشغيل المعالجة
                </button>
              </div>

              <div className="admin-form-grid">
                <label htmlFor="content-lesson-link">ربط بدرس</label>
                <select
                  id="content-lesson-link"
                  value={lessonId}
                  onChange={(event) => setLessonId(event.target.value)}
                  disabled={busyAction !== "idle"}
                >
                  <option value="">اختر درسًا</option>
                  {curriculum?.subjects.flatMap((subject) =>
                    subject.units.flatMap((unit) =>
                      unit.lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {subject.title} / {unit.title} / {lesson.title}
                        </option>
                      )),
                    ),
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => void runAction("linking", () => linkContentIngestionTask(task.task.id, lessonId), "تم ربط المصدر بالدرس.")}
                  disabled={!lessonId || busyAction !== "idle"}
                >
                  حفظ الربط
                </button>
              </div>

              <LessonPublicationPanel lessonId={task.task.lessonId} />

              <div className="admin-danger-zone">
                <button
                  type="button"
                  onClick={() => void runAction("archiving", () => archiveContentIngestionTask(task.task.id), "تمت أرشفة المصدر.")}
                  disabled={busyAction !== "idle"}
                >
                  أرشفة المصدر
                </button>
              </div>
            </>
          ) : selectedTaskSummary ? (
            <p>جارٍ تحميل تفاصيل {selectedTaskSummary.sourceName}…</p>
          ) : (
            <p>اختر مصدرًا من السجل لعرض تفاصيله.</p>
          )}
        </section>
      </div>
    </section>
  );
}
