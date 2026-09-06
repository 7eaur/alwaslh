import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { type AppConfig, allowedOrigins } from "../config.js";
import { AppError } from "../errors.js";
import type { AuthService, SessionProfile } from "./service.js";

const LoginSchema = z.object({
  identifier: z.string().min(3).max(120),
  password: z.string().min(1).max(128),
});

const StudentLoginCompleteSchema = z.object({
  challengeToken: z.string().min(32).max(128),
  signature: z.string().min(64).max(256),
  publicKeySpki: z.string().min(80).max(4096).optional(),
  newPassword: z.string().min(8).max(128).optional(),
});

const StudentAdminMutationSchema = z.object({
  profileId: z.string().uuid(),
});

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function parseCookies(header: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (!name) continue;
    try {
      cookies.set(name, decodeURIComponent(value));
    } catch {
      // Ignore malformed individual cookie values rather than rejecting the whole header.
    }
  }
  return cookies;
}

export function sessionToken(request: FastifyRequest, config: AppConfig): string | undefined {
  return parseCookies(request.headers.cookie).get(config.SESSION_COOKIE_NAME);
}

export function sessionCookie(config: AppConfig, token: string, maxAgeSeconds: number): string {
  const sameSite = config.SESSION_COOKIE_SAME_SITE === "none" ? "None" : "Lax";
  const requiresSecure = config.NODE_ENV === "production" || sameSite === "None";
  const secure = requiresSecure ? "; Secure" : "";
  return `${config.SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAgeSeconds}${secure}`;
}

function clearSessionCookie(config: AppConfig): string {
  return sessionCookie(config, "", 0);
}

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400);
  return parsed.data;
}

export async function currentProfile(
  request: FastifyRequest,
  config: AppConfig,
  auth: AuthService,
): Promise<SessionProfile> {
  return auth.authenticate(sessionToken(request, config));
}

export function registerAuthRoutes(app: FastifyInstance, config: AppConfig, auth: AuthService): void {
  const origins = allowedOrigins(config);

  app.addHook("onRequest", async (request) => {
    if (!unsafeMethods.has(request.method) || !request.url.startsWith("/v1/")) return;
    const origin = request.headers.origin;
    if (config.NODE_ENV === "production" && !origin) {
      throw new AppError("FORBIDDEN", "مصدر الطلب غير مسموح", 403);
    }
    if (origin && !origins.has(origin)) {
      throw new AppError("FORBIDDEN", "مصدر الطلب غير مسموح", 403);
    }
  });

  // This route is intentionally Admin-only. Student password-only login would
  // bypass the registered-device security boundary.
  app.post("/v1/auth/login", async (request, reply) => {
    const input = parseBody(LoginSchema, request.body);
    const result = await auth.login(input.identifier, input.password, request.headers["user-agent"]);
    reply.header("Set-Cookie", sessionCookie(config, result.token, config.SESSION_TTL_HOURS * 3600));
    return { profile: result.profile };
  });

  app.post("/v1/student/login/start", async (request) => {
    const input = parseBody(LoginSchema, request.body);
    return auth.startStudentLogin(input.identifier, input.password);
  });

  app.post("/v1/student/login/complete", async (request, reply) => {
    const input = parseBody(StudentLoginCompleteSchema, request.body);
    const result = await auth.completeStudentLogin({
      challengeToken: input.challengeToken,
      signature: input.signature,
      ...(input.publicKeySpki ? { publicKeySpki: input.publicKeySpki } : {}),
      ...(input.newPassword ? { newPassword: input.newPassword } : {}),
      ...(request.headers["user-agent"] ? { userAgent: request.headers["user-agent"] } : {}),
    });
    reply.header("Set-Cookie", sessionCookie(config, result.token, config.SESSION_TTL_HOURS * 3600));
    return { profile: result.profile, deviceId: result.deviceId };
  });

  app.post("/v1/auth/logout", async (request, reply) => {
    await auth.logout(sessionToken(request, config));
    reply.header("Set-Cookie", clearSessionCookie(config));
    return reply.code(204).send();
  });

  app.get("/v1/auth/me", async (request) => ({
    profile: await currentProfile(request, config, auth),
  }));

  app.get("/v1/admin/me", async (request) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    return { profile };
  });

  app.get("/v1/student/me", async (request) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);
    return { profile };
  });

  app.post("/v1/admin/auth/temporary-password", async (request) => {
    const actor = await currentProfile(request, config, auth);
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const input = parseBody(StudentAdminMutationSchema, request.body);
    return auth.issueTemporaryPassword(actor, input.profileId);
  });

  app.post("/v1/admin/auth/device-rebind", async (request) => {
    const actor = await currentProfile(request, config, auth);
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
    const input = parseBody(StudentAdminMutationSchema, request.body);
    await auth.resetStudentDevice(actor, input.profileId);
    return { status: "device_rebind_allowed" };
  });
}
