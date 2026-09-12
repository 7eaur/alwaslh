import type {
  OperationsAuditEntry,
  OperationsGovernanceOverview,
} from "./service.js";

export interface OperationsAttentionSummary {
  review: {
    contentAssets: number;
    ocr: number;
    ai: number;
    questions: number;
    quizzes: number;
  };
  failures: {
    ingestion: number;
    ocr: number;
    ai: number;
  };
  support: {
    lockedLogins: number;
    pendingRecovery: number;
    forcedPasswordChanges: number;
  };
  recentActivity: OperationsAuditEntry[];
}

export function buildOperationsAttention(
  governance: OperationsGovernanceOverview,
  recentActivity: readonly OperationsAuditEntry[],
): OperationsAttentionSummary {
  return {
    review: {
      contentAssets: governance.reports.content.reviewAssets,
      ocr: governance.reports.ocr.pendingReview,
      ai: governance.reports.ai.reviewRequiredUnits,
      questions: governance.reports.questionBank.review,
      quizzes: governance.reports.quizzes.review,
    },
    failures: {
      ingestion: governance.reports.content.failedIngestionTasks,
      ocr: governance.reports.ocr.failedExtractions,
      ai: governance.reports.ai.failedJobs,
    },
    support: {
      lockedLogins: governance.security.lockedLoginGuards,
      pendingRecovery: governance.security.pendingRecoveryTokens,
      forcedPasswordChanges: governance.security.forcedPasswordChanges,
    },
    recentActivity: [...recentActivity],
  };
}
