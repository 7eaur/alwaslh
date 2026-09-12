import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "../../admin-api";
import {
  type OperationsGovernanceOverview,
  fetchAdminOperationsDiagnostics,
} from "../../admin-operations-api";
import "./operations-pages.css";

type LoadState = "loading" | "ready" | "error";

function numberLabel(value: number): string {
  return value.toLocaleString("ar-YE");
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر تحميل التشخيص المتقدم. أعد المحاولة.";
}

function DiagnosticRow({ label, value }: { label: string; value: string | number }) {
  return <div className="operations-diagnostic-row"><span>{label}</span><strong>{typeof value === "number" ? numberLabel(value) : value}</strong></div>;
}

export function AdminOperationsDiagnosticsPage({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [state, setState] = useState<LoadState>("loading");
  const [diagnostics, setDiagnostics] = useState<OperationsGovernanceOverview | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setMessage("");
    try {
      setDiagnostics(await fetchAdminOperationsDiagnostics());
      setState("ready");
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      setMessage(errorMessage(error));
      setState("error");
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="operations-page">
      <header className="page-header operations-page-header">
        <div>
          <p className="eyebrow">التشغيل · متقدم</p>
          <h1>التشخيص المتقدم</h1>
          <p className="page-description">حالة تشغيلية وتقنية مخصصة للتشخيص عند الحاجة. لا تحتوي هذه الصفحة على الأسرار أو مفاتيح التخزين أو بيانات الاعتماد.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void load()} disabled={state === "loading"}>تحديث الحالة</button>
      </header>

      {state === "loading" ? (
        <OperationsState title="جارٍ تحميل التشخيص" body="نقرأ الإسقاط الآمن من الخادم." />
      ) : state === "error" || !diagnostics ? (
        <OperationsState title="تعذر تحميل التشخيص" body={message} onRetry={() => void load()} />
      ) : (
        <div className="operations-diagnostics-grid">
          <section className="operations-diagnostics-section is-wide" aria-labelledby="diagnostics-workflows-title">
            <div className="operations-section-header"><div><h2 id="diagnostics-workflows-title">حالة مسارات العمل</h2><p>مؤشرات تفصيلية للتشخيص، وليست لوحة العمل اليومية.</p></div></div>
            <div className="operations-diagnostic-group-grid">
              <DiagnosticGroup title="المحتوى" rows={[
                ["مهام معالجة نشطة", diagnostics.reports.content.activeIngestionTasks],
                ["مهام معالجة فاشلة", diagnostics.reports.content.failedIngestionTasks],
                ["أصول مسودة", diagnostics.reports.content.draftAssets],
                ["أصول قيد المراجعة", diagnostics.reports.content.reviewAssets],
                ["أصول منشورة", diagnostics.reports.content.publishedAssets],
              ]} />
              <DiagnosticGroup title="OCR" rows={[
                ["استخراجات نشطة", diagnostics.reports.ocr.activeExtractions],
                ["استخراجات فاشلة", diagnostics.reports.ocr.failedExtractions],
                ["بانتظار المراجعة", diagnostics.reports.ocr.pendingReview],
              ]} />
              <DiagnosticGroup title="الذكاء الاصطناعي" rows={[
                ["مهام نشطة", diagnostics.reports.ai.activeJobs],
                ["مهام فاشلة", diagnostics.reports.ai.failedJobs],
                ["وحدات تحتاج مراجعة", diagnostics.reports.ai.reviewRequiredUnits],
              ]} />
              <DiagnosticGroup title="بنك الأسئلة" rows={[
                ["مسودة", diagnostics.reports.questionBank.draft],
                ["مراجعة", diagnostics.reports.questionBank.review],
                ["منشور", diagnostics.reports.questionBank.published],
                ["مؤرشف", diagnostics.reports.questionBank.archived],
              ]} />
              <DiagnosticGroup title="الاختبارات" rows={[
                ["مسودة", diagnostics.reports.quizzes.draft],
                ["مراجعة", diagnostics.reports.quizzes.review],
                ["منشور", diagnostics.reports.quizzes.published],
                ["مؤرشف", diagnostics.reports.quizzes.archived],
              ]} />
            </div>
          </section>

          <section className="operations-diagnostics-section" aria-labelledby="diagnostics-settings-title">
            <div className="operations-section-header"><div><h2 id="diagnostics-settings-title">إعدادات التشغيل</h2><p>وضع الإعدادات فقط؛ القيم السرية غير متاحة للمتصفح.</p></div></div>
            <div className="operations-diagnostic-list">
              <DiagnosticRow label="البيئة" value={diagnostics.settings.environment} />
              <DiagnosticRow label="اتصال قاعدة البيانات" value={diagnostics.settings.databaseSsl === "require" ? "SSL مطلوب" : "SSL غير مطلوب"} />
              <DiagnosticRow label="حد اتصالات قاعدة البيانات" value={diagnostics.settings.databasePoolMax} />
              <DiagnosticRow label="مدة الجلسة" value={`${numberLabel(diagnostics.settings.sessionTtlHours)} ساعة`} />
              <DiagnosticRow label="سياسة SameSite" value={diagnostics.settings.sessionSameSite} />
              <DiagnosticRow label="عدد المصادر المسموحة" value={diagnostics.settings.allowedOriginCount} />
              <DiagnosticRow label="إيقاف AI العام" value={diagnostics.settings.aiGlobalKillSwitch ? "مفعّل" : "غير مفعّل"} />
              <DiagnosticRow label="ميزانية AI" value={diagnostics.settings.aiBudgetConfigured ? "مضبوطة" : "غير مضبوطة"} />
            </div>
          </section>

          <section className="operations-diagnostics-section" aria-labelledby="diagnostics-security-title">
            <div className="operations-section-header"><div><h2 id="diagnostics-security-title">حالة الأمان والجلسات</h2><p>مؤشرات تشخيصية مجمعة من سلطات النظام الأساسية.</p></div></div>
            <div className="operations-diagnostic-list">
              <DiagnosticRow label="جلسات الإدارة النشطة" value={diagnostics.security.activeAdminSessions} />
              <DiagnosticRow label="جلسات الطلاب النشطة" value={diagnostics.security.activeStudentSessions} />
              <DiagnosticRow label="محاولات دخول مقفلة" value={diagnostics.security.lockedLoginGuards} />
              <DiagnosticRow label="طلبات استرداد سارية" value={diagnostics.security.pendingRecoveryTokens} />
              <DiagnosticRow label="أجهزة طلاب نشطة" value={diagnostics.security.activeStudentDevices} />
              <DiagnosticRow label="تحديات جهاز معلقة" value={diagnostics.security.pendingDeviceChallenges} />
              <DiagnosticRow label="تذاكر تفعيل معلقة" value={diagnostics.security.pendingActivationTickets} />
              <DiagnosticRow label="تغيير كلمة مرور إجباري" value={diagnostics.security.forcedPasswordChanges} />
              <DiagnosticRow label="مسارات AI متوقفة" value={diagnostics.security.aiRoutesPaused} />
              <DiagnosticRow label="مسارات AI في تبريد" value={diagnostics.security.aiRoutesCoolingDown} />
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function DiagnosticGroup({ title, rows }: { title: string; rows: readonly (readonly [string, number])[] }) {
  return <article className="operations-diagnostic-group"><h3>{title}</h3><div className="operations-diagnostic-list">{rows.map(([label, value]) => <DiagnosticRow key={label} label={label} value={value} />)}</div></article>;
}

function OperationsState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return <div className="operations-page-state" role="status"><strong>{title}</strong><p>{body}</p>{onRetry ? <button className="secondary-button" type="button" onClick={onRetry}>إعادة المحاولة</button> : null}</div>;
}
