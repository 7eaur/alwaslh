import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody, sessionCookie } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { StudentActivationService } from "./service.js";

const VerifyActivationSchema = z.object({
  code: z.string().min(1).max(32),
});

const CompleteActivationSchema = z.object({
  activationTicket: z.string().min(32).max(128),
  password: z.string().min(8).max(128),
  idempotencyKey: z.string().min(12).max(120),
  devicePublicKeySpki: z.string().min(80).max(4096),
  deviceProof: z.string().min(64).max(256),
});

export function registerStudentActivationRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  activation: StudentActivationService,
): void {
  app.post("/v1/student/activation/verify", async (request) => {
    const input = parseBody(VerifyActivationSchema, request.body);
    return activation.verifyCode(input.code);
  });

  app.post("/v1/student/activation/complete", async (request, reply) => {
    const input = parseBody(CompleteActivationSchema, request.body);
    const activationResult = await activation.activate(
      input.activationTicket,
      input.password,
      input.idempotencyKey,
      input.devicePublicKeySpki,
      input.deviceProof,
    );

    const session = await auth.createStudentSession(
      activationResult.profile.id,
      activationResult.deviceId,
      request.headers["user-agent"],
    );
    if (session.profile.id !== activationResult.profile.id || session.profile.role !== "student") {
      throw new AppError("CONFLICT", "تعذر مطابقة جلسة الطالب مع حساب التفعيل", 409);
    }

    reply.header("Set-Cookie", sessionCookie(config, session.token, config.SESSION_TTL_HOURS * 3600));
    return reply.code(activationResult.replayed ? 200 : 201).send({
      profile: session.profile,
      entitlement: activationResult.entitlement,
      accountIdentifier: activationResult.accountIdentifier,
      deviceId: activationResult.deviceId,
      replayed: activationResult.replayed,
    });
  });
}
