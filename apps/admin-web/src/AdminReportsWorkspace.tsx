import { useCallback, useEffect, useState } from "react";
import {
  ApiRequestError,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "./admin-api";
import {
  type FullAccessCodeImportError,
  fetchAllAccessCodesForExport,
  importFullAccessCodes,
} from "./admin-access-files-api";
import type {
  AdminAccessCode,
  AdminAccessCodeStatus,
  AdminAccessCodeType,
} from "./admin-student-access-api";
import {
  type CsvRowError,
  buildAccessCodesCsv,
  fullAccessCodeImportTemplate,
  parseFullAccessCodeCsv,
} from "./access-code-files";
import "./admin-reports.css";

type Feedback = { kind: "busy" | "success" | "error"; message: string } | null;

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة.";
}

function downloadText(filename: string, text: string, type: string): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function statusLabel(status: AdminAccessCodeStatus): string {
  return {
    active: "نشط",
    redeemed: "مستخدم",
    expired: "منتهي",
    revoked: "موقوف",
  }[status];
}

function typeLabel(type: AdminAccessCodeType): string {
  return type === "full_access" ? "وصول شامل" : "وصول صف";
}

export function AdminReportsWorkspace({
  onSessionExpired,
}: {
  onSessionExpired: () => void;
}) {
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [importRows, setImportRows] = useState<
    Array<{ rowNumber: number; code: string; durationDays: number }>
  >([]);
  const [localErrors, setLocalErrors] = useState<CsvRowError[]>([]);
  const [serverErrors, setServerErrors] = useState<FullAccessCodeImportError[]>([]);
  const [importSummary, setImportSummary] = useState<{
    received: number;
    imported: number;
    rejected: number;
  } | null>(null);
  const [type, setType] = useState<AdminAccessCodeType>("full_access");
  const [status, setStatus] = useState<AdminAccessCodeStatus | "">("");
  const [classId, setClassId] = useState("");
  const [printCodes, setPrintCodes] = useState<AdminAccessCode[]>([]);
  const [printRequested, setPrintRequested] = useState(false);

  const handleError = useCallback(
    (error: unknown) => {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return true;
      }
      return false;
    },
    [onSessionExpired],
  );

  useEffect(() => {
    void fetchAdminCurriculum()
      .then((curriculum) => {
        setClasses(
          curriculum.classes
            .filter((item) => item.status === "active")
            .map((item) => ({ id: item.id, name: item.name })),
        );
      })
      .catch((error) => {
        if (!handleError(error)) setFeedback({ kind: "error", message: errorMessage(error) });
      });
  }, [handleError]);

  useEffect(() => {
    if (!printRequested || printCodes.length === 0) return;
    const frame = requestAnimationFrame(() => {
      window.print();
      setPrintRequested(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [printCodes, printRequested]);

  async function readImportFile(file: File | undefined): Promise<void> {
    setSelectedFileName(file?.name ?? "");
    setImportRows([]);
    setLocalErrors([]);
    setServerErrors([]);
    setImportSummary(null);
    setFeedback(null);
    if (!file) return;

    try {
      const parsed = parseFullAccessCodeCsv(await file.text());
      setImportRows(parsed.rows);
      setLocalErrors(parsed.errors);
      if (parsed.rows.length === 0) {
        setFeedback({ kind: "error", message: "لا توجد صفوف صالحة للإرسال إلى الخادم." });
      }
    } catch (error) {
      setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  async function runImport(): Promise<void> {
    if (importRows.length === 0) return;
    setFeedback({ kind: "busy", message: "جارٍ التحقق من الأكواد وإضافتها…" });
    try {
      const result = await importFullAccessCodes(importRows);
      setServerErrors(result.errors);
      setImportSummary({
        received: result.summary.received + localErrors.length,
        imported: result.summary.imported,
        rejected: result.summary.rejected + localErrors.length,
      });
      setFeedback({
        kind: "success",
        message: `اكتمل الاستيراد: ${result.summary.imported} كود مضاف و${result.summary.rejected + localErrors.length} صف مرفوض.`,
      });
    } catch (error) {
      if (!handleError(error)) setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  function downloadTemplate(): void {
    downloadText(
      "alwaslh-full-access-import-template.csv",
      fullAccessCodeImportTemplate(),
      "text/csv;charset=utf-8",
    );
  }

  function exportScope() {
    return {
      type,
      ...(status ? { status } : {}),
      ...(type === "class_access" && classId ? { classId } : {}),
    };
  }

  async function exportCsv(): Promise<void> {
    setFeedback({ kind: "busy", message: "جارٍ تجهيز جميع الأكواد المطابقة…" });
    try {
      const codes = await fetchAllAccessCodesForExport(exportScope());
      if (codes.length === 0) {
        setFeedback({ kind: "error", message: "لا توجد أكواد مطابقة للتصدير." });
        return;
      }
      downloadText(
        `alwaslh-${type}-${status || "all"}.csv`,
        buildAccessCodesCsv(codes),
        "text/csv;charset=utf-8",
      );
      setFeedback({ kind: "success", message: `تم تجهيز ${codes.length} كود في ملف CSV متوافق مع Excel.` });
    } catch (error) {
      if (!handleError(error)) setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  async function preparePrint(): Promise<void> {
    setFeedback({ kind: "busy", message: "جارٍ تجهيز بطاقات الطباعة…" });
    try {
      const codes = await fetchAllAccessCodesForExport(exportScope());
      if (codes.length === 0) {
        setFeedback({ kind: "error", message: "لا توجد أكواد مطابقة للطباعة." });
        return;
      }
      setPrintCodes(codes);
      setPrintRequested(true);
      setFeedback({ kind: "success", message: `تم تجهيز ${codes.length} بطاقة للطباعة أو الحفظ بصيغة PDF من المتصفح.` });
    } catch (error) {
      if (!handleError(error)) setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  const allErrors = [
    ...localErrors.map((error) => ({
      rowNumber: error.rowNumber,
      message: error.message,
      code: "—",
    })),
    ...serverErrors.map((error) => ({
      rowNumber: error.rowNumber,
      message: error.message,
      code: error.code,
    })),
  ].sort((left, right) => left.rowNumber - right.rowNumber);

  return (
    <section className="admin-reports-workspace">
      <header className="page-header reports-page-header">
        <div>
          <p className="eyebrow">Stage 13G · الملفات والتشغيل</p>
          <h1>الملفات والتقارير</h1>
          <p className="page-description">
            استيراد أكواد الوصول الشامل بتقرير أخطاء صفّي، وتصدير المخزون المفلتر، وتجهيز بطاقات RTL
            للطباعة دون إنشاء سلطة بيانات ثانية.
          </p>
        </div>
      </header>

      {feedback && (
        <div className={`mutation-feedback is-${feedback.kind}`} aria-live="polite">
          {feedback.message}
        </div>
      )}

      <section className="reports-section" aria-labelledby="import-heading">
        <div className="reports-section-heading">
          <div>
            <p className="section-kicker">Full Access</p>
            <h2 id="import-heading">استيراد أكواد الوصول الشامل</h2>
            <p>CSV UTF‑8 متوافق مع Excel. الكود ستة أرقام ويجب الحفاظ على الصفر في البداية.</p>
          </div>
          <button className="secondary-button" type="button" onClick={downloadTemplate}>
            تنزيل قالب CSV
          </button>
        </div>

        <div className="import-panel">
          <label className="file-field">
            <span>ملف CSV</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => void readImportFile(event.target.files?.[0])}
            />
          </label>
          {selectedFileName && (
            <div className="import-file-summary" aria-live="polite">
              <strong>{selectedFileName}</strong>
              <span>{importRows.length} صف جاهز للإرسال</span>
              <span>{localErrors.length} خطأ بنيوي محلي</span>
            </div>
          )}
          <button
            className="primary-button"
            type="button"
            disabled={importRows.length === 0 || feedback?.kind === "busy"}
            onClick={() => void runImport()}
          >
            استيراد الصفوف الصالحة
          </button>
        </div>

        {importSummary && (
          <div className="import-result-summary" aria-label="ملخص الاستيراد">
            <span>المستلم <strong>{importSummary.received}</strong></span>
            <span>المضاف <strong>{importSummary.imported}</strong></span>
            <span>المرفوض <strong>{importSummary.rejected}</strong></span>
          </div>
        )}

        {allErrors.length > 0 && (
          <div className="import-error-list" aria-label="أخطاء صفوف الاستيراد">
            <h3>الصفوف التي تحتاج تصحيحًا</h3>
            {allErrors.map((error) => (
              <div className="import-error-row" key={`${error.rowNumber}-${error.code}-${error.message}`}>
                <strong>صف {error.rowNumber}</strong>
                <code>{error.code}</code>
                <span>{error.message}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="reports-section" aria-labelledby="export-heading">
        <div className="reports-section-heading">
          <div>
            <p className="section-kicker">Export / Print</p>
            <h2 id="export-heading">تصدير وطباعة أكواد الوصول</h2>
            <p>النطاق نفسه يُستخدم للتصدير وبطاقات الطباعة، ولا يتم إخفاء أو اقتطاع صفحات النتائج.</p>
          </div>
        </div>

        <form className="report-scope-form" aria-label="نطاق تصدير أكواد الوصول">
          <label>
            <span>نوع الكود</span>
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value as AdminAccessCodeType);
                setClassId("");
              }}
            >
              <option value="full_access">وصول شامل</option>
              <option value="class_access">وصول صف</option>
            </select>
          </label>
          <label>
            <span>الحالة</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as AdminAccessCodeStatus | "")}>
              <option value="">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="redeemed">مستخدم</option>
              <option value="expired">منتهي</option>
              <option value="revoked">موقوف</option>
            </select>
          </label>
          {type === "class_access" && (
            <label>
              <span>الصف</span>
              <select value={classId} onChange={(event) => setClassId(event.target.value)}>
                <option value="">كل الصفوف</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          )}
          <div className="report-actions">
            <button className="primary-button" type="button" onClick={() => void exportCsv()}>
              تصدير CSV متوافق مع Excel
            </button>
            <button className="secondary-button" type="button" onClick={() => void preparePrint()}>
              طباعة البطاقات
            </button>
          </div>
        </form>
      </section>

      <section className="access-print-sheet" aria-label="بطاقات أكواد الوصول للطباعة">
        <header>
          <strong>الوسيلة الذكية</strong>
          <span>{typeLabel(type)} · {status ? statusLabel(status) : "كل الحالات"}</span>
        </header>
        <div className="print-code-grid">
          {printCodes.map((code) => (
            <article className="print-code-card" key={code.id}>
              <span>{code.type === "class_access" ? code.className || "وصول صف" : "وصول شامل"}</span>
              <code>{code.code}</code>
              <small>{statusLabel(code.status)} · {code.entitlementDurationDays} يوم</small>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
