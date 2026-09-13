import { useState } from "react";
import type { ReactNode } from "react";
import type { AiApplicationCapability } from "./ai-application-api";
import type { AiGenerationOutputApi, AiReviewMutationInput } from "./ai-operations-api";
import {
  type AiGenerationOutputView,
  type AiJobAction,
  type AiOperationsWorkspaceModel,
  type AiPaginationView,
  type AiQuestionView,
  type AiReviewOutputView,
  type AiSourceEvidenceView,
  type AiSourceProvenanceView,
  type AiUnitView,
  answerStatusLabel,
  describeProgress,
  difficultyLabel,
  generationModeLabel,
  jobActionLabel,
  jobStatusLabel,
  nextPageOffset,
  paginationRangeLabel,
  previousPageOffset,
  questionTypeLabel,
  reviewActionLabel,
  reviewStatusLabel,
  unitStatusLabel,
  validationStatusLabel,
} from "./ai-operations-view-model";
import { AiStructuredOutputEditor } from "./AiStructuredOutputEditor";
import "./ai-review-workspace.css";

interface Props {
  model: AiOperationsWorkspaceModel;
  onRefresh: () => void;
  onSelectJob: (jobId: string) => void;
  onSelectUnit: (unitId: string) => void;
  onJobPageChange: (offset: number) => void;
  onUnitPageChange: (offset: number) => void;
  onAttemptPageChange: (unitId: string, offset: number) => void;
  onReviewPageChange: (unitId: string, offset: number) => void;
  onJobAction: (jobId: string, action: AiJobAction) => void;
  onReviewSubmit: (outputId: string, input: AiReviewMutationInput) => Promise<boolean>;
  onApplyOutput: (outputId: string, kind: AiApplicationCapability["kind"]) => Promise<void>;
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function jobTypeLabel(value: string): string {
  switch (value) {
    case "lesson_summary":
      return "تلخيص درس";
    case "question_generation":
      return "توليد أسئلة";
    case "comprehensive_lesson_content":
      return "إنشاء محتوى درس";
    case "multi_version_quiz":
      return "إنشاء نماذج اختبار";
    case "exact_question_extraction":
      return "استخراج أسئلة من المصدر";
    case "exact_exam_extraction":
      return "استخراج اختبار من المصدر";
    case "replica_question_extraction":
      return "استخراج نسخة مطابقة";
    case "regenerate_question":
      return "إعادة توليد سؤال";
    case "page_detection":
      return "تحليل صفحة";
    default:
      return "مهمة توليد ومراجعة";
  }
}

function statusClass(status: string): string {
  if (status === "completed" || status === "valid" || status === "approved") return "is-success";
  if (
    status === "failed" ||
    status === "invalid" ||
    status === "rejected" ||
    status === "cancelled"
  ) return "is-danger";
  if (status === "review_required" || status === "edited" || status === "retrying") return "is-warning";
  return "is-neutral";
}

export function AiReviewWorkspace({
  model,
  onRefresh,
  onSelectJob,
  onSelectUnit,
  onJobPageChange,
  onUnitPageChange,
  onAttemptPageChange,
  onReviewPageChange,
  onJobAction,
  onReviewSubmit,
  onApplyOutput,
}: Props) {
  const selectedUnit = model.selectedJob?.units.find((unit) => unit.id === model.selectedUnitId) ?? null;
  const mutationPending = model.feedback?.kind === "busy";

  return (
    <section className="ai-review-workspace">
      <header className="page-header ai-review-page-header">
        <div>
          <p className="eyebrow">المراجعات</p>
          <h1>مراجعات الذكاء الاصطناعي</h1>
          <p className="page-description">
            راجع المحتوى الناتج واتخذ القرار البشري ثم طبّق النتيجة من مكانها عندما يسمح الخادم بذلك.
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={onRefresh} disabled={model.isRefreshing || mutationPending}>
          {model.isRefreshing ? "جارٍ التحديث…" : "تحديث الحالة"}
        </button>
      </header>

      {model.feedback ? (
        <div className={`mutation-feedback is-${model.feedback.kind}`} role="status">
          {model.feedback.message}
        </div>
      ) : null}

      {model.state === "loading" ? <StatePanel title="جارٍ تحميل المراجعات" body="نقرأ الحالة الفعلية من الخادم." /> : null}
      {model.state === "error" ? <StatePanel title="تعذر تحميل المراجعات" body={model.errorMessage ?? "حاول مرة أخرى."}><button className="primary-button" type="button" onClick={onRefresh}>إعادة المحاولة</button></StatePanel> : null}
      {model.state === "empty" ? <StatePanel title="لا توجد مهام مراجعة" body="ستظهر هنا مخرجات التوليد والمعالجة عندما تصبح متاحة." /> : null}

      {model.state === "ready" ? (
        <div className="ai-review-layout">
          <section className="ai-review-list-pane" aria-labelledby="ai-review-jobs-title">
            <div className="ai-review-pane-heading">
              <div>
                <h2 id="ai-review-jobs-title">مهام المحتوى</h2>
                <p>اختر المهمة ثم النتيجة التي تريد مراجعتها.</p>
              </div>
              <span className="count-pill">{model.jobPagination.total}</span>
            </div>
            <div className="ai-review-job-list">
              {model.jobs.map((job) => (
                <button
                  className={`ai-review-job${model.selectedJobId === job.id ? " is-selected" : ""}`}
                  type="button"
                  key={job.id}
                  data-job-type={job.jobType}
                  onClick={() => onSelectJob(job.id)}
                >
                  <span>
                    <strong>{jobTypeLabel(job.jobType)}</strong>
                    <small>{formatDateTime(job.createdAt)}</small>
                  </span>
                  <span className={`ai-status ${statusClass(job.progress.status)}`}>{jobStatusLabel(job.progress.status)}</span>
                  <small>{describeProgress(job.progress)}</small>
                </button>
              ))}
            </div>
            <PaginationControls
              label="صفحات مهام مراجعة الذكاء الاصطناعي"
              pagination={model.jobPagination}
              disabled={mutationPending}
              onPageChange={onJobPageChange}
            />
          </section>

          <section className="ai-review-detail-pane" aria-live="polite">
            {model.selectedJobState === "idle" ? <StatePanel title="اختر مهمة" body="ستظهر نتائجها وحالة المراجعة هنا." /> : null}
            {model.selectedJobState === "loading" ? <StatePanel title="جارٍ فتح المهمة" body="نقرأ أحدث حالة من الخادم." /> : null}
            {model.selectedJobState === "error" ? <StatePanel title="تعذر فتح المهمة" body={model.selectedJobError ?? "أعد المحاولة."} /> : null}
            {model.selectedJobState === "ready" && model.selectedJob ? (
              <JobReviewDetail
                job={model.selectedJob}
                selectedUnit={selectedUnit}
                selectedUnitState={model.selectedUnitState}
                selectedUnitError={model.selectedUnitError}
                mutationPending={mutationPending}
                onSelectUnit={onSelectUnit}
                onUnitPageChange={onUnitPageChange}
                onAttemptPageChange={onAttemptPageChange}
                onReviewPageChange={onReviewPageChange}
                onJobAction={onJobAction}
                onReviewSubmit={onReviewSubmit}
                onApplyOutput={onApplyOutput}
              />
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}

function JobReviewDetail({
  job,
  selectedUnit,
  selectedUnitState,
  selectedUnitError,
  mutationPending,
  onSelectUnit,
  onUnitPageChange,
  onAttemptPageChange,
  onReviewPageChange,
  onJobAction,
  onReviewSubmit,
  onApplyOutput,
}: {
  job: NonNullable<AiOperationsWorkspaceModel["selectedJob"]>;
  selectedUnit: AiUnitView | null;
  selectedUnitState: AiOperationsWorkspaceModel["selectedUnitState"];
  selectedUnitError: string | null;
  mutationPending: boolean;
  onSelectUnit: (unitId: string) => void;
  onUnitPageChange: (offset: number) => void;
  onAttemptPageChange: (unitId: string, offset: number) => void;
  onReviewPageChange: (unitId: string, offset: number) => void;
  onJobAction: (jobId: string, action: AiJobAction) => void;
  onReviewSubmit: (outputId: string, input: AiReviewMutationInput) => Promise<boolean>;
  onApplyOutput: (outputId: string, kind: AiApplicationCapability["kind"]) => Promise<void>;
}) {
  return (
    <div className="ai-review-job-detail">
      <div className="ai-review-detail-heading">
        <div>
          <p className="section-kicker">مهمة المحتوى</p>
          <h2>{jobTypeLabel(job.jobType)}</h2>
          <p>{describeProgress(job.progress)}</p>
        </div>
        <span className={`ai-status ${statusClass(job.progress.status)}`}>{jobStatusLabel(job.progress.status)}</span>
      </div>

      {job.allowedActions.length > 0 ? (
        <div className="ai-review-job-actions" aria-label="إجراءات المهمة">
          {job.allowedActions.map((action) => (
            <button
              key={action}
              className={action === "cancel" ? "danger-button" : "secondary-button"}
              type="button"
              disabled={mutationPending}
              onClick={() => onJobAction(job.id, action)}
            >
              {jobActionLabel(action)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="ai-review-unit-layout">
        <section aria-labelledby="ai-review-units-title">
          <div className="ai-review-pane-heading compact">
            <h3 id="ai-review-units-title">النتائج</h3>
            <span className="count-pill">{job.unitPagination.total}</span>
          </div>
          <div className="ai-review-unit-list">
            {job.units.map((unit) => (
              <button
                className={`ai-review-unit${selectedUnit?.id === unit.id ? " is-selected" : ""}`}
                type="button"
                key={unit.id}
                onClick={() => onSelectUnit(unit.id)}
              >
                <span><strong>النتيجة {unit.position + 1}</strong><small>{generationModeLabel(unit.mode)}</small></span>
                <span className={`ai-status ${statusClass(unit.status)}`}>{unitStatusLabel(unit.status)}</span>
              </button>
            ))}
          </div>
          <PaginationControls
            label="صفحات نتائج مهمة الذكاء الاصطناعي"
            pagination={job.unitPagination}
            disabled={mutationPending}
            onPageChange={onUnitPageChange}
          />
        </section>

        <section className="ai-review-result-pane">
          {selectedUnitState === "idle" ? <StatePanel title="اختر نتيجة" body="اعرض المحتوى ثم اتخذ قرار المراجعة." /> : null}
          {selectedUnitState === "loading" ? <StatePanel title="جارٍ تحميل النتيجة" body="نقرأ أحدث نسخة ومراجعتها من الخادم." /> : null}
          {selectedUnitState === "error" ? <StatePanel title="تعذر تحميل النتيجة" body={selectedUnitError ?? "أعد المحاولة."} /> : null}
          {selectedUnitState === "ready" && selectedUnit ? (
            <UnitReview
              unit={selectedUnit}
              mutationPending={mutationPending}
              onAttemptPageChange={onAttemptPageChange}
              onReviewPageChange={onReviewPageChange}
              onReviewSubmit={onReviewSubmit}
              onApplyOutput={onApplyOutput}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function UnitReview({
  unit,
  mutationPending,
  onAttemptPageChange,
  onReviewPageChange,
  onReviewSubmit,
  onApplyOutput,
}: {
  unit: AiUnitView;
  mutationPending: boolean;
  onAttemptPageChange: (unitId: string, offset: number) => void;
  onReviewPageChange: (unitId: string, offset: number) => void;
  onReviewSubmit: (outputId: string, input: AiReviewMutationInput) => Promise<boolean>;
  onApplyOutput: (outputId: string, kind: AiApplicationCapability["kind"]) => Promise<void>;
}) {
  const output = unit.output;
  return (
    <div className="ai-review-result">
      <div className="ai-review-detail-heading compact">
        <div><p className="section-kicker">النتيجة {unit.position + 1}</p><h3>{generationModeLabel(unit.mode)}</h3></div>
        <span className={`ai-status ${statusClass(unit.status)}`}>{unitStatusLabel(unit.status)}</span>
      </div>

      {unit.attemptPagination && unit.attemptPagination.total > 0 ? (
        <details className="ai-review-execution-history">
          <summary>سجل التنفيذ ({unit.attemptPagination.total})</summary>
          {unit.attempts.length > 0 ? (
            <ol>{unit.attempts.map((attempt) => <li key={attempt.id}>المحاولة {attempt.attemptNumber} — {jobStatusLabel(attempt.status)}</li>)}</ol>
          ) : <p className="empty-inline">لا توجد محاولات في هذه الصفحة.</p>}
          <PaginationControls
            label="صفحات سجل تنفيذ النتيجة"
            pagination={unit.attemptPagination}
            disabled={mutationPending}
            onPageChange={(offset) => onAttemptPageChange(unit.id, offset)}
          />
        </details>
      ) : null}

      {output ? (
        <ReviewOutput
          output={output}
          mutationPending={mutationPending}
          onReviewPageChange={(offset) => onReviewPageChange(unit.id, offset)}
          onReviewSubmit={onReviewSubmit}
          onApplyOutput={onApplyOutput}
        />
      ) : <StatePanel title="لا توجد نتيجة قابلة للمراجعة" body="قد تكون المعالجة لم تنتهِ بعد أو لم تحفظ مخرجًا منظمًا." />}
    </div>
  );
}

function ReviewOutput({
  output,
  mutationPending,
  onReviewPageChange,
  onReviewSubmit,
  onApplyOutput,
}: {
  output: AiReviewOutputView;
  mutationPending: boolean;
  onReviewPageChange: (offset: number) => void;
  onReviewSubmit: (outputId: string, input: AiReviewMutationInput) => Promise<boolean>;
  onApplyOutput: (outputId: string, kind: AiApplicationCapability["kind"]) => Promise<void>;
}) {
  const [mode, setMode] = useState<"edit" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [clientError, setClientError] = useState("");
  const visibleOutput = output.effectiveReviewedOutput ?? (output.reviewStatus === "pending" ? output.normalizedOutput : null);

  function openEdit() {
    setMode("edit");
    setClientError("");
  }

  async function submitEdit(editedOutput: AiGenerationOutputApi, reviewNote: string): Promise<boolean> {
    const input: AiReviewMutationInput = reviewNote
      ? { action: "edit", editedOutput, note: reviewNote }
      : { action: "edit", editedOutput };
    const saved = await onReviewSubmit(output.id, input);
    if (saved) setClientError("");
    return saved;
  }

  async function submitReject() {
    const reason = note.trim();
    if (!reason) {
      setClientError("سبب الرفض مطلوب.");
      return;
    }
    if (await onReviewSubmit(output.id, { action: "reject", note: reason })) {
      setMode(null);
      setClientError("");
    }
  }

  return (
    <section className="ai-review-output" aria-labelledby="ai-reviewed-output-title">
      <div className="ai-review-output-heading">
        <div>
          <h4 id="ai-reviewed-output-title">مراجعة النتيجة</h4>
          <p>{output.reviewedAt ? `آخر مراجعة: ${formatDateTime(output.reviewedAt)}` : "لم يصدر قرار مراجعة بشري بعد."}</p>
        </div>
        <div className="ai-review-statuses">
          <span className={`ai-status ${statusClass(output.validationStatus)}`}>{validationStatusLabel(output.validationStatus)}</span>
          <span className={`ai-status ${statusClass(output.reviewStatus)}`}>{reviewStatusLabel(output.reviewStatus)}</span>
        </div>
      </div>

      <SourceProvenance sources={output.sourceProvenance} />
      {output.validationIssues.length > 0 ? <IssueList title="أخطاء التحقق" issues={output.validationIssues.map((issue) => issue.message)} /> : null}
      {output.semanticWarnings.length > 0 ? <IssueList title="ملاحظات تحتاج الانتباه" issues={output.semanticWarnings.map((issue) => issue.message)} /> : null}

      {visibleOutput ? <OutputBody output={visibleOutput} /> : (
        <StatePanel
          title={output.reviewStatus === "rejected" ? "تم رفض النتيجة" : "لا توجد نتيجة منظمة صالحة للعرض"}
          body={output.reviewStatus === "rejected" ? "الرفض ينهي المراجعة ولا ينشر شيئًا." : "راجع ملاحظات التحقق أو أعد المحاولة من المهمة عند السماح بذلك."}
        />
      )}

      {output.reviewPagination.total > 0 ? (
        <details className="ai-review-history">
          <summary>سجل المراجعة ({output.reviewPagination.total})</summary>
          {output.reviewHistory.length > 0 ? (
            <ol>{output.reviewHistory.map((event) => <li key={event.id}><strong>{reviewActionLabel(event.action)}</strong><span>{event.actorDisplayName ?? "مدير النظام"} · {formatDateTime(event.createdAt)}</span>{event.note ? <p>{event.note}</p> : null}</li>)}</ol>
          ) : <p className="empty-inline">لا توجد أحداث مراجعة في هذه الصفحة.</p>}
          <PaginationControls
            label="صفحات سجل مراجعة النتيجة"
            pagination={output.reviewPagination}
            disabled={mutationPending}
            onPageChange={onReviewPageChange}
          />
        </details>
      ) : null}

      <div className="ai-review-actions" aria-label="إجراءات مراجعة النتيجة">
        {output.allowedReviewActions.includes("edit") && visibleOutput ? <button className="secondary-button" type="button" disabled={mutationPending} onClick={openEdit}>{reviewActionLabel("edit")}</button> : null}
        {output.allowedReviewActions.includes("approve") ? <button className="primary-button" type="button" disabled={mutationPending} onClick={() => void onReviewSubmit(output.id, { action: "approve" })}>{reviewActionLabel("approve")}</button> : null}
        {output.allowedReviewActions.includes("reject") ? <button className="danger-button" type="button" disabled={mutationPending} onClick={() => { setMode("reject"); setNote(""); setClientError(""); }}>{reviewActionLabel("reject")}</button> : null}
        {output.allowedReviewActions.length === 0 && !output.application ? <span className="empty-inline">لا توجد إجراءات أخرى متاحة لهذه النتيجة.</span> : null}
      </div>

      {output.application ? (
        <div className="ai-review-apply" role="region" aria-label="تطبيق النتيجة المعتمدة">
          <div>
            <strong>النتيجة معتمدة وجاهزة للتطبيق</strong>
            <p>{output.application.kind === "lesson" ? "سيطبق الخادم المحتوى على الدرس المرتبط ويُبقي الأسئلة الجديدة كمسودات عند وجودها." : "سيستورد الخادم الأسئلة إلى بنك الأسئلة، ويُركّب النموذج عندما تصبح الأسئلة منشورة وفق القواعد الحالية."}</p>
          </div>
          <button className="primary-button" type="button" disabled={mutationPending} onClick={() => void onApplyOutput(output.id, output.application!.kind)}>
            {output.application.kind === "lesson" ? "تطبيق النتيجة على الدرس" : "تطبيق النتيجة على الاختبار"}
          </button>
        </div>
      ) : null}

      {mode === "edit" && output.allowedReviewActions.includes("edit") && visibleOutput ? (
        <AiStructuredOutputEditor
          initialOutput={visibleOutput}
          disabled={mutationPending}
          onSubmit={submitEdit}
          onCancel={() => setMode(null)}
        />
      ) : null}

      {mode === "reject" && output.allowedReviewActions.includes("reject") ? (
        <div className="ai-review-reject" role="region" aria-label="رفض النتيجة">
          <label><span>سبب الرفض</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} required /></label>
          {clientError ? <p className="field-error" role="alert">{clientError}</p> : null}
          <div className="ai-review-editor-actions"><button className="danger-button" type="button" disabled={mutationPending} onClick={() => void submitReject()}>تأكيد الرفض</button><button className="secondary-button" type="button" disabled={mutationPending} onClick={() => setMode(null)}>إلغاء</button></div>
        </div>
      ) : null}
    </section>
  );
}

function SourceProvenance({ sources }: { sources: readonly AiSourceProvenanceView[] }) {
  if (sources.length === 0) return null;
  return (
    <section className="ai-review-sources" aria-label="مصادر النتيجة">
      <h5>المصادر</h5>
      <ul>{sources.map((source, index) => <li key={`${source.pageNumber}-${index}`}>صفحة <strong>{source.pageNumber}</strong> · {source.inputKind === "approved_ocr" ? "نص OCR معتمد" : "قراءة بصرية للمصدر"}</li>)}</ul>
    </section>
  );
}

function IssueList({ title, issues }: { title: string; issues: readonly string[] }) {
  return <section className="ai-review-issues" aria-label={title}><h5>{title}</h5><ul>{issues.map((issue, index) => <li key={`${index}-${issue.slice(0, 30)}`}>{issue}</li>)}</ul></section>;
}

function OutputBody({ output }: { output: AiGenerationOutputView }) {
  if (output.kind === "summary") return <div className="ai-review-content"><h5>الملخص المقترح</h5><p className="ai-review-long-copy">{output.summary}</p><Evidence evidence={output.sourceEvidence} /></div>;
  if (output.kind === "page_detection") return <div className="ai-review-content"><h5>{output.title}</h5><p>{output.pageNumber ? `صفحة ${output.pageNumber}` : "رقم الصفحة غير مثبت"}</p><p className="ai-review-long-copy">{output.contentPreview}</p><Evidence evidence={output.sourceEvidence} /></div>;
  if (output.kind === "question_set") return <QuestionList title="الأسئلة المقترحة" questions={output.questions} />;
  if (output.kind === "lesson_content") return <div className="ai-review-content"><h5>ملخص الدرس المقترح</h5><p className="ai-review-long-copy">{output.summary}</p><Evidence evidence={output.summaryEvidence} /><QuestionList title="الأسئلة المقترحة" questions={output.questions} /></div>;
  return <div className="ai-review-content"><h5>نماذج الاختبار المقترحة</h5>{output.versions.map((version, index) => <section className="ai-review-version" key={`${version.label}-${index}`}><h6>{version.label}</h6><QuestionList title="الأسئلة" questions={version.questions} /></section>)}</div>;
}

function QuestionList({ title, questions }: { title: string; questions: readonly AiQuestionView[] }) {
  return (
    <section className="ai-review-questions">
      <div className="ai-review-pane-heading compact"><h5>{title}</h5><span className="count-pill">{questions.length}</span></div>
      {questions.length === 0 ? <p className="empty-inline">لا توجد أسئلة في هذه النتيجة.</p> : null}
      <ol>{questions.map((questionValue, index) => <li key={`${index}-${questionValue.prompt.slice(0, 40)}`}><div className="ai-review-question-meta"><span>{questionTypeLabel(questionValue.type)}</span><span>{difficultyLabel(questionValue.difficulty)}</span><span>{answerStatusLabel(questionValue.answerStatus)}</span></div><strong>{questionValue.prompt}</strong>{questionValue.options.length > 0 ? <ul>{questionValue.options.map((option, optionIndex) => <li key={`${optionIndex}-${option.slice(0, 30)}`} className={questionValue.correctOptionIndex === optionIndex ? "is-correct" : ""}>{option}{questionValue.correctOptionIndex === optionIndex ? " — الإجابة المثبتة" : ""}</li>)}</ul> : null}{questionValue.answerText ? <p><strong>الإجابة:</strong> {questionValue.answerText}</p> : null}{questionValue.explanation ? <p><strong>الشرح:</strong> {questionValue.explanation}</p> : null}<Evidence evidence={questionValue.sourceEvidence} /></li>)}</ol>
    </section>
  );
}

function Evidence({ evidence }: { evidence: readonly AiSourceEvidenceView[] }) {
  if (evidence.length === 0) return null;
  return <div className="ai-review-evidence"><strong>الدليل من المصدر</strong><ul>{evidence.map((source, index) => <li key={`${source.pageNumber}-${index}`}>صفحة {source.pageNumber}{source.quote ? <blockquote>{source.quote}</blockquote> : null}</li>)}</ul></div>;
}

function PaginationControls({
  label,
  pagination,
  disabled,
  onPageChange,
}: {
  label: string;
  pagination: AiPaginationView;
  disabled: boolean;
  onPageChange: (offset: number) => void;
}) {
  const previous = previousPageOffset(pagination);
  const next = nextPageOffset(pagination);
  return (
    <nav className="ai-review-pagination" aria-label={label}>
      <button className="secondary-button" type="button" disabled={disabled || previous === null} onClick={() => previous !== null && onPageChange(previous)}>السابق</button>
      <span aria-live="polite">{paginationRangeLabel(pagination)}</span>
      <button className="secondary-button" type="button" disabled={disabled || next === null} onClick={() => next !== null && onPageChange(next)}>التالي</button>
    </nav>
  );
}

function StatePanel({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return <div className="workspace-state" role="status"><h2>{title}</h2><p>{body}</p>{children ? <div className="ai-review-state-actions">{children}</div> : null}</div>;
}
