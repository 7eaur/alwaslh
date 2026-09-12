import assert from "node:assert/strict";
import test from "node:test";
import { buildOperationsAttention } from "../src/admin-operations/attention.js";
import type {
  OperationsAuditEntry,
  OperationsGovernanceOverview,
} from "../src/admin-operations/service.js";

const governance: OperationsGovernanceOverview = {
  reports: {
    content: {
      activeIngestionTasks: 4,
      failedIngestionTasks: 2,
      draftAssets: 9,
      reviewAssets: 3,
      publishedAssets: 12,
    },
    ocr: { activeExtractions: 2, failedExtractions: 1, pendingReview: 5 },
    ai: { activeJobs: 3, failedJobs: 2, reviewRequiredUnits: 7 },
    questionBank: { draft: 8, review: 4, published: 30, archived: 1 },
    quizzes: { draft: 3, review: 2, published: 10, archived: 0 },
  },
  settings: {
    environment: "test",
    databaseSsl: "disable",
    databasePoolMax: 10,
    sessionTtlHours: 24,
    sessionSameSite: "lax",
    allowedOriginCount: 1,
    aiGlobalKillSwitch: false,
    aiBudgetConfigured: true,
  },
  security: {
    activeAdminSessions: 1,
    activeStudentSessions: 20,
    lockedLoginGuards: 2,
    pendingRecoveryTokens: 3,
    activeStudentDevices: 18,
    pendingDeviceChallenges: 0,
    pendingActivationTickets: 1,
    forcedPasswordChanges: 4,
    aiRoutesPaused: 0,
    aiRoutesCoolingDown: 0,
  },
};

const activity: OperationsAuditEntry[] = [
  {
    id: "audit:1",
    source: "question_bank",
    eventType: "publish",
    actorProfileId: "actor-1",
    actorDisplayName: "مدير المحتوى",
    subjectProfileId: null,
    subjectDisplayName: null,
    resourceType: "question_bank_item",
    resourceId: "question-1",
    createdAt: "2026-09-13T00:00:00.000Z",
  },
];

test("attention projection contains only actionable review, failure, support, and recent activity data", () => {
  const summary = buildOperationsAttention(governance, activity);

  assert.deepEqual(summary.review, {
    contentAssets: 3,
    ocr: 5,
    ai: 7,
    questions: 4,
    quizzes: 2,
  });
  assert.deepEqual(summary.failures, { ingestion: 2, ocr: 1, ai: 2 });
  assert.deepEqual(summary.support, {
    lockedLogins: 2,
    pendingRecovery: 3,
    forcedPasswordChanges: 4,
  });
  assert.deepEqual(summary.recentActivity, activity);
  assert.equal("settings" in summary, false);
  assert.equal("security" in summary, false);
});
