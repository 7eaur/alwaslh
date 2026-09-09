import Fastify, { type FastifyInstance } from "fastify";
import { registerAccessRoutes } from "./access/http.js";
import { AccessService } from "./access/service.js";
import { registerStudentActivationRoutes } from "./activation/http.js";
import { StudentActivationService } from "./activation/service.js";
import { AdminAiOperationsService } from "./ai/admin-operations.js";
import { registerAdminAiOperationsRoutes } from "./ai/admin-operations-http.js";
import { registerAuthRoutes } from "./auth/http.js";
import { AuthService } from "./auth/service.js";
import { type AppConfig, allowedOrigins } from "./config.js";
import { AdminContentOperationsService } from "./content/admin-operations.js";
import { registerAdminContentOperationsRoutes } from "./content/admin-operations-http.js";
import { registerAdminContentIngestionRoutes } from "./content/ingestion-http.js";
import { AdminContentIngestionService } from "./content/ingestion-service.js";
import { registerCurriculumRoutes } from "./curriculum/http.js";
import { CurriculumService } from "./curriculum/service.js";
import type { Database } from "./db.js";
import { AppError, toPublicError } from "./errors.js";
import { FileSystemMediaStorage } from "./media/storage.js";
import { registerQuestionBankRoutes } from "./question-bank/http.js";
import { registerQuestionBankRegenerationRoutes } from "./question-bank/regeneration-http.js";
import { QuestionBankRegenerationService } from "./question-bank/regeneration.js";
import { QuestionBankService } from "./question-bank/service.js";
import { QuizQuestionCandidateService } from "./quiz-builder/candidates.js";
import { registerQuizVersionExportRoutes } from "./quiz-builder/export-http.js";
import { QuizVersionExportService } from "./quiz-builder/export.js";
import { registerQuizBuilderRoutes } from "./quiz-builder/http.js";
import { QuizBuilderService } from "./quiz-builder/service.js";

export interface AppDependencies {
  config: AppConfig;
  database: Database;
}

export function buildApp({ config, database }: AppDependencies): FastifyInstance {
  const app = Fastify({
    logger: config.LOG_LEVEL === "silent" ? false : { level: config.LOG_LEVEL },
    disableRequestLogging: false,
    trustProxy: true,
    bodyLimit: 1_048_576,
    requestTimeout: 15_000,
  });
  const origins = allowedOrigins(config);
  const auth = new AuthService(database, config.SESSION_TTL_HOURS);
  const access = new AccessService(database);
  const activation = new StudentActivationService(database);
  const curriculum = new CurriculumService(database);
  const contentOperations = new AdminContentOperationsService(database);
  const aiOperations = new AdminAiOperationsService(database);
  const questionBank = new QuestionBankService(database);
  const questionBankRegeneration = new QuestionBankRegenerationService(database);
  const quizBuilder = new QuizBuilderService(database);
  const quizCandidates = new QuizQuestionCandidateService(database);
  const quizExports = new QuizVersionExportService(quizBuilder);
  const mediaStorage = new FileSystemMediaStorage(config.MEDIA_STORAGE_ROOT);
  const contentIngestion = new AdminContentIngestionService(database, mediaStorage);

  app.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin;
    if (origin && origins.has(origin)) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Access-Control-Allow-Credentials", "true");
      reply.header("Vary", "Origin");
    }

    if (request.method === "OPTIONS") {
      if (!origin || !origins.has(origin)) {
        throw new AppError("FORBIDDEN", "مصدر الطلب غير مسموح", 403);
      }
      reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      reply.header("Access-Control-Allow-Headers", "Content-Type");
      return reply.code(204).send();
    }
  });

  registerAuthRoutes(app, config, auth);
  registerStudentActivationRoutes(app, config, auth, activation);
  registerAccessRoutes(app, config, auth, access);
  registerCurriculumRoutes(app, config, auth, curriculum);
  registerAdminContentOperationsRoutes(app, config, auth, contentOperations);
  registerAdminContentIngestionRoutes(app, config, auth, contentIngestion);
  registerAdminAiOperationsRoutes(app, config, auth, aiOperations);
  registerQuestionBankRoutes(app, config, auth, questionBank);
  registerQuestionBankRegenerationRoutes(app, config, auth, questionBankRegeneration);
  registerQuizBuilderRoutes(app, config, auth, quizBuilder, quizCandidates);
  registerQuizVersionExportRoutes(app, config, auth, quizExports);

  app.get("/health", async () => ({
    status: "ok",
    service: "alwaslh-api",
  }));

  app.get("/ready", async (_request, reply) => {
    try {
      await database.ping();
      return { status: "ready" };
    } catch (error) {
      app.log.error({ err: error }, "database readiness check failed");
      return reply.code(503).send({ status: "not_ready" });
    }
  });

  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({ error: { code: "NOT_FOUND", message: "المسار غير موجود" } });
  });

  app.setErrorHandler((error, request, reply) => {
    const publicError = toPublicError(error);
    if (publicError.statusCode >= 500) {
      request.log.error({ err: error }, "request failed");
    }
    return reply.code(publicError.statusCode).send(publicError.body);
  });

  app.addHook("onClose", async () => {
    await database.close();
  });

  return app;
}
