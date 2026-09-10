import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { AdminOperationsService } from "./service.js";

const OverviewQuerySchema = z.object({
  recentLimit: z.coerce.number().int().min(1).max(20).optional(),
});

export function registerAdminOperationsRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  operations: AdminOperationsService,
): void {
  app.get("/v1/admin/operations/overview", async (request) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const parsed = OverviewQuerySchema.safeParse(request.query);
    if (!parsed.success) throw new AppError("BAD_REQUEST", "معاملات الطلب غير صالحة", 400);
    return operations.overview(parsed.data.recentLimit ?? 8);
  });
}
