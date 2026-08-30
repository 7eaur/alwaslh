import assert from "node:assert/strict";
import test from "node:test";
import {
  inventoryDigest,
  validateInventory,
  type ContentSourceInventory,
} from "../src/content/source-import.js";

function makeInventory(): ContentSourceInventory {
  const inventory = {
    schemaVersion: 1 as const,
    source: {
      repository: "7eaur/alwaslh-go",
      revision: "a".repeat(40),
    },
    summary: {
      subjectRoots: 1,
      documents: 1,
      images: 1,
      helperFiles: 0,
      extensions: { ".jpg": 1 },
      manifestFiles: 0,
      duplicateBlobGroups: 0,
      duplicateBlobAssets: 0,
      otherFiles: 0,
      fatalIssues: 0,
      perSubject: [],
    },
    issues: {
      sourceRevisionErrors: [],
      unmappedImages: [],
      unparsedAssets: [],
      manifestErrors: [],
      orderErrors: [],
      classificationErrors: [],
      expectedCountErrors: [],
      otherFiles: [],
      duplicateBlobGroups: [],
    },
    documents: [
      {
        sourcePath: "تاسع علوم/علوم_تاسع_الجزء_الأول",
        classSlug: "grade-9",
        className: "الصف التاسع",
        subjectSlug: "science",
        subjectName: "العلوم",
        kind: "textbook" as const,
        title: "علوم تاسع الجزء الأول",
        hijriYear: null,
        examTrack: null,
        position: 0,
        helperFiles: [],
        sourceMetadata: {},
        assets: [
          {
            sourcePath: "تاسع علوم/علوم_تاسع_الجزء_الأول/الصور/ص001 - مقدمة.jpg",
            filename: "ص001 - مقدمة.jpg",
            extension: ".jpg",
            mimeType: "image/jpeg",
            byteSize: 1234,
            sourceGitBlobSha1: "b".repeat(40),
            namingFamily: "book_page",
            sourceNumber: 1,
            sourceOrder: 0,
            titleHint: "مقدمة",
            sourceMetadata: {},
          },
        ],
      },
    ],
    manifestSha256: "0".repeat(64),
  } satisfies ContentSourceInventory;
  inventory.manifestSha256 = inventoryDigest(inventory);
  return inventory;
}

test("valid inventory passes digest and count checks", () => {
  const inventory = makeInventory();
  assert.deepEqual(validateInventory(inventory), inventory);
});

test("tampered inventory is rejected by digest verification", () => {
  const inventory = makeInventory();
  const firstDocument = inventory.documents[0];
  assert.ok(firstDocument);
  firstDocument.title = "tampered";
  assert.throws(() => validateInventory(inventory), /digest mismatch/);
});

test("fatal inventory issues block database import", () => {
  const inventory = makeInventory();
  inventory.summary.fatalIssues = 1;
  inventory.manifestSha256 = inventoryDigest(inventory);
  assert.throws(() => validateInventory(inventory), /fatal issue/);
});

test("payload counts must match actual documents and assets", () => {
  const inventory = makeInventory();
  inventory.summary.images = 2;
  inventory.manifestSha256 = inventoryDigest(inventory);
  assert.throws(() => validateInventory(inventory), /image count/);
});
