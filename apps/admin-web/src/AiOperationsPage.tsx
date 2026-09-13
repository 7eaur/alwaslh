import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "./admin-api";
import { applyApprovedLessonOutput, applyApprovedQuizOutput } from "./admin-ai-authoring-api";
import { fetchAiApplicationCapability, type AiApplicationCapability } from "./ai-application-api";
import {
  fetchAiJobDetail,
  fetchAiJobs,
  fetchAiOutputDetail,
  fetchAiUnitDetail,
  isAiConflictError,
  mutateAiJob,
  reviewAiOutput,
  type AiReviewMutationInput,
} from "./ai-operations-api";
import {
  enrichAiUnit,
  mapAiJobDetail,
  mapAiJobSummary,
  mapAiOutputDetail,
} from "./ai-operations-adapter";
import type {
  AiJobAction,
  AiJobDetailView,
  AiJobSummaryView,
  AiOperationsFeedback,
  AiOperationsWorkspaceModel,
} from "./ai-operations-view-model";
import { AiReviewWorkspace } from "./AiReviewWorkspace";

interface Props {
  onSessionExpired: () => void;
}

const POLL_INTERVAL_MS = 5_000;
const JOB_PAGE_SIZE = 30;
const UNIT_PAGE_SIZE = 50;
const ATTEMPT_PAGE_SIZE = 50;
const REVIEW_PAGE_SIZE = 50;
const TERMINAL_EXECUTION_STATUSES = new Set(["completed", "failed", "cancelled"]);

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال العملية. أعد المحاولة.";
}

export function AiOperationsPage({ onSessionExpired }: Props) {
  const [state, setState] = useState<AiOperationsWorkspaceModel["state"]>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobs, setJobs] = useState<AiJobSummaryView[]>([]);
  const [jobPagination, setJobPagination] = useState({ total: 0, limit: JOB_PAGE_SIZE, offset: 0 });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobState, setSelectedJobState] = useState<AiOperationsWorkspaceModel["selectedJobState"]>("idle");
  const [selectedJobError, setSelectedJobError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<AiJobDetailView | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedUnitState, setSelectedUnitState] = useState<AiOperationsWorkspaceModel["selectedUnitState"]>("idle");
  const [selectedUnitError, setSelectedUnitError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<AiOperationsFeedback | null>(null);

  const selectedJobIdRef = useRef<string | null>(null);
  const selectedUnitIdRef = useRef<string | null>(null);
  const jobOffsetRef = useRef(0);
  const unitOffsetRef = useRef(0);
  const attemptOffsetRef = useRef(0);
  const reviewOffsetRef = useRef(0);
  const listSequence = useRef(0);
  const jobSequence = useRef(0);
  const unitSequence = useRef(0);

  const handleError = useCallback((error: unknown): string | null => {
    if (isMissingSessionError(error)) {
      onSessionExpired();
      return null;
    }
    return messageFor(error);
  }, [onSessionExpired]);

  const clearSelectedUnit = useCallback(() => {
    selectedUnitIdRef.current = null;
    attemptOffsetRef.current = 0;
    reviewOffsetRef.current = 0;
    setSelectedUnitId(null);
    setSelectedUnitState("idle");
    setSelectedUnitError(null);
  }, []);

  const clearSelectedJob = useCallback(() => {
    selectedJobIdRef.current = null;
    unitOffsetRef.current = 0;
    setSelectedJobId(null);
    setSelectedJob(null);
    setSelectedJobState("idle");
    setSelectedJobError(null);
    clearSelectedUnit();
  }, [clearSelectedUnit]);

  const loadJobs = useCallback(async (background = false, requestedOffset = jobOffsetRef.current) => {
    const sequence = ++listSequence.current;
    if (!background) {
      setState("loading");
      setErrorMessage(null);
    }
    try {
      const result = await fetchAiJobs({ limit: JOB_PAGE_SIZE, offset: requestedOffset });
      if (sequence !== listSequence.current) return;
      const mapped = result.jobs.map(mapAiJobSummary);
      jobOffsetRef.current = result.pagination.offset;
      setJobPagination({ ...result.pagination });
      setJobs(mapped);
      setState(result.pagination.total === 0 ? "empty" : "ready");
      setErrorMessage(null);
    } catch (error) {
      if (sequence !== listSequence.current) return;
      const message = handleError(error);
      if (message === null) return;
      if (!background) setState("error");
      setErrorMessage(message);
    }
  }, [handleError]);

  const loadJob = useCallback(async (
    jobId: string,
    background = false,
    requestedUnitOffset = background ? unitOffsetRef.current : 0,
  ) => {
    const sequence = ++jobSequence.current;
    if (!background) {
      selectedJobIdRef.current = jobId;
      unitOffsetRef.current = requestedUnitOffset;
      setSelectedJobId(jobId);
      clearSelectedUnit();
      setSelectedJobState("loading");
      setSelectedJobError(null);
    }
    try {
      const result = await fetchAiJobDetail(jobId, UNIT_PAGE_SIZE, requestedUnitOffset);
      if (sequence !== jobSequence.current || selectedJobIdRef.current !== jobId) return;
      unitOffsetRef.current = result.pagination.offset;
      const mapped = mapAiJobDetail(result);
      setSelectedJob((current) => {
        const detailedUnit = current?.units.find((unit) => unit.id === selectedUnitIdRef.current) ?? null;
        if (!detailedUnit) return mapped;
        return {
          ...mapped,
          units: mapped.units.map((unit) => unit.id === detailedUnit.id ? {
            ...unit,
            attempts: detailedUnit.attempts,
            attemptPagination: detailedUnit.attemptPagination,
            output: detailedUnit.output,
          } : unit),
        };
      });
      setJobs((current) => current.map((job) => job.id === mapped.id ? {
        id: mapped.id,
        jobType: mapped.jobType,
        promptKey: mapped.promptKey,
        promptVersion: mapped.promptVersion,
        createdAt: mapped.createdAt,
        progress: mapped.progress,
      } : job));
      setSelectedJobState("ready");
      setSelectedJobError(null);
    } catch (error) {
      if (sequence !== jobSequence.current || selectedJobIdRef.current !== jobId) return;
      const message = handleError(error);
      if (message === null) return;
      if (!background) setSelectedJobState("error");
      setSelectedJobError(message);
    }
  }, [clearSelectedUnit, handleError]);

  const loadUnit = useCallback(async (
    unitId: string,
    background = false,
    requestedAttemptOffset = background ? attemptOffsetRef.current : 0,
    requestedReviewOffset = background ? reviewOffsetRef.current : 0,
  ) => {
    const sequence = ++unitSequence.current;
    if (!background) {
      selectedUnitIdRef.current = unitId;
      attemptOffsetRef.current = requestedAttemptOffset;
      reviewOffsetRef.current = requestedReviewOffset;
      setSelectedUnitId(unitId);
      setSelectedUnitState("loading");
      setSelectedUnitError(null);
    }
    try {
      const detail = await fetchAiUnitDetail(unitId, ATTEMPT_PAGE_SIZE, requestedAttemptOffset);
      let output = null;
      if (detail.unit.output?.id) {
        const outputId = detail.unit.output.id;
        const [outputDetail, capability] = await Promise.all([
          fetchAiOutputDetail(outputId, REVIEW_PAGE_SIZE, requestedReviewOffset),
          fetchAiApplicationCapability(outputId),
        ]);
        output = { ...mapAiOutputDetail(outputDetail), application: capability.application };
      }
      if (sequence !== unitSequence.current || selectedUnitIdRef.current !== unitId) return;
      attemptOffsetRef.current = detail.attemptPagination.offset;
      reviewOffsetRef.current = output?.reviewPagination.offset ?? 0;
      const enriched = enrichAiUnit(detail.unit, detail.attempts, output, detail.attemptPagination);
      setSelectedJob((current) => current ? {
        ...current,
        units: current.units.map((unit) => unit.id === unitId ? enriched : unit),
      } : current);
      setSelectedUnitState("ready");
      setSelectedUnitError(null);
    } catch (error) {
      if (sequence !== unitSequence.current || selectedUnitIdRef.current !== unitId) return;
      const message = handleError(error);
      if (message === null) return;
      if (!background) setSelectedUnitState("error");
      setSelectedUnitError(message);
    }
  }, [handleError]);

  const changeJobPage = useCallback((offset: number) => {
    jobOffsetRef.current = offset;
    clearSelectedJob();
    void loadJobs(false, offset);
  }, [clearSelectedJob, loadJobs]);

  const changeUnitPage = useCallback((offset: number) => {
    const jobId = selectedJobIdRef.current;
    if (!jobId) return;
    unitOffsetRef.current = offset;
    clearSelectedUnit();
    void loadJob(jobId, false, offset);
  }, [clearSelectedUnit, loadJob]);

  const changeAttemptPage = useCallback((unitId: string, offset: number) => {
    attemptOffsetRef.current = offset;
    void loadUnit(unitId, false, offset, reviewOffsetRef.current);
  }, [loadUnit]);

  const changeReviewPage = useCallback((unitId: string, offset: number) => {
    if (selectedUnitIdRef.current !== unitId) return;
    reviewOffsetRef.current = offset;
    void loadUnit(unitId, false, attemptOffsetRef.current, offset);
  }, [loadUnit]);

  const refreshCanonical = useCallback(async (jobId: string | null, unitId: string | null) => {
    setIsRefreshing(true);
    try {
      await loadJobs(true, jobOffsetRef.current);
      if (jobId) await loadJob(jobId, true, unitOffsetRef.current);
      if (unitId) {
        await loadUnit(unitId, true, attemptOffsetRef.current, reviewOffsetRef.current);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [loadJob, loadJobs, loadUnit]);

  useEffect(() => {
    void loadJobs(false, 0);
  }, [loadJobs]);

  useEffect(() => {
    if (!selectedJob || TERMINAL_EXECUTION_STATUSES.has(selectedJob.progress.executionStatus)) return;
    let stopped = false;
    let inFlight = false;
    const timer = window.setInterval(() => {
      if (stopped || inFlight) return;
      inFlight = true;
      const jobId = selectedJob.id;
      const unitId = selectedUnitIdRef.current;
      void (async () => {
        try {
          await loadJob(jobId, true, unitOffsetRef.current);
          if (unitId) {
            await loadUnit(unitId, true, attemptOffsetRef.current, reviewOffsetRef.current);
          }
        } finally {
          inFlight = false;
        }
      })();
    }, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [loadJob, loadUnit, selectedJob]);

  const runJobAction = useCallback(async (jobId: string, action: AiJobAction) => {
    setFeedback({ kind: "busy", message: "جارٍ تنفيذ الإجراء وتحديث الحالة من الخادم…" });
    try {
      await mutateAiJob(jobId, action);
      await refreshCanonical(jobId, selectedUnitIdRef.current);
      setFeedback({ kind: "success", message: "تم تنفيذ الإجراء وتحديث الحالة الفعلية من الخادم." });
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      if (isAiConflictError(error)) {
        await refreshCanonical(jobId, selectedUnitIdRef.current);
        setFeedback({ kind: "error", message: "تغيرت الحالة على الخادم قبل تنفيذ الإجراء. تم تحديث البيانات؛ راجع الإجراءات المتاحة الآن." });
        return;
      }
      setFeedback({ kind: "error", message: messageFor(error) });
    }
  }, [onSessionExpired, refreshCanonical]);

  const submitReview = useCallback(async (outputId: string, input: AiReviewMutationInput): Promise<boolean> => {
    setFeedback({ kind: "busy", message: "جارٍ حفظ قرار المراجعة والتحقق منه على الخادم…" });
    try {
      await reviewAiOutput(outputId, input);
      await refreshCanonical(selectedJobIdRef.current, selectedUnitIdRef.current);
      setFeedback({ kind: "success", message: "تم حفظ قرار المراجعة وتحديث النتيجة من المصدر الموثوق." });
      return true;
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return false;
      }
      if (isAiConflictError(error)) {
        await refreshCanonical(selectedJobIdRef.current, selectedUnitIdRef.current);
        setFeedback({ kind: "error", message: "سبق أن تغيرت حالة المراجعة أو لم يعد القرار صالحًا. تم تحديث النتيجة من الخادم." });
        return false;
      }
      setFeedback({ kind: "error", message: messageFor(error) });
      return false;
    }
  }, [onSessionExpired, refreshCanonical]);

  const applyOutput = useCallback(async (outputId: string, kind: AiApplicationCapability["kind"]): Promise<void> => {
    setFeedback({ kind: "busy", message: "جارٍ تطبيق النتيجة المعتمدة عبر الخادم…" });
    try {
      if (kind === "lesson") {
        const result = await applyApprovedLessonOutput(outputId);
        const pieces = [
          result.summaryApplied ? "تم تحديث ملخص الدرس" : null,
          result.questionBankItemIds.length > 0 ? `أضيفت ${result.questionBankItemIds.length} مسودة إلى بنك الأسئلة` : null,
        ].filter(Boolean);
        setFeedback({
          kind: "success",
          message: `${pieces.join("، ") || "تم تطبيق محتوى الدرس"}. لا يتم نشر الأسئلة تلقائيًا.`,
        });
      } else {
        const result = await applyApprovedQuizOutput(outputId);
        setFeedback({
          kind: "success",
          message: result.readyForVersion
            ? "تم تطبيق النتيجة وتركيب نموذج الاختبار وفق الأسئلة المنشورة."
            : `تم استيراد ${result.questionBankItemIds.length} سؤالًا كمسودات. راجعها وانشرها في بنك الأسئلة ثم أعد تطبيق النتيجة لتركيب النموذج.`,
        });
      }
      await refreshCanonical(selectedJobIdRef.current, selectedUnitIdRef.current);
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return;
      }
      if (isAiConflictError(error)) {
        await refreshCanonical(selectedJobIdRef.current, selectedUnitIdRef.current);
        setFeedback({ kind: "error", message: "لم يعد التطبيق صالحًا وفق الحالة الحالية. تم تحديث البيانات من الخادم." });
        return;
      }
      setFeedback({ kind: "error", message: messageFor(error) });
    }
  }, [onSessionExpired, refreshCanonical]);

  const model = useMemo<AiOperationsWorkspaceModel>(() => ({
    state,
    errorMessage,
    jobs,
    jobPagination,
    selectedJobId,
    selectedJobState,
    selectedJobError,
    selectedJob,
    selectedUnitId,
    selectedUnitState,
    selectedUnitError,
    isRefreshing,
    feedback,
  }), [
    errorMessage,
    feedback,
    isRefreshing,
    jobPagination,
    jobs,
    selectedJob,
    selectedJobError,
    selectedJobId,
    selectedJobState,
    selectedUnitError,
    selectedUnitId,
    selectedUnitState,
    state,
  ]);

  return (
    <AiReviewWorkspace
      model={model}
      onRefresh={() => void refreshCanonical(selectedJobIdRef.current, selectedUnitIdRef.current)}
      onSelectJob={(jobId) => void loadJob(jobId)}
      onSelectUnit={(unitId) => void loadUnit(unitId)}
      onJobPageChange={changeJobPage}
      onUnitPageChange={changeUnitPage}
      onAttemptPageChange={changeAttemptPage}
      onReviewPageChange={changeReviewPage}
      onJobAction={(jobId, action) => void runJobAction(jobId, action)}
      onReviewSubmit={submitReview}
      onApplyOutput={applyOutput}
    />
  );
}
