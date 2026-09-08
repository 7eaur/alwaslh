import type { ReactNode } from "react";
import {
  type AiAttemptView,
  type AiGenerationOutputView,
  type AiJobAction,
  type AiJobDetailView,
  type AiJobSummaryView,
  type AiOperationsWorkspaceModel,
  type AiQuestionView,
  type AiReviewAction,
  type AiSourceEvidenceView,
  type AiSourceProvenanceView,
  type AiUnitView,
  answerStatusLabel,
  describeProgress,
  difficultyLabel,
  formatCost,
  formatLatency,
  formatTokens,
  generationModeLabel,
  jobActionLabel,
  jobStatusLabel,
  publicOperationalErrorLabel,
  questionTypeLabel,
  reviewActionLabel,
  reviewStatusLabel,
  unitStatusLabel,
  validationStatusLabel,
} from "./ai-operations-view-model";
import "./ai-operations.css";

interface Props {
  model: AiOperationsWorkspaceModel;
  onRefresh: () => void;
  onSelectJob: (jobId: string) => void;
  onSelectUnit: (unitId: string) => void;
  onJobAction: (jobId: string, action: AiJobAction) => void;
  onReviewAction: (outputId: string, action: AiReviewAction) => void;
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function statusClass(status: string): string {
  if (status === "completed" || status === "valid" || status === "approved") return "is-positive";
  if (status === "failed" || status === "invalid" || status === "cancelled" || status === "rejected") return "is-negative";
  if (status === "review_required" || status === "retrying" || status === "paused" || status === "edited") return "is-attention";
  return "is-neutral";
}

export function AiOperationsWorkspace({ model, onRefresh, onSelectJob, onSelectUnit, onJobAction, onReviewAction }: Props) {
  const selectedUnit = model.selectedJob?.units.find((unit) => unit.id === model.selectedUnitId) ?? null;

  return (
    <section className="ai-ops" aria-labelledby="ai-ops-title">
      <header className="page-header">
        <div>
          <p className="eyebrow">تشغيل ومراجعة الذكاء الاصطناعي</p>
          <h1 id="ai-ops-title">عمليات AI</h1>
          <p className="page-description">
            متابعة الحالة الفعلية من الخادم ومراجعة المخرجات قبل أي اعتماد لاحق. اعتماد Stage13E هو اعتماد مخرج AI بعد المراجعة فقط، وليس نشرًا إلى بنك الأسئلة.
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={onRefresh} disabled={model.isRefreshing || model.state === "loading"}>
          {model.isRefreshing ? "جارٍ التحديث…" : "تحديث الحالة"}
        </button>
      </header>

      <div className="ai-authority-note" role="note">
        <strong>الخادم هو مصدر الحالة والصلاحيات.</strong>
        <span>الواجهة لا تستنتج lifecycle أو صلاحية pause/resume/cancel/retry أو قرارات المراجعة من enum محلي.</span>
      </div>

      {model.feedback ? <div className={`mutation-feedback is-${model.feedback.kind}`} aria-live="polite">{model.feedback.message}</div> : null}
      {model.state === "loading" ? <StatePanel title="جارٍ تحميل عمليات AI" body="نقرأ الحالة الفعلية للمهمات من الخادم." /> : null}
      {model.state === "error" ? (
        <StatePanel title="تعذر تحميل عمليات AI" body={model.errorMessage ?? "تعذر إكمال الطلب."}>
          <button className="secondary-button" type="button" onClick={onRefresh}>إعادة المحاولة</button>
        </StatePanel>
      ) : null}
      {model.state === "empty" ? <StatePanel title="لا توجد مهام AI بعد" body="ستظهر هنا المهام التي أنشأها تدفق Admin الموثق." /> : null}

      {model.state === "ready" ? (
        <div className="ai-ops-layout">
          <section className="ai-jobs-pane" aria-labelledby="ai-jobs-title">
            <div className="ai-pane-heading">
              <div><p className="section-kicker">المهام</p><h2 id="ai-jobs-title">التشغيل الحالي</h2></div>
              <span className="count-pill" aria-label={`${model.jobs.length} مهمة معروضة`}>{model.jobs.length}</span>
            </div>
            <div className="ai-job-list">
              {model.jobs.map((job) => <JobCard key={job.id} job={job} selected={job.id === model.selectedJobId} onSelect={() => onSelectJob(job.id)} />)}
            </div>
          </section>

          <section className="ai-detail-pane" aria-labelledby="ai-job-detail-title">
            {model.selectedJobState === "idle" ? <StatePanel title="اختر مهمة" body="افتح مهمة لرؤية وحداتها ومحاولاتها ومخرجات المراجعة." /> : null}
            {model.selectedJobState === "loading" ? <StatePanel title="جارٍ تحميل تفاصيل المهمة" body="نحمّل التفاصيل عند الطلب." /> : null}
            {model.selectedJobState === "error" ? <StatePanel title="تعذر تحميل تفاصيل المهمة" body={model.selectedJobError ?? "تعذر إكمال الطلب."} /> : null}
            {model.selectedJobState === "ready" && model.selectedJob ? (
              <JobDetail job={model.selectedJob} selectedUnit={selectedUnit} onSelectUnit={onSelectUnit} onJobAction={onJobAction} onReviewAction={onReviewAction} />
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}

function JobCard({ job, selected, onSelect }: { job: AiJobSummaryView; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`ai-job-card${selected ? " is-selected" : ""}`} type="button" onClick={onSelect} aria-pressed={selected}>
      <span className="ai-job-card-header">
        <span><strong>{job.jobType}</strong><small>{job.promptKey}@{job.promptVersion}</small></span>
        <span className={`ai-status ${statusClass(job.progress.status)}`}>{jobStatusLabel(job.progress.status)}</span>
      </span>
      <span className="ai-progress-track" role="progressbar" aria-label="تقدم المهمة" aria-valuemin={0} aria-valuemax={100} aria-valuenow={job.progress.progressPercent}>
        <span style={{ inlineSize: `${job.progress.progressPercent}%` }} />
      </span>
      <span className="ai-job-progress-copy">{describeProgress(job.progress)}</span>
      <span className="ai-job-time">أنشئت: {formatDateTime(job.createdAt)}</span>
    </button>
  );
}

function JobDetail({ job, selectedUnit, onSelectUnit, onJobAction, onReviewAction }: {
  job: AiJobDetailView;
  selectedUnit: AiUnitView | null;
  onSelectUnit: (unitId: string) => void;
  onJobAction: (jobId: string, action: AiJobAction) => void;
  onReviewAction: (outputId: string, action: AiReviewAction) => void;
}) {
  return (
    <div className="ai-job-detail">
      <div className="ai-detail-heading">
        <div><p className="section-kicker">تفاصيل المهمة</p><h2 id="ai-job-detail-title">{job.jobType}</h2><p><code>{job.id}</code></p></div>
        <span className={`ai-status ${statusClass(job.progress.status)}`}>{jobStatusLabel(job.progress.status)}</span>
      </div>

      <dl className="ai-progress-grid" aria-label="تقدم المهمة من الخادم">
        <Metric label="إجمالي الوحدات" value={job.progress.totalUnits} />
        <Metric label="مقبولة" value={job.progress.acceptedUnits} />
        <Metric label="تحتاج مراجعة" value={job.progress.reviewRequiredUnits} />
        <Metric label="فشلت" value={job.progress.failedUnits} />
        <Metric label="قيد التنفيذ" value={job.progress.runningUnits} />
        <Metric label="متبقية" value={job.progress.remainingUnits} />
      </dl>

      <div className="ai-job-contract">
        <span>حالة التنفيذ الأساسية: <strong>{jobStatusLabel(job.progress.executionStatus)}</strong></span>
        <span>الإيقاف المؤقت: <strong>{formatDateTime(job.progress.pausedAt)}</strong></span>
        <span>Prompt: <code>{job.promptKey}@{job.promptVersion}</code></span>
      </div>

      <div className="ai-action-row" aria-label="إجراءات المهمة">
        {job.allowedActions.length === 0 ? <span className="empty-inline">لا توجد إجراءات تشغيل متاحة من الخادم للحالة الحالية.</span> : null}
        {job.allowedActions.map((action) => (
          <button className={action === "cancel" ? "ai-danger-button" : "secondary-button small-button"} type="button" key={action} onClick={() => onJobAction(job.id, action)}>
            {jobActionLabel(action)}
          </button>
        ))}
      </div>

      <div className="ai-units-layout">
        <section className="ai-units-pane" aria-labelledby="ai-units-title">
          <div className="ai-pane-heading compact"><h3 id="ai-units-title">وحدات المهمة</h3><span className="count-pill">{job.units.length}</span></div>
          <div className="ai-unit-list">
            {job.units.map((unit) => (
              <button className={`ai-unit-card${selectedUnit?.id === unit.id ? " is-selected" : ""}`} type="button" key={unit.id} aria-pressed={selectedUnit?.id === unit.id} onClick={() => onSelectUnit(unit.id)}>
                <span><strong>{generationModeLabel(unit.mode)}</strong><small>الوحدة {unit.position + 1} · محاولة {unit.attemptCount}/{unit.maxAttempts}</small></span>
                <span className={`ai-status ${statusClass(unit.status)}`}>{unitStatusLabel(unit.status)}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="ai-unit-detail" aria-live="polite">
          {selectedUnit ? <UnitDetail unit={selectedUnit} onReviewAction={onReviewAction} /> : <StatePanel title="اختر وحدة" body="تفاصيل المحاولات والمخرجات تُعرض للوحدة المحددة فقط." />}
        </section>
      </div>
    </div>
  );
}

function UnitDetail({ unit, onReviewAction }: { unit: AiUnitView; onReviewAction: (outputId: string, action: AiReviewAction) => void }) {
  return (
    <div className="ai-unit-detail-body">
      <div className="ai-detail-heading compact">
        <div><p className="section-kicker">الوحدة {unit.position + 1}</p><h3>{generationModeLabel(unit.mode)}</h3><p><code>{unit.unitKey}</code></p></div>
        <span className={`ai-status ${statusClass(unit.status)}`}>{unitStatusLabel(unit.status)}</span>
      </div>

      {unit.lastErrorCode ? (
        <div className="ai-error-detail" role="status">
          <strong>{unit.lastErrorCode}</strong>
          <span>{publicOperationalErrorLabel(unit.lastErrorCode)}</span>
        </div>
      ) : null}

      <SourceProvenance sources={unit.sourceProvenance} />

      <section className="ai-subsection" aria-labelledby={`attempts-${unit.id}`}>
        <div className="ai-pane-heading compact"><h4 id={`attempts-${unit.id}`}>المحاولات</h4><span className="count-pill">{unit.attempts.length}</span></div>
        {unit.attempts.length === 0 ? <p className="empty-inline">لم تبدأ محاولة مزود لهذه الوحدة بعد.</p> : <div className="ai-attempt-list">{unit.attempts.map((attempt) => <AttemptCard key={attempt.id} attempt={attempt} />)}</div>}
      </section>

      <section className="ai-subsection" aria-labelledby={`output-${unit.id}`}>
        <h4 id={`output-${unit.id}`}>مراجعة المخرَج</h4>
        {unit.output ? <ReviewOutput output={unit.output} onReviewAction={onReviewAction} /> : <p className="empty-inline">لا يوجد مخرَج محفوظ لهذه الوحدة حتى الآن.</p>}
      </section>
    </div>
  );
}

function AttemptCard({ attempt }: { attempt: AiAttemptView }) {
  return (
    <article className="ai-attempt-card">
      <div className="ai-attempt-heading">
        <div><strong>المحاولة {attempt.attemptNumber}</strong><small>{attempt.providerKey} · {attempt.modelUsed}</small></div>
        <span className={`ai-status ${statusClass(attempt.status)}`}>{jobStatusLabel(attempt.status)}</span>
      </div>
      <dl className="ai-attempt-facts">
        <Fact label="المشروع" value={attempt.projectAlias ?? "غير محدد"} />
        <Fact label="Route" value={attempt.routeKey} mono />
        <Fact label="Benchmark" value={attempt.benchmarkVersion} mono />
        <Fact label="زمن الاستجابة" value={formatLatency(attempt.latencyMs)} />
        <Fact label="Input tokens" value={formatTokens(attempt.inputTokens)} />
        <Fact label="Output tokens" value={formatTokens(attempt.outputTokens)} />
        <Fact label="الكلفة المقدرة" value={formatCost(attempt.estimatedCostUsd)} />
      </dl>
      {attempt.validationStatus ? <p className="ai-attempt-validation">التحقق: <strong>{validationStatusLabel(attempt.validationStatus)}</strong></p> : null}
      {attempt.errorCode ? <p className="ai-attempt-error"><strong>{attempt.errorCode}</strong> · {publicOperationalErrorLabel(attempt.errorCode)}</p> : null}
    </article>
  );
}

function ReviewOutput({ output, onReviewAction }: { output: NonNullable<AiUnitView["output"]>; onReviewAction: (outputId: string, action: AiReviewAction) => void }) {
  const visibleOutput = output.effectiveReviewedOutput ?? (output.reviewStatus === "pending" ? output.normalizedOutput : null);
  return (
    <div className="ai-review-output">
      <div className="ai-review-header">
        <div>
          <span className={`ai-status ${statusClass(output.validationStatus)}`}>{validationStatusLabel(output.validationStatus)}</span>
          <span className={`ai-status ${statusClass(output.reviewStatus)}`}>{reviewStatusLabel(output.reviewStatus)}</span>
          {output.reviewedAt ? <p>آخر مراجعة: {formatDateTime(output.reviewedAt)}{output.reviewedBy ? ` · ${output.reviewedBy}` : ""}</p> : <p>لم يسجل قرار مراجعة بشري لهذا المخرَج بعد.</p>}
        </div>
      </div>

      {output.hasRawResponse ? (
        <div className="ai-authority-note" role="note">
          <strong>توجد استجابة خام محفوظة في الخادم.</strong>
          <span>لا يعرض Frontend محتوى الاستجابة الخام؛ المعروض هنا هو المخرج المنظم/المراجع فقط.</span>
        </div>
      ) : null}

      <SourceProvenance sources={output.sourceProvenance} />
      {output.validationIssues.length > 0 ? <IssueList title="أخطاء التحقق" issues={output.validationIssues} /> : null}
      {output.semanticWarnings.length > 0 ? <IssueList title="ملاحظات التحقق الدلالي" issues={output.semanticWarnings} /> : null}

      {visibleOutput ? <OutputBody output={visibleOutput} /> : (
        <StatePanel
          title={output.reviewStatus === "rejected" ? "تم رفض المخرَج" : "لا يوجد مخرَج منظم صالح للعرض"}
          body={output.reviewStatus === "rejected" ? "الرفض قرار مراجعة نهائي في Stage13E ولا ينشر شيئًا إلى بنك الأسئلة." : "راجع نتائج التحقق. الواجهة لا تعيد بناء استجابة غير صالحة ولا تعرض الاستجابة الخام."}
        />
      )}

      <div className="ai-review-actions" aria-label="إجراءات مراجعة المخرَج">
        {output.allowedReviewActions.length === 0 ? <span className="empty-inline">لا توجد إجراءات مراجعة متاحة من الخادم.</span> : null}
        {output.allowedReviewActions.map((action) => (
          <button className={action === "reject" ? "ai-danger-button" : action === "approve" ? "primary-button small-button" : "secondary-button small-button"} type="button" key={action} onClick={() => onReviewAction(output.id, action)}>
            {reviewActionLabel(action)}
          </button>
        ))}
      </div>
    </div>
  );
}

function IssueList({ title, issues }: { title: string; issues: AiReviewOutputViewLikeIssues }) {
  return (
    <div className="ai-validation-issues" aria-label={title}>
      {issues.map((issue, index) => (
        <article key={`${issue.code}-${issue.path}-${index}`} className={`is-${issue.severity}`}>
          <strong>{issue.code}</strong><span>{issue.message}</span><code>{issue.path}</code>
        </article>
      ))}
    </div>
  );
}

type AiReviewOutputViewLikeIssues = NonNullable<AiUnitView["output"]>["validationIssues"];

function SourceProvenance({ sources }: { sources: readonly AiSourceProvenanceView[] }) {
  return (
    <div className="ai-provenance">
      <h6>مصدر الوحدة</h6>
      {sources.length === 0 ? <p className="empty-inline">لا توجد بيانات provenance متاحة.</p> : (
        <ul>{sources.map((source) => (
          <li key={`${source.mediaAssetId}-${source.pageNumber}`}>
            <span>صفحة <strong>{source.pageNumber}</strong> · {source.inputKind === "approved_ocr" ? "OCR معتمد" : "Vision fallback"}</span>
            <code>media: {source.mediaAssetId}</code>
            <code>sha256: {source.inputChecksumSha256}</code>
            {source.ocrExtractionId ? <code>ocr: {source.ocrExtractionId}</code> : null}
            {source.contentSourceAssetId ? <code>source: {source.contentSourceAssetId}</code> : null}
          </li>
        ))}</ul>
      )}
    </div>
  );
}

function OutputBody({ output }: { output: AiGenerationOutputView }) {
  if (output.kind === "summary") return <div className="ai-output-body"><p className="section-kicker">ملخص منظم</p><p className="ai-long-copy">{output.summary}</p><Evidence evidence={output.sourceEvidence} /></div>;
  if (output.kind === "page_detection") return <div className="ai-output-body"><p className="section-kicker">اكتشاف صفحة</p><h5>{output.title}</h5><p>رقم الصفحة: <strong>{output.pageNumber ?? "غير مثبت من المصدر"}</strong></p><p className="ai-long-copy">{output.contentPreview}</p><Evidence evidence={output.sourceEvidence} /></div>;
  if (output.kind === "question_set") return <QuestionList title="الأسئلة المستخرجة/المولدة" questions={output.questions} />;
  if (output.kind === "lesson_content") return <div className="ai-output-body"><p className="section-kicker">محتوى درس شامل</p><p className="ai-long-copy">{output.summary}</p><Evidence evidence={output.summaryEvidence} /><QuestionList title="أسئلة المحتوى" questions={output.questions} /></div>;
  return <div className="ai-output-body"><p className="section-kicker">نماذج الاختبار</p><div className="ai-version-list">{output.versions.map((version, index) => <section key={`${version.label}-${index}`} className="ai-version-card"><h5>{version.label}</h5><QuestionList title="الأسئلة" questions={version.questions} /></section>)}</div></div>;
}

function QuestionList({ title, questions }: { title: string; questions: readonly AiQuestionView[] }) {
  return (
    <section className="ai-question-section">
      <div className="ai-pane-heading compact"><h5>{title}</h5><span className="count-pill">{questions.length}</span></div>
      {questions.length === 0 ? <p className="empty-inline">لا توجد أسئلة في هذا المخرَج.</p> : null}
      <ol className="ai-question-list">{questions.map((question, index) => (
        <li key={`${index}-${question.prompt.slice(0, 40)}`}>
          <div className="ai-question-meta"><span>{questionTypeLabel(question.type)}</span><span>{difficultyLabel(question.difficulty)}</span><span>{answerStatusLabel(question.answerStatus)}</span></div>
          <strong>{question.prompt}</strong>
          {question.options.length > 0 ? <ul className="ai-option-list">{question.options.map((option, optionIndex) => <li key={`${optionIndex}-${option.slice(0, 30)}`} className={question.correctOptionIndex === optionIndex ? "is-correct" : ""}>{option}{question.correctOptionIndex === optionIndex ? <span> · الإجابة المثبتة</span> : null}</li>)}</ul> : null}
          {question.answerText ? <p><strong>الإجابة:</strong> {question.answerText}</p> : null}
          {question.explanation ? <p><strong>الشرح:</strong> {question.explanation}</p> : null}
          {question.method ? <p><strong>الطريقة:</strong> {question.method}</p> : null}
          <Evidence evidence={question.sourceEvidence} />
        </li>
      ))}</ol>
    </section>
  );
}

function Evidence({ evidence }: { evidence: readonly AiSourceEvidenceView[] }) {
  return (
    <div className="ai-provenance">
      <h6>إحالة المخرج</h6>
      {evidence.length === 0 ? <p className="empty-inline">لا توجد إحالة مصدر في المخرج المنظم.</p> : <ul>{evidence.map((source, index) => <li key={`${source.mediaAssetId}-${source.pageNumber}-${index}`}><span>صفحة <strong>{source.pageNumber}</strong></span><code>media: {source.mediaAssetId}</code>{source.ocrExtractionId ? <code>ocr: {source.ocrExtractionId}</code> : null}{source.quote ? <blockquote>{source.quote}</blockquote> : null}</li>)}</ul>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div><dt>{label}</dt><dd>{mono ? <code>{value}</code> : value}</dd></div>; }
function StatePanel({ title, body, children }: { title: string; body: string; children?: ReactNode }) { return <div className="workspace-state" role="status"><h2>{title}</h2><p>{body}</p>{children ? <div className="ai-state-actions">{children}</div> : null}</div>; }
