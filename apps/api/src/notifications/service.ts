import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";

export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export interface NotificationRecord {
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
  readAt?: string | null;
}

export interface NotificationPage {
  notifications: NotificationRecord[];
  page: { total: number; limit: number; offset: number };
}

export interface StudentNotificationPage extends NotificationPage {
  unreadCount: number;
}

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  severity: NotificationSeverity;
  target_profile_id: string | null;
  target_class_id: string | null;
  target_class_name: string | null;
  action_path: string | null;
  published_at: Date;
  expires_at: Date | null;
  created_by_profile_id: string | null;
  created_by_display_name: string | null;
  created_at: Date;
  read_at?: Date | null;
}

function toNotification(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    severity: row.severity,
    targetProfileId: row.target_profile_id,
    targetClassId: row.target_class_id,
    targetClassName: row.target_class_name,
    actionPath: row.action_path,
    publishedAt: row.published_at.toISOString(),
    expiresAt: row.expires_at?.toISOString() ?? null,
    createdByProfileId: row.created_by_profile_id,
    createdByDisplayName: row.created_by_display_name,
    createdAt: row.created_at.toISOString(),
    ...(Object.hasOwn(row, "read_at") ? { readAt: row.read_at?.toISOString() ?? null } : {}),
  };
}

function normalizedOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export class NotificationService {
  constructor(private readonly db: Database) {}

  async listAdmin(input: {
    search?: string;
    severity?: NotificationSeverity;
    limit: number;
    offset: number;
  }): Promise<NotificationPage> {
    const search = normalizedOptionalText(input.search);
    const values: unknown[] = [];
    const where: string[] = [];

    if (search) {
      values.push(`%${search}%`);
      where.push(`(n.title ilike $${values.length} or n.body ilike $${values.length})`);
    }
    if (input.severity) {
      values.push(input.severity);
      where.push(`n.severity = $${values.length}::notification_severity`);
    }

    const whereSql = where.length ? `where ${where.join(" and ")}` : "";
    const countRows = await this.db.query<{ total: string }>(
      `select count(*)::text as total from notifications n ${whereSql}`,
      values,
    );

    values.push(input.limit, input.offset);
    const rows = await this.db.query<NotificationRow>(
      `select n.id, n.title, n.body, n.severity,
              n.target_profile_id, n.target_class_id, c.name as target_class_name,
              n.action_path, n.published_at, n.expires_at,
              n.created_by_profile_id, creator.display_name as created_by_display_name,
              n.created_at
       from notifications n
       left join classes c on c.id = n.target_class_id
       left join profiles creator on creator.id = n.created_by_profile_id
       ${whereSql}
       order by n.published_at desc, n.created_at desc, n.id desc
       limit $${values.length - 1} offset $${values.length}`,
      values,
    );

    return {
      notifications: rows.map(toNotification),
      page: { total: Number(countRows[0]?.total ?? 0), limit: input.limit, offset: input.offset },
    };
  }

  async create(
    actorProfileId: string,
    input: {
      title: string;
      body: string;
      severity: NotificationSeverity;
      actionPath?: string | null;
      expiresAt?: string | null;
      targetProfileId?: string | null;
      targetClassId?: string | null;
    },
  ): Promise<NotificationRecord> {
    const title = input.title.trim();
    const body = input.body.trim();
    const actionPath = normalizedOptionalText(input.actionPath);
    const targetProfileId = input.targetProfileId ?? null;
    const targetClassId = input.targetClassId ?? null;

    if (!title || !body) throw new AppError("BAD_REQUEST", "عنوان الإشعار ونصه مطلوبان", 400);
    if (targetProfileId && targetClassId) {
      throw new AppError("BAD_REQUEST", "لا يمكن توجيه الإشعار إلى طالب وصف في الوقت نفسه", 400);
    }
    if (actionPath && !actionPath.startsWith("/")) {
      throw new AppError("BAD_REQUEST", "مسار الإجراء يجب أن يكون مسارًا داخليًا", 400);
    }

    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    if (expiresAt && (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now())) {
      throw new AppError("BAD_REQUEST", "تاريخ انتهاء الإشعار يجب أن يكون في المستقبل", 400);
    }

    return this.db.transaction(async (tx) => {
      await this.assertTargetExists(tx, targetProfileId, targetClassId);
      const rows = await tx.query<NotificationRow>(
        `insert into notifications (
           title, body, severity, target_profile_id, target_class_id,
           action_path, expires_at, created_by_profile_id
         ) values ($1, $2, $3::notification_severity, $4, $5, $6, $7, $8)
         returning id, title, body, severity, target_profile_id, target_class_id,
                   null::text as target_class_name, action_path, published_at, expires_at,
                   created_by_profile_id, null::text as created_by_display_name, created_at`,
        [title, body, input.severity, targetProfileId, targetClassId, actionPath, expiresAt, actorProfileId],
      );
      const row = rows[0];
      if (!row) throw new AppError("INTERNAL_ERROR", "تعذر إنشاء الإشعار", 500);
      return toNotification(row);
    });
  }

  async deleteAdmin(notificationId: string): Promise<void> {
    const rows = await this.db.query<{ id: string }>("delete from notifications where id = $1 returning id", [
      notificationId,
    ]);
    if (!rows[0]) throw new AppError("NOT_FOUND", "الإشعار غير موجود", 404);
  }

  async listStudent(
    profileId: string,
    input: { limit: number; offset: number },
  ): Promise<StudentNotificationPage> {
    const visibilitySql = `
      n.published_at <= now()
      and (n.expires_at is null or n.expires_at > now())
      and (
        (n.target_profile_id is null and n.target_class_id is null)
        or n.target_profile_id = $1
        or (
          n.target_class_id is not null
          and (
            exists (
              select 1 from student_entitlements se
              where se.profile_id = $1
                and se.status = 'active'
                and se.starts_at <= now()
                and (se.expires_at is null or se.expires_at > now())
                and se.scope = 'all_content'
            )
            or exists (
              select 1 from student_entitlements se
              where se.profile_id = $1
                and se.status = 'active'
                and se.starts_at <= now()
                and (se.expires_at is null or se.expires_at > now())
                and se.scope = 'class'
                and se.class_id = n.target_class_id
            )
          )
        )
      )`;

    const [countRows, unreadRows, rows] = await Promise.all([
      this.db.query<{ total: string }>(
        `select count(*)::text as total from notifications n where ${visibilitySql}`,
        [profileId],
      ),
      this.db.query<{ total: string }>(
        `select count(*)::text as total
         from notifications n
         left join notification_reads nr
           on nr.notification_id = n.id and nr.profile_id = $1
         where ${visibilitySql} and nr.notification_id is null`,
        [profileId],
      ),
      this.db.query<NotificationRow>(
        `select n.id, n.title, n.body, n.severity,
                n.target_profile_id, n.target_class_id, c.name as target_class_name,
                n.action_path, n.published_at, n.expires_at,
                n.created_by_profile_id, creator.display_name as created_by_display_name,
                n.created_at, nr.read_at
         from notifications n
         left join notification_reads nr
           on nr.notification_id = n.id and nr.profile_id = $1
         left join classes c on c.id = n.target_class_id
         left join profiles creator on creator.id = n.created_by_profile_id
         where ${visibilitySql}
         order by n.published_at desc, n.created_at desc, n.id desc
         limit $2 offset $3`,
        [profileId, input.limit, input.offset],
      ),
    ]);

    return {
      notifications: rows.map(toNotification),
      unreadCount: Number(unreadRows[0]?.total ?? 0),
      page: { total: Number(countRows[0]?.total ?? 0), limit: input.limit, offset: input.offset },
    };
  }

  async markRead(profileId: string, notificationId: string): Promise<void> {
    const visible = await this.db.query<{ id: string }>(
      `select n.id
       from notifications n
       where n.id = $2
         and n.published_at <= now()
         and (n.expires_at is null or n.expires_at > now())
         and (
           (n.target_profile_id is null and n.target_class_id is null)
           or n.target_profile_id = $1
           or (
             n.target_class_id is not null
             and (
               exists (
                 select 1 from student_entitlements se
                 where se.profile_id = $1 and se.status = 'active'
                   and se.starts_at <= now() and (se.expires_at is null or se.expires_at > now())
                   and se.scope = 'all_content'
               )
               or exists (
                 select 1 from student_entitlements se
                 where se.profile_id = $1 and se.status = 'active'
                   and se.starts_at <= now() and (se.expires_at is null or se.expires_at > now())
                   and se.scope = 'class' and se.class_id = n.target_class_id
               )
             )
           )
         )`,
      [profileId, notificationId],
    );
    if (!visible[0]) throw new AppError("NOT_FOUND", "الإشعار غير موجود أو غير متاح", 404);

    await this.db.query(
      `insert into notification_reads (notification_id, profile_id)
       values ($1, $2)
       on conflict (notification_id, profile_id) do nothing`,
      [notificationId, profileId],
    );
  }

  private async assertTargetExists(
    tx: QueryExecutor,
    targetProfileId: string | null,
    targetClassId: string | null,
  ): Promise<void> {
    if (targetProfileId) {
      const profiles = await tx.query<{ id: string }>(
        "select id from profiles where id = $1 and role = 'student' limit 1",
        [targetProfileId],
      );
      if (!profiles[0]) throw new AppError("BAD_REQUEST", "الطالب المستهدف غير موجود", 400);
    }
    if (targetClassId) {
      const classes = await tx.query<{ id: string }>("select id from classes where id = $1 limit 1", [
        targetClassId,
      ]);
      if (!classes[0]) throw new AppError("BAD_REQUEST", "الصف المستهدف غير موجود", 400);
    }
  }
}
