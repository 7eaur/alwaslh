import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import { NotificationService, type NotificationSeverity } from "./service.js";

const NotificationSeveritySchema = z.enum(["info", "success", "warning", "critical"]);

const AdminNotificationQuerySchema = z.object({
  search: z.string().max(200).optional(),
  severity: NotificationSeveritySchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
});

const StudentNotificationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
});

const NotificationCreateSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(4000),
  severity: NotificationSeveritySchema.optional(),
  actionPath: z.string().max(512).nullable().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  targetProfileId: z.string().uuid().nullable().optional(),
  targetClassId: z.string().uuid().nullable().optional(),
});

const NotificationParamsSchema = z.object({ notificationId: z.string().uuid() });

function parseQuery<T>(schema: z.ZodType<T>, query: unknown): T {
  const parsed = schema.safeParse(query);
  if (!parsed.success) throw new AppError("BAD_REQUEST", "معاملات الطلب غير صالحة", 400);
  return parsed.data;
}

export function registerNotificationRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  notifications: NotificationService,
): void {
  app.get("/v1/admin/notifications", async (request) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const query = parseQuery(AdminNotificationQuerySchema, request.query);
    return notifications.listAdmin({
      ...(query.search ? { search: query.search } : {}),
      ...(query.severity ? { severity: query.severity as NotificationSeverity } : {}),
      limit: query.limit ?? 25,
      offset: query.offset ?? 0,
    });
  });

  app.post("/v1/admin/notifications", async (request, reply) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const input = parseBody(NotificationCreateSchema, request.body);
    const notification = await notifications.create(profile.id, {
      title: input.title,
      body: input.body,
      severity: input.severity ?? "info",
      ...(input.actionPath !== undefined ? { actionPath: input.actionPath } : {}),
      ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
      ...(input.targetProfileId !== undefined ? { targetProfileId: input.targetProfileId } : {}),
      ...(input.targetClassId !== undefined ? { targetClassId: input.targetClassId } : {}),
    });
    return reply.code(201).send({ notification });
  });

  app.delete("/v1/admin/notifications/:notificationId", async (request, reply) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const params = parseQuery(NotificationParamsSchema, request.params);
    await notifications.deleteAdmin(params.notificationId);
    return reply.code(204).send();
  });

  app.get("/v1/student/notifications", async (request) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);
    const query = parseQuery(StudentNotificationQuerySchema, request.query);
    return notifications.listStudent(profile.id, {
      limit: query.limit ?? 25,
      offset: query.offset ?? 0,
    });
  });

  app.post("/v1/student/notifications/:notificationId/read", async (request, reply) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);
    const params = parseQuery(NotificationParamsSchema, request.params);
    await notifications.markRead(profile.id, params.notificationId);
    return reply.code(204).send();
  });
}
