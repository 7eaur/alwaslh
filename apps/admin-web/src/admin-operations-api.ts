import { adminApiRequest } from "./admin-api";

export type NotificationSeverity = "info" | "success" | "warning" | "critical";

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
