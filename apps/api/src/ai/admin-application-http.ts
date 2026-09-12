import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { AdminAiApplicationService } from "./admin-application.js";

const OutputParamsSchema = z.object({ outputId: z.string().uuid() });

async function requireAdmin(
  request: Parameters<typeof currentProfile>[0],
  config: AppConfig,
  auth: AuthService,
) {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "admin") {
    throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
  }
  return actor;
}

export function registerAdminAiApplicationRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  applications: AdminAiApplicationService,
): void {
  app.get("/v1/admin/ai/outputs/:outputId/application", async (request) => {
    await requireAdmin(request, config, auth);
    const params = parseBody(OutputParamsSchema, request.params);
    return applications.capability(params.outputId);
  });
}
