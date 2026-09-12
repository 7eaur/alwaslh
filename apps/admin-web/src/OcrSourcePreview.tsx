import { useEffect, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "./admin-api";
import { fetchOcrSourcePreview } from "./content-operations-api";

interface Props {
  extractionId: string;
  filename: string | null;
  pageNumber: number | null;
  onSessionExpired: () => void;
}

function previewError(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل صورة المصدر. أعد المحاولة.";
}

export function OcrSourcePreview({ extractionId, filename, pageNumber, onSessionExpired }: Props) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setState("loading");
    setSourceUrl(null);
    setError("");

    void fetchOcrSourcePreview(extractionId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (!active) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setSourceUrl(objectUrl);
        setState("ready");
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (isMissingSessionError(cause)) {
          onSessionExpired();
          return;
        }
        setError(previewError(cause));
        setState("error");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [extractionId, onSessionExpired, retryToken]);

  const pageLabel = pageNumber ? `الصفحة ${pageNumber}` : "صفحة المصدر";
  const alt = filename ? `${pageLabel} من ${filename}` : pageLabel;

  return (
    <figure className="ocr-source-preview" aria-label="المصدر المرئي للنص">
      <figcaption>
        <strong>الصفحة الأصلية</strong>
        <span>{pageLabel}</span>
      </figcaption>
      {state === "loading" ? <div className="ocr-preview-state">جارٍ تحميل الصفحة…</div> : null}
      {state === "error" ? (
        <div className="ocr-preview-state" role="alert">
          <span>{error}</span>
          <button className="secondary-button small-button" type="button" onClick={() => setRetryToken((value) => value + 1)}>
            إعادة المحاولة
          </button>
        </div>
      ) : null}
      {state === "ready" && sourceUrl ? (
        <div className="ocr-source-preview-frame">
          <img src={sourceUrl} alt={alt} data-testid="ocr-source-preview" />
        </div>
      ) : null}
    </figure>
  );
}
