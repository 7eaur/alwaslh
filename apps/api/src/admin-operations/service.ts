import type { Database } from "../db.js";
import type { NotificationRecord } from "../notifications/service.js";
import { NotificationService } from "../notifications/service.js";

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
  recentNotifications: NotificationRecord[];
  recentActivity: OperationsActivity[];
}

interface MetricsRow {
  active_classes: string;
  active_subjects: string;
  active_lessons: string;
  active_students: string;
  students_with_access: string;
  active_full_codes: string;
  active_class_codes: string;
  active_notifications: string;
}

interface ActivityRow {
  id: string;
  source: "auth" | "access";
  event_type: string;
  actor_profile_id: string | null;
  actor_display_name: string | null;
  subject_profile_id: string | null;
  subject_display_name: string | null;
  created_at: Date;
}

export class AdminOperationsService {
  private readonly notifications: NotificationService;

  constructor(private readonly db: Database) {
    this.notifications = new NotificationService(db);
  }

  async overview(recentLimit = 8): Promise<OperationsOverview> {
    const [metricsRows, notificationPage, activityRows] = await Promise.all([
      this.db.query<MetricsRow>(`
        select
          (select count(*) from classes where status = 'active')::text as active_classes,
          (select count(*) from subjects where status = 'active')::text as active_subjects,
          (select count(*) from lessons where status = 'active')::text as active_lessons,
          (select count(*) from profiles where role = 'student' and status = 'active')::text as active_students,
          (
            select count(distinct profile_id)
            from student_entitlements
            where status = 'active'
              and starts_at <= now()
              and (expires_at is null or expires_at > now())
          )::text as students_with_access,
          (
            select count(*) from full_access_codes
            where status = 'active'
              and valid_from <= now()
              and (expires_at is null or expires_at > now())
          )::text as active_full_codes,
          (
            select count(*) from class_access_codes
            where status = 'active'
              and valid_from <= now()
              and (expires_at is null or expires_at > now())
          )::text as active_class_codes,
          (
            select count(*) from notifications
            where published_at <= now()
              and (expires_at is null or expires_at > now())
          )::text as active_notifications
      `),
      this.notifications.listAdmin({ limit: recentLimit, offset: 0 }),
      this.db.query<ActivityRow>(
        `select * from (
           select concat('access:', ae.id::text) as id,
                  'access'::text as source,
                  ae.event_type::text as event_type,
                  ae.actor_profile_id,
                  actor.display_name as actor_display_name,
                  ae.subject_profile_id,
                  subject.display_name as subject_display_name,
                  ae.created_at
           from access_events ae
           left join profiles actor on actor.id = ae.actor_profile_id
           left join profiles subject on subject.id = ae.subject_profile_id

           union all

           select concat('auth:', au.id::text) as id,
                  'auth'::text as source,
                  au.event_type::text as event_type,
                  au.actor_profile_id,
                  actor.display_name as actor_display_name,
                  au.profile_id as subject_profile_id,
                  subject.display_name as subject_display_name,
                  au.created_at
           from auth_events au
           left join profiles actor on actor.id = au.actor_profile_id
           left join profiles subject on subject.id = au.profile_id
         ) activity
         order by created_at desc, id desc
         limit $1`,
        [recentLimit],
      ),
    ]);

    const row = metricsRows[0];
    const metrics: OperationsMetrics = {
      activeClasses: Number(row?.active_classes ?? 0),
      activeSubjects: Number(row?.active_subjects ?? 0),
      activeLessons: Number(row?.active_lessons ?? 0),
      activeStudents: Number(row?.active_students ?? 0),
      studentsWithAccess: Number(row?.students_with_access ?? 0),
      activeFullCodes: Number(row?.active_full_codes ?? 0),
      activeClassCodes: Number(row?.active_class_codes ?? 0),
      activeNotifications: Number(row?.active_notifications ?? 0),
    };

    return {
      metrics,
      recentNotifications: notificationPage.notifications,
      recentActivity: activityRows.map((activity) => ({
        id: activity.id,
        source: activity.source,
        eventType: activity.event_type,
        actorProfileId: activity.actor_profile_id,
        actorDisplayName: activity.actor_display_name,
        subjectProfileId: activity.subject_profile_id,
        subjectDisplayName: activity.subject_display_name,
        createdAt: activity.created_at.toISOString(),
      })),
    };
  }
}
