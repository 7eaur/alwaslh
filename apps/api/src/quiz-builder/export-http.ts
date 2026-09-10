import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { QuizVersionExportService } from "./export.js";

const ParamsSchema = z.object({ quizId: z.string().uuid(), versionId: z.string().uuid() });

export function registerQuizVersionExportRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  exports: QuizVersionExportService,
): void {
  app.get("/v1/admin/quizzes/:quizId/versions/:versionId/export", async (request) => {
    const actor = await currentProfile(request, config, auth);
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const params = parseBody(ParamsSchema, request.params);
    return exports.bundle(params.quizId, params.versionId);
  });
}
