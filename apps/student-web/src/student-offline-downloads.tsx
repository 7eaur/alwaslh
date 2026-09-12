import { useEffect, useState } from "react";
import {
  ApiRequestError,
  isMissingSessionError,
  listStudentCurriculum,
  type StudentCurriculumCatalog,
} from "./auth-api";
import { OfflineAuthorizationError } from "./offline-authorization";
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
import { getActiveOfflineScope, refreshOfflineLeaseForCurrentSession } from "./offline-session";

interface OfflineLessonOption {
  id: string;
  title: string;
  className: string;
  subjectName: string;
  contentRevision: number;
}

type DownloadsState =
  | { status: "loading" }
  | { status: "offline-empty" }
  | { status: "ready"; lessons: OfflineLessonOption[]; packages: StoredOfflineLessonPackage[]; catalogAvailable: boolean }
  | { status: "error"; message: string };

function lessonOptions(catalog: StudentCurriculumCatalog): OfflineLessonOption[] {
  const lessons: OfflineLessonOption[] = [];
  for (const classRecord of catalog.classes) {
    for (const subject of classRecord.subjects) {
      const append = (lesson: { id: string; title: string; contentRevision: number }) =>
        lessons.push({
          id: lesson.id,
          title: lesson.title,
          className: classRecord.name,
          subjectName: subject.name,
          contentRevision: lesson.contentRevision,
        });
      subject.unsectionedLessons.forEach(append);
      subject.sections.forEach((section) => section.lessons.forEach(append));
    }
  }
  return lessons;
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} بايت`;
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} ك.ب`;
  return `${(value / (1024 * 1024)).toLocaleString("ar-YE", { maximumFractionDigits: 1 })} م.ب`;
}

function downloadMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof OfflineAuthorizationError) {
    return "تعذر حفظ الدرس بأمان. حدّث الصفحة وحاول مرة أخرى.";
  }
  if (error instanceof OfflineContentError) {
    switch (error.code) {
      case "lesson_budget_exceeded":
        return "هذا الدرس كبير جدًا للحفظ على الجهاز.";
      case "scope_budget_exceeded":
        return "مساحة التنزيلات ممتلئة. أزل درسًا محفوظًا ثم حاول مرة أخرى.";
      case "storage_quota_exceeded":
        return "لا توجد مساحة كافية على الجهاز. حرر بعض المساحة ثم حاول مرة أخرى.";
      case "crypto_unavailable":
        return "هذا المتصفح لا يدعم الحماية المطلوبة. حدّث المتصفح أو جرّب متصفحًا حديثًا.";
      case "byte_size_mismatch":
      case "checksum_mismatch":
      case "asset_missing":
      case "manifest_invalid":
        return "تعذر حفظ الدرس بأمان. لم يتم الاحتفاظ بتنزيل غير مكتمل.";
    }
  }
  if (error instanceof OfflineMaterializationError) {
    return "تعذر التحقق من هذا الجهاز. سجّل الدخول مرة أخرى أو اطلب المساعدة.";
  }
  return "تعذر حفظ الدرس. تحقق من الإنترنت وحاول مرة أخرى.";
}

function packageCurrent(lesson: OfflineLessonOption | undefined, stored: StoredOfflineLessonPackage): boolean {
  return lesson ? stored.contentRevision >= lesson.contentRevision : true;
}

export function StudentOfflineDownloadsSection({
  profileId,
  online,
  refreshKey,
  onSessionExpired,
}: {
  profileId: string;
  online: boolean;
  refreshKey: number;
  onSessionExpired: () => void;
}) {
  const [state, setState] = useState<DownloadsState>({ status: "loading" });
  const [busyLessonId, setBusyLessonId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadDownloads() {
    setActionError(null);
    if (!online) {
      const scope = getActiveOfflineScope(profileId);
      if (!scope) {
        setState({ status: "offline-empty" });
        return;
      }
      try {
        const packages = await listOfflineLessonPackages(profileId, scope.deviceId);
        setState({ status: "ready", lessons: [], packages, catalogAvailable: false });
      } catch {
        setState({ status: "offline-empty" });
      }
      return;
    }

    setState({ status: "loading" });
    try {
      const [lease, catalog] = await Promise.all([
        refreshOfflineLeaseForCurrentSession(profileId),
        listStudentCurriculum(),
      ]);
      setState({
        status: "ready",
        lessons: lessonOptions(catalog),
        packages: await listOfflineLessonPackages(lease.profileId, lease.deviceId),
        catalogAvailable: true,
      });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState({ status: "error", message: error instanceof ApiRequestError ? error.message : "تعذر تحميل التنزيلات. حاول مرة أخرى." });
    }
  }

  useEffect(() => {
    void loadDownloads();
  }, [online, refreshKey, profileId]);

  const packages = state.status === "ready" ? state.packages : [];
  const lessons = state.status === "ready" ? state.lessons : [];
  const packageByLesson = new Map(packages.map((record) => [record.lessonId, record]));
  const availableLessons = lessons.filter((lesson) => !packageByLesson.has(lesson.id));
  const usedBytes = offlineScopeUsageBytes(packages);

  async function downloadLesson(lesson: OfflineLessonOption) {
    if (state.status !== "ready" || busyLessonId || !online) return;
    setBusyLessonId(lesson.id);
    setActionError(null);
    setNotice(null);
    try {
      const replacing = packageByLesson.has(lesson.id);
      const record = await materializeStudentLessonForOffline(profileId, lesson.id);
      setState((current) => current.status === "ready"
        ? { ...current, packages: [record, ...current.packages.filter((item) => item.lessonId !== record.lessonId)] }
        : current);
      setNotice(replacing ? "تم تحديث الدرس المحفوظ." : "تم حفظ الدرس للتعلم بدون إنترنت.");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setActionError(downloadMessage(error));
    } finally {
      setBusyLessonId(null);
    }
  }

  async function removeLesson(record: StoredOfflineLessonPackage) {
    if (busyLessonId) return;
    setBusyLessonId(record.lessonId);
    setActionError(null);
    setNotice(null);
    try {
      await removeStoredOfflineLessonForSession(profileId, record.lessonId);
      setState((current) => current.status === "ready"
        ? { ...current, packages: current.packages.filter((item) => item.lessonId !== record.lessonId) }
        : current);
      setNotice("تمت إزالة الدرس من هذا الجهاز.");
    } catch (error) {
      setActionError(downloadMessage(error));
    } finally {
      setBusyLessonId(null);
    }
  }

  return (
    <main className="student-downloads-experience" aria-labelledby="downloads-title">
      <header className="student-downloads-hero">
        <div>
          <p className="eyebrow">بدون إنترنت</p>
          <h1 id="downloads-title">التنزيلات</h1>
          <p>احفظ الدروس التي تحتاجها لتفتحها لاحقًا حتى عند انقطاع الإنترنت.</p>
        </div>
        {state.status === "ready" ? (
          <div className="downloads-usage" aria-label={`استخدمت ${formatBytes(usedBytes)} من مساحة التنزيلات`}>
            <strong>{packages.length}</strong>
            <span>درس محفوظ</span>
            <small>{formatBytes(usedBytes)} من {formatBytes(OFFLINE_SCOPE_PAYLOAD_BUDGET_BYTES)}</small>
          </div>
        ) : null}
      </header>

      {!online && state.status === "ready" ? (
        <div className="student-b05-state is-warning" role="status">
          <strong>أنت غير متصل الآن</strong>
          <p>يمكنك إدارة الدروس المحفوظة. اتصل بالإنترنت لإضافة تنزيلات جديدة أو تحديثها.</p>
        </div>
      ) : null}
      {actionError ? <div className="form-alert is-danger" role="alert">{actionError}</div> : null}
      {notice ? <div className="form-alert is-success" role="status">{notice}</div> : null}

      {state.status === "loading" ? (
        <div className="student-b05-skeleton" role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">جاري تحميل التنزيلات</span><span /><span /><span />
        </div>
      ) : state.status === "offline-empty" ? (
        <div className="student-b05-state is-warning" role="status">
          <strong>لا يمكن تحميل قائمة التنزيلات الآن</strong>
          <p>اتصل بالإنترنت مرة واحدة لفتح حسابك وتحديث التنزيلات.</p>
        </div>
      ) : state.status === "error" ? (
        <div className="student-b05-state is-error" role="alert">
          <strong>تعذر تحميل التنزيلات</strong>
          <p>{state.message}</p>
          <button className="secondary-button" type="button" onClick={() => void loadDownloads()} disabled={!online}>إعادة المحاولة</button>
        </div>
      ) : (
        <>
          <section className="downloads-section" aria-labelledby="saved-downloads-title">
            <div className="downloads-section__heading">
              <div>
                <p className="eyebrow">على هذا الجهاز</p>
                <h2 id="saved-downloads-title">الدروس المحفوظة</h2>
              </div>
              {online ? <button className="text-button" type="button" onClick={() => void loadDownloads()}>تحديث</button> : null}
            </div>

            {packages.length === 0 ? (
              <div className="student-b05-state is-empty">
                <strong>لم تحفظ أي درس بعد</strong>
                <p>اختر درسًا من القائمة التالية واحفظه للتعلم بدون إنترنت.</p>
              </div>
            ) : (
              <ul className="downloads-list" aria-label="الدروس المحفوظة">
                {packages.map((record) => {
                  const lesson = lessons.find((item) => item.id === record.lessonId);
                  const current = packageCurrent(lesson, record);
                  return (
                    <li key={record.lessonId} data-downloaded-lesson-id={record.lessonId}>
                      <div className="downloads-list__copy">
                        <span className={`downloads-status ${current ? "is-ready" : "is-update"}`}>
                          {current ? "متاح بدون إنترنت" : "يوجد تحديث للدرس"}
                        </span>
                        <strong>{record.title}</strong>
                        <small>{formatBytes(record.totalByteSize)}</small>
                      </div>
                      <div className="downloads-list__actions">
                        {!current && lesson ? (
                          <button className="primary-button" type="button" onClick={() => void downloadLesson(lesson)} disabled={!online || busyLessonId !== null}>
                            {busyLessonId === lesson.id ? "جاري التحديث" : "تحديث الدرس"}
                          </button>
                        ) : null}
                        <button className="secondary-button" type="button" onClick={() => void removeLesson(record)} disabled={busyLessonId !== null}>
                          {busyLessonId === record.lessonId ? "جاري الإزالة" : "إزالة من الجهاز"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {state.catalogAvailable ? (
            <section className="downloads-section" aria-labelledby="available-downloads-title">
              <div className="downloads-section__heading">
                <div>
                  <p className="eyebrow">احفظ للمرة القادمة</p>
                  <h2 id="available-downloads-title">دروس متاحة للتنزيل</h2>
                </div>
              </div>
              {availableLessons.length === 0 ? (
                <div className="student-b05-state is-empty">
                  <strong>{lessons.length === 0 ? "لا توجد دروس متاحة الآن" : "كل الدروس المتاحة محفوظة"}</strong>
                  <p>{lessons.length === 0 ? "ستظهر الدروس هنا عندما تصبح متاحة لحسابك." : "يمكنك إزالة أي درس لم تعد تحتاجه من القائمة أعلاه."}</p>
                </div>
              ) : (
                <ul className="downloads-list downloads-list--available" aria-label="دروس متاحة للتنزيل">
                  {availableLessons.map((lesson) => (
                    <li key={lesson.id} data-downloadable-lesson-id={lesson.id}>
                      <div className="downloads-list__copy">
                        <span className="downloads-context">{lesson.className} · {lesson.subjectName}</span>
                        <strong>{lesson.title}</strong>
                        <small>احفظه لتفتحه عند انقطاع الإنترنت.</small>
                      </div>
                      <button className="primary-button" type="button" onClick={() => void downloadLesson(lesson)} disabled={!online || busyLessonId !== null}>
                        {busyLessonId === lesson.id ? "جاري الحفظ" : "حفظ بدون إنترنت"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
