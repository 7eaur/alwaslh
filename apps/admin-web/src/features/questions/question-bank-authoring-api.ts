import { adminApiRequest } from "../../admin-api";
import type { AiAuthoringSubjectDomain, AuthoringPlanResult } from "../ai/public";

export function enqueueQuestionRegeneration(
  itemId: string,
  input: { clientRequestId: string; subjectDomain: AiAuthoringSubjectDomain },
): Promise<AuthoringPlanResult> {
  return adminApiRequest<AuthoringPlanResult>(
    `/v1/admin/authoring/question-bank/${itemId}/regenerate`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function archiveQuestionBankItem(itemId: string): Promise<{ replayed: boolean }> {
  return adminApiRequest<{ replayed: boolean }>(
    `/v1/admin/authoring/question-bank/${itemId}/archive`,
    {
      method: "POST",
    },
  );
}
