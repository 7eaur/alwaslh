import { useEffect, useMemo, useState } from "react";
import {
  ApiRequestError,
  isMissingSessionError,
  listStudentCurriculum,
  type StudentCurriculumCatalog,
} from "./auth-api";
import {
  listOfflineLessonPackages,
  OFFLINE_SCOPE_PAYLOAD_BUDGET_BYTES,
  OfflineContentError,
  offlineScopeUsageBytes,
  type StoredOfflineLessonPackage,
} from "./offline-content-store";
import {
  materializeStudentLessonForOffline,
  OfflineMaterializationError,
  removeStoredOfflineLessonForSession,
} from "./offline-materialization";
import { refreshOfflineLeaseForCurrentSession } from "./offline-session";
import type { StoredOfflineLease } from "./offline-store";

interface OfflineLessonOption {
  id: string;
  title: string;
  className: string;
  subjectName: string;
  contentRevision: number;
}

type DownloadsState =
  | { status: "loading" }
  | { status: "offline" }
  | {
      status: "ready";
      lease: StoredOfflineLease;
      lessons: OfflineLessonOption[];
      packages: StoredOfflineLessonPackage[];
    }
  | { status: "error"; message: string };

function lessonOptions(catalog: StudentCurriculumCatalog): OfflineLessonOption[] {
  const lessons: OfflineLessonOption[] = [];
  for (const classRecord of catalog.classes) {
    for (const subject of classRecord.subjects) {
      for (const lesson of subject.unsectionedLessons) {
        lessons.push({
          id: lesson.id,
          title: lesson.title,
          className: classRecord.name,
          subjectName: subject.name,
          contentRevision: lesson.contentRevision,
        });
      }
      for (const section of subject.sections) {
        for (const lesson of section.lessons) {
          lessons.push({
            id: lesson.id,
            title: lesson.title,
            className: classRecord.name,
            subjectName: subject.name,
            contentRevision: lesson.contentRevision,
          });
        }
      }
    }
  }
  return lessons;
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} بايت`;
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} ك.ب`;
  return `${(value / (1024 * 1024)).toLocaleString("ar-YE", { maximumFractionDigits: 1 })} م.ب`;
}

function materializationMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof OfflineContentError) {
    switch (error.code) {
      case "lesson_budget_exceeded":
        return "حجم هذا الدرس أكبر من حد التنزيل المسموح للدرس الواحد (64 م.ب).";
      case "scope_budget_exceeded":
        return "لا توجد مساحة ضمن حد التنزيل لهذا الجهاز. احذف تنزيلًا محفوظًا ثم حاول مرة أخرى.";
      case "byte_size_mismatch":
      case "checksum_mismatch":
      case "asset_missing":
        return "لم يكتمل التحقق من ملفات الدرس، لذلك لم نحفظ تنزيلًا جزئيًا أو غير موثوق.";
      case "storage_quota_exceeded":
        return "رفض المتصفح تخزين الملف بسبب المساحة المتاحة على الجهاز. احذف تنزيلًا أو حرر مساحة ثم حاول مرة أخرى.";
      case "crypto_unavailable":
        return "هذا المتصفح لا يدعم التحقق التشفيري المطلوب لحفظ المحتوى دون اتصال.";
      default:
        return "بيانات التنزيل المنشورة غير صالحة للحفظ دون اتصال.";
    }
  }
  if (error instanceof OfflineMaterializationError) {
    return "تعذر مطابقة التنزيل مع الحساب والجهاز الحاليين. حدّث الصفحة ثم حاول مرة أخرى.";
  }
  return "تعذر إكمال تنزيل الدرس. حاول مرة أخرى.";
}

export function StudentOfflineDownloadsSection({
  online,
  refreshKey,
  onSessionExpired,
}: {
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const [state, setState] = useState<DownloadsState>({ status: online ? "loading" : "offline" });
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [busy, setBusy] = useState<"download" | "remove" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadDownloads() {
    if (!online) {
      setState((current) => (current.status === "ready" ? current : { status: "offline" }));
      return;
    }
    setState({ status: "loading" });
    try {
      const [lease, catalog] = await Promise.all([
        refreshOfflineLeaseForCurrentSession(),
        listStudentCurriculum(),
      ]);
      const lessons = lessonOptions(catalog);
      const packages = await listOfflineLessonPackages(lease.profileId, lease.deviceId);
      setState({ status: "ready", lease, lessons, packages });
      setSelectedLessonId((current) =>
        current && lessons.some((lesson) => lesson.id === current) ? current : (lessons[0]?.id ?? ""),
      );
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState({
        status: "error",
        message: error instanceof ApiRequestError ? error.message : "تعذر تحميل حالة التنزيلات دون اتصال.",
      });
    }
  }

  useEffect(() => {
    void loadDownloads();
  }, [online, refreshKey]);

  const selectedLesson =
    state.status === "ready"
      ? (state.lessons.find((lesson) => lesson.id === selectedLessonId) ?? null)
      : null;
  const selectedPackage =
    state.status === "ready"
      ? (state.packages.find((record) => record.lessonId === selectedLessonId) ?? null)
      : null;
  const currentDownload =
    selectedLesson && selectedPackage
      ? selectedLesson.contentRevision === selectedPackage.contentRevision
      : false;
  const usedBytes = state.status === "ready" ? offlineScopeUsageBytes(state.packages) : 0;
  const downloadedCount = state.status === "ready" ? state.packages.length : 0;

  const selectionLabel = useMemo(() => {
    if (!selectedLesson) return null;
    return `${selectedLesson.className} · ${selectedLesson.subjectName}`;
  }, [selectedLesson]);

  async function downloadSelectedLesson() {
    if (state.status !== "ready" || !selectedLesson || busy || !online) return;
    setBusy("download");
    setActionError(null);
    setNotice(null);
    try {
      const record = await materializeStudentLessonForOffline(state.lease.profileId, selectedLesson.id);
      setState((current) => {
        if (current.status !== "ready") return current;
        return {
          ...current,
          packages: [record, ...current.packages.filter((stored) => stored.lessonId !== record.lessonId)],
        };
      });
      setNotice(currentDownload ? "تم تحديث النسخة المحفوظة والتحقق من ملفاتها." : "تم حفظ الدرس والتحقق من ملفاته.");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setActionError(materializationMessage(error));
    } finally {
      setBusy(null);
    }
  }

  async function removeSelectedLesson() {
    if (state.status !== "ready" || !selectedLesson || !selectedPackage || busy) return;
    setBusy("remove");
    setActionError(null);
    setNotice(null);
    try {
      await removeStoredOfflineLessonForSession(state.lease.profileId, selectedLesson.id);
      setState((current) => {
        if (current.status !== "ready") return current;
        return {
          ...current,
          packages: current.packages.filter((stored) => stored.lessonId !== selectedLesson.id),
        };
      });
      setNotice("تم حذف النسخة المحفوظة من هذا الجهاز.");
    } catch (error) {
      setActionError(materializationMessage(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="access-section" aria-labelledby="offline-download-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">دون اتصال</p>
          <h2 id="offline-download-title">تنزيل الدروس لهذا الجهاز</h2>
        </div>
        {state.status === "ready" ? (
          <span className="subject-count">
            {downloadedCount} محفوظ · {formatBytes(usedBytes)} من {formatBytes(OFFLINE_SCOPE_PAYLOAD_BUDGET_BYTES)}
          </span>
        ) : null}
      </div>

      <p className="field-hint">
        نحفظ فقط النسخة المنشورة الحالية بعد التحقق من الحجم وبصمة SHA-256. لا نحذف تنزيلات قديمة تلقائيًا لتوفير المساحة.
      </p>

      {state.status === "loading" ? (
        <div className="access-skeleton" role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">جاري تحميل حالة التنزيلات</span>
          <span />
          <span />
          <span />
        </div>
      ) : state.status === "offline" ? (
        <div className="form-alert is-warning" role="status">
          يلزم اتصال لبدء تنزيل جديد. التنزيلات المكتملة لا تُخزن في Service Worker أو Cache API.
        </div>
      ) : state.status === "error" ? (
        <div className="access-error" role="alert">
          <div className="form-alert is-danger">{state.message}</div>
          <button className="secondary-button" type="button" onClick={() => void loadDownloads()} disabled={!online}>
            إعادة المحاولة
          </button>
        </div>
      ) : state.lessons.length === 0 ? (
        <div className="empty-state">
          <strong>لا توجد دروس منشورة متاحة للتنزيل الآن</strong>
          <p>سيظهر الدرس هنا بعد نشره ضمن صلاحيات حسابك.</p>
        </div>
      ) : (
        <div className="access-tools">
          <div className="field-group">
            <label htmlFor="offline-lesson-select">الدرس</label>
            <select
              id="offline-lesson-select"
              className="text-input"
              value={selectedLessonId}
              onChange={(event) => {
                setSelectedLessonId(event.target.value);
                setActionError(null);
                setNotice(null);
              }}
              disabled={busy !== null}
            >
              {state.lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.className} · {lesson.subjectName} · {lesson.title}
                </option>
              ))}
            </select>
            {selectionLabel ? <p className="field-hint">{selectionLabel}</p> : null}
          </div>

          {actionError ? (
            <div className="form-alert is-danger" role="alert">
              {actionError}
            </div>
          ) : null}
          {notice ? (
            <div className="form-alert is-success" role="status">
              {notice}
            </div>
          ) : null}

          {selectedPackage ? (
            <div className={`form-alert ${currentDownload ? "is-success" : "is-warning"}`} role="status">
              {currentDownload
                ? `هذه النسخة محفوظة ومطابقة للإصدار المنشور ${selectedPackage.contentRevision}.`
                : `يوجد إصدار محفوظ أقدم (${selectedPackage.contentRevision}). حدّث التنزيل قبل اعتباره النسخة الحالية.`}
            </div>
          ) : (
            <div className="form-alert is-info" role="status">
              هذا الدرس غير محفوظ على هذا الجهاز بعد.
            </div>
          )}

          <div className="access-code-row">
            {!currentDownload ? (
              <button
                className="primary-button"
                type="button"
                onClick={() => void downloadSelectedLesson()}
                disabled={!online || busy !== null || !selectedLesson}
              >
                {busy === "download" ? "جاري التحقق والحفظ" : selectedPackage ? "تحديث التنزيل" : "تنزيل للاستخدام دون اتصال"}
              </button>
            ) : null}
            {selectedPackage ? (
              <button
                className="secondary-button"
                type="button"
                onClick={() => void removeSelectedLesson()}
                disabled={busy !== null}
              >
                {busy === "remove" ? "جاري الحذف" : "حذف التنزيل"}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
