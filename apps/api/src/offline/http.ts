import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody, sessionToken } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { StudentOfflineDownloadService } from "./download.js";
import type { StudentOfflineService } from "./service.js";

const OfflineLessonParamsSchema = z.object({ lessonId: z.string().uuid() });
const OfflineLessonAssetParamsSchema = z.object({
  lessonId: z.string().uuid(),
  assetId: z.string().uuid(),
});
const OfflineAssetQuerySchema = z.object({
  revision: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
});

export function registerStudentOfflineRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  offline: StudentOfflineService,
  downloads: StudentOfflineDownloadService,
): void {
  app.get("/v1/student/offline/lease", async (request, reply) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);

    const lease = await offline.lease(profile.id, sessionToken(request, config));
    reply.header("Cache-Control", "private, no-store");
    reply.header("Pragma", "no-cache");
    return { lease };
  });

  app.get("/v1/student/offline/lessons/:lessonId/manifest", async (request, reply) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);
    const params = parseBody(OfflineLessonParamsSchema, request.params);
    const manifest = await downloads.lessonManifest(
      profile.id,
      sessionToken(request, config),
      params.lessonId,
    );
    reply.header("Cache-Control", "private, no-store");
    reply.header("Pragma", "no-cache");
    return { manifest };
  });

  app.get("/v1/student/offline/lessons/:lessonId/assets/:assetId", async (request, reply) => {
    const profile = await currentProfile(request, config, auth);
    if (profile.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);
    const params = parseBody(OfflineLessonAssetParamsSchema, request.params);
    const query = parseBody(OfflineAssetQuerySchema, request.query);
    const content = await downloads.lessonAsset(profile.id, sessionToken(request, config), {
      lessonId: params.lessonId,
      assetId: params.assetId,
      contentRevision: query.revision,
    });

    reply.header("Content-Type", content.mimeType);
    reply.header("Content-Length", String(content.byteSize));
    reply.header("Cache-Control", "private, no-store");
    reply.header("Pragma", "no-cache");
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("ETag", `"${content.checksumSha256}"`);
    reply.header("X-Alwaslh-Content-Revision", String(query.revision));
    return reply.send(content.bytes);
  });
}
