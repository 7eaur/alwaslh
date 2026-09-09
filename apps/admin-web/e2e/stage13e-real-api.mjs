const apiBaseUrl = (process.env.STAGE13E_E2E_API_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const adminOrigin = process.env.STAGE13E_E2E_ADMIN_ORIGIN ?? "http://127.0.0.1:5175";
const TERMINAL_EXECUTION_STATUSES = new Set(["completed", "failed", "cancelled"]);

async function parseJsonResponse(response, operation) {
  const text = await response.text();
  if (!response.ok()) {
    throw new Error(`${operation} failed with HTTP ${response.status()}: ${text.slice(0, 500)}`);
  }
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${operation} returned a non-JSON response`);
  }
}

function unsafeHeaders() {
  return {
    Origin: adminOrigin,
    "Content-Type": "application/json",
  };
}

export async function logoutRealAdminSession(page) {
  const response = await page.context().request.post(`${apiBaseUrl}/v1/auth/logout`, {
    headers: { Origin: adminOrigin },
  });
  await parseJsonResponse(response, "Stage13E real-session logout");
}

export async function findTerminalOpenReviewFixture(page, jobType) {
  const listResponse = await page.context().request.get(
    `${apiBaseUrl}/v1/admin/ai/jobs?jobType=${encodeURIComponent(jobType)}&limit=30&offset=0`,
  );
  const list = await parseJsonResponse(listResponse, "Stage13E race fixture job lookup");
  const job = list?.jobs?.find((candidate) => candidate.jobType === jobType);
  if (!job) {
    throw new Error(`STAGE13E_E2E_RACE_JOB_TYPE=${jobType} did not resolve to a real Admin AI job`);
  }

  const detailResponse = await page.context().request.get(
    `${apiBaseUrl}/v1/admin/ai/jobs/${job.id}?unitLimit=50&unitOffset=0`,
  );
  const detail = await parseJsonResponse(detailResponse, "Stage13E race fixture job detail");
  if (!TERMINAL_EXECUTION_STATUSES.has(detail?.job?.executionStatus)) {
    throw new Error(
      `STAGE13E_E2E_RACE_JOB_TYPE=${jobType} must reference a terminal execution job so the stale-review race is deterministic without polling interference`,
    );
  }

  for (let unitIndex = 0; unitIndex < (detail?.units?.length ?? 0); unitIndex += 1) {
    const outputId = detail.units[unitIndex]?.output?.id;
    if (!outputId) continue;
    const outputResponse = await page.context().request.get(`${apiBaseUrl}/v1/admin/ai/outputs/${outputId}`);
    const outputEnvelope = await parseJsonResponse(outputResponse, "Stage13E race fixture output detail");
    const allowed = outputEnvelope?.output?.allowedReviewActions ?? [];
    if (allowed.includes("approve")) {
      return {
        jobType,
        unitIndex,
        outputId,
      };
    }
  }

  throw new Error(
    `STAGE13E_E2E_RACE_JOB_TYPE=${jobType} must contain an open output whose server allowedReviewActions includes approve`,
  );
}

export async function terminateReviewOutOfBand(page, outputId) {
  const response = await page.context().request.patch(`${apiBaseUrl}/v1/admin/ai/outputs/${outputId}/review`, {
    headers: unsafeHeaders(),
    data: {
      action: "reject",
      note: "إغلاق خارجي مقصود لاختبار تعارض المراجعة في المتصفح",
    },
  });
  const envelope = await parseJsonResponse(response, "Stage13E out-of-band terminal review");
  if (envelope?.output?.reviewStatus !== "rejected") {
    throw new Error("Stage13E out-of-band terminal review did not persist rejected state");
  }
  if ((envelope?.output?.allowedReviewActions ?? []).length !== 0) {
    throw new Error("Stage13E terminal review fixture still advertises review actions after rejection");
  }
}
