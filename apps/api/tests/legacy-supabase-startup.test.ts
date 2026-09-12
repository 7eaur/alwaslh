import assert from "node:assert/strict";
import test from "node:test";
import {
  assertFirstProductionBatchDryRun,
  assertReplayStable,
  FIRST_PRODUCTION_BATCH_FLAG,
  parseFirstProductionBatchFlag,
} from "../src/content/legacy-supabase-startup.js";
import type {
  LegacySubjectDryRun,
  LegacySubjectImportResult,
} from "../src/content/legacy-supabase-importer.js";
import type { LegacySubjectVerificationResult } from "../src/content/legacy-supabase-verifier.js";

function validDryRun(): LegacySubjectDryRun {
  return {
    sourceRepository: "supabase://example",
    sourceRevision: "snapshot:abc",
    manifestSha256: "abc",
    legacyClass: { id: "class", name: "Grade 9" },
    legacySubject: { id: "1794eea5-4772-4c94-bd2b-b08e5815e733", name: "English" },
    target: { classSlug: "grade-9", subjectSlug: "english", documentOrder: 0 },
    documentKind: "textbook",
    sourcePages: 69,
    logicalLessons: 62,
    sourceImageRecords: 69,
    uniqueExactImageFiles: 69,
    exactDuplicateImageGroups: 0,
    exactDuplicateImageRecords: 0,
    sameLessonDuplicateImageGroups: 0,
    sourceQuestions: 104,
    importableQuestions: 104,
    exactDuplicateQuestionRecords: 0,
    unresolvedQuestions: [],
    unresolvedPages: [],
    duplicatePageNumbers: [],
    blockingReasons: [],
    lessons: [],
    images: [],
  };
}

function importResult(overrides: Partial<LegacySubjectImportResult> = {}): LegacySubjectImportResult {
  return {
    runId: "run-1",
    sourceRepository: "supabase://example",
    sourceRevision: "snapshot:abc",
    legacySubjectId: "1794eea5-4772-4c94-bd2b-b08e5815e733",
    targetClassSlug: "grade-9",
    targetSubjectSlug: "english",
    lessons: 62,
    sourceAssets: 69,
    lessonAssets: 69,
    uniqueMediaAssetsUsed: 69,
    newMediaAssets: 69,
    reusedExactMediaAssets: 0,
    questionsImported: 104,
    questionsSkippedUnresolved: 0,
    questionDuplicatesCollapsed: 0,
    allLessonAssetsDraft: true,
    allQuestionRevisionsDraft: true,
    ...overrides,
  };
}

function verification(): LegacySubjectVerificationResult {
  return {
    legacySubjectId: "1794eea5-4772-4c94-bd2b-b08e5815e733",
    targetClassSlug: "grade-9",
    targetSubjectSlug: "english",
    sourceManifestSha256: "abc",
    lessonCount: 62,
    lessonAssetCount: 69,
    uniqueMediaAssets: 69,
    duplicateReadyMediaChecksumRows: 0,
    questionCount: 104,
    publishedLessonCount: 0,
    nonDraftLessonAssetCount: 0,
    publishedQuestionRevisionCount: 0,
    storageVariantsVerified: 276,
    sourcePagesVerified: 69,
    questionSourcesVerified: 104,
    verified: true,
  };
}

test("production legacy startup requires the single explicit bounded flag", () => {
  assert.deepEqual(parseFirstProductionBatchFlag(FIRST_PRODUCTION_BATCH_FLAG), {
    legacySubjectId: "1794eea5-4772-4c94-bd2b-b08e5815e733",
    targetClassSlug: "grade-9",
    targetSubjectSlug: "english",
    documentOrder: 0,
  });
  assert.throws(() => parseFirstProductionBatchFlag("grade9-all-content"), /legacy_startup_batch_flag_not_allowed/);
});

test("production legacy startup refuses source drift from the approved 69/62/104 contract", () => {
  assert.doesNotThrow(() => assertFirstProductionBatchDryRun(validDryRun()));
  assert.throws(
    () => assertFirstProductionBatchDryRun({ ...validDryRun(), sourcePages: 68 }),
    /legacy_startup_first_batch_contract_mismatch/,
  );
  assert.throws(
    () => assertFirstProductionBatchDryRun({ ...validDryRun(), importableQuestions: 103 }),
    /legacy_startup_first_batch_contract_mismatch/,
  );
});

test("replay must reuse the same run and create no media duplicates", () => {
  const first = importResult();
  const replay = importResult({ newMediaAssets: 0, reusedExactMediaAssets: 69 });
  const firstVerification = verification();
  const replayVerification = verification();
  assert.doesNotThrow(() => assertReplayStable(first, replay, firstVerification, replayVerification));
  assert.throws(
    () => assertReplayStable(first, { ...replay, runId: "run-2" }, firstVerification, replayVerification),
    /legacy_startup_replay_changed_import_run/,
  );
  assert.throws(
    () => assertReplayStable(first, { ...replay, newMediaAssets: 1 }, firstVerification, replayVerification),
    /legacy_startup_replay_created_media/,
  );
});
