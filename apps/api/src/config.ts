import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), {
      message: "DATABASE_URL must use postgresql:// or postgres://",
    }),
  DATABASE_SSL: z.enum(["disable", "require"]).default("disable"),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(10),
  SESSION_COOKIE_NAME: z
    .string()
    .regex(/^[A-Za-z0-9_-]+$/)
    .default("alwaslh_session"),
  SESSION_TTL_HOURS: z.coerce
    .number()
    .int()
    .min(1)
    .max(24 * 30)
    .default(24 * 7),
  SESSION_COOKIE_SAME_SITE: z.enum(["lax", "none"]).default("lax"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173,http://localhost:5174"),
  MEDIA_STORAGE_ROOT: z.string().trim().min(1).default("./.media-storage"),
  OFFLINE_AUTH_SIGNING_PRIVATE_KEY_PEM_B64: z.string().trim().min(1).optional(),
  INTEGRATIONS_API_KEY: z.string().trim().min(1).optional(),
  AI_GATEWAY_BASE_URL: z
    .string()
    .url()
    .default("https://app-a8tauoehdn9d-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta"),
  AI_GEMINI_MODEL: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9._-]+$/)
    .default("gemini-2.5-flash"),
  AI_WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(8).default(2),
  AI_PROVIDER_TIMEOUT_MS: z.coerce.number().int().min(5_000).max(300_000).default(120_000),
  AI_PROVIDER_MAX_INLINE_BYTES: z.coerce
    .number()
    .int()
    .min(1_048_576)
    .max(64 * 1_048_576)
    .default(16 * 1_048_576),
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return result.data;
}

export function allowedOrigins(config: AppConfig): ReadonlySet<string> {
  return new Set(
    config.ALLOWED_ORIGINS.split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}
