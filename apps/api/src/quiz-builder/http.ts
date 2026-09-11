import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AdminAiAuthoringService } from "../ai/admin-authoring.js";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { QuizQuestionCandidateService } from "./candidates.js";
import type { QuizBuilderService } from "./service.js";

const PaginationOffsetSchema = z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const QuizParamsSchema = z.object({ quizId: z.string().uuid() });
const VersionParamsSchema = z.object({ quizId: z.string().uuid(), versionId: z.string().uuid() });
const ScopeSchema = z
  .object({
    classId: z.string().uuid(),
    subjectId: z.string().uuid(),
    lessonIds: z.array(z.string().uuid()).min(1).max(64),
  })
  .strict();
const QuestionRefSchema = z
  .object({ questionBankItemId: z.string().uuid(), questionBankRevisionId: z.string().uuid() })
  .strict();
const CreateSchema = ScopeSchema.extend({
  title: z.string().trim().min(1).max(500),
  description: z.string().trim().max(4000).nullable().optional(),
  shuffleVersions: z.boolean().optional(),
}).strict();
const UpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(500),
    description: z.string().trim().max(4000).nullable().optional(),
    shuffleVersions: z.boolean().optional(),
  })
  .strict();
const VersionSchema = z
  .object({
    label: z.string().trim().min(1).max(200),
    shuffleOptions: z.boolean().optional(),
    questions: z.array(QuestionRefSchema).min(1).max(500),
  })
  .strict();
const ReplaceQuestionsSchema = z.object({ questions: z.array(QuestionRefSchema).min(1).max(500) }).strict();
const RejectSchema = z.object({ note: z.string().trim().min(1).max(4000) }).strict();
const ListSchema = z.object({
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  status: z.enum(["draft", "review", "published", "archived"]).optional(),
  search: z.string().trim().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: PaginationOffsetSchema.default(0),
});
const CandidateListSchema = z.object({
  search: z.string().trim().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: PaginationOffsetSchema.default(0),
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

export function registerQuizBuilderRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  quizzes: QuizBuilderService,
  candidates: QuizQuestionCandidateService,
  authoring: AdminAiAuthoringService,
): void {
  app.get("/v1/admin/quizzes", async (request) => {
    await adminActor(request, config, auth);
    const query = parseBody(ListSchema, request.query);
    return quizzes.list({
      ...(query.classId ? { classId: query.classId } : {}),
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { search: query.search } : {}),
      limit: query.limit ?? 30,
      offset: query.offset ?? 0,
    });
  });

  app.get("/v1/admin/quizzes/:quizId", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    return quizzes.detail(params.quizId);
  });

  app.get("/v1/admin/quizzes/:quizId/candidates", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    const query = parseBody(CandidateListSchema, request.query);
    return candidates.list(params.quizId, {
      ...(query.search ? { search: query.search } : {}),
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
    });
  });

  app.post("/v1/admin/quizzes", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const input = parseBody(CreateSchema, request.body);
    return reply.code(201).send(
      await quizzes.create(actor.id, {
        classId: input.classId,
        subjectId: input.subjectId,
        lessonIds: input.lessonIds,
        title: input.title,
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.shuffleVersions !== undefined ? { shuffleVersions: input.shuffleVersions } : {}),
      }),
    );
  });

  app.patch("/v1/admin/quizzes/:quizId", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    const input = parseBody(UpdateSchema, request.body);
    await quizzes.update(actor.id, params.quizId, {
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.shuffleVersions !== undefined ? { shuffleVersions: input.shuffleVersions } : {}),
    });
    return reply.code(204).send();
  });

  app.post("/v1/admin/quizzes/:quizId/versions", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    const input = parseBody(VersionSchema, request.body);
    return reply.code(201).send(
      await quizzes.addVersion(actor.id, params.quizId, {
        label: input.label,
        questions: input.questions,
        ...(input.shuffleOptions !== undefined ? { shuffleOptions: input.shuffleOptions } : {}),
      }),
    );
  });

  app.put("/v1/admin/quizzes/:quizId/versions/:versionId/questions", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(VersionParamsSchema, request.params);
    const input = parseBody(ReplaceQuestionsSchema, request.body);
    await quizzes.replaceVersionQuestions(actor.id, params.quizId, params.versionId, input.questions);
    return reply.code(204).send();
  });

  app.delete("/v1/admin/quizzes/:quizId/versions/:versionId", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(VersionParamsSchema, request.params);
    await quizzes.removeVersion(actor.id, params.quizId, params.versionId);
    return reply.code(204).send();
  });

  app.post("/v1/admin/quizzes/:quizId/submit-review", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    await quizzes.submitForReview(actor.id, params.quizId);
    return reply.code(204).send();
  });

  app.post("/v1/admin/quizzes/:quizId/reject", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    const input = parseBody(RejectSchema, request.body);
    await quizzes.rejectReview(actor.id, params.quizId, input.note);
    return reply.code(204).send();
  });

  app.post("/v1/admin/quizzes/:quizId/publish", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    await quizzes.publish(actor.id, params.quizId);
    return reply.code(204).send();
  });

  app.post("/v1/admin/quizzes/:quizId/archive", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    await authoring.archiveQuiz(actor.id, params.quizId);
    return reply.code(204).send();
  });
}
