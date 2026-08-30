import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { parseBody, sessionCookie } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { StudentActivationService } from "./service.js";

const ActivateStudentSchema = z.object({
  code: z.string().min(1).max(32),
  password: z.string().min(8).max(128),
  idempotencyKey: z.string().min(12).max(120),
});

export function registerStudentActivationRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  activation: StudentActivationService,
): void {
  app.post("/v1/student/activate", async (request, reply) => {
    const input = parseBody(ActivateStudentSchema, request.body);
    const activationResult = await activation.activate(input.code, input.password, input.idempotencyKey);

    // The account transaction is already committed at this point. Session
    // creation goes through the normal Auth path so idempotent replays must
    // still prove the account password before receiving a new session.
    const session = await auth.login(
      activationResult.accountIdentifier,
      input.password,
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
      replayed: activationResult.replayed,
    });
  });
}
