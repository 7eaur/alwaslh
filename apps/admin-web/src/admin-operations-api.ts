import { adminApiRequest } from "./admin-api";

export type NotificationSeverity = "info" | "success" | "warning" | "critical";
export type OperationsAuditSource =
  | "auth"
  | "access"
  | "curriculum"
  | "ai_review"
  | "question_bank"
  | "quiz_builder";

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  severity: NotificationSeverity;
  targetProfileId: string | null;
  targetClassId: string | null;
  targetClassName: string | null;
  actionPath: string | null;
  publishedAt: string;
  expiresAt: string | null;
  createdByProfileId: string | null;
  createdByDisplayName: string | null;
  createdAt: string;
}

export interface NotificationPage {
  notifications: AdminNotification[];
  page: { total: number; limit: number; offset: number };
}

export interface OperationsMetrics {
  activeClasses: number;
  activeSubjects: number;
  activeLessons: number;
  activeStudents: number;
  studentsWithAccess: number;
  activeFullCodes: number;
  activeClassCodes: number;
  activeNotifications: number;
}

export interface OperationsActivity {
  id: string;
  source: "auth" | "access";
  eventType: string;
  actorProfileId: string | null;
  actorDisplayName: string | null;
  subjectProfileId: string | null;
  subjectDisplayName: string | null;
  createdAt: string;
}

export interface OperationsOverview {
  metrics: OperationsMetrics;
  recentNotifications: AdminNotification[];
  recentActivity: OperationsActivity[];
}

export interface OperationsGovernanceOverview {
  reports: {
    content: {
      activeIngestionTasks: number;
      failedIngestionTasks: number;
      draftAssets: number;
      reviewAssets: number;
      publishedAssets: number;
    };
    ocr: {
      activeExtractions: number;
      failedExtractions: number;
      pendingReview: number;
    };
    ai: {
      activeJobs: number;
      failedJobs: number;
      reviewRequiredUnits: number;
    };
    questionBank: {
      draft: number;
      review: number;
      published: number;
      archived: number;
    };
    quizzes: {
      draft: number;
      review: number;
      published: number;
      archived: number;
    };
  };
  settings: {
    environment: "development" | "test" | "production";
    databaseSsl: "disable" | "require";
    databasePoolMax: number;
    sessionTtlHours: number;
    sessionSameSite: "lax" | "none";
    allowedOriginCount: number;
    aiGlobalKillSwitch: boolean;
    aiBudgetConfigured: boolean;
  };
  security: {
    activeAdminSessions: number;
    activeStudentSessions: number;
    lockedLoginGuards: number;
    pendingRecoveryTokens: number;
    activeStudentDevices: number;
    pendingDeviceChallenges: number;
    pendingActivationTickets: number;
    forcedPasswordChanges: number;
    aiRoutesPaused: number;
    aiRoutesCoolingDown: number;
  };
}

export interface OperationsAuditEntry {
  id: string;
  source: OperationsAuditSource;
  eventType: string;
  actorProfileId: string | null;
  actorDisplayName: string | null;
  subjectProfileId: string | null;
  subjectDisplayName: string | null;
  resourceType: string | null;
  resourceId: string | null;
  createdAt: string;
}

export interface OperationsAuditPage {
  entries: OperationsAuditEntry[];
  page: { total: number; limit: number; offset: number };
}

function queryString(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export function fetchAdminOperationsOverview(recentLimit = 8): Promise<OperationsOverview> {
  return adminApiRequest<OperationsOverview>(
    `/v1/admin/operations/overview${queryString({ recentLimit })}`,
  );
}

export function fetchAdminOperationsGovernance(): Promise<OperationsGovernanceOverview> {
  return adminApiRequest<OperationsGovernanceOverview>("/v1/admin/operations/governance");
}

export function fetchAdminOperationsAudit(input: {
  source?: OperationsAuditSource;
  eventType?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<OperationsAuditPage> {
  return adminApiRequest<OperationsAuditPage>(
    `/v1/admin/operations/audit${queryString({
      source: input.source,
      eventType: input.eventType?.trim(),
      limit: input.limit,
      offset: input.offset,
    })}`,
  );
}

export function fetchAdminNotifications(input: {
  search?: string;
  severity?: NotificationSeverity;
  limit?: number;
  offset?: number;
} = {}): Promise<NotificationPage> {
  return adminApiRequest<NotificationPage>(
    `/v1/admin/notifications${queryString({
      search: input.search?.trim(),
      severity: input.severity,
      limit: input.limit,
      offset: input.offset,
    })}`,
  );
}

export function createAdminNotification(input: {
  title: string;
  body: string;
  severity: NotificationSeverity;
  actionPath?: string | null;
  expiresAt?: string | null;
}): Promise<{ notification: AdminNotification }> {
  return adminApiRequest<{ notification: AdminNotification }>("/v1/admin/notifications", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteAdminNotification(notificationId: string): Promise<void> {
  await adminApiRequest(`/v1/admin/notifications/${notificationId}`, {
    method: "DELETE",
  });
}
