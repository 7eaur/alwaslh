import { adminApiRequest } from "./admin-api";

export interface AiApplicationCapability {
  kind: "lesson" | "quiz";
  reviewRevision: number;
}

export interface AiApplicationCapabilityResponse {
  application: AiApplicationCapability | null;
}

export function fetchAiApplicationCapability(outputId: string): Promise<AiApplicationCapabilityResponse> {
  return adminApiRequest<AiApplicationCapabilityResponse>(
    `/v1/admin/ai/outputs/${encodeURIComponent(outputId)}/application`,
  );
}
