import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { AdminContentOperationsService } from "./admin-operations.js";

const OverviewQuerySchema = z.object({
  classSlug: z.string().trim().min(1).max(160).optional(),
  subjectSlug: z.string().trim().min(1).max(160).optional(),
  kind: z.enum(["textbook", "government_exam"]).optional(),
  q: z.string().trim().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});

const DetailQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const DocumentParamsSchema = z.object({ documentId: z.string().uuid() });
const ExtractionParamsSchema = z.object({ extractionId: z.string().uuid() });
const ReviewSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  replacementText: z.string().max(250_000).optional(),
});

async function adminActor(request: Parameters<typeof currentProfile>[0], config: AppConfig, auth: AuthService) {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
  return actor;
}

export function registerAdminContentOperationsRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  operations: AdminContentOperationsService,
): void {
  app.get("/v1/admin/content-operations", async (request) => {
    await adminActor(request, config, auth);
    const query = parseBody(OverviewQuerySchema, request.query);
    return {
      operations: await operations.overview({
        ...(query.classSlug ? { classSlug: query.classSlug } : {}),
        ...(query.subjectSlug ? { subjectSlug: query.subjectSlug } : {}),
        ...(query.kind ? { kind: query.kind } : {}),
        ...(query.q ? { query: query.q } : {}),
        limit: query.limit,
        offset: query.offset,
      }),
    };
  });

  app.get("/v1/admin/content-operations/documents/:documentId", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(DocumentParamsSchema, request.params);
    const query = parseBody(DetailQuerySchema, request.query);
    return { detail: await operations.documentDetail(params.documentId, query.limit, query.offset) };
  });

  app.get("/v1/admin/content-operations/ocr/:extractionId", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(ExtractionParamsSchema, request.params);
    return { extraction: await operations.ocrExtraction(params.extractionId) };
  });

  app.patch("/v1/admin/content-operations/ocr/:extractionId/review", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(ExtractionParamsSchema, request.params);
    const input = parseBody(ReviewSchema, request.body);
    return {
      extraction: await operations.reviewOcr(
        actor.id,
        params.extractionId,
        input.decision,
        input.replacementText,
      ),
    };
  });
}
