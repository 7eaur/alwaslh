import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { aiQuestionSchema } from "../ai/contracts.js";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { QuestionBankService } from "./service.js";

const PaginationOffsetSchema = z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const ItemParamsSchema = z.object({ itemId: z.string().uuid() });
const OutputParamsSchema = z.object({ outputId: z.string().uuid() });

const QuestionSchema = aiQuestionSchema.omit({ sourceEvidence: true });
const ScopeSchema = z
  .object({
    classId: z.string().uuid(),
    subjectId: z.string().uuid(),
    lessonIds: z.array(z.string().uuid()).min(1).max(64),
  })
  .strict();

const ManualCreateSchema = ScopeSchema.extend({ question: QuestionSchema }).strict();
const ImportAiSchema = ScopeSchema;
const EditQuestionSchema = z.object({ question: QuestionSchema }).strict();
const RejectSchema = z.object({ note: z.string().trim().min(1).max(4000) }).strict();

const ListQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  origin: z.enum(["manual", "ai"]).optional(),
  status: z.enum(["draft", "review", "published"]).optional(),
  search: z.string().trim().min(1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: PaginationOffsetSchema.default(0),
});

const DetailQuerySchema = z.object({
  revisionLimit: z.coerce.number().int().min(1).max(100).default(50),
  revisionOffset: PaginationOffsetSchema.default(0),
  eventLimit: z.coerce.number().int().min(1).max(100).default(50),
  eventOffset: PaginationOffsetSchema.default(0),
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

export function registerQuestionBankRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  questionBank: QuestionBankService,
): void {
  app.get("/v1/admin/question-bank", async (request) => {
    await adminActor(request, config, auth);
    const query = parseBody(ListQuerySchema, request.query);
    return questionBank.listItems({
      ...(query.classId ? { classId: query.classId } : {}),
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      ...(query.origin ? { origin: query.origin } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { search: query.search } : {}),
      limit: query.limit ?? 30,
      offset: query.offset ?? 0,
    });
  });

  app.get("/v1/admin/question-bank/:itemId", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(ItemParamsSchema, request.params);
    const query = parseBody(DetailQuerySchema, request.query);
    return questionBank.itemDetail(
      params.itemId,
      query.revisionLimit ?? 50,
      query.revisionOffset ?? 0,
      query.eventLimit ?? 50,
      query.eventOffset ?? 0,
    );
  });

  app.post("/v1/admin/question-bank/manual", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const input = parseBody(ManualCreateSchema, request.body);
    const created = await questionBank.createManual(actor.id, input);
    return reply.code(201).send(created);
  });

  app.post("/v1/admin/question-bank/import-ai/:outputId", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(OutputParamsSchema, request.params);
    const input = parseBody(ImportAiSchema, request.body);
    const result = await questionBank.importApprovedAiOutput(actor.id, {
      ...input,
      outputId: params.outputId,
    });
    return reply.code(result.replayed ? 200 : 201).send(result);
  });

  app.patch("/v1/admin/question-bank/:itemId", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(ItemParamsSchema, request.params);
    const input = parseBody(EditQuestionSchema, request.body);
    return questionBank.editItem(actor.id, params.itemId, input.question);
  });

  app.post("/v1/admin/question-bank/:itemId/submit-review", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(ItemParamsSchema, request.params);
    await questionBank.submitForReview(actor.id, params.itemId);
    return reply.code(204).send();
  });

  app.post("/v1/admin/question-bank/:itemId/reject", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(ItemParamsSchema, request.params);
    const input = parseBody(RejectSchema, request.body);
    await questionBank.rejectReview(actor.id, params.itemId, input.note);
    return reply.code(204).send();
  });

  app.post("/v1/admin/question-bank/:itemId/publish", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(ItemParamsSchema, request.params);
    await questionBank.publish(actor.id, params.itemId);
    return reply.code(204).send();
  });
}
