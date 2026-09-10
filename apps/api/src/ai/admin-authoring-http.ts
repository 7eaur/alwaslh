import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { aiDifficultySchema, aiQuestionTargetSchema, aiSubjectDomainSchema } from "./contracts.js";
import type { AdminAiAuthoringService } from "./admin-authoring.js";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";

const LessonModeSchema = z.enum([
  "lesson_summary",
  "question_generation",
  "comprehensive_lesson_content",
  "exact_question_extraction",
  "replica_question_extraction",
]);
const QuizModeSchema = z.enum([
  "question_generation",
  "exact_question_extraction",
  "exact_exam_extraction",
  "replica_question_extraction",
]);
const ClientRequestSchema = z.string().uuid();
const PrioritySchema = z.number().int().min(1).max(10).optional();
const LessonGenerateSchema = z
  .object({
    lessonIds: z.array(z.string().uuid()).min(1).max(32),
    mode: LessonModeSchema,
    subjectDomain: aiSubjectDomainSchema.default("general"),
    target: aiQuestionTargetSchema.optional(),
    expectedQuestionCount: z.number().int().min(1).max(500).optional(),
    clientRequestId: ClientRequestSchema,
    priority: PrioritySchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (
      (value.mode === "question_generation" || value.mode === "comprehensive_lesson_content") &&
      !value.target
    ) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "target is required for generated questions" });
    }
  });
const QuizVersionSchema = z
  .object({
    key: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(200),
    lessonIds: z.array(z.string().uuid()).min(1).max(64),
    shuffleOptions: z.boolean().default(true),
    target: aiQuestionTargetSchema.optional(),
    expectedQuestionCount: z.number().int().min(1).max(500).optional(),
  })
  .strict();
const QuizGenerateSchema = z
  .object({
    mode: QuizModeSchema,
    subjectDomain: aiSubjectDomainSchema.default("general"),
    versions: z.array(QuizVersionSchema).min(1).max(20),
    clientRequestId: ClientRequestSchema,
    priority: PrioritySchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.mode === "question_generation" && value.versions.some((version) => !version.target)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "target is required for generated quiz versions" });
    }
  });
const OutputParamsSchema = z.object({ outputId: z.string().uuid() });
const ItemParamsSchema = z.object({ itemId: z.string().uuid() });
const QuizParamsSchema = z.object({ quizId: z.string().uuid() });
const RegenerateSchema = z
  .object({
    clientRequestId: ClientRequestSchema,
    subjectDomain: aiSubjectDomainSchema.default("general"),
    priority: PrioritySchema,
  })
  .strict();

async function adminActor(
  request: Parameters<typeof currentProfile>[0],
  config: AppConfig,
  auth: AuthService,
) {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
  return actor;
}

export function registerAdminAiAuthoringRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  authoring: AdminAiAuthoringService,
): void {
  app.post("/v1/admin/authoring/lessons/generate", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const input = parseBody(LessonGenerateSchema, request.body);
    const result = await authoring.enqueueLessons(actor.id, input);
    return reply.code(result.replayed ? 200 : 202).send(result);
  });

  app.post("/v1/admin/authoring/outputs/:outputId/apply-lesson", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(OutputParamsSchema, request.params);
    return authoring.applyLessonOutput(actor.id, params.outputId);
  });

  app.post("/v1/admin/quizzes/:quizId/generate", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    const input = parseBody(QuizGenerateSchema, request.body);
    const result = await authoring.enqueueQuiz(actor.id, params.quizId, input);
    return reply.code(result.replayed ? 200 : 202).send(result);
  });

  app.post("/v1/admin/authoring/question-bank/:itemId/regenerate", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(ItemParamsSchema, request.params);
    const input = parseBody(RegenerateSchema, request.body);
    const result = await authoring.enqueueQuestionRegeneration(actor.id, params.itemId, input);
    return reply.code(result.replayed ? 200 : 202).send(result);
  });

  app.post("/v1/admin/authoring/question-bank/:itemId/archive", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(ItemParamsSchema, request.params);
    return authoring.archiveQuestion(actor.id, params.itemId);
  });

  app.post("/v1/admin/authoring/quizzes/:quizId/archive", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    return authoring.archiveQuiz(actor.id, params.quizId);
  });
}
