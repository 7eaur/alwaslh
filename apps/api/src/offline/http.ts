import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import { currentProfile, sessionToken } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { StudentOfflineService } from "./service.js";

export function registerStudentOfflineRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  offline: StudentOfflineService,
): void {
  app.get("/v1/student/offline/lease", async (request, reply) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);

    const lease = await offline.lease(profile.id, sessionToken(request, config));
    reply.header("Cache-Control", "private, no-store");
    reply.header("Pragma", "no-cache");
    return { lease };
  });
}
