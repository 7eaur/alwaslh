import type { Database } from "../db.js";
import { AppError } from "../errors.js";
import type { AiGenerationOutput } from "./contracts.js";
import { aiGenerationOutputSchema } from "./contracts.js";

export type AdminAiApplicationKind = "lesson" | "quiz";

export interface AdminAiApplicationCapability {
  kind: AdminAiApplicationKind;
  reviewRevision: number;
}

interface ApplicationRow {
  unit_key: string;
  revision: number | null;
  action: string | null;
  reviewed_output: unknown;
}

export function projectAdminAiApplication(
  unitKey: string,
  action: string | null,
  reviewRevision: number | null,
  output: AiGenerationOutput | null,
): AdminAiApplicationCapability | null {
  if (action !== "approve" || reviewRevision === null || output === null) return null;

  if (
    unitKey.startsWith("lesson:") &&
    (output.kind === "summary" || output.kind === "question_set" || output.kind === "lesson_content")
  ) {
    return { kind: "lesson", reviewRevision };
  }

  if (unitKey.startsWith("quiz-version:") && output.kind === "question_set") {
    return { kind: "quiz", reviewRevision };
  }

  return null;
}

export class AdminAiApplicationService {
  constructor(private readonly database: Database) {}

  async capability(outputId: string): Promise<{ application: AdminAiApplicationCapability | null }> {
    const rows = await this.database.query<ApplicationRow>(
      `select u.unit_key,
              latest.revision,
              latest.action,
              latest.reviewed_output
       from ai_outputs o
       join ai_job_units u on u.id = o.job_unit_id
       left join lateral (
         select e.revision, e.action::text as action, e.reviewed_output
         from ai_output_review_events e
         where e.ai_output_id = o.id
         order by e.revision desc
         limit 1
       ) latest on true
       where o.id = $1`,
      [outputId],
    );
    const row = rows[0];
    if (!row) throw new AppError("NOT_FOUND", "مخرج الذكاء الاصطناعي غير موجود", 404);

    let reviewedOutput: AiGenerationOutput | null = null;
    if (row.reviewed_output !== null) {
      const parsed = aiGenerationOutputSchema.safeParse(row.reviewed_output);
      if (!parsed.success) {
        throw new AppError("INTERNAL_ERROR", "المخرج المعتمد المخزن لا يطابق عقد الذكاء الاصطناعي", 500);
      }
      reviewedOutput = parsed.data;
    }

    return {
      application: projectAdminAiApplication(row.unit_key, row.action, row.revision, reviewedOutput),
    };
  }
}
