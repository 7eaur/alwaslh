import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "./admin-api";
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
} from "./content-ingestion-api";
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
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setLoadState("error");
      setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }, [includeArchived, onSessionExpired]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const classById = useMemo(
    () => new Map(curriculum?.classes.map((record) => [record.id, record.name]) ?? []),
    [curriculum],
  );
  const subjectById = useMemo(
    () => new Map(curriculum?.subjects.map((record) => [record.id, record.name]) ?? []),
    [curriculum],
  );
  const lessonOptions = useMemo(
    () =>
      (curriculum?.lessons ?? [])
        .filter((lesson) => lesson.status !== "archived")
        .map((lesson) => ({
          id: lesson.id,
          label: `${classById.get(lesson.classId) ?? "صف"} · ${subjectById.get(lesson.subjectId) ?? "مادة"} · ${lesson.title}`,
        })),
    [classById, curriculum, subjectById],
  );

  const refreshHistory = useCallback(async () => {
    const next = await fetchContentIngestionHistory({ includeArchived, limit: 50 });
    setHistory(next);
  }, [includeArchived]);

  const openTask = useCallback(
    async (taskId: string) => {
      try {
        setFeedback({ kind: "info", message: "جارٍ تحميل تفاصيل مهمة الرفع…" });
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

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setFiles(nextFiles);
    setUploadedFileCount(0);
    const validation = validateFiles(nextFiles);
    setFeedback(validation ? { kind: "error", message: validation } : null);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateFiles(files);
    if (!selectedLessonId) {
      setFeedback({ kind: "error", message: "اختر الدرس الذي ستُربط به الوسائط." });
      return;
    }
    if (validation) {
      setFeedback({ kind: "error", message: validation });
      return;
    }

    setBusyAction("uploading");
    setUploadedFileCount(0);
    setFeedback({ kind: "info", message: "جارٍ إنشاء مهمة رفع دائمة…" });
    try {
      let task = await createContentIngestionTask({
        lessonId: selectedLessonId,
        clientRequestId: crypto.randomUUID(),
        items: files.map((file) => ({ filename: file.name, mimeType: file.type, byteSize: file.size })),
      });
      setSelectedTask(task);

      const orderedItems = [...task.items].sort((a, b) => a.position - b.position);
      for (let index = 0; index < orderedItems.length; index += 1) {
        const item = orderedItems[index];
        const file = files[index];
        if (!item || !file) throw new Error("upload_contract_mismatch");
        setFeedback({ kind: "info", message: `جارٍ رفع ${file.name} (${index + 1}/${files.length})…` });
        task = await uploadContentIngestionItem(task.id, item.id, file);
        setSelectedTask(task);
        setUploadedFileCount(index + 1);
      }
      await refreshHistory();
      setFeedback({
        kind: "success",
        message: "اكتمل رفع الملفات بالترتيب المحدد. ابدأ المعالجة عندما تكون جاهزًا.",
      });
      setFiles([]);
    } catch (error) {
      handleError(error);
    } finally {
      setBusyAction("idle");
    }
  };

  const runTaskAction = useCallback(
    async (
      action: BusyAction,
      work: (taskId: string) => Promise<ContentIngestionTaskDetail>,
      successMessage: string,
    ) => {
      if (!selectedTask) return;
      setBusyAction(action);
      setFeedback({ kind: "info", message: "جارٍ تنفيذ العملية…" });
      try {
        const task = await work(selectedTask.id);
        setSelectedTask(task);
        await refreshHistory();
        if (action === "linking") setLessonContentRefreshToken((value) => value + 1);
        setFeedback({ kind: "success", message: successMessage });
      } catch (error) {
        handleError(error);
      } finally {
        setBusyAction("idle");
      }
    },
    [handleError, refreshHistory, selectedTask],
  );

  const isBusy = busyAction !== "idle";

  if (loadState === "loading" && !curriculum) {
    return <WorkspaceState title="جارٍ تحميل مساحة الرفع" body="نقرأ الدروس وسجل الرفع الدائم من الخادم." />;
  }

  if (loadState === "error" && !curriculum) {
    return (
      <WorkspaceState title="تعذر تحميل مساحة الرفع" body={feedback?.message ?? "تعذر تحميل البيانات."}>
        <button className="primary-button" type="button" onClick={() => void refresh()}>
          إعادة المحاولة
        </button>
      </WorkspaceState>
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">إدخال المحتوى</p>
          <h1>رفع المحتوى ومعالجته</h1>
          <p className="page-description">
            ارفع الصور وPDF، تابع المعالجة، ثم اربط النتائج بالدرس كمسودة. قرار المراجعة والنشر منفصل ويُدار على مستوى محتوى الدرس نفسه.
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void refresh()} disabled={isBusy}>
          تحديث السجل
        </button>
      </header>

      {feedback ? (
        <div className={`ingestion-feedback is-${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.message}
        </div>
      ) : null}

      <section className="ingestion-layout" aria-label="رفع المحتوى وإدارة المهام">
        <div className="ingestion-primary-column">
          <section className="ingestion-panel" aria-labelledby="new-ingestion-title">
            <div className="ingestion-panel-heading">
              <div>
                <p className="section-kicker">رفع جديد</p>
                <h2 id="new-ingestion-title">مهمة رفع جديدة</h2>
              </div>
              <span className="ingestion-policy-note">JPG · PNG · WebP · PDF</span>
            </div>

            <form className="ingestion-upload-form" onSubmit={(event) => void handleUpload(event)}>
              <label>
                <span>الدرس</span>
                <select
                  value={selectedLessonId}
                  onChange={(event) => setSelectedLessonId(event.target.value)}
                  disabled={isBusy || lessonOptions.length === 0}
                  required
                >
                  {lessonOptions.length === 0 ? <option value="">لا توجد دروس متاحة</option> : null}
                  {lessonOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="file-picker">
                <span>الملفات بالترتيب المطلوب</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  multiple
                  onChange={handleFiles}
                  disabled={isBusy}
                  aria-describedby="ingestion-file-help"
                />
                <small id="ingestion-file-help">
                  يتم الحفاظ على ترتيب الاختيار. الصورة حتى 50 MB وPDF حتى 100 MB، وبحد أقصى 100 ملف للمهمة.
                </small>
              </label>

              {files.length > 0 ? (
                <ol className="selected-file-list" aria-label="ترتيب الملفات المختارة">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${index}`}>
                      <span>{index + 1}</span>
                      <strong>{file.name}</strong>
                      <small>{formattedBytes(file.size)}</small>
                    </li>
                  ))}
                </ol>
              ) : null}

              {busyAction === "uploading" && files.length > 0 ? (
                <div className="upload-progress" aria-live="polite">
                  <span>رفع الملفات</span>
                  <progress value={uploadedFileCount} max={files.length} />
                  <strong>
                    {uploadedFileCount}/{files.length}
                  </strong>
                </div>
              ) : null}

              <button className="primary-button" type="submit" disabled={isBusy || lessonOptions.length === 0}>
                {busyAction === "uploading" ? "جارٍ الرفع…" : "إنشاء المهمة ورفع الملفات"}
              </button>
            </form>
          </section>

          <LessonPublicationPanel
            lessonId={selectedLessonId}
            refreshToken={lessonContentRefreshToken}
            disabled={isBusy}
            onSessionExpired={onSessionExpired}
          />

          {selectedTask ? (
            <TaskDetail
              task={selectedTask}
              isBusy={isBusy}
              onProcess={() =>
                void runTaskAction(
                  "processing",
                  processContentIngestionTask,
                  "اكتملت محاولة المعالجة. راجع النتيجة قبل الربط.",
                )
              }
              onLink={() =>
                void runTaskAction(
                  "linking",
                  linkContentIngestionTask,
                  "تم ربط الوسائط بالدرس كمسودة. يمكنك الآن إدارة مراجعة محتوى الدرس ونشره من لوحة قرار النشر.",
                )
              }
              onArchive={() =>
                void runTaskAction("archiving", archiveContentIngestionTask, "تمت أرشفة المهمة مع الاحتفاظ بتاريخها.")
              }
            />
          ) : (
            <WorkspaceState
              title="لا توجد مهمة مفتوحة"
              body="أنشئ مهمة جديدة أو افتح مهمة من السجل لمراجعة الرفع والمعالجة والربط."
            />
          )}
        </div>

        <aside className="ingestion-history" aria-labelledby="ingestion-history-title">
          <div className="ingestion-panel-heading">
            <div>
              <p className="section-kicker">السجل</p>
              <h2 id="ingestion-history-title">سجل الرفع</h2>
            </div>
            <label className="archive-toggle">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(event) => setIncludeArchived(event.target.checked)}
                disabled={isBusy}
              />
              إظهار المؤرشف
            </label>
          </div>

          {history?.tasks.length ? (
            <ul className="ingestion-history-list">
              {history.tasks.map((task) => (
                <li key={task.id}>
                  <button
                    className={selectedTask?.id === task.id ? "history-task is-selected" : "history-task"}
                    type="button"
                    onClick={() => void openTask(task.id)}
                    disabled={isBusy}
                  >
                    <span className={`ingestion-status status-${task.status}`}>{taskStatusLabel(task.status)}</span>
                    <strong>{task.lessonTitle}</strong>
                    <small>
                      {task.uploadedCount}/{task.itemCount} مرفوع · {task.mediaAssetCount} وسيط
                    </small>
                    {task.archivedAt ? <small>مؤرشفة</small> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-copy">لا توجد مهام رفع ضمن هذا العرض.</p>
          )}
        </aside>
      </section>
    </>
  );
}

function TaskDetail({
  task,
  isBusy,
  onProcess,
  onLink,
  onArchive,
}: {
  task: ContentIngestionTaskDetail;
  isBusy: boolean;
  onProcess: () => void;
  onLink: () => void;
  onArchive: () => void;
}) {
  const allUploaded = task.uploadedCount === task.itemCount;
  const canProcess = !task.archivedAt && (task.status === "ready" || task.status === "failed") && allUploaded;
  const canLink = !task.archivedAt && task.status === "completed" && !task.linkedAt && task.mediaAssetCount > 0;

  return (
    <section className="ingestion-panel task-detail" aria-labelledby="active-ingestion-title">
      <div className="ingestion-panel-heading">
        <div>
          <p className="section-kicker">مهمة الرفع</p>
          <h2 id="active-ingestion-title">{task.lessonTitle}</h2>
        </div>
        <div className="task-badges">
          <span className={`ingestion-status status-${task.status}`}>{taskStatusLabel(task.status)}</span>
        </div>
      </div>

      <div className="task-metrics" aria-label="تقدم المهمة">
        <Metric label="الملفات" value={`${task.uploadedCount}/${task.itemCount}`} />
        <Metric label="تمت معالجتها" value={`${task.processedItemCount}/${task.itemCount}`} />
        <Metric label="الوسائط الناتجة" value={String(task.mediaAssetCount)} />
        <Metric label="الفشل" value={String(task.failedItemCount)} />
      </div>

      {task.lastErrorMessage ? (
        <div className="task-error" role="alert">
          <strong>تعذر إكمال المعالجة</strong>
          <span>{task.lastErrorMessage}</span>
        </div>
      ) : null}

      <ol className="task-item-list" aria-label="ملفات المهمة">
        {task.items.map((item) => (
          <li key={item.id}>
            <span className="item-position">{item.position + 1}</span>
            <div>
              <strong>{item.filename}</strong>
              <small>
                {formattedBytes(item.declaredByteSize)}
                {item.outputCount > 0 ? ` · ${item.outputCount} ناتج` : ""}
              </small>
              {item.lastErrorMessage ? <small className="item-error">{item.lastErrorMessage}</small> : null}
            </div>
            <span className={`item-state state-${item.status}`}>{itemStatusLabel(item.status)}</span>
          </li>
        ))}
      </ol>

      <div className="task-actions" aria-label="إجراءات مهمة الرفع">
        <button className="primary-button" type="button" onClick={onProcess} disabled={isBusy || !canProcess}>
          {task.status === "failed" ? "إعادة محاولة المعالجة" : "بدء المعالجة"}
        </button>
        <button className="secondary-button" type="button" onClick={onLink} disabled={isBusy || !canLink}>
          ربط بالدرس كمسودة
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={onArchive}
          disabled={isBusy || Boolean(task.archivedAt) || task.status === "processing"}
        >
          أرشفة المهمة
        </button>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="task-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WorkspaceState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <section className="workspace-state" aria-live="polite">
      <h2>{title}</h2>
      <p>{body}</p>
      {children}
    </section>
  );
}
