import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
} from "../../features/curriculum/public";
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
import { ApiRequestError, isMissingSessionError } from "../../shared/api/client";
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
    case "completed":
      return "جاهز";
    case "failed":
      return "تعذر تجهيزه";
  }
}

function formattedBytes(value: number): string {
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function validateFiles(files: File[]): string | null {
  if (files.length < 1) return "اختر ملفًا واحدًا على الأقل.";
  if (files.length > 100) return "الحد الأعلى للمهمة الواحدة هو 100 ملف.";
  for (const file of files) {
    if (!SUPPORTED_TYPES.has(file.type)) return `الملف ${file.name} من نوع غير مدعوم.`;
    const limit = file.type === "application/pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
    if (file.size <= 0 || file.size > limit) return `حجم الملف ${file.name} خارج الحد المسموح.`;
  }
  return null;
}

export function ContentIngestionWorkspace({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof fetchContentIngestionHistory>> | null>(null);
  const [selectedTask, setSelectedTask] = useState<ContentIngestionTaskDetail | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [lessonContentRefreshToken, setLessonContentRefreshToken] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [busyAction, setBusyAction] = useState<BusyAction>("idle");
  const [feedback, setFeedback] = useState<{ kind: "info" | "success" | "error"; message: string } | null>(null);
  const [uploadedFileCount, setUploadedFileCount] = useState(0);

  const handleError = useCallback(
    (error: unknown) => {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setFeedback({ kind: "error", message: errorMessage(error) });
    },
    [onSessionExpired],
  );

  const refresh = useCallback(async () => {
    setLoadState("loading");
    try {
      const [nextCurriculum, nextHistory] = await Promise.all([
        fetchAdminCurriculum(),
        fetchContentIngestionHistory({ includeArchived, limit: 50 }),
      ]);
      setCurriculum(nextCurriculum);
      setHistory(nextHistory);
      setLoadState("ready");
      setSelectedLessonId((current) => {
        if (current && nextCurriculum.lessons.some((lesson) => lesson.id === current && lesson.status !== "archived")) {
          return current;
        }
        return nextCurriculum.lessons.find((lesson) => lesson.status !== "archived")?.id ?? "";
      });
      setLessonContentRefreshToken((value) => value + 1);
    } catch (error) {
      setLoadState("error");
      handleError(error);
    }
  }, [handleError, includeArchived]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeLessons = useMemo(
    () => curriculum?.lessons.filter((lesson) => lesson.status !== "archived") ?? [],
    [curriculum],
  );

  const openTask = useCallback(
    async (taskId: string) => {
      try {
        const task = await fetchContentIngestionTask(taskId);
        setSelectedTask(task);
        setSelectedLessonId(task.lessonId);
        setFeedback(null);
      } catch (error) {
        handleError(error);
      }
    },
    [handleError],
  );

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateFiles(files);
    if (validationError) {
      setFeedback({ kind: "error", message: validationError });
      return;
    }
    if (!selectedLessonId) {
      setFeedback({ kind: "error", message: "اختر درسًا قبل بدء الرفع." });
      return;
    }

    setBusyAction("uploading");
    setUploadedFileCount(0);
    setFeedback({ kind: "info", message: "يتم إنشاء مهمة الرفع الآن..." });
    try {
      let task = await createContentIngestionTask({
        lessonId: selectedLessonId,
        clientRequestId: crypto.randomUUID(),
        items: files.map((file) => ({ filename: file.name, mimeType: file.type, byteSize: file.size })),
      });

      for (let index = 0; index < files.length; index += 1) {
        const item = task.items[index];
        const file = files[index];
        if (!item || !file) continue;
        task = await uploadContentIngestionItem(task.id, item.id, file);
        setUploadedFileCount(index + 1);
      }

      setSelectedTask(task);
      setFiles([]);
      setFeedback({ kind: "success", message: "اكتمل الرفع. المهمة جاهزة للمعالجة." });
      await refresh();
    } catch (error) {
      handleError(error);
    } finally {
      setBusyAction("idle");
    }
  }

  async function runTaskAction(action: "process" | "link" | "archive") {
    if (!selectedTask) return;
    setBusyAction(action === "process" ? "processing" : action === "link" ? "linking" : "archiving");
    setFeedback(null);
    try {
      const nextTask =
        action === "process"
          ? await processContentIngestionTask(selectedTask.id)
          : action === "link"
            ? await linkContentIngestionTask(selectedTask.id)
            : await archiveContentIngestionTask(selectedTask.id);
      setSelectedTask(nextTask);
      setFeedback({
        kind: "success",
        message:
          action === "process"
            ? "اكتملت معالجة الملفات."
            : action === "link"
              ? "تم ربط المخرجات بالدرس."
              : "تمت أرشفة المهمة.",
      });
      await refresh();
    } catch (error) {
      handleError(error);
    } finally {
      setBusyAction("idle");
    }
  }

  const currentTaskStatus = selectedTask ? taskStatusLabel(selectedTask.status) : null;

  return (
    <section className="workspace-stack" aria-labelledby="content-ingestion-title">
      <header className="workspace-header">
        <div>
          <p className="workspace-eyebrow">المحتوى</p>
          <h1 id="content-ingestion-title">إدخال المحتوى</h1>
          <p>ارفع المصادر، راقب المعالجة، ثم اربط المخرجات بالدرس المناسب.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void refresh()} disabled={loadState === "loading"}>
          تحديث
        </button>
      </header>

      {feedback ? <p className={`feedback feedback--${feedback.kind}`}>{feedback.message}</p> : null}

      <section className="workspace-panel" aria-labelledby="content-upload-title">
        <div className="workspace-panel__heading">
          <div>
            <p className="workspace-eyebrow">مصدر جديد</p>
            <h2 id="content-upload-title">رفع ملفات للمعالجة</h2>
          </div>
          <span className="status-chip">JPEG / PNG / WebP / PDF</span>
        </div>

        <form className="workspace-form" onSubmit={createTask}>
          <label>
            الدرس
            <select value={selectedLessonId} onChange={(event) => setSelectedLessonId(event.target.value)} required>
              <option value="">اختر درسًا</option>
              {activeLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            الملفات
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(event: ChangeEvent<HTMLInputElement>) => setFiles(Array.from(event.target.files ?? []))}
            />
          </label>
          <p className="workspace-hint">
            الحد الأعلى 100 ملف. الصور حتى 50MB للملف وPDF حتى 100MB. تحفظ المهمة قبل بدء المعالجة.
          </p>
          {files.length > 0 ? (
            <ul className="compact-list">
              {files.map((file) => (
                <li key={`${file.name}-${file.lastModified}`}>
                  <strong>{file.name}</strong>
                  <span>{formattedBytes(file.size)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <button className="primary-button" type="submit" disabled={busyAction !== "idle" || activeLessons.length === 0}>
            {busyAction === "uploading" ? `جارٍ الرفع ${uploadedFileCount}/${files.length}` : "إنشاء مهمة ورفع الملفات"}
          </button>
        </form>
      </section>

      <section className="workspace-panel" aria-labelledby="content-history-title">
        <div className="workspace-panel__heading">
          <div>
            <p className="workspace-eyebrow">السجل</p>
            <h2 id="content-history-title">مهام الإدخال</h2>
          </div>
          <label className="inline-control">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(event) => setIncludeArchived(event.target.checked)}
            />
            إظهار المؤرشف
          </label>
        </div>

        {loadState === "loading" ? <p className="workspace-state">جارٍ تحميل مهام المحتوى...</p> : null}
        {loadState === "error" ? (
          <div className="workspace-state workspace-state--error">
            <p>تعذر تحميل سجل المحتوى.</p>
            <button className="secondary-button" type="button" onClick={() => void refresh()}>
              إعادة المحاولة
            </button>
          </div>
        ) : null}
        {loadState === "ready" && history?.tasks.length === 0 ? (
          <p className="workspace-state">لا توجد مهام إدخال محتوى حتى الآن.</p>
        ) : null}
        {history?.tasks.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الدرس</th>
                  <th>الحالة</th>
                  <th>الملفات</th>
                  <th>المخرجات</th>
                  <th>آخر تحديث</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {history.tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.lessonTitle}</td>
                    <td>{taskStatusLabel(task.status)}</td>
                    <td>{task.uploadedCount}/{task.itemCount}</td>
                    <td>{task.mediaAssetCount}</td>
                    <td>{new Date(task.updatedAt).toLocaleString("ar-YE")}</td>
                    <td>
                      <button className="text-button" type="button" onClick={() => void openTask(task.id)}>
                        فتح
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {selectedTask ? (
        <section className="workspace-panel" aria-labelledby="content-task-title">
          <div className="workspace-panel__heading">
            <div>
              <p className="workspace-eyebrow">المهمة الحالية</p>
              <h2 id="content-task-title">{selectedTask.lessonTitle}</h2>
            </div>
            {currentTaskStatus ? <span className="status-chip">{currentTaskStatus}</span> : null}
          </div>

          <dl className="summary-grid">
            <div>
              <dt>الملفات المرفوعة</dt>
              <dd>{selectedTask.uploadedCount}/{selectedTask.itemCount}</dd>
            </div>
            <div>
              <dt>المعالجة</dt>
              <dd>{selectedTask.processedItemCount}/{selectedTask.itemCount}</dd>
            </div>
            <div>
              <dt>المخرجات</dt>
              <dd>{selectedTask.mediaAssetCount}</dd>
            </div>
            <div>
              <dt>الفشل</dt>
              <dd>{selectedTask.failedItemCount}</dd>
            </div>
          </dl>

          {selectedTask.lastErrorMessage ? (
            <div className="workspace-state workspace-state--error">
              <strong>{selectedTask.lastErrorCode ?? "تعذر إكمال العملية"}</strong>
              <p>{selectedTask.lastErrorMessage}</p>
            </div>
          ) : null}

          <div className="workspace-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => void runTaskAction("process")}
              disabled={busyAction !== "idle" || !["ready", "failed"].includes(selectedTask.status)}
            >
              {busyAction === "processing" ? "جارٍ المعالجة..." : "معالجة الملفات"}
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => void runTaskAction("link")}
              disabled={busyAction !== "idle" || selectedTask.status !== "completed" || Boolean(selectedTask.linkedAt)}
            >
              {busyAction === "linking" ? "جارٍ الربط..." : selectedTask.linkedAt ? "تم الربط" : "ربط المخرجات بالدرس"}
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={() => void runTaskAction("archive")}
              disabled={busyAction !== "idle" || Boolean(selectedTask.archivedAt)}
            >
              {busyAction === "archiving" ? "جارٍ الأرشفة..." : "أرشفة المهمة"}
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الملف</th>
                  <th>الحالة</th>
                  <th>الحجم</th>
                  <th>المخرجات</th>
                </tr>
              </thead>
              <tbody>
                {selectedTask.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.position + 1}</td>
                    <td>{item.filename}</td>
                    <td>{itemStatusLabel(item.status)}</td>
                    <td>{formattedBytes(item.byteSize ?? item.declaredByteSize)}</td>
                    <td>{item.outputCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <LessonPublicationPanel
            task={selectedTask}
            refreshToken={lessonContentRefreshToken}
            onSessionExpired={onSessionExpired}
            onTaskChanged={(task) => {
              setSelectedTask(task);
              setLessonContentRefreshToken((value) => value + 1);
              void refresh();
            }}
          />
        </section>
      ) : null}
    </section>
  );
}
