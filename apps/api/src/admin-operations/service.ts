import type { AppConfig } from "../config.js";
import { allowedOrigins } from "../config.js";
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

export type OperationsAuditSource = "auth" | "access" | "ai_review" | "question_bank" | "quiz_builder";

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

export interface OperationsGovernanceOverview {
  reports: {
    content: {
      activeIngestionTasks: number;
      failedIngestionTasks: number;
      draftAssets: number;
      reviewAssets: number;
      publishedAssets: number;
    };
    ocr: { activeExtractions: number; failedExtractions: number; pendingReview: number };
    ai: { activeJobs: number; failedJobs: number; reviewRequiredUnits: number };
    questionBank: { draft: number; review: number; published: number; archived: number };
    quizzes: { draft: number; review: number; published: number; archived: number };
  };
  settings: {
    environment: AppConfig["NODE_ENV"];
    databaseSsl: AppConfig["DATABASE_SSL"];
    databasePoolMax: number;
    sessionTtlHours: number;
    sessionSameSite: AppConfig["SESSION_COOKIE_SAME_SITE"];
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

interface GovernanceRow {
  active_ingestion_tasks: string;
  failed_ingestion_tasks: string;
  draft_assets: string;
  review_assets: string;
  published_assets: string;
  active_ocr_extractions: string;
  failed_ocr_extractions: string;
  pending_ocr_review: string;
  active_ai_jobs: string;
  failed_ai_jobs: string;
  ai_review_required_units: string;
  question_bank_draft: string;
  question_bank_review: string;
  question_bank_published: string;
  question_bank_archived: string;
  quizzes_draft: string;
  quizzes_review: string;
  quizzes_published: string;
  quizzes_archived: string;
  active_admin_sessions: string;
  active_student_sessions: string;
  locked_login_guards: string;
  pending_recovery_tokens: string;
  active_student_devices: string;
  pending_device_challenges: string;
  pending_activation_tickets: string;
  forced_password_changes: string;
  ai_global_kill_switch: boolean;
  ai_budget_configured: boolean;
  ai_routes_paused: string;
  ai_routes_cooling_down: string;
}

interface AuditRow {
  id: string;
  source: OperationsAuditSource;
  event_type: string;
  actor_profile_id: string | null;
  actor_display_name: string | null;
  subject_profile_id: string | null;
  subject_display_name: string | null;
  resource_type: string | null;
  resource_id: string | null;
  created_at: Date;
}

const AUDIT_UNION_SQL = `
  select concat('auth:', au.id::text) as id,
         'auth'::text as source,
         au.event_type::text as event_type,
         au.actor_profile_id,
         actor.display_name as actor_display_name,
         au.profile_id as subject_profile_id,
         subject.display_name as subject_display_name,
         case when au.profile_id is null then null else 'profile' end::text as resource_type,
         au.profile_id::text as resource_id,
         au.created_at
  from auth_events au
  left join profiles actor on actor.id = au.actor_profile_id
  left join profiles subject on subject.id = au.profile_id

  union all

  select concat('access:', ae.id::text) as id,
         'access'::text as source,
         ae.event_type::text as event_type,
         ae.actor_profile_id,
         actor.display_name as actor_display_name,
         ae.subject_profile_id,
         subject.display_name as subject_display_name,
         case
           when ae.entitlement_id is not null then 'entitlement'
           when ae.full_access_code_id is not null then 'full_access_code'
           when ae.class_access_code_id is not null then 'class_access_code'
           when ae.subject_profile_id is not null then 'profile'
           else null
         end::text as resource_type,
         coalesce(
           ae.entitlement_id::text,
           ae.full_access_code_id::text,
           ae.class_access_code_id::text,
           ae.subject_profile_id::text
         ) as resource_id,
         ae.created_at
  from access_events ae
  left join profiles actor on actor.id = ae.actor_profile_id
  left join profiles subject on subject.id = ae.subject_profile_id

  union all

  select concat('ai_review:', rev.id::text) as id,
         'ai_review'::text as source,
         rev.action::text as event_type,
         rev.actor_profile_id,
         actor.display_name as actor_display_name,
         null::uuid as subject_profile_id,
         null::text as subject_display_name,
         'ai_output'::text as resource_type,
         rev.ai_output_id::text as resource_id,
         rev.created_at
  from ai_output_review_events rev
  left join profiles actor on actor.id = rev.actor_profile_id

  union all

  select concat('question_bank:', qbe.id::text) as id,
         'question_bank'::text as source,
         qbe.action::text as event_type,
         qbe.actor_profile_id,
         actor.display_name as actor_display_name,
         null::uuid as subject_profile_id,
         null::text as subject_display_name,
         'question_bank_item'::text as resource_type,
         qbe.item_id::text as resource_id,
         qbe.created_at
  from question_bank_events qbe
  left join profiles actor on actor.id = qbe.actor_profile_id

  union all

  select concat('quiz_builder:', qze.id::text) as id,
         'quiz_builder'::text as source,
         qze.action::text as event_type,
         qze.actor_profile_id,
         actor.display_name as actor_display_name,
         null::uuid as subject_profile_id,
         null::text as subject_display_name,
         'quiz'::text as resource_type,
         qze.quiz_id::text as resource_id,
         qze.created_at
  from quiz_builder_events qze
  left join profiles actor on actor.id = qze.actor_profile_id
`;

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

  async governance(config: AppConfig): Promise<OperationsGovernanceOverview> {
    const rows = await this.db.query<GovernanceRow>(`
      select
        (select count(*) from content_ingestion_tasks where status in ('uploading', 'ready', 'processing'))::text as active_ingestion_tasks,
        (select count(*) from content_ingestion_tasks where status = 'failed')::text as failed_ingestion_tasks,
        (select count(*) from lesson_assets where publication_status = 'draft')::text as draft_assets,
        (select count(*) from lesson_assets where publication_status = 'review')::text as review_assets,
        (select count(*) from lesson_assets where publication_status = 'published')::text as published_assets,
        (select count(*) from ocr_extractions where status in ('queued', 'running', 'retrying'))::text as active_ocr_extractions,
        (select count(*) from ocr_extractions where status = 'failed')::text as failed_ocr_extractions,
        (select count(*) from ocr_extractions where status = 'completed' and review_status = 'pending')::text as pending_ocr_review,
        (select count(*) from ai_jobs where status in ('queued', 'running', 'retrying'))::text as active_ai_jobs,
        (select count(*) from ai_jobs where status = 'failed')::text as failed_ai_jobs,
        (select count(*) from ai_job_units where status = 'review_required')::text as ai_review_required_units,
        (select count(*) from question_bank_revisions where status = 'draft')::text as question_bank_draft,
        (select count(*) from question_bank_revisions where status = 'review')::text as question_bank_review,
        (select count(*) from question_bank_revisions where status = 'published')::text as question_bank_published,
        (select count(*) from question_bank_revisions where status = 'archived')::text as question_bank_archived,
        (select count(*) from quizzes where status = 'draft')::text as quizzes_draft,
        (select count(*) from quizzes where status = 'review')::text as quizzes_review,
        (select count(*) from quizzes where status = 'published')::text as quizzes_published,
        (select count(*) from quizzes where status = 'archived')::text as quizzes_archived,
        (
          select count(*) from auth_sessions s
          join profiles p on p.id = s.profile_id
          where p.role = 'admin' and s.revoked_at is null and s.expires_at > now()
        )::text as active_admin_sessions,
        (
          select count(*) from auth_sessions s
          join profiles p on p.id = s.profile_id
          where p.role = 'student' and s.revoked_at is null and s.expires_at > now()
        )::text as active_student_sessions,
        (select count(*) from auth_login_guards where locked_until > now())::text as locked_login_guards,
        (select count(*) from auth_password_reset_tokens where used_at is null and expires_at > now())::text as pending_recovery_tokens,
        (select count(*) from student_devices where revoked_at is null)::text as active_student_devices,
        (select count(*) from auth_device_challenges where used_at is null and expires_at > now())::text as pending_device_challenges,
        (select count(*) from student_activation_tickets where used_at is null and expires_at > now())::text as pending_activation_tickets,
        (select count(*) from auth_credentials where must_change_password)::text as forced_password_changes,
        coalesce((select kill_switch from ai_execution_runtime_control where singleton), false) as ai_global_kill_switch,
        coalesce((select budget_limit_usd_micros is not null from ai_execution_runtime_control where singleton), false) as ai_budget_configured,
        (select count(*) from ai_route_runtime_state where kill_switch)::text as ai_routes_paused,
        (select count(*) from ai_route_runtime_state where cooldown_until > now())::text as ai_routes_cooling_down
    `);
    const row = rows[0];

    return {
      reports: {
        content: {
          activeIngestionTasks: Number(row?.active_ingestion_tasks ?? 0),
          failedIngestionTasks: Number(row?.failed_ingestion_tasks ?? 0),
          draftAssets: Number(row?.draft_assets ?? 0),
          reviewAssets: Number(row?.review_assets ?? 0),
          publishedAssets: Number(row?.published_assets ?? 0),
        },
        ocr: {
          activeExtractions: Number(row?.active_ocr_extractions ?? 0),
          failedExtractions: Number(row?.failed_ocr_extractions ?? 0),
          pendingReview: Number(row?.pending_ocr_review ?? 0),
        },
        ai: {
          activeJobs: Number(row?.active_ai_jobs ?? 0),
          failedJobs: Number(row?.failed_ai_jobs ?? 0),
          reviewRequiredUnits: Number(row?.ai_review_required_units ?? 0),
        },
        questionBank: {
          draft: Number(row?.question_bank_draft ?? 0),
          review: Number(row?.question_bank_review ?? 0),
          published: Number(row?.question_bank_published ?? 0),
          archived: Number(row?.question_bank_archived ?? 0),
        },
        quizzes: {
          draft: Number(row?.quizzes_draft ?? 0),
          review: Number(row?.quizzes_review ?? 0),
          published: Number(row?.quizzes_published ?? 0),
          archived: Number(row?.quizzes_archived ?? 0),
        },
      },
      settings: {
        environment: config.NODE_ENV,
        databaseSsl: config.DATABASE_SSL,
        databasePoolMax: config.DATABASE_POOL_MAX,
        sessionTtlHours: config.SESSION_TTL_HOURS,
        sessionSameSite: config.SESSION_COOKIE_SAME_SITE,
        allowedOriginCount: allowedOrigins(config).size,
        aiGlobalKillSwitch: row?.ai_global_kill_switch ?? false,
        aiBudgetConfigured: row?.ai_budget_configured ?? false,
      },
      security: {
        activeAdminSessions: Number(row?.active_admin_sessions ?? 0),
        activeStudentSessions: Number(row?.active_student_sessions ?? 0),
        lockedLoginGuards: Number(row?.locked_login_guards ?? 0),
        pendingRecoveryTokens: Number(row?.pending_recovery_tokens ?? 0),
        activeStudentDevices: Number(row?.active_student_devices ?? 0),
        pendingDeviceChallenges: Number(row?.pending_device_challenges ?? 0),
        pendingActivationTickets: Number(row?.pending_activation_tickets ?? 0),
        forcedPasswordChanges: Number(row?.forced_password_changes ?? 0),
        aiRoutesPaused: Number(row?.ai_routes_paused ?? 0),
        aiRoutesCoolingDown: Number(row?.ai_routes_cooling_down ?? 0),
      },
    };
  }

  async audit(
    input: { source?: OperationsAuditSource; eventType?: string; limit?: number; offset?: number } = {},
  ): Promise<OperationsAuditPage> {
    const source = input.source ?? null;
    const eventType = input.eventType?.trim() || null;
    const limit = input.limit ?? 25;
    const offset = input.offset ?? 0;
    const params = [source, eventType];
    const [countRows, rows] = await Promise.all([
      this.db.query<{ total: string }>(
        `select count(*)::text as total
         from (${AUDIT_UNION_SQL}) audit
         where ($1::text is null or source = $1)
           and ($2::text is null or event_type = $2)`,
        params,
      ),
      this.db.query<AuditRow>(
        `select *
         from (${AUDIT_UNION_SQL}) audit
         where ($1::text is null or source = $1)
           and ($2::text is null or event_type = $2)
         order by created_at desc, id desc
         limit $3 offset $4`,
        [...params, limit, offset],
      ),
    ]);

    return {
      entries: rows.map((entry) => ({
        id: entry.id,
        source: entry.source,
        eventType: entry.event_type,
        actorProfileId: entry.actor_profile_id,
        actorDisplayName: entry.actor_display_name,
        subjectProfileId: entry.subject_profile_id,
        subjectDisplayName: entry.subject_display_name,
        resourceType: entry.resource_type,
        resourceId: entry.resource_id,
        createdAt: entry.created_at.toISOString(),
      })),
      page: { total: Number(countRows[0]?.total ?? 0), limit, offset },
    };
  }
}
