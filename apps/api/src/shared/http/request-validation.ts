import { z } from "zod";
import { AppError } from "../../errors.js";

export function parseBody<TSchema extends z.ZodTypeAny>(schema: TSchema, body: unknown): z.output<TSchema> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400);
  return parsed.data;
}
