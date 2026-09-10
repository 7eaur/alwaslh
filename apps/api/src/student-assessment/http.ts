import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService, SessionProfile } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { StudentAssessmentService } from "./service.js";

const QuizParamsSchema = z.object({ quizId: z.string().uuid() });
const SessionParamsSchema = z.object({ sessionId: z.string().uuid() });
const AnswerParamsSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
});
const CatalogQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
});
const StartSchema = z.object({
  mode: z.enum(["practice", "test"]),
  versionId: z.string().uuid().optional(),
  restart: z.boolean().optional(),
});
const AnswerSchema = z.object({
  selectedOptionId: z.string().uuid().nullable().optional(),
  directAnswerText: z.string().max(10_000).nullable().optional(),
});
const HistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

async function studentActor(
  request: Parameters<typeof currentProfile>[0],
  config: AppConfig,
  auth: AuthService,
): Promise<SessionProfile> {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);
  return actor;
}

export function registerStudentAssessmentRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  assessment: StudentAssessmentService,
): void {
  app.get("/v1/student/quizzes", async (request) => {
    const actor = await studentActor(request, config, auth);
    const query = parseBody(CatalogQuerySchema, request.query);
    return { quizzes: await assessment.catalog(actor.id, query) };
  });

  app.post("/v1/student/quizzes/:quizId/sessions", async (request) => {
    const actor = await studentActor(request, config, auth);
    const params = parseBody(QuizParamsSchema, request.params);
    const input = parseBody(StartSchema, request.body);
    return { assessment: await assessment.start(actor.id, params.quizId, input) };
  });

  app.get("/v1/student/assessment-sessions/:sessionId", async (request) => {
    const actor = await studentActor(request, config, auth);
    const params = parseBody(SessionParamsSchema, request.params);
    return { assessment: await assessment.session(actor.id, params.sessionId) };
  });

  app.put("/v1/student/assessment-sessions/:sessionId/questions/:questionId/answer", async (request) => {
    const actor = await studentActor(request, config, auth);
    const params = parseBody(AnswerParamsSchema, request.params);
    const input = parseBody(AnswerSchema, request.body);
    return {
      assessment: await assessment.answer(actor.id, params.sessionId, params.questionId, input),
    };
  });

  app.post("/v1/student/assessment-sessions/:sessionId/finalize", async (request) => {
    const actor = await studentActor(request, config, auth);
    const params = parseBody(SessionParamsSchema, request.params);
    return { assessment: await assessment.finalize(actor.id, params.sessionId) };
  });

  app.post("/v1/student/assessment-sessions/:sessionId/abandon", async (request, reply) => {
    const actor = await studentActor(request, config, auth);
    const params = parseBody(SessionParamsSchema, request.params);
    await assessment.abandon(actor.id, params.sessionId);
    return reply.code(204).send();
  });

  app.get("/v1/student/attempts", async (request) => {
    const actor = await studentActor(request, config, auth);
    const query = parseBody(HistoryQuerySchema, request.query);
    return { attempts: await assessment.history(actor.id, query.limit) };
  });
}
