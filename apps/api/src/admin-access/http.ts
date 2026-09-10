import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AccessCodeImportService } from "../access/import-service.js";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type {
  AdminAccessCodeSort,
  AdminAccessCodeStatus,
  AdminAccessCodeType,
  AdminStudentAccessService,
  AdminStudentSort,
  AdminStudentStatus,
  SortDirection,
} from "./service.js";

const AccessCodeTypeSchema = z.enum(["full_access", "class_access"]);
const AccessCodeStatusSchema = z.enum(["active", "redeemed", "expired", "revoked"]);
const AccessCodeSortSchema = z.enum([
  "created_at",
  "code",
  "status",
  "valid_from",
  "expires_at",
  "redeemed_at",
]);
const StudentStatusSchema = z.enum(["active", "inactive", "archived"]);
const StudentSortSchema = z.enum(["created_at", "identifier", "status", "last_login"]);
const DirectionSchema = z.enum(["asc", "desc"]);
const PageSizeSchema = z.coerce.number().int().min(1).max(100);
const PageOffsetSchema = z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER);

const CodeListQuerySchema = z.object({
  type: AccessCodeTypeSchema.default("full_access"),
  status: AccessCodeStatusSchema.optional(),
  search: z.string().trim().max(32).optional(),
  classId: z.string().uuid().optional(),
  sort: AccessCodeSortSchema.default("created_at"),
  direction: DirectionSchema.default("desc"),
  limit: PageSizeSchema.optional(),
  offset: PageOffsetSchema.optional(),
});

const RevokeCodesSchema = z.object({
  type: AccessCodeTypeSchema,
  codeIds: z.array(z.string().uuid()).min(1).max(100),
});

const FullAccessImportSchema = z.object({
  rows: z
    .array(
      z.object({
        rowNumber: z.number().int().min(2).max(1_000_000),
        code: z.string().min(1).max(32),
        durationDays: z.number().int().min(1).max(3650),
      }),
    )
    .min(1)
    .max(500),
});

const StudentListQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: StudentStatusSchema.optional(),
  sort: StudentSortSchema.default("created_at"),
  direction: DirectionSchema.default("desc"),
  limit: PageSizeSchema.optional(),
  offset: PageOffsetSchema.optional(),
});

const StudentParamsSchema = z.object({
  profileId: z.string().uuid(),
});

const StudentDetailQuerySchema = z.object({
  historyLimit: PageSizeSchema.optional(),
  historyOffset: PageOffsetSchema.optional(),
});

async function requireAdmin(
  request: Parameters<typeof currentProfile>[0],
  config: AppConfig,
  auth: AuthService,
) {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
  return actor;
}

export function registerAdminStudentAccessRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  service: AdminStudentAccessService,
  importService: AccessCodeImportService,
): void {
  app.get("/v1/admin/access/codes", async (request) => {
    await requireAdmin(request, config, auth);
    const query = parseBody(CodeListQuerySchema, request.query);
    const page = await service.listAccessCodes({
      type: query.type as AdminAccessCodeType,
      ...(query.status ? { status: query.status as AdminAccessCodeStatus } : {}),
      ...(query.search ? { search: query.search } : {}),
      ...(query.classId ? { classId: query.classId } : {}),
      sort: query.sort as AdminAccessCodeSort,
      direction: query.direction as SortDirection,
      limit: query.limit ?? 25,
      offset: query.offset ?? 0,
    });
    return { codes: page.items, page: { total: page.total, limit: page.limit, offset: page.offset } };
  });

  app.post("/v1/admin/access/codes/revoke", async (request) => {
    const actor = await requireAdmin(request, config, auth);
    const input = parseBody(RevokeCodesSchema, request.body);
    return service.revokeUnusedCodes(actor.id, input.type as AdminAccessCodeType, input.codeIds);
  });

  app.post("/v1/admin/access/full-codes/import", async (request) => {
    const actor = await requireAdmin(request, config, auth);
    const input = parseBody(FullAccessImportSchema, request.body);
    return importService.importFullAccessCodes(actor.id, input.rows);
  });

  app.get("/v1/admin/students", async (request) => {
    await requireAdmin(request, config, auth);
    const query = parseBody(StudentListQuerySchema, request.query);
    const page = await service.listStudents({
      ...(query.search ? { search: query.search } : {}),
      ...(query.status ? { status: query.status as AdminStudentStatus } : {}),
      sort: query.sort as AdminStudentSort,
      direction: query.direction as SortDirection,
      limit: query.limit ?? 25,
      offset: query.offset ?? 0,
    });
    return { students: page.items, page: { total: page.total, limit: page.limit, offset: page.offset } };
  });

  app.get("/v1/admin/students/:profileId", async (request) => {
    await requireAdmin(request, config, auth);
    const params = parseBody(StudentParamsSchema, request.params);
    const query = parseBody(StudentDetailQuerySchema, request.query);
    return {
      student: await service.studentDetail(
        params.profileId,
        query.historyLimit ?? 25,
        query.historyOffset ?? 0,
      ),
    };
  });
}
