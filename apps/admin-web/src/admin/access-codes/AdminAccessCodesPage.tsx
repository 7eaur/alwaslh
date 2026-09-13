import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError, fetchAdminCurriculum, isMissingSessionError } from "../../admin-api";
import {
  type AdminAccessCode,
  type AdminAccessCodeSort,
  type AdminAccessCodeStatus,
  type AdminAccessCodeType,
  fetchAdminAccessCodes,
  generateClassAccessCodes,
  generateFullAccessCodes,
  revokeUnusedAccessCodes,
} from "../../admin-student-access-api";
import "../../admin-student-access.css";

const PAGE_SIZE = 25;
type LoadState = "loading" | "ready" | "error";
type Feedback = { kind: "busy" | "success" | "error"; message: string } | null;

const dateFormatter = new Intl.DateTimeFormat("ar-YE", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة.";
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "نشط",
    redeemed: "مستخدم",
    expired: "منتهي",
    revoked: "موقوف",
  };
  return labels[status] ?? status;
}

export function AdminAccessCodesPage({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [type, setType] = useState<AdminAccessCodeType>("full_access");
  const [status, setStatus] = useState<AdminAccessCodeStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [sort, setSort] = useState<AdminAccessCodeSort>("created_at");
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [codes, setCodes] = useState<AdminAccessCode[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [generateCount, setGenerateCount] = useState(10);
  const [durationDays, setDurationDays] = useState(365);
  const [generateClassId, setGenerateClassId] = useState("");

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
      .then((curriculum) =>
        setClasses(
          curriculum.classes
            .filter((item) => item.status === "active")
            .map((item) => ({ id: item.id, name: item.name })),
        ),
      )
      .catch((error) => {
        if (!handleError(error)) setFeedback({ kind: "error", message: errorMessage(error) });
      });
  }, [handleError]);

  const loadCodes = useCallback(async () => {
    setState("loading");
    try {
      const result = await fetchAdminAccessCodes({
        type,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
        ...(type === "class_access" && classId ? { classId } : {}),
        sort,
        direction: "desc",
        limit: PAGE_SIZE,
        offset,
      });
      setCodes(result.codes);
      setTotal(result.page.total);
      setSelectedIds(new Set());
      setState("ready");
    } catch (error) {
      if (!handleError(error)) {
        setState("error");
        setFeedback({ kind: "error", message: errorMessage(error) });
      }
    }
  }, [classId, handleError, offset, search, sort, status, type]);

  useEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  useEffect(() => {
    if (!generateClassId && classes[0]) setGenerateClassId(classes[0].id);
  }, [classes, generateClassId]);

  const revocableIds = useMemo(
    () => codes.filter((code) => code.status === "active" || code.status === "expired").map((code) => code.id),
    [codes],
  );

  async function generateCodes(): Promise<void> {
    if (generateCount < 1 || generateCount > 500 || durationDays < 1 || durationDays > 3650) {
      setFeedback({ kind: "error", message: "تحقق من العدد ومدة الصلاحية قبل التوليد." });
      return;
    }
    if (type === "class_access" && !generateClassId) {
      setFeedback({ kind: "error", message: "اختر الصف قبل توليد أكواد الصف." });
      return;
    }

    setFeedback({ kind: "busy", message: "جارٍ توليد الأكواد…" });
    setGeneratedCodes([]);
    try {
      const result =
        type === "full_access"
          ? await generateFullAccessCodes(generateCount, durationDays)
          : await generateClassAccessCodes(generateClassId, generateCount, durationDays);
      setGeneratedCodes(result.codes);
      setFeedback({
        kind: "success",
        message: `تم توليد ${result.codes.length} كود. احتفظ بالنسخة المعروضة قبل مغادرة الصفحة.`,
      });
      setOffset(0);
      await loadCodes();
    } catch (error) {
      if (!handleError(error)) setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  async function revokeSelected(): Promise<void> {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setFeedback({ kind: "busy", message: "جارٍ إيقاف الأكواد غير المستخدمة…" });
    try {
      const result = await revokeUnusedAccessCodes(type, ids);
      const parts = [`تم إيقاف ${result.revokedIds.length} كود`];
      if (result.blockedIds.length) parts.push(`${result.blockedIds.length} مستخدم لا يمكن إيقافه`);
      if (result.alreadyRevokedIds.length) parts.push(`${result.alreadyRevokedIds.length} موقوف مسبقًا`);
      setFeedback({ kind: "success", message: `${parts.join("، ")}.` });
      setSelectedIds(new Set());
      await loadCodes();
    } catch (error) {
      if (!handleError(error)) setFeedback({ kind: "error", message: errorMessage(error) });
    }
  }

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="admin-access-workspace access-codes-panel" aria-labelledby="codes-heading">
      <header className="page-header access-page-header">
        <div>
          <p className="eyebrow">Stage 13G · إدارة الوصول</p>
          <h1 id="codes-heading">أكواد الوصول</h1>
          <p className="page-description">إصدار أكواد الوصول ومراجعة حالتها وإيقاف غير المستخدم منها دون خلطها بدعم حسابات الطلاب.</p>
        </div>
        <span className="count-pill" aria-label={`${total} كود`}>{total}</span>
      </header>

      {feedback && <div className={`mutation-feedback is-${feedback.kind}`} aria-live="polite">{feedback.message}</div>}

      <div className="code-toolbar-grid">
        <form className="code-filter-card" aria-label="فلترة أكواد الوصول" onSubmit={(event) => {
          event.preventDefault();
          setOffset(0);
          setSearch(searchInput.trim());
        }}>
          <h2>البحث والتصفية</h2>
          <div className="access-filter-grid code-filter-grid">
            <label><span>نوع الكود</span><select value={type} onChange={(event) => {
              setOffset(0); setClassId(""); setSelectedIds(new Set()); setGeneratedCodes([]);
              setType(event.target.value as AdminAccessCodeType);
            }}><option value="full_access">وصول شامل</option><option value="class_access">وصول صف</option></select></label>
            <label><span>الحالة</span><select value={status} onChange={(event) => { setOffset(0); setStatus(event.target.value as AdminAccessCodeStatus | ""); }}>
              <option value="">كل الحالات</option><option value="active">نشط</option><option value="redeemed">مستخدم</option><option value="expired">منتهي</option><option value="revoked">موقوف</option>
            </select></label>
            {type === "class_access" && <label><span>الصف</span><select value={classId} onChange={(event) => setClassId(event.target.value)}><option value="">كل الصفوف</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
            <label><span>الترتيب</span><select value={sort} onChange={(event) => setSort(event.target.value as AdminAccessCodeSort)}>
              <option value="created_at">الأحدث</option><option value="expires_at">تاريخ الانتهاء</option><option value="redeemed_at">تاريخ الاستخدام</option><option value="code">رقم الكود</option><option value="status">الحالة</option>
            </select></label>
            <label className="access-search-field"><span>بحث برقم الكود</span><input inputMode="numeric" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="اكتب جزءًا من الكود" /></label>
            <button className="secondary-button" type="submit">تطبيق البحث</button>
          </div>
        </form>

        <form className="code-generation-card" aria-label="توليد أكواد الوصول" onSubmit={(event) => { event.preventDefault(); void generateCodes(); }}>
          <h2>{type === "full_access" ? "توليد أكواد شاملة" : "توليد أكواد صف"}</h2>
          {type === "class_access" && <label><span>الصف</span><select value={generateClassId} onChange={(event) => setGenerateClassId(event.target.value)}><option value="">اختر الصف</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
          <div className="generation-fields">
            <label><span>العدد</span><input type="number" min={1} max={500} value={generateCount} onChange={(event) => setGenerateCount(Number(event.target.value))} /></label>
            <label><span>المدة بالأيام</span><input type="number" min={1} max={3650} value={durationDays} onChange={(event) => setDurationDays(Number(event.target.value))} /></label>
          </div>
          <button className="primary-button" type="submit">توليد الأكواد</button>
        </form>
      </div>

      {generatedCodes.length > 0 && <section className="generated-code-panel" aria-labelledby="generated-codes-heading"><div><p className="section-kicker">نتيجة التوليد</p><h2 id="generated-codes-heading">الأكواد الجديدة</h2></div><div className="generated-code-grid">{generatedCodes.map((code) => <code key={code}>{code}</code>)}</div></section>}

      <div className="code-selection-bar">
        <label className="checkbox-label"><input type="checkbox" checked={revocableIds.length > 0 && revocableIds.every((id) => selectedIds.has(id))} onChange={(event) => setSelectedIds(event.target.checked ? new Set(revocableIds) : new Set())} /><span>تحديد الأكواد غير المستخدمة في الصفحة</span></label>
        <button className="secondary-button danger-button" type="button" disabled={selectedIds.size === 0} onClick={() => void revokeSelected()}>إيقاف المحدد ({selectedIds.size})</button>
      </div>

      {state === "loading" ? <WorkspaceState title="جارٍ تحميل الأكواد" body="نقرأ حالة الأكواد الحالية وسجل استخدامها." /> :
       state === "error" ? <WorkspaceState title="تعذر تحميل الأكواد" body="أعد المحاولة بعد التحقق من الاتصال."><button className="secondary-button" type="button" onClick={() => void loadCodes()}>إعادة المحاولة</button></WorkspaceState> :
       codes.length === 0 ? <WorkspaceState title="لا توجد أكواد مطابقة" body="غيّر الفلاتر أو ولّد دفعة جديدة." /> :
       <div className="access-code-list">{codes.map((code) => {
         const revocable = code.status === "active" || code.status === "expired";
         return <article className="access-code-card" key={code.id}>
           <label className="code-select-box"><input type="checkbox" disabled={!revocable} checked={selectedIds.has(code.id)} onChange={(event) => setSelectedIds((current) => { const next = new Set(current); if (event.target.checked) next.add(code.id); else next.delete(code.id); return next; })} aria-label={`تحديد الكود ${code.code}`} /></label>
           <div className="access-code-main"><div className="access-code-title"><code>{code.code}</code><span className={`status-badge status-${code.status}`}>{statusLabel(code.status)}</span></div>
             <div className="access-code-meta"><span>{code.type === "full_access" ? "وصول شامل" : code.className || "وصول صف"}</span><span>المدة {code.entitlementDurationDays} يوم</span><span>ينتهي {formatDate(code.expiresAt)}</span></div>
             {code.redeemedAt && <div className="access-code-redemption"><span>استخدمه {code.redeemedByDisplayName || code.redeemedByIdentifier || "طالب"}</span><time dateTime={code.redeemedAt}>{formatDate(code.redeemedAt)}</time></div>}
           </div>
         </article>;
       })}</div>}

      <Pagination pageNumber={pageNumber} pageCount={pageCount} canPrevious={offset > 0} canNext={offset + PAGE_SIZE < total} onPrevious={() => setOffset(Math.max(0, offset - PAGE_SIZE))} onNext={() => setOffset(offset + PAGE_SIZE)} />
    </section>
  );
}

function WorkspaceState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return <div className="access-workspace-state" aria-live="polite"><strong>{title}</strong><p>{body}</p>{children}</div>;
}

function Pagination({ pageNumber, pageCount, canPrevious, canNext, onPrevious, onNext }: { pageNumber: number; pageCount: number; canPrevious: boolean; canNext: boolean; onPrevious: () => void; onNext: () => void }) {
  return <nav className="access-pagination" aria-label="التنقل بين الصفحات"><button className="secondary-button small-button" type="button" disabled={!canPrevious} onClick={onPrevious}>السابق</button><span>صفحة {pageNumber} من {pageCount}</span><button className="secondary-button small-button" type="button" disabled={!canNext} onClick={onNext}>التالي</button></nav>;
}
