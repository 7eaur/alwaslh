import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ApiRequestError,
  getStudentLessonReader,
  isMissingSessionError,
  studentAssetContentUrl,
  type StudentLessonReader,
  type StudentReaderAsset,
} from "./auth-api";
import { studentSubjectHref, type StudentLessonContext } from "./student-learning-model";

type ReaderState =
  | { status: "loading" }
  | { status: "ready"; reader: StudentLessonReader }
  | { status: "offline" }
  | { status: "error"; message: string };

function requestMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر فتح الدرس. حاول مرة أخرى.";
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
    return (
      <div className="reader-media-unsupported" role="status">
        <strong>{pageLabel}</strong>
        <p>لا يمكن عرض هذا المحتوى داخل القارئ حاليًا.</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="reader-media-error" role="alert">
        <strong>تعذر عرض {pageLabel}</strong>
        <p>تحقق من اتصالك ثم أعد المحاولة.</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            setFailed(false);
            setRetryVersion((current) => current + 1);
          }}
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    );
  }

  return (
    <figure className="reader-media">
      <img
        src={`${studentAssetContentUrl(asset.id)}?retry=${retryVersion}`}
        alt={pageLabel}
        width={asset.width ?? undefined}
        height={asset.height ?? undefined}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      <figcaption>{pageLabel}</figcaption>
    </figure>
  );
}

export function StudentLessonReaderPage({
  context,
  online,
  onSessionExpired,
}: {
  context: StudentLessonContext;
  online: boolean;
  onSessionExpired: () => void;
}) {
  const { lesson, subject, classRecord } = context;
  const [state, setState] = useState<ReaderState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [speaking, setSpeaking] = useState(false);

  async function loadReader() {
    if (!online) {
      setState({ status: "offline" });
      return;
    }

    setState({ status: "loading" });
    try {
      setState({ status: "ready", reader: await getStudentLessonReader(lesson.id) });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setState({ status: "error", message: requestMessage(error) });
    }
  }

  useEffect(() => {
    setQuery("");
    void loadReader();
  }, [lesson.id, online]);

  useEffect(
    () => () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );

  const reader = state.status === "ready" ? state.reader : null;
  const normalizedQuery = normalizeSearch(query);
  const readableText = reader
    ? [reader.lesson.summary, ...reader.assets.map((asset) => asset.text)].filter(
        (value): value is string => Boolean(value?.trim()),
      )
    : [];
  const speechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function";
  const visibleAssets = reader
    ? normalizedQuery
      ? reader.assets.filter((asset) => normalizeSearch(asset.text ?? "").includes(normalizedQuery))
      : reader.assets
    : [];

  function toggleSpeech() {
    if (!speechSupported || readableText.length === 0) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(readableText.join("\n\n"));
    utterance.lang = "ar";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <article className="reader-shell" aria-labelledby="reader-title">
      <header className="reader-shell__header">
        <div className="reader-shell__context">
          <Link className="reader-back-link" to={studentSubjectHref(subject.id)}>
            <span aria-hidden="true">→</span>
            العودة إلى {subject.name}
          </Link>
          <p>{classRecord.name} · {subject.name}</p>
          <h1 id="reader-title">{lesson.title}</h1>
          {lesson.summary ? <p className="reader-shell__summary">{lesson.summary}</p> : null}
        </div>

        {state.status === "ready" ? (
          <button
            className="secondary-button reader-speech-button"
            type="button"
            onClick={toggleSpeech}
            disabled={!speechSupported || readableText.length === 0}
            aria-pressed={speaking}
          >
            {speaking ? "إيقاف الاستماع" : speechSupported ? "استماع للدرس" : "الاستماع غير متاح"}
          </button>
        ) : null}
      </header>

      {state.status === "loading" ? (
        <div className="reader-skeleton" role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">جاري فتح الدرس</span>
          <span />
          <span />
        </div>
      ) : state.status === "offline" ? (
        <div className="reader-state reader-state--offline" role="status">
          <strong>أنت غير متصل</strong>
          <p>يحتاج هذا الدرس اتصالًا الآن. يمكنك فتح قسم التنزيلات للمحتوى المحفوظ على هذا الجهاز.</p>
          <Link className="secondary-button reader-state__action" to="/app/downloads">
            فتح التنزيلات
          </Link>
        </div>
      ) : state.status === "error" ? (
        <div className="reader-state reader-state--error" role="alert">
          <strong>تعذر فتح الدرس</strong>
          <p>{state.message}</p>
          <button className="secondary-button" type="button" onClick={() => void loadReader()} disabled={!online}>
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="reader-shell__body">
          {state.reader.assets.length > 0 && readableText.length > 0 ? (
            <div className="reader-search">
              <label htmlFor={`reader-search-${lesson.id}`}>بحث داخل الدرس</label>
              <input
                id={`reader-search-${lesson.id}`}
                className="text-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="اكتب كلمة أو عبارة"
              />
            </div>
          ) : null}

          {state.reader.assets.length === 0 ? (
            <div className="empty-state">
              <strong>لا يوجد محتوى للدرس بعد</strong>
              <p>ارجع إلى المادة واختر درسًا آخر.</p>
            </div>
          ) : normalizedQuery && visibleAssets.length === 0 ? (
            <div className="empty-state" role="status">
              <strong>لا توجد نتيجة داخل الدرس</strong>
              <p>جرّب كلمة أخرى أو امسح البحث لعرض جميع الصفحات.</p>
            </div>
          ) : (
            <div className="reader-pages" aria-label={`محتوى ${lesson.title}`}>
              {visibleAssets.map((asset) => (
                <article className="reader-page" key={asset.id} data-reader-asset-id={asset.id}>
                  <ReaderMedia asset={asset} />
                  {asset.text ? (
                    <div className="reader-text">
                      <p>{asset.text}</p>
                    </div>
                  ) : (
                    <div className="reader-text is-muted" role="status">
                      لا يوجد نص لهذه الصفحة.
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
