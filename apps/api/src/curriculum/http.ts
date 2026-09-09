import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService, SessionProfile } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { StudentReaderService } from "./student-reader.js";
import type { CurriculumService } from "./service.js";

const RecordStatusSchema = z.enum(["active", "inactive", "archived"]);
const SlugSchema = z.string().trim().min(1).max(120);
const NameSchema = z.string().trim().min(1).max(200);
const DescriptionSchema = z.string().trim().max(4000).nullable().optional();
const PositionSchema = z.number().int().min(0).max(1_000_000);

const CreateClassSchema = z.object({
  slug: SlugSchema,
  name: NameSchema,
  description: DescriptionSchema,
  position: PositionSchema.optional(),
  status: RecordStatusSchema.optional(),
});

const UpdateClassSchema = z.object({
  name: NameSchema.optional(),
  description: DescriptionSchema,
  position: PositionSchema.optional(),
  status: RecordStatusSchema.optional(),
});

const CreateSubjectSchema = z.object({
  slug: SlugSchema,
  name: NameSchema,
  description: DescriptionSchema,
  status: RecordStatusSchema.optional(),
});

const UpdateSubjectSchema = z.object({
  name: NameSchema.optional(),
  description: DescriptionSchema,
  status: RecordStatusSchema.optional(),
});

const CreateOfferingSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  position: PositionSchema.optional(),
  status: RecordStatusSchema.optional(),
});

const UpdateOfferingSchema = z.object({
  position: PositionSchema.optional(),
  status: RecordStatusSchema.optional(),
});

const CreateSectionSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  slug: SlugSchema,
  title: NameSchema,
  description: DescriptionSchema,
  position: PositionSchema.optional(),
  status: RecordStatusSchema.optional(),
});

const UpdateSectionSchema = z.object({
  title: NameSchema.optional(),
  description: DescriptionSchema,
  position: PositionSchema.optional(),
  status: RecordStatusSchema.optional(),
});

const CreateLessonSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  sectionId: z.string().uuid().nullable().optional(),
  slug: SlugSchema,
  title: NameSchema,
  summary: DescriptionSchema,
  position: PositionSchema.optional(),
  status: RecordStatusSchema.optional(),
});

const UpdateLessonSchema = z.object({
  sectionId: z.string().uuid().nullable().optional(),
  title: NameSchema.optional(),
  summary: DescriptionSchema,
  position: PositionSchema.optional(),
  status: RecordStatusSchema.optional(),
});

const ClassParamsSchema = z.object({ classId: z.string().uuid() });
const SubjectParamsSchema = z.object({ subjectId: z.string().uuid() });
const OfferingParamsSchema = z.object({ classId: z.string().uuid(), subjectId: z.string().uuid() });
const SectionParamsSchema = z.object({ sectionId: z.string().uuid() });
const LessonParamsSchema = z.object({ lessonId: z.string().uuid() });
const LessonAssetParamsSchema = z.object({ assetId: z.string().uuid() });

async function adminActor(
  request: Parameters<typeof currentProfile>[0],
  config: AppConfig,
  auth: AuthService,
): Promise<SessionProfile> {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
  return actor;
}

async function studentActor(
  request: Parameters<typeof currentProfile>[0],
  config: AppConfig,
  auth: AuthService,
): Promise<SessionProfile> {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "student") throw new AppError("FORBIDDEN", "هذه العملية للطالب فقط", 403);
  return actor;
}

export function registerCurriculumRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  curriculum: CurriculumService,
  studentReader: StudentReaderService,
): void {
  app.get("/v1/student/curriculum", async (request) => {
    const actor = await studentActor(request, config, auth);
    return { curriculum: await curriculum.studentCatalog(actor.id) };
  });

  app.get("/v1/student/lessons/:lessonId/reader", async (request) => {
    const actor = await studentActor(request, config, auth);
    const params = parseBody(LessonParamsSchema, request.params);
    return { reader: await studentReader.lesson(actor.id, params.lessonId) };
  });

  app.get("/v1/student/lesson-assets/:assetId/content", async (request, reply) => {
    const actor = await studentActor(request, config, auth);
    const params = parseBody(LessonAssetParamsSchema, request.params);
    const content = await studentReader.assetContent(actor.id, params.assetId);
    reply.header("Content-Type", content.mimeType);
    reply.header("Content-Length", String(content.byteSize));
    reply.header("Cache-Control", "private, no-store");
    reply.header("Pragma", "no-cache");
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("ETag", `"${content.checksumSha256}"`);
    return reply.send(content.bytes);
  });

  app.get("/v1/admin/curriculum", async (request) => {
    await adminActor(request, config, auth);
    return { curriculum: await curriculum.snapshot() };
  });

  app.post("/v1/admin/curriculum/classes", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const input = parseBody(CreateClassSchema, request.body);
    const record = await curriculum.createClass(actor.id, input);
    return reply.code(201).send({ class: record });
  });

  app.patch("/v1/admin/curriculum/classes/:classId", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(ClassParamsSchema, request.params);
    const input = parseBody(UpdateClassSchema, request.body);
    return { class: await curriculum.updateClass(actor.id, params.classId, input) };
  });

  app.post("/v1/admin/curriculum/subjects", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const input = parseBody(CreateSubjectSchema, request.body);
    const record = await curriculum.createSubject(actor.id, input);
    return reply.code(201).send({ subject: record });
  });

  app.patch("/v1/admin/curriculum/subjects/:subjectId", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(SubjectParamsSchema, request.params);
    const input = parseBody(UpdateSubjectSchema, request.body);
    return { subject: await curriculum.updateSubject(actor.id, params.subjectId, input) };
  });

  app.post("/v1/admin/curriculum/offerings", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const input = parseBody(CreateOfferingSchema, request.body);
    const record = await curriculum.createOffering(actor.id, input);
    return reply.code(201).send({ offering: record });
  });

  app.patch("/v1/admin/curriculum/offerings/:classId/:subjectId", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(OfferingParamsSchema, request.params);
    const input = parseBody(UpdateOfferingSchema, request.body);
    return {
      offering: await curriculum.updateOffering(actor.id, params.classId, params.subjectId, input),
    };
  });

  app.post("/v1/admin/curriculum/sections", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const input = parseBody(CreateSectionSchema, request.body);
    const record = await curriculum.createSection(actor.id, input);
    return reply.code(201).send({ section: record });
  });

  app.patch("/v1/admin/curriculum/sections/:sectionId", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(SectionParamsSchema, request.params);
    const input = parseBody(UpdateSectionSchema, request.body);
    return { section: await curriculum.updateSection(actor.id, params.sectionId, input) };
  });

  app.post("/v1/admin/curriculum/lessons", async (request, reply) => {
    const actor = await adminActor(request, config, auth);
    const input = parseBody(CreateLessonSchema, request.body);
    const record = await curriculum.createLesson(actor.id, input);
    return reply.code(201).send({ lesson: record });
  });

  app.patch("/v1/admin/curriculum/lessons/:lessonId", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(LessonParamsSchema, request.params);
    const input = parseBody(UpdateLessonSchema, request.body);
    return { lesson: await curriculum.updateLesson(actor.id, params.lessonId, input) };
  });
}
