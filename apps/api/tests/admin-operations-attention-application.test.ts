import assert from "node:assert/strict";
import test from "node:test";
import { loadOperationsAttention } from "../src/admin-operations/attention-application.js";
import type { OperationsAuditPage, OperationsGovernanceOverview } from "../src/admin-operations/service.js";
import type { AppConfig } from "../src/config.js";

const governance: OperationsGovernanceOverview = {
  reports: {
    content: {
      activeIngestionTasks: 1,
      failedIngestionTasks: 2,
      draftAssets: 3,
      reviewAssets: 4,
      publishedAssets: 5,
    },
    ocr: { activeExtractions: 6, failedExtractions: 7, pendingReview: 8 },
    ai: { activeJobs: 9, failedJobs: 10, reviewRequiredUnits: 11 },
    questionBank: { draft: 12, review: 13, published: 14, archived: 15 },
    quizzes: { draft: 16, review: 17, published: 18, archived: 19 },
  },
  settings: {
    environment: "test",
    databaseSsl: "disable",
    databasePoolMax: 10,
    sessionTtlHours: 24,
    sessionSameSite: "lax",
    allowedOriginCount: 1,
    aiGlobalKillSwitch: false,
    aiBudgetConfigured: false,
  },
  security: {
    activeAdminSessions: 1,
    activeStudentSessions: 2,
    lockedLoginGuards: 20,
    pendingRecoveryTokens: 21,
    activeStudentDevices: 3,
    pendingDeviceChallenges: 4,
    pendingActivationTickets: 5,
    forcedPasswordChanges: 22,
    aiRoutesPaused: 0,
    aiRoutesCoolingDown: 0,
  },
};

const auditPage: OperationsAuditPage = {
  entries: [
    {
      id: "auth:1",
      source: "auth",
      eventType: "login_failed",
      actorProfileId: null,
      actorDisplayName: null,
      subjectProfileId: "profile-1",
      subjectDisplayName: "طالب",
      resourceType: "profile",
      resourceId: "profile-1",
      createdAt: "2026-09-14T12:00:00.000Z",
    },
  ],
  page: { total: 1, limit: 3, offset: 0 },
};

test("operations attention application owns governance and audit orchestration", async () => {
  const config = {} as AppConfig;
  const calls: unknown[] = [];
  const operations = {
    async governance(receivedConfig: AppConfig) {
      calls.push(["governance", receivedConfig]);
      return governance;
    },
    async audit(input: { limit?: number; offset?: number }) {
      calls.push(["audit", input]);
      return auditPage;
    },
  };

  const result = await loadOperationsAttention(operations, config, 3);

  assert.deepEqual(calls, [
    ["governance", config],
    ["audit", { limit: 3, offset: 0 }],
  ]);
  assert.deepEqual(result.review, {
    contentAssets: 4,
    ocr: 8,
    ai: 11,
    questions: 13,
    quizzes: 17,
  });
  assert.deepEqual(result.failures, { ingestion: 2, ocr: 7, ai: 10 });
  assert.deepEqual(result.support, {
    lockedLogins: 20,
    pendingRecovery: 21,
    forcedPasswordChanges: 22,
  });
  assert.deepEqual(result.recentActivity, auditPage.entries);
});
