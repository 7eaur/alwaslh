import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import {
  type QuizBuilderListItem,
  type QuizBuilderStatus,
  fetchQuizzes,
} from "../../quiz-builder-api";
import "../../quiz-builder.css";

interface Props {
  onSessionExpired: () => void;
}

interface Filters {
  search: string;
  status: "" | QuizBuilderStatus;
}

const PAGE_SIZE = 30;

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل الاختبارات. أعد المحاولة.";
}

function statusLabel(status: QuizBuilderStatus): string {
  if (status === "draft") return "مسودة";
  if (status === "review") return "قيد المراجعة";
  if (status === "published") return "منشور";
  return "مؤرشف";
}

function localDate(value: string): string {
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function QuizBuilderListPage({ onSessionExpired }: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<QuizBuilderListItem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  const [filters, setFilters] = useState<Filters>({ search: "", status: "" });
  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);
  const [offset, setOffset] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  const loadList = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const result = await fetchQuizzes({
        ...(appliedFilters.search.trim() ? { search: appliedFilters.search.trim() } : {}),
        ...(appliedFilters.status ? { status: appliedFilters.status } : {}),
        limit: PAGE_SIZE,
        offset,
      });
      setItems(result.items);
      setPagination(result.pagination);
      setState("ready");
    } catch (cause) {
      if (isMissingSessionError(cause)) {
        onSessionExpired();
        return;
      }
      setError(messageFor(cause));
      setState("error");
    }
  }, [appliedFilters, offset, onSessionExpired]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const canPrevious = offset > 0;
  const canNext = offset + items.length < pagination.total;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
  }

  return (
    <section className="quiz-builder" aria-labelledby="quiz-builder-list-title">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">التقييمات</p>
          <h1 id="quiz-builder-list-title">الاختبارات</h1>
          <p>ابحث في الاختبارات وافتح كل اختبار في رابط مستقل. دورة النشر وتجميد النماذج تبقى تحت سلطة الخادم.</p>
        </div>
        <div className="qz-header-actions">
          <span className="count-pill">{pagination.total} اختبار</span>
          <button className="secondary-button" type="button" onClick={() => void loadList()} disabled={state === "loading"}>
            تحديث
          </button>
          <Link className="primary-button" to="/app/quizzes/manage">
            إنشاء وإدارة اختبار
          </Link>
        </div>
      </header>

      <form className="qz-filter-bar" onSubmit={applyFilters} aria-label="فلترة الاختبارات">
        <label>
          <span>بحث بالعنوان</span>
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="مثال: اختبار الطاقة"
          />
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
            <option value="archived">مؤرشف</option>
          </select>
        </label>
        <button className="primary-button" type="submit">تطبيق</button>
      </form>

      {state === "loading" ? (
        <StatePanel title="جارٍ تحميل الاختبارات" body="نقرأ القائمة الحالية من الخادم." />
      ) : state === "error" ? (
        <StatePanel
          title="تعذر تحميل الاختبارات"
          body={error}
          action={<button className="secondary-button" type="button" onClick={() => void loadList()}>إعادة المحاولة</button>}
        />
      ) : items.length === 0 ? (
        <StatePanel title="لا توجد اختبارات مطابقة" body="غيّر المرشحات أو أنشئ اختبارًا جديدًا." />
      ) : (
        <section className="qz-list-panel" aria-label="قائمة الاختبارات">
          <div className="qz-list">
            {items.map((item) => (
              <button
                className="qz-quiz-card"
                type="button"
                key={item.id}
                onClick={() => navigate(`/app/quizzes/${encodeURIComponent(item.id)}`)}
              >
                <div className="qz-card-topline">
                  <span className={`status-badge qb-status-${item.status}`}>{statusLabel(item.status)}</span>
                  <small>{localDate(item.updatedAt)}</small>
                </div>
                <strong>{item.title}</strong>
                <span>{item.description || "بدون وصف"}</span>
              </button>
            ))}
          </div>

          <nav className="qz-pagination" aria-label="صفحات الاختبارات">
            <button
              className="secondary-button small-button"
              type="button"
              disabled={!canPrevious}
              onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}
            >
              السابق
            </button>
            <span>
              {pagination.total === 0
                ? "0 من 0"
                : `${pagination.offset + 1}–${Math.min(pagination.offset + items.length, pagination.total)} من ${pagination.total}`}
            </span>
            <button
              className="secondary-button small-button"
              type="button"
              disabled={!canNext}
              onClick={() => setOffset((value) => value + PAGE_SIZE)}
            >
              التالي
            </button>
          </nav>
        </section>
      )}
    </section>
  );
}

function StatePanel({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="qz-list-panel" role="status">
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}
