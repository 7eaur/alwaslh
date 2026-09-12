import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { AdminLessonContentService } from "./lesson-content.js";

const LessonParamsSchema = z.object({ lessonId: z.string().uuid() });
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

export function registerAdminLessonContentRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  lessonContent: AdminLessonContentService,
): void {
  app.get("/v1/admin/lesson-content/:lessonId", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(LessonParamsSchema, request.params);
    return { content: await lessonContent.state(params.lessonId) };
  });

  app.patch("/v1/admin/lesson-content/:lessonId/publication", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(LessonParamsSchema, request.params);
    const input = parseBody(PublicationSchema, request.body);
    return {
      content: await lessonContent.transition(actor.id, params.lessonId, input.action),
    };
  });
}
