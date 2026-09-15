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
    case "completed":
      return "جاهز";
    case "failed":
      return "تعذر تجهيزه";
  }
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContentIngestionWorkspace() {
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [history, setHistory] = useState<ContentIngestionTaskDetail[]>([]);
  const [activeTask, setActiveTask] = useState<ContentIngestionTaskDetail | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [pageNumber, setPageNumber] = useState("");

  const refreshHistory = useCallback(async () => {
    try {
      const nextHistory = await fetchContentIngestionHistory();
      setHistory(nextHistory.tasks);
    } catch (nextError) {
      if (!isMissingSessionError(nextError)) setError(errorMessage(nextError));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAdminCurriculum(), fetchContentIngestionHistory()])
      .then(([nextCurriculum, nextHistory]) => {
        if (cancelled) return;
        setCurriculum(nextCurriculum);
        setHistory(nextHistory.tasks);
      })
      .catch((nextError) => {
        if (!cancelled && !isMissingSessionError(nextError)) setError(errorMessage(nextError));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSubject = useMemo(
    () => curriculum?.subjects.find((subject) => subject.id === subjectId) ?? null,
    [curriculum, subjectId],
  );

  const selectedLesson = useMemo(() => {
    if (!selectedSubject) return null;
    for (const unit of selectedSubject.units) {
      const lesson = unit.lessons.find((candidate) => candidate.id === lessonId);
      if (lesson) return lesson;
    }
    return null;
  }, [lessonId, selectedSubject]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setNotice(null);
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!SUPPORTED_TYPES.has(file.type)) {
      setSelectedFile(null);
      setError("الملف غير مدعوم. استخدم JPG أو PNG أو WEBP أو PDF فقط.");
      return;
    }
    const limit = file.type === "application/pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
    if (file.size > limit) {
      setSelectedFile(null);
      setError(file.type === "application/pdf" ? "حجم PDF يتجاوز 100 MB." : "حجم الصورة يتجاوز 50 MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleCreateAndUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("اختر ملفًا أولًا.");
      return;
    }
    setBusyAction("uploading");
    setError(null);
    setNotice(null);
    try {
      const created = await createContentIngestionTask({
        sourceName: selectedFile.name,
        itemCount: 1,
      });
      const uploaded = await uploadContentIngestionItem(created.task.id, selectedFile);
      setActiveTask(uploaded);
      setSelectedFile(null);
      setNotice("تم رفع الملف وحفظ المهمة. يمكنك الآن بدء المعالجة.");
      await refreshHistory();
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setBusyAction("idle");
    }
  };

  const handleProcess = async () => {
    if (!activeTask) return;
    setBusyAction("processing");
    setError(null);
    setNotice(null);
    try {
      const nextTask = await processContentIngestionTask(activeTask.task.id);
      setActiveTask(nextTask);
      setNotice("اكتملت المعالجة الأولية. راجع النتائج ثم اربطها بالدرس الصحيح.");
      await refreshHistory();
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setBusyAction("idle");
    }
  };

  const handleLink = async () => {
    if (!activeTask || !lessonId) {
      setError("اختر الدرس قبل الربط.");
      return;
    }
    const parsedPageNumber = pageNumber.trim() === "" ? null : Number(pageNumber);
    if (parsedPageNumber !== null && (!Number.isInteger(parsedPageNumber) || parsedPageNumber <= 0)) {
      setError("رقم الصفحة يجب أن يكون عددًا صحيحًا موجبًا.");
      return;
    }
    setBusyAction("linking");
    setError(null);
    setNotice(null);
    try {
      const nextTask = await linkContentIngestionTask(activeTask.task.id, {
        lessonId,
        pageNumber: parsedPageNumber,
      });
      setActiveTask(nextTask);
      setNotice("تم ربط المحتوى بالدرس. يبقى قرار النشر منفصلًا ومقصودًا.");
      await refreshHistory();
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setBusyAction("idle");
    }
  };

  const handleArchive = async () => {
    if (!activeTask) return;
    setBusyAction("archiving");
    setError(null);
    setNotice(null);
    try {
      await archiveContentIngestionTask(activeTask.task.id);
      setActiveTask(null);
      setNotice("تمت أرشفة المهمة وإزالتها من قائمة العمل النشطة.");
      await refreshHistory();
    } catch (nextError) {
      setError(errorMessage(nextError));
    } finally {
      setBusyAction("idle");
    }
  };

  const handleOpenTask = async (taskId: string) => {
    setError(null);
    setNotice(null);
    try {
      setActiveTask(await fetchContentIngestionTask(taskId));
    } catch (nextError) {
      setError(errorMessage(nextError));
    }
  };

  return (
    <section className="content-ingestion-workspace" aria-labelledby="content-ingestion-title">
      <header className="content-ingestion-workspace__header">
        <div>
          <p className="eyebrow">إدخال المحتوى</p>
          <h2 id="content-ingestion-title">من الملف الخام إلى محتوى مرتبط بالمنهج</h2>
          <p>
            ارفع المصدر، عالجه، راجع النتيجة، ثم اربطه بالدرس الصحيح. النشر يبقى خطوة مستقلة حتى لا يصل محتوى غير
            معتمد إلى الطالب.
          </p>
        </div>
      </header>

      {error ? <div className="state-banner state-banner--error" role="alert">{error}</div> : null}
      {notice ? <div className="state-banner state-banner--success" role="status">{notice}</div> : null}

      <div className="content-ingestion-grid">
        <form className="content-ingestion-panel" onSubmit={handleCreateAndUpload}>
          <div className="content-ingestion-panel__heading">
            <span>1</span>
            <div>
              <h3>ارفع المصدر</h3>
              <p>JPG / PNG / WEBP حتى 50 MB، أو PDF حتى 100 MB.</p>
            </div>
          </div>
          <label className="content-ingestion-field">
            <span>الملف</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              disabled={busyAction !== "idle"}
            />
          </label>
          {selectedFile ? (
            <div className="content-ingestion-file-summary">
              <strong>{selectedFile.name}</strong>
              <span>{formatBytes(selectedFile.size)}</span>
            </div>
          ) : null}
          <button className="primary-button" type="submit" disabled={!selectedFile || busyAction !== "idle"}>
            {busyAction === "uploading" ? "جارٍ الرفع…" : "إنشاء المهمة ورفع الملف"}
          </button>
        </form>

        <section className="content-ingestion-panel" aria-labelledby="content-process-title">
          <div className="content-ingestion-panel__heading">
            <span>2</span>
            <div>
              <h3 id="content-process-title">عالج وراجع</h3>
              <p>المعالجة لا تعني النشر. راجع حالة العناصر والنتيجة قبل الربط.</p>
            </div>
          </div>
          {activeTask ? (
            <>
              <dl className="content-ingestion-summary">
                <div><dt>الحالة</dt><dd>{taskStatusLabel(activeTask.task.status)}</dd></div>
                <div><dt>المصدر</dt><dd>{activeTask.task.sourceName}</dd></div>
                <div><dt>العناصر</dt><dd>{activeTask.items.length}</dd></div>
              </dl>
              <div className="content-ingestion-items">
                {activeTask.items.map((item) => (
                  <article key={item.id} className="content-ingestion-item">
                    <div>
                      <strong>{item.originalName}</strong>
                      <span>{itemStatusLabel(item.status)}</span>
                    </div>
                    <small>{formatBytes(item.sizeBytes)}</small>
                  </article>
                ))}
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={handleProcess}
                disabled={busyAction !== "idle" || activeTask.task.status === "processing"}
              >
                {busyAction === "processing" ? "جارٍ المعالجة…" : "بدء المعالجة"}
              </button>
            </>
          ) : (
            <p className="content-ingestion-empty">اختر مهمة من السجل أو ارفع ملفًا جديدًا.</p>
          )}
        </section>

        <section className="content-ingestion-panel" aria-labelledby="content-link-title">
          <div className="content-ingestion-panel__heading">
            <span>3</span>
            <div>
              <h3 id="content-link-title">اربط بالمنهج</h3>
              <p>حدد المادة والدرس ورقم الصفحة عند توفره.</p>
            </div>
          </div>
          <label className="content-ingestion-field">
            <span>المادة</span>
            <select
              value={subjectId}
              onChange={(event) => {
                setSubjectId(event.target.value);
                setLessonId("");
              }}
              disabled={!curriculum}
            >
              <option value="">اختر المادة</option>
              {curriculum?.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.title}</option>
              ))}
            </select>
          </label>
          <label className="content-ingestion-field">
            <span>الدرس</span>
            <select value={lessonId} onChange={(event) => setLessonId(event.target.value)} disabled={!selectedSubject}>
              <option value="">اختر الدرس</option>
              {selectedSubject?.units.flatMap((unit) =>
                unit.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>{unit.title} — {lesson.title}</option>
                )),
              )}
            </select>
          </label>
          <label className="content-ingestion-field">
            <span>رقم الصفحة</span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={pageNumber}
              onChange={(event) => setPageNumber(event.target.value)}
              placeholder="اختياري"
            />
          </label>
          <button className="primary-button" type="button" onClick={handleLink} disabled={!activeTask || !lessonId || busyAction !== "idle"}>
            {busyAction === "linking" ? "جارٍ الربط…" : "ربط المحتوى بالدرس"}
          </button>
          {selectedLesson ? <small>الدرس المحدد: {selectedLesson.title}</small> : null}
        </section>
      </div>

      <LessonPublicationPanel activeTask={activeTask} onTaskChange={setActiveTask} />

      <section className="content-ingestion-history" aria-labelledby="content-history-title">
        <div className="content-ingestion-history__header">
          <div>
            <p className="eyebrow">سجل العمل</p>
            <h3 id="content-history-title">المهام الأخيرة</h3>
          </div>
          <button className="secondary-button" type="button" onClick={refreshHistory}>تحديث</button>
        </div>
        {history.length === 0 ? (
          <p className="content-ingestion-empty">لا توجد مهام إدخال محتوى بعد.</p>
        ) : (
          <div className="content-ingestion-history__list">
            {history.map((task) => (
              <article key={task.task.id} className="content-ingestion-history__item">
                <div>
                  <strong>{task.task.sourceName}</strong>
                  <span>{taskStatusLabel(task.task.status)}</span>
                </div>
                <div className="content-ingestion-history__actions">
                  <button className="secondary-button" type="button" onClick={() => handleOpenTask(task.task.id)}>فتح</button>
                  {activeTask?.task.id === task.task.id ? (
                    <button className="danger-button" type="button" onClick={handleArchive} disabled={busyAction !== "idle"}>
                      {busyAction === "archiving" ? "جارٍ الأرشفة…" : "أرشفة"}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
