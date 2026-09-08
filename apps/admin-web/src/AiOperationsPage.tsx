import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiRequestError, isMissingSessionError } from "./admin-api";
import { AiOperationsWorkspace } from "./AiOperationsWorkspace";
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

interface Props {
  onSessionExpired: () => void;
}

const POLL_INTERVAL_MS = 5_000;
const TERMINAL_EXECUTION_STATUSES = new Set(["completed", "failed", "cancelled"]);

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "تعذر إكمال العملية. أعد المحاولة.";
}

export function AiOperationsPage({ onSessionExpired }: Props) {
  const [state, setState] = useState<AiOperationsWorkspaceModel["state"]>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobs, setJobs] = useState<AiJobSummaryView[]>([]);
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

  const loadJobs = useCallback(async (background = false) => {
    const sequence = ++listSequence.current;
    if (!background) {
      setState("loading");
      setErrorMessage(null);
    }
    try {
      const result = await fetchAiJobs({ limit: 30, offset: 0 });
      if (sequence !== listSequence.current) return;
      const mapped = result.jobs.map(mapAiJobSummary);
      setJobs(mapped);
      setState(mapped.length === 0 ? "empty" : "ready");
      setErrorMessage(null);
    } catch (error) {
      if (sequence !== listSequence.current) return;
      const message = handleError(error);
      if (message === null) return;
      if (!background) setState("error");
      setErrorMessage(message);
    }
  }, [handleError]);

  const loadJob = useCallback(async (jobId: string, background = false) => {
    const sequence = ++jobSequence.current;
    if (!background) {
      selectedJobIdRef.current = jobId;
      selectedUnitIdRef.current = null;
      setSelectedJobId(jobId);
      setSelectedUnitId(null);
      setSelectedUnitState("idle");
      setSelectedUnitError(null);
      setSelectedJobState("loading");
      setSelectedJobError(null);
    }
    try {
      const result = await fetchAiJobDetail(jobId);
      if (sequence !== jobSequence.current || selectedJobIdRef.current !== jobId) return;
      const mapped = mapAiJobDetail(result);
      setSelectedJob((current) => {
        const detailedUnit = current?.units.find((unit) => unit.id === selectedUnitIdRef.current) ?? null;
        if (!detailedUnit) return mapped;
        return {
          ...mapped,
          units: mapped.units.map((unit) => unit.id === detailedUnit.id ? {
            ...unit,
            attempts: detailedUnit.attempts,
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
  }, [handleError]);

  const loadUnit = useCallback(async (unitId: string, background = false) => {
    const sequence = ++unitSequence.current;
    if (!background) {
      selectedUnitIdRef.current = unitId;
      setSelectedUnitId(unitId);
      setSelectedUnitState("loading");
      setSelectedUnitError(null);
    }
    try {
      const detail = await fetchAiUnitDetail(unitId);
      let output = null;
      if (detail.unit.output?.id) {
        output = mapAiOutputDetail(await fetchAiOutputDetail(detail.unit.output.id));
      }
      if (sequence !== unitSequence.current || selectedUnitIdRef.current !== unitId) return;
      const enriched = enrichAiUnit(detail.unit, detail.attempts, output);
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

  const refreshCanonical = useCallback(async (jobId: string | null, unitId: string | null) => {
    setIsRefreshing(true);
    try {
      await loadJobs(true);
      if (jobId) await loadJob(jobId, true);
      if (unitId) await loadUnit(unitId, true);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadJob, loadJobs, loadUnit]);

  useEffect(() => {
    void loadJobs();
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
          await loadJob(jobId, true);
          if (unitId) await loadUnit(unitId, true);
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
      setFeedback({ kind: "success", message: "تم حفظ قرار المراجعة وتحديث المخرج من المصدر الموثوق." });
      return true;
    } catch (error) {
      if (isMissingSessionError(error)) {
        onSessionExpired();
        return false;
      }
      if (isAiConflictError(error)) {
        await refreshCanonical(selectedJobIdRef.current, selectedUnitIdRef.current);
        setFeedback({ kind: "error", message: "سبق أن تغيرت حالة المراجعة أو لم يعد القرار صالحًا. تم تحديث المخرج من الخادم." });
        return false;
      }
      setFeedback({ kind: "error", message: messageFor(error) });
      return false;
    }
  }, [onSessionExpired, refreshCanonical]);

  const model = useMemo<AiOperationsWorkspaceModel>(() => ({
    state,
    errorMessage,
    jobs,
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
    <AiOperationsWorkspace
      model={model}
      onRefresh={() => void refreshCanonical(selectedJobIdRef.current, selectedUnitIdRef.current)}
      onSelectJob={(jobId) => void loadJob(jobId)}
      onSelectUnit={(unitId) => void loadUnit(unitId)}
      onJobAction={(jobId, action) => void runJobAction(jobId, action)}
      onReviewSubmit={submitReview}
    />
  );
}
