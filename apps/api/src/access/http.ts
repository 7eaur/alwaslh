import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { AccessService } from "./service.js";

const GenerateFullSchema = z.object({
  count: z.number().int().min(1).max(500),
  durationDays: z.number().int().min(1).max(3650).default(365),
});

const GenerateClassSchema = GenerateFullSchema.extend({
  classId: z.string().uuid(),
});

const RedeemSchema = z.object({
  code: z.string().min(1).max(32),
  idempotencyKey: z.string().min(12).max(120),
});

const EntitlementParamsSchema = z.object({
  entitlementId: z.string().uuid(),
});

export function registerAccessRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  access: AccessService,
): void {
  app.post("/v1/admin/access/full-codes", async (request) => {
    const actor = await currentProfile(request, config, auth);
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const input = parseBody(GenerateFullSchema, request.body);
    const durationDays = input.durationDays ?? 365;
    return {
      codes: await access.generateFullCodes(actor.id, input.count, durationDays),
      durationDays,
    };
  });

  app.post("/v1/admin/access/class-codes", async (request) => {
    const actor = await currentProfile(request, config, auth);
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const input = parseBody(GenerateClassSchema, request.body);
    const durationDays = input.durationDays ?? 365;
    return {
      codes: await access.generateClassCodes(actor.id, input.classId, input.count, durationDays),
      classId: input.classId,
      durationDays,
    };
  });

  app.post("/v1/student/access/redeem", async (request) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);
    const input = parseBody(RedeemSchema, request.body);
    return { entitlement: await access.redeem(profile.id, input.code, input.idempotencyKey) };
  });

  app.get("/v1/student/access/entitlements", async (request) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);
    return { entitlements: await access.listActiveEntitlements(profile.id) };
  });

  app.post("/v1/admin/access/entitlements/:entitlementId/revoke", async (request, reply) => {
    const actor = await currentProfile(request, config, auth);
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const params = parseBody(EntitlementParamsSchema, request.params);
    await access.revokeEntitlement(actor.id, params.entitlementId);
    return reply.code(204).send();
  });
}
