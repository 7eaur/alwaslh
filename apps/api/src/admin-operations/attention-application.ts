import type { AppConfig } from "../config.js";
import { buildOperationsAttention, type OperationsAttentionSummary } from "./attention.js";
import type { AdminOperationsService } from "./service.js";

type OperationsAttentionReader = Pick<AdminOperationsService, "governance" | "audit">;

export async function loadOperationsAttention(
  operations: OperationsAttentionReader,
  config: AppConfig,
  recentLimit: number,
): Promise<OperationsAttentionSummary> {
  const [governance, audit] = await Promise.all([
    operations.governance(config),
    operations.audit({ limit: recentLimit, offset: 0 }),
  ]);

  return buildOperationsAttention(governance, audit.entries);
}
