import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getStudentLessonReader,
  isMissingSessionError,
  studentAssetContentUrl,
  type StudentLessonReader,
  type StudentReaderAsset,
} from "./auth-api";
import {
  loadUsableOfflineLessonPackage,
  type StoredOfflineLessonAsset,
  type StoredOfflineLessonPackage,
} from "./offline-content-store";
import { getActiveOfflineScope } from "./offline-session";
import { studentErrorMessage } from "./student-error-copy";
import { studentSubjectHref, type StudentLessonContext } from "./student-learning-model";

type ReaderState =
  | { status: "loading" }
  | { status: "ready"; reader: StudentLessonReader }
  | { status: "offline" }
  | { status: "error"; message: string };

type OfflineReaderState =
  | { status: "loading" }
  | { status: "ready"; lesson: StoredOfflineLessonPackage }
  | { status: "unavailable" };

function requestMessage(error: unknown): string {
  return studentErrorMessage(error, "reader");
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("ar");
}

function ReaderMedia({ asset }: { asset: StudentReaderAsset }) {
  const [failed, setFailed] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const isImage = asset.mimeType.startsWith("image/");
  const pageLabel = asset.sourcePageNumber ? `صفحة ${asset.sourcePageNumber}` : `محتوى ${asset.position + 1}`;

  if (!isImage) {
    return <div className="reader-media-unsupported" role="status"><strong>{pageLabel}</strong><p>لا يمكن عرض هذا المحتوى داخل القارئ حاليًا.</p></div>;
  }

  if (failed) {
    return (
      <div className="reader-media-error" role="alert">
        <strong>تعذر عرض {pageLabel}</strong><p>تحقق من اتصالك ثم أعد المحاولة.</p>
        <button className="secondary-button" type="button" onClick={() => { setFailed(false); setRetryVersion((current) => current + 1); }}>إعادة تحميل الصفحة</button>
      </div>
    );
  }

  return (
    <figure className="reader-media">
      <img src={`${studentAssetContentUrl(asset.id)}?retry=${retryVersion}`} alt={pageLabel} width={asset.width ?? undefined} height={asset.height ?? undefined} loading="lazy" onError={() => setFailed(true)} />
      <figcaption>{pageLabel}</figcaption>
    </figure>
  );
}

function StoredReaderMedia({ asset }: { asset: StoredOfflineLessonAsset }) {
  const [source, setSource] = useState<string | null>(null);
  const isImage = asset.mimeType.startsWith("image/");
  const pageLabel = asset.sourcePageNumber ? `صفحة ${asset.sourcePageNumber}` : `محتوى ${asset.position + 1}`;

  useEffect(() => {
    if (!isImage) return;
    const objectUrl = URL.createObjectURL(asset.blob);
    setSource(objectUrl);
    return () => {
      setSource(null);
      URL.revokeObjectURL(objectUrl);
    };
  }, [asset.blob, isImage]);

  if (!isImage) {
    return <div className="reader-media-unsupported" role="status"><strong>{pageLabel}</strong><p>لا يمكن عرض هذا المحتوى داخل القارئ حاليًا.</p></div>;
  }

  if (!source) {
    return <div className="reader-media" role="status" aria-live="polite"><span className="sr-only">جاري تجهيز {pageLabel}</span></div>;
  }

  return (
    <figure className="reader-media">
      <img src={source} alt={pageLabel} width={asset.width ?? undefined} height={asset.height ?? undefined} loading="lazy" />
      <figcaption>{pageLabel}</figcaption>
    </figure>
  );
}

export function StudentOfflineLessonReaderPage({ lessonId }: { lessonId: string }) {
  const [state, setState] = useState<OfflineReaderState>({ status: "loading" });

  useEffect(() => {
    let current = true;
    void (async () => {
      const scope = getActiveOfflineScope();
      if (!scope) {
        if (current) setState({ status: "unavailable" });
        return;
      }
      try {
        const lesson = await loadUsableOfflineLessonPackage(scope.profileId, scope.deviceId, lessonId);
        if (current) setState(lesson ? { status: "ready", lesson } : { status: "unavailable" });
      } catch {
        if (current) setState({ status: "unavailable" });
      }
    })();
    return () => { current = false; };
  }, [lessonId]);

  if (state.status === "loading") {
    return <div className="reader-skeleton" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">جاري فتح الدرس المحفوظ</span><span /><span /></div>;
  }

  if (state.status === "unavailable") {
    return (
      <div className="reader-state reader-state--offline" role="status">
        <strong>هذا الدرس المحفوظ غير متاح الآن</strong>
        <p>قد يحتاج إلى تحديث أو إعادة اتصال للتأكد من استمرار وصولك. لن نعرض نسخة لا يمكن التحقق منها.</p>
        <Link className="secondary-button reader-state__action" to="/app/library/downloads">العودة إلى التنزيلات</Link>
      </div>
    );
  }

  const lesson = state.lesson;
  return (
    <article className="reader-shell" aria-labelledby="reader-title" data-offline-reader="ready">
      <header className="reader-shell__header">
        <div className="reader-shell__context">
          <Link className="reader-back-link" to="/app/library/downloads"><span aria-hidden="true">→</span>العودة إلى التنزيلات</Link>
          <p>محفوظ على هذا الجهاز · بدون إنترنت</p>
          <h1 id="reader-title">{lesson.title}</h1>
          {lesson.summary ? <p className="reader-shell__summary">{lesson.summary}</p> : null}
        </div>
      </header>
      <div className="reader-shell__body">
        {lesson.assets.length === 0 ? (
          <div className="empty-state"><strong>لا يوجد محتوى محفوظ لهذا الدرس</strong><p>اتصل بالإنترنت ثم حدّث تنزيل الدرس.</p></div>
        ) : (
          <div className="reader-pages" aria-label={`محتوى ${lesson.title}`}>
            {lesson.assets.map((asset) => (
              <article className="reader-page" key={asset.id} data-reader-asset-id={asset.id}>
                <StoredReaderMedia asset={asset} />
                {asset.text ? <div className="reader-text"><p>{asset.text}</p></div> : <div className="reader-text is-muted" role="status">لا يوجد نص لهذه الصفحة.</div>}
              </article>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function StudentLessonReaderPage({ context, online, onSessionExpired }: {
  context: StudentLessonContext;
  online: boolean;
  onSessionExpired: () => void;
}) {
  const { lesson, subject, classRecord } = context;
  const [state, setState] = useState<ReaderState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const firstSearchResultRef = useRef<HTMLElement | null>(null);

  async function loadReader() {
    if (!online) { setState({ status: "offline" }); return; }
    setState({ status: "loading" });
    try {
      setState({ status: "ready", reader: await getStudentLessonReader(lesson.id) });
    } catch (error) {
      if (isMissingSessionError(error)) { onSessionExpired(); return; }
      setState({ status: "error", message: requestMessage(error) });
    }
  }

  useEffect(() => { setQuery(""); void loadReader(); }, [lesson.id, online]);
  useEffect(() => () => { if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);

  const reader = state.status === "ready" ? state.reader : null;
  const normalizedQuery = normalizeSearch(query);
  const readableText = reader ? [reader.lesson.summary, ...reader.assets.map((asset) => asset.text)].filter((value): value is string => Boolean(value?.trim())) : [];
  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  const visibleAssets = reader ? normalizedQuery ? reader.assets.filter((asset) => normalizeSearch(asset.text ?? "").includes(normalizedQuery)) : reader.assets : [];

  function toggleSpeech() {
    if (!speechSupported || readableText.length === 0) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(readableText.join("\n\n"));
    utterance.lang = "ar";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function focusFirstSearchResult() {
    if (!normalizedQuery || visibleAssets.length === 0) return;
    firstSearchResultRef.current?.focus();
  }

  return (
    <article className="reader-shell" aria-labelledby="reader-title">
      <header className="reader-shell__header">
        <div className="reader-shell__context">
          <Link className="reader-back-link" to={studentSubjectHref(subject.id)}><span aria-hidden="true">→</span>العودة إلى {subject.name}</Link>
          <p>{classRecord.name} · {subject.name}</p>
          <h1 id="reader-title">{lesson.title}</h1>
          {lesson.summary ? <p className="reader-shell__summary">{lesson.summary}</p> : null}
        </div>
        {state.status === "ready" ? <button className="secondary-button reader-speech-button" type="button" onClick={toggleSpeech} disabled={!speechSupported || readableText.length === 0} aria-pressed={speaking}>{speaking ? "إيقاف الاستماع" : speechSupported ? "استماع للدرس" : "الاستماع غير متاح"}</button> : null}
      </header>

      {state.status === "loading" ? (
        <div className="reader-skeleton" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">جاري فتح الدرس</span><span /><span /></div>
      ) : state.status === "offline" ? (
        <div className="reader-state reader-state--offline" role="status"><strong>أنت غير متصل</strong><p>إذا سبق أن حفظت هذا الدرس فافتحه من التنزيلات.</p><Link className="secondary-button reader-state__action" to="/app/library/downloads">فتح التنزيلات</Link></div>
      ) : state.status === "error" ? (
        <div className="reader-state reader-state--error" role="alert"><strong>تعذر فتح الدرس</strong><p>{state.message}</p><button className="secondary-button" type="button" onClick={() => void loadReader()} disabled={!online}>إعادة المحاولة</button></div>
      ) : (
        <div className="reader-shell__body">
          {state.reader.assets.length > 0 && readableText.length > 0 ? (
            <div className="reader-search">
              <label htmlFor={`reader-search-${lesson.id}`}>بحث داخل الدرس</label>
              <input id={`reader-search-${lesson.id}`} className="text-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); focusFirstSearchResult(); } }} placeholder="اكتب كلمة أو عبارة" aria-describedby={normalizedQuery ? `reader-search-status-${lesson.id}` : undefined} />
              {normalizedQuery ? (
                <div className="reader-search__status" id={`reader-search-status-${lesson.id}`} aria-live="polite">
                  <span>{visibleAssets.length === 0 ? "لا توجد نتائج" : `${visibleAssets.length} نتيجة`}</span>
                  {visibleAssets.length > 0 ? <button className="text-button" type="button" onClick={focusFirstSearchResult}>الانتقال إلى أول نتيجة</button> : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {state.reader.assets.length === 0 ? (
            <div className="empty-state"><strong>لا يوجد محتوى للدرس بعد</strong><p>ارجع إلى المادة واختر درسًا آخر.</p></div>
          ) : normalizedQuery && visibleAssets.length === 0 ? (
            <div className="empty-state" role="status"><strong>لا توجد نتيجة داخل الدرس</strong><p>جرّب كلمة أخرى أو امسح البحث لعرض جميع الصفحات.</p></div>
          ) : (
            <div className="reader-pages" aria-label={`محتوى ${lesson.title}`}>
              {visibleAssets.map((asset, index) => (
                <article className="reader-page" key={asset.id} data-reader-asset-id={asset.id} tabIndex={normalizedQuery && index === 0 ? -1 : undefined} ref={normalizedQuery && index === 0 ? firstSearchResultRef : undefined}>
                  <ReaderMedia asset={asset} />
                  {asset.text ? <div className="reader-text"><p>{asset.text}</p></div> : <div className="reader-text is-muted" role="status">لا يوجد نص لهذه الصفحة.</div>}
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
