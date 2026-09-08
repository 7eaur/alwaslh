import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type {
  AdminContentIngestionService,
  ContentIngestionTaskStatus,
} from "./ingestion-service.js";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const TaskParamsSchema = z.object({ taskId: z.string().uuid() });
const ItemParamsSchema = z.object({ taskId: z.string().uuid(), itemId: z.string().uuid() });
const ListSchema = z.object({
  status: z.enum(["uploading", "ready", "processing", "completed", "failed"]).optional(),
  lessonId: z.string().uuid().optional(),
  includeArchived: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});
const CreateSchema = z.object({
  lessonId: z.string().uuid(),
  clientRequestId: z.string().uuid(),
  items: z
    .array(
      z.object({
        filename: z.string().trim().min(1).max(255),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
        byteSize: z.number().int().positive().max(MAX_UPLOAD_BYTES),
      }),
    )
    .min(1)
    .max(100),
});
const PublicationSchema = z.object({
  action: z.enum(["submit_review", "return_to_draft", "publish"]),
});

async function adminActor(
  request: Parameters<typeof currentProfile>[0],
  config: AppConfig,
  auth: AuthService,
) {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
  return actor;
}

export function registerAdminContentIngestionRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  ingestion: AdminContentIngestionService,
): void {
  if (!app.hasContentTypeParser("application/octet-stream")) {
    app.addContentTypeParser(
      "application/octet-stream",
      { parseAs: "buffer", bodyLimit: MAX_UPLOAD_BYTES },
      (_request, body, done) => done(null, body),
    );
  }

  app.get("/v1/admin/content-ingestions", async (request) => {
    await adminActor(request, config, auth);
    const query = parseBody(ListSchema, request.query);
    return {
      history: await ingestion.listTasks({
        ...(query.status ? { status: query.status as ContentIngestionTaskStatus } : {}),
        ...(query.lessonId ? { lessonId: query.lessonId } : {}),
        includeArchived: query.includeArchived ?? false,
        limit: query.limit ?? 30,
        offset: query.offset ?? 0,
      }),
    };
  });

  app.get("/v1/admin/content-ingestions/:taskId", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(TaskParamsSchema, request.params);
    return { task: await ingestion.detail(params.taskId) };
  });

  app.post("/v1/admin/content-ingestions", async (request) => {
    const actor = await adminActor(request, config, auth);
    const input = parseBody(CreateSchema, request.body);
    return {
      task: await ingestion.createTask(actor.id, {
        lessonId: input.lessonId,
        clientRequestId: input.clientRequestId,
        items: input.items,
      }),
    };
  });

  app.put(
    "/v1/admin/content-ingestions/:taskId/items/:itemId/content",
    { bodyLimit: MAX_UPLOAD_BYTES },
    async (request) => {
      await adminActor(request, config, auth);
      const params = parseBody(ItemParamsSchema, request.params);
      if (!Buffer.isBuffer(request.body)) {
        throw new AppError("BAD_REQUEST", "يجب إرسال محتوى الملف كبيانات ثنائية", 400);
      }
      return { task: await ingestion.uploadItem(params.taskId, params.itemId, request.body) };
    },
  );

  app.post("/v1/admin/content-ingestions/:taskId/process", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(TaskParamsSchema, request.params);
    return { task: await ingestion.processTask(params.taskId) };
  });

  app.post("/v1/admin/content-ingestions/:taskId/link", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(TaskParamsSchema, request.params);
    return { task: await ingestion.linkTaskToLesson(actor.id, params.taskId) };
  });

  app.patch("/v1/admin/content-ingestions/:taskId/publication", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(TaskParamsSchema, request.params);
    const input = parseBody(PublicationSchema, request.body);
    return {
      task: await ingestion.transitionPublication(actor.id, params.taskId, input.action),
    };
  });

  app.patch("/v1/admin/content-ingestions/:taskId/archive", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(TaskParamsSchema, request.params);
    return { task: await ingestion.archiveTask(params.taskId) };
  });
}
