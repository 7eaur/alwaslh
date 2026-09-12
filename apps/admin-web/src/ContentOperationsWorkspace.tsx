import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiRequestError, isMissingSessionError } from "./admin-api";
import {
  type ContentDocumentDetail,
  type ContentDocumentKind,
  type ContentOperationsOverview,
  type OcrExtractionDetail,
  fetchContentDocument,
  fetchContentOperations,
  fetchOcrExtraction,
  reviewOcrExtraction,
} from "./content-operations-api";
import "./content-operations.css";
import { OcrSourcePreview } from "./OcrSourcePreview";

interface Props {
  onSessionExpired: () => void;
}

interface Filters {
  classSlug: string;
  subjectSlug: string;
  kind: "" | ContentDocumentKind;
  query: string;
}

const PAGE_SIZE = 30;

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال العملية. أعد المحاولة.";
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function mediaLabel(status: "processing" | "ready" | "failed"): string {
  if (status === "ready") return "جاهزة";
  if (status === "failed") return "تعذر تجهيزها";
  return "قيد التجهيز";
}

function reviewLabel(status: string): string {
  if (status === "pending") return "بانتظار المراجعة";
  if (status === "approved") return "معتمد";
  if (status === "rejected") return "مرفوض";
  return "لا يحتاج مراجعة";
}

function reviewReasonLabel(reason: string): string {
  if (reason === "low_confidence") return "دقة الاستخراج منخفضة وتحتاج تحققًا بشريًا.";
  if (reason === "empty_text") return "لم يُستخرج نص واضح من الصفحة.";
  return "هذه النتيجة تحتاج مراجعة بشرية قبل اعتمادها.";
}

export function ContentOperationsWorkspace({ onSessionExpired }: Props) {
  const [overview, setOverview] = useState<ContentOperationsOverview | null>(null);
  const [filters, setFilters] = useState<Filters>({ classSlug: "", subjectSlug: "", kind: "", query: "" });
  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<ContentDocumentDetail | null>(null);
  const [detailState, setDetailState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [detailError, setDetailError] = useState("");
  const [ocr, setOcr] = useState<OcrExtractionDetail | null>(null);
  const [ocrState, setOcrState] = useState<"idle" | "loading" | "ready" | "saving" | "error">("idle");
  const [ocrError, setOcrError] = useState("");
  const [replacementText, setReplacementText] = useState("");

  const handleError = useCallback(
    (cause: unknown, setter: (value: string) => void) => {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setter(messageFor(cause));
    },
    [onSessionExpired],
  );

  const loadOverview = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const result = await fetchContentOperations({
        ...(appliedFilters.classSlug ? { classSlug: appliedFilters.classSlug } : {}),
        ...(appliedFilters.subjectSlug ? { subjectSlug: appliedFilters.subjectSlug } : {}),
        ...(appliedFilters.kind ? { kind: appliedFilters.kind } : {}),
        ...(appliedFilters.query.trim() ? { query: appliedFilters.query.trim() } : {}),
        limit: PAGE_SIZE,
        offset,
      });
      setOverview(result);
      setState("ready");
    } catch (cause) {
      setState("error");
      handleError(cause, setError);
    }
  }, [appliedFilters, handleError, offset]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const openDocument = useCallback(
    async (documentId: string) => {
      setDetailState("loading");
      setDetailError("");
      setOcr(null);
      setOcrState("idle");
      try {
        const result = await fetchContentDocument(documentId);
        setDetail(result);
        setDetailState("ready");
      } catch (cause) {
        setDetailState("error");
        handleError(cause, setDetailError);
      }
    },
    [handleError],
  );

  const openOcr = useCallback(
    async (extractionId: string) => {
      setOcrState("loading");
      setOcrError("");
      try {
        const result = await fetchOcrExtraction(extractionId);
        setOcr(result);
        setReplacementText(result.normalizedText ?? result.rawText ?? "");
        setOcrState("ready");
      } catch (cause) {
        setOcrState("error");
        handleError(cause, setOcrError);
      }
    },
    [handleError],
  );

  const review = useCallback(
    async (decision: "approved" | "rejected") => {
      if (!ocr) return;
      setOcrState("saving");
      setOcrError("");
      try {
        const result = await reviewOcrExtraction(
          ocr.id,
          decision,
          decision === "approved" ? replacementText : undefined,
        );
        setOcr(result);
        setReplacementText(result.normalizedText ?? result.rawText ?? "");
        setOcrState("ready");

        if (detail) {
          try {
            const refreshedDetail = await fetchContentDocument(detail.document.id);
            setDetail(refreshedDetail);
            setDetailState("ready");
            setDetailError("");
          } catch (cause) {
            setDetailState("error");
            handleError(cause, setDetailError);
          }
        }
        await loadOverview();
      } catch (cause) {
        setOcrState("error");
        handleError(cause, setOcrError);
      }
    },
    [detail, handleError, loadOverview, ocr, replacementText],
  );

  const canGoNext = useMemo(() => {
    if (!overview) return false;
    return overview.pagination.offset + overview.documents.length < overview.pagination.total;
  }, [overview]);

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
    setDetail(null);
    setDetailState("idle");
    setOcr(null);
    setOcrState("idle");
  }

  return (
    <section className="content-ops" aria-labelledby="content-ops-title">
      <header className="page-header">
        <div>
          <p className="eyebrow">مراجعات المحتوى</p>
          <h1 id="content-ops-title">مراجعة النصوص من الصفحات</h1>
          <p className="page-description">
            راجع الصفحة الأصلية بجانب النص المستخرج، صحح النص عند الحاجة، ثم اعتمد النتيجة أو ارفضها. النشر للطلاب يبقى قرارًا مستقلًا.
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void loadOverview()} disabled={state === "loading"}>
          تحديث
        </button>
      </header>

      {overview ? (
        <div className="metric-grid content-metrics" aria-label="ملخص مراجعة المحتوى">
          <Metric label="المصادر" value={overview.summary.documentCount} />
          <Metric label="الصفحات" value={overview.summary.assetCount} />
          <Metric label="جاهزة" value={overview.summary.readyMediaCount} />
          <Metric label="تعذر تجهيزها" value={overview.summary.failedMediaCount} />
          <Metric label="نصوص للمراجعة" value={overview.summary.pendingOcrCount} />
        </div>
      ) : null}

      <form className="content-filter-bar" onSubmit={submitFilters} aria-label="فلترة مصادر المحتوى">
        <label>
          <span>بحث</span>
          <input
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="عنوان المصدر أو الصف أو المادة"
          />
        </label>
        <label>
          <span>الصف</span>
          <select
            value={filters.classSlug}
            onChange={(event) => setFilters((current) => ({ ...current, classSlug: event.target.value }))}
          >
            <option value="">الكل</option>
            {overview?.facets.classes.map((facet) => (
              <option key={facet.slug} value={facet.slug}>
                {facet.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>المادة</span>
          <select
            value={filters.subjectSlug}
            onChange={(event) => setFilters((current) => ({ ...current, subjectSlug: event.target.value }))}
          >
            <option value="">الكل</option>
            {overview?.facets.subjects.map((facet) => (
              <option key={facet.slug} value={facet.slug}>
                {facet.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>نوع المصدر</span>
          <select
            value={filters.kind}
            onChange={(event) => setFilters((current) => ({ ...current, kind: event.target.value as Filters["kind"] }))}
          >
            <option value="">الكل</option>
            <option value="textbook">كتاب</option>
            <option value="government_exam">اختبار وزاري</option>
          </select>
        </label>
        <button className="primary-button" type="submit">
          تطبيق
        </button>
      </form>

      {state === "loading" ? <StatePanel title="جارٍ تحميل المحتوى" body="نقرأ حالة المصادر والمراجعات من الخادم." /> : null}
      {state === "error" ? <StatePanel title="تعذر تحميل المحتوى" body={error} /> : null}
      {state === "ready" && overview?.documents.length === 0 ? (
        <StatePanel title="لا توجد نتائج" body="غيّر الفلاتر أو البحث لعرض مصادر أخرى." />
      ) : null}

      {state === "ready" && overview && overview.documents.length > 0 ? (
        <div className="content-documents" aria-label="مصادر المحتوى">
          {overview.documents.map((document) => (
            <article className="content-document-card" key={document.id}>
              <div>
                <div className="content-document-meta">
                  <span>{document.className}</span>
                  <span>•</span>
                  <span>{document.subjectName}</span>
                  <span className="status-badge">{document.kind === "textbook" ? "كتاب" : "اختبار وزاري"}</span>
                </div>
                <h2>{document.title}</h2>
              </div>
              <dl className="content-counts">
                <div>
                  <dt>الصفحات</dt>
                  <dd>{document.assetCount}</dd>
                </div>
                <div>
                  <dt>جاهز</dt>
                  <dd>{document.readyMediaCount}</dd>
                </div>
                <div>
                  <dt>فشل</dt>
                  <dd>{document.failedMediaCount}</dd>
                </div>
                <div>
                  <dt>للمراجعة</dt>
                  <dd>{document.pendingOcrCount}</dd>
                </div>
              </dl>
              <button className="secondary-button small-button" type="button" onClick={() => void openDocument(document.id)}>
                فتح الصفحات
              </button>
            </article>
          ))}
          <div className="pagination-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}
            >
              السابق
            </button>
            <span>
              {overview.pagination.offset + 1}–{overview.pagination.offset + overview.documents.length} من {overview.pagination.total}
            </span>
            <button
              className="secondary-button"
              type="button"
              disabled={!canGoNext}
              onClick={() => setOffset((value) => value + PAGE_SIZE)}
            >
              التالي
            </button>
          </div>
        </div>
      ) : null}

      <section className="content-detail-panel" aria-live="polite">
        {detailState === "loading" ? (
          <StatePanel title="جارٍ تحميل الصفحات" body="نقرأ ترتيب الصفحات وحالة تجهيزها والنصوص التي تحتاج مراجعة." />
        ) : null}
        {detailState === "error" ? <StatePanel title="تعذر تحميل التفاصيل" body={detailError} /> : null}
        {detailState === "ready" && detail ? (
          <>
            <div className="content-detail-heading">
              <div>
                <p className="section-kicker">صفحات المصدر</p>
                <h2>{detail.document.title}</h2>
              </div>
              <button
                className="secondary-button small-button"
                type="button"
                onClick={() => {
                  setDetail(null);
                  setDetailState("idle");
                  setOcr(null);
                  setOcrState("idle");
                }}
              >
                إغلاق
              </button>
            </div>
            <div className="asset-list">
              {detail.assets.map((asset) => (
                <article className="asset-row" key={asset.id}>
                  <div className="asset-order">{asset.position + 1}</div>
                  <div className="asset-main">
                    <strong>{asset.filename}</strong>
                    <small>{formatBytes(asset.byteSize)}</small>
                    {asset.media ? (
                      <div className="asset-status-line">
                        <span className={`status-badge media-${asset.media.status}`}>{mediaLabel(asset.media.status)}</span>
                        {asset.media.sourcePageNumber ? <span>صفحة {asset.media.sourcePageNumber}</span> : null}
                      </div>
                    ) : (
                      <span className="status-badge">لم تُجهز بعد</span>
                    )}
                    {asset.media?.lastErrorMessage ? <p className="asset-error">{asset.media.lastErrorMessage}</p> : null}
                  </div>
                  <div className="ocr-list">
                    {asset.media?.ocrExtractions.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className={`ocr-chip review-${entry.reviewStatus}`}
                        onClick={() => void openOcr(entry.id)}
                      >
                        <span>{reviewLabel(entry.reviewStatus)}</span>
                        <small>
                          {entry.meanConfidence === null ? "تحتاج تحققًا" : `دقة تقريبية ${entry.meanConfidence.toFixed(1)}%`}
                        </small>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>

      {ocrState !== "idle" ? (
        <section className="ocr-review-panel" aria-live="polite" aria-labelledby="ocr-review-title">
          {ocrState === "loading" ? (
            <StatePanel title="جارٍ فتح المراجعة" body="نحمّل النص وبيانات الصفحة التي ستراجعها." />
          ) : null}
          {ocrState === "error" && !ocr ? <StatePanel title="تعذر فتح المراجعة" body={ocrError} /> : null}
          {ocr ? (
            <>
              <div className="content-detail-heading">
                <div>
                  <p className="section-kicker">مراجعة النص</p>
                  <h2 id="ocr-review-title">{ocr.source.filename ?? "صفحة المحتوى"}</h2>
                </div>
                <span className={`status-badge review-${ocr.reviewStatus}`}>{reviewLabel(ocr.reviewStatus)}</span>
              </div>
              <div className="ocr-review-grid">
                <OcrSourcePreview
                  extractionId={ocr.id}
                  filename={ocr.source.filename}
                  pageNumber={ocr.source.sourcePageNumber}
                  onSessionExpired={onSessionExpired}
                />
                <div className="ocr-text-review">
                  <div>
                    <h3>النص المستخرج</h3>
                    <pre className="ocr-source-text">{ocr.rawText || "لا يوجد نص مستخرج"}</pre>
                  </div>
                  <label>
                    <span>النص بعد المراجعة</span>
                    <textarea
                      rows={12}
                      value={replacementText}
                      onChange={(event) => setReplacementText(event.target.value)}
                      disabled={ocr.reviewStatus !== "pending" || ocrState === "saving"}
                    />
                  </label>
                </div>
              </div>
              {ocr.reviewReason ? <p className="ocr-review-reason">{reviewReasonLabel(ocr.reviewReason)}</p> : null}
              {ocrError ? <p className="form-error">{ocrError}</p> : null}
              {ocr.reviewStatus === "pending" ? (
                <div className="ocr-review-actions">
                  <button
                    className="primary-button"
                    type="button"
                    disabled={ocrState === "saving"}
                    onClick={() => void review("approved")}
                  >
                    اعتماد النص
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={ocrState === "saving"}
                    onClick={() => void review("rejected")}
                  >
                    رفض النتيجة
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatePanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="content-state">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}
