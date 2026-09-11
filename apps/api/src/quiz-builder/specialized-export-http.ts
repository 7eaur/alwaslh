import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { QuizSpecializedExportService } from "./specialized-export.js";

const QuizParamsSchema = z.object({ quizId: z.string().uuid() });
const AssetParamsSchema = z.object({ quizId: z.string().uuid(), assetId: z.string().uuid() });
const VariantSchema = z.enum([
  "questions_options",
  "questions_only",
  "questions_answers",
  "answers_explanations",
  "answer_key",
  "lesson_names",
  "lesson_images",
]);
const ExportQuerySchema = z.object({
  versionIds: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.split(",").map((item) => item.trim()))
    .pipe(z.array(z.string().uuid()).min(1).max(20)),
  variant: VariantSchema.default("questions_options"),
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

export function registerQuizSpecializedExportRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  exports: QuizSpecializedExportService,
): void {
  app.get("/v1/admin/quizzes/:quizId/specialized-export", async (request) => {
    await requireAdmin(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    const query = parseBody(ExportQuerySchema, request.query);
    return exports.bundle(params.quizId, query.versionIds, query.variant);
  });

  app.get("/v1/admin/quizzes/:quizId/specialized-print", async (request, reply) => {
    await requireAdmin(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    const query = parseBody(ExportQuerySchema, request.query);
    const bundle = await exports.bundle(params.quizId, query.versionIds, query.variant);
    reply.header(
      "Content-Security-Policy",
      "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'",
    );
    reply.header("X-Content-Type-Options", "nosniff");
    return reply.type("text/html; charset=utf-8").send(bundle.printHtml);
  });

  app.get("/v1/admin/quizzes/:quizId/export-assets/:assetId", async (request, reply) => {
    await requireAdmin(request, config, auth);
    const params = parseBody(AssetParamsSchema, request.params);
    const asset = await exports.asset(params.quizId, params.assetId);
    reply.header("Cache-Control", "private, max-age=300");
    reply.header("X-Content-Type-Options", "nosniff");
    return reply.type(asset.mimeType).send(asset.bytes);
  });
}
