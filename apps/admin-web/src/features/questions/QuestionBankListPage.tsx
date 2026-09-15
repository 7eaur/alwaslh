import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ApiRequestError,
  type AdminCurriculumSnapshot,
  fetchAdminCurriculum,
  isMissingSessionError,
} from "../../admin-api";
import {
  type QuestionBankListItem,
  type QuestionBankOrigin,
  type QuestionBankStatus,
  fetchQuestionBank,
} from "../../question-bank-api";
import "../../question-bank.css";

interface Props {
  onSessionExpired: () => void;
}

interface Filters {
  classId: string;
  subjectId: string;
  origin: "" | QuestionBankOrigin;
  status: "" | Exclude<QuestionBankStatus, "archived">;
  search: string;
}

const PAGE_SIZE = 30;

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل بنك الأسئلة. أعد المحاولة.";
}

function statusLabel(status: QuestionBankStatus | undefined): string {
  if (status === "draft") return "مسودة";
  if (status === "review") return "قيد المراجعة";
  if (status === "published") return "منشور";
  if (status === "archived") return "مؤرشف";
  return "بدون نسخة";
}

function originLabel(origin: QuestionBankOrigin): string {
  return origin === "ai" ? "مستورد من AI" : "يدوي";
}

export function QuestionBankListPage({ onSessionExpired }: Props) {
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState<AdminCurriculumSnapshot | null>(null);
  const [items, setItems] = useState<QuestionBankListItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [filters, setFilters] = useState<Filters>({ classId: "", subjectId: "", origin: "", status: "", search: "" });
  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  const handleError = useCallback(
    (cause: unknown) => {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setError(messageFor(cause));
    },
    [onSessionExpired],
  );

  const loadCurriculum = useCallback(async () => {
    try {
      setCurriculum(await fetchAdminCurriculum());
    } catch (cause) {
      handleError(cause);
    }
  }, [handleError]);

  const loadList = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const result = await fetchQuestionBank({
        ...(appliedFilters.classId ? { classId: appliedFilters.classId } : {}),
        ...(appliedFilters.subjectId ? { subjectId: appliedFilters.subjectId } : {}),
        ...(appliedFilters.origin ? { origin: appliedFilters.origin } : {}),
        ...(appliedFilters.status ? { status: appliedFilters.status } : {}),
        ...(appliedFilters.search.trim() ? { search: appliedFilters.search.trim() } : {}),
        limit: PAGE_SIZE,
        offset,
      });
      setItems(result.items);
      setPagination(result.pagination);
      setState("ready");
    } catch (cause) {
      setState("error");
      handleError(cause);
    }
  }, [appliedFilters, handleError, offset]);

  useEffect(() => {
    void loadCurriculum();
  }, [loadCurriculum]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const classOptions = useMemo(
    () => curriculum?.classes.filter((item) => item.status !== "archived") ?? [],
    [curriculum],
  );

  const subjectOptions = useMemo(() => {
    if (!curriculum) return [];
    if (!filters.classId) return curriculum.subjects.filter((item) => item.status !== "archived");
    const allowed = new Set(
      curriculum.offerings
        .filter((offering) => offering.classId === filters.classId && offering.status !== "archived")
        .map((offering) => offering.subjectId),
    );
    return curriculum.subjects.filter((subject) => allowed.has(subject.id) && subject.status !== "archived");
  }, [curriculum, filters.classId]);

  const canGoNext = pagination.offset + items.length < pagination.total;
  const canGoPrevious = offset > 0;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
  }

  return (
    <section className="question-bank" aria-labelledby="question-bank-title">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">المحتوى التعليمي</p>
          <h1 id="question-bank-title">بنك الأسئلة</h1>
          <p>ابحث عن السؤال ثم افتح صفحته المستقلة للمراجعة، المصدر، السجل وإجراءات دورة النشر.</p>
        </div>
        <div className="qb-header-actions">
          <span className="count-pill">{pagination.total} سؤال</span>
          <button className="secondary-button" type="button" onClick={() => void loadList()} disabled={state === "loading"}>
            تحديث
          </button>
          <Link className="primary-button" to="/app/questions/manage">
            إنشاء أو استيراد
          </Link>
        </div>
      </header>

      <form className="qb-filter-bar" onSubmit={applyFilters}>
        <label>
          <span>بحث</span>
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="ابحث في نص السؤال"
          />
        </label>
        <label>
          <span>الصف</span>
          <select
            value={filters.classId}
            onChange={(event) => {
              const classId = event.target.value;
              setFilters((current) => ({ ...current, classId, subjectId: "" }));
            }}
          >
            <option value="">كل الصفوف</option>
            {classOptions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>المادة</span>
          <select
            value={filters.subjectId}
            onChange={(event) => setFilters((current) => ({ ...current, subjectId: event.target.value }))}
          >
            <option value="">كل المواد</option>
            {subjectOptions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>الحالة</span>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as Filters["status"] }))}
          >
            <option value="">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="review">قيد المراجعة</option>
            <option value="published">منشور</option>
          </select>
        </label>
        <label>
          <span>المصدر</span>
          <select
            value={filters.origin}
            onChange={(event) => setFilters((current) => ({ ...current, origin: event.target.value as Filters["origin"] }))}
          >
            <option value="">كل المصادر</option>
            <option value="manual">يدوي</option>
            <option value="ai">ذكاء اصطناعي</option>
          </select>
        </label>
        <button className="primary-button" type="submit">تطبيق المرشحات</button>
      </form>

      {state === "loading" ? (
        <StatePanel title="جارٍ تحميل بنك الأسئلة" body="نقرأ قائمة الأسئلة من المصدر التشغيلي." />
      ) : state === "error" ? (
        <StatePanel
          title="تعذر تحميل بنك الأسئلة"
          body={error}
          action={<button className="secondary-button" type="button" onClick={() => void loadList()}>إعادة المحاولة</button>}
        />
      ) : items.length === 0 ? (
        <StatePanel title="لا توجد أسئلة مطابقة" body="غيّر المرشحات أو استخدم مساحة الإنشاء والاستيراد لإضافة سؤال جديد." />
      ) : (
        <div className="qb-list-panel">
          <div className="qb-list" aria-label="قائمة الأسئلة">
            {items.map((item) => (
              <button
                className="qb-question-card"
                key={item.id}
                type="button"
                onClick={() => navigate(`/app/questions/${item.id}`)}
              >
                <div className="qb-card-topline">
                  <span className={`status-chip qb-status-${item.currentRevision?.status ?? "none"}`}>
                    {statusLabel(item.currentRevision?.status)}
                  </span>
                  <span className="qb-origin">{originLabel(item.origin)}</span>
                </div>
                <strong>{item.currentRevision?.prompt ?? "سؤال بلا نسخة حالية"}</strong>
                <div className="qb-card-meta">
                  <span>نسخة {item.currentRevision?.revisionNumber ?? "—"}</span>
                  <span>افتح السؤال للمراجعة والتفاصيل</span>
                </div>
              </button>
            ))}
          </div>

          <div className="qb-pagination" aria-label="التنقل بين صفحات بنك الأسئلة">
            <button
              className="secondary-button small-button"
              type="button"
              disabled={!canGoPrevious}
              onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}
            >
              السابق
            </button>
            <span>
              {pagination.total === 0 ? 0 : pagination.offset + 1}–{pagination.offset + items.length} من {pagination.total}
            </span>
            <button
              className="secondary-button small-button"
              type="button"
              disabled={!canGoNext}
              onClick={() => setOffset((value) => value + PAGE_SIZE)}
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function StatePanel({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="qb-list-panel" role="status">
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}
