import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { currentProfile } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { AdminOperationsService } from "./service.js";

const OverviewQuerySchema = z.object({
  recentLimit: z.coerce.number().int().min(1).max(20).optional(),
});

const AuditQuerySchema = z.object({
  source: z.enum(["auth", "access", "ai_review", "question_bank", "quiz_builder"]).optional(),
  eventType: z.string().trim().min(1).max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).max(100_000).optional(),
});

async function requireAdmin(
  request: FastifyRequest,
  config: AppConfig,
  auth: AuthService,
): Promise<void> {
  const profile = await currentProfile(request, config, auth);
  if (profile.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
}

export function registerAdminOperationsRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  operations: AdminOperationsService,
): void {
  app.get("/v1/admin/operations/overview", async (request) => {
    await requireAdmin(request, config, auth);
    const parsed = OverviewQuerySchema.safeParse(request.query);
    if (!parsed.success) throw new AppError("BAD_REQUEST", "معاملات الطلب غير صالحة", 400);
    return operations.overview(parsed.data.recentLimit ?? 8);
  });

  app.get("/v1/admin/operations/governance", async (request) => {
    await requireAdmin(request, config, auth);
    return operations.governance(config);
  });

  app.get("/v1/admin/operations/audit", async (request) => {
    await requireAdmin(request, config, auth);
    const parsed = AuditQuerySchema.safeParse(request.query);
    if (!parsed.success) throw new AppError("BAD_REQUEST", "معاملات سجل التدقيق غير صالحة", 400);
    return operations.audit(parsed.data);
  });
}
