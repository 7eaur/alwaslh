import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { LessonAuthoringExportService } from "./lesson-authoring-export.js";

const ExportSchema = z
  .object({
    lessonIds: z.array(z.string().uuid()).min(1).max(32),
    historySource: z.enum(["all", "curriculum", "question_bank", "ai"]).optional(),
    eventType: z.string().trim().min(1).max(80).optional(),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
  })
  .refine((value) => !value.from || !value.to || new Date(value.from) <= new Date(value.to), {
    message: "بداية الفترة يجب أن تسبق نهايتها",
  });

async function requireAdmin(
  request: Parameters<typeof currentProfile>[0],
  config: AppConfig,
  auth: AuthService,
): Promise<void> {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "admin") {
    throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
  }
}

export function registerLessonAuthoringExportRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  exports: LessonAuthoringExportService,
): void {
  app.post("/v1/admin/curriculum/lesson-authoring-export", async (request) => {
    await requireAdmin(request, config, auth);
    const input = parseBody(ExportSchema, request.body);
    return exports.bundle({
      lessonIds: input.lessonIds,
      ...(input.historySource ? { historySource: input.historySource } : {}),
      ...(input.eventType ? { eventType: input.eventType } : {}),
      ...(input.from ? { from: new Date(input.from) } : {}),
      ...(input.to ? { to: new Date(input.to) } : {}),
    });
  });
}
