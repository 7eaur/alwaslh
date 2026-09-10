import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { QuestionBankRegenerationService } from "./regeneration.js";

const ParamsSchema = z.object({ itemId: z.string().uuid(), outputId: z.string().uuid() });

export function registerQuestionBankRegenerationRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  regeneration: QuestionBankRegenerationService,
): void {
  app.post("/v1/admin/question-bank/:itemId/regenerate-ai/:outputId", async (request, reply) => {
    const actor = await currentProfile(request, config, auth);
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const params = parseBody(ParamsSchema, request.params);
    const result = await regeneration.applyApprovedOutput(actor.id, params.itemId, params.outputId);
    return reply.code(result.replayed ? 200 : 201).send(result);
  });
}
