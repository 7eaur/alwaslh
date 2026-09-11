import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLegacySectionPlan,
  parseLegacySourceName,
  validateLegacyManifest,
} from "../src/content/legacy-subject-bootstrap.js";

const validManifest = [
  {
    seq: 1,
    source_page: 1,
    book_page: null,
    section: "Front Matter",
    title: "Front Cover",
    original_name: "صفحة_1.jpg",
    new_name: "front001 - Front Cover.jpg",
    relative_path: "الصور/front001 - Front Cover.jpg",
  },
  {
    seq: 2,
    source_page: 2,
    book_page: 1,
    section: "Unit 1 - Revision",
    title: "Presents from London",
    original_name: "صفحة_2.jpg",
    new_name: "p001 - Presents from London.jpg",
    relative_path: "الصور/p001 - Presents from London.jpg",
  },
  {
    seq: 3,
    source_page: 3,
    book_page: 2,
    section: "Unit 1 - Revision",
    title: "The holidays",
    original_name: "صفحة_3.jpg",
    new_name: "p002 - The holidays.jpg",
    relative_path: "الصور/p002 - The holidays.jpg",
  },
] as const;

test("legacy subject bootstrap validates exact contiguous manifest order", () => {
  const parsed = validateLegacyManifest(validManifest, 3);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[2]?.seq, 3);

  assert.throws(
    () => validateLegacyManifest([{ ...validManifest[0], seq: 2 }, validManifest[1], validManifest[2]], 3),
    /legacy_manifest_sequence_mismatch/,
  );
  assert.throws(() => validateLegacyManifest(validManifest, 4), /legacy_manifest_count_mismatch/);
});

test("legacy subject bootstrap parses the canonical Stage9 filename families", () => {
  assert.deepEqual(parseLegacySourceName("front001 - Front Cover.jpg"), {
    namingFamily: "front",
    sourceNumber: 1,
    titleHint: "Front Cover",
  });
  assert.deepEqual(parseLegacySourceName("p012 - Planning a garden.jpg"), {
    namingFamily: "english_page",
    sourceNumber: 12,
    titleHint: "Planning a garden",
  });
});

test("legacy subject bootstrap preserves source-authored section order", () => {
  assert.deepEqual(buildLegacySectionPlan(validManifest), [
    {
      section: "Front Matter",
      slug: "legacy-english9-section-01",
      position: 0,
    },
    {
      section: "Unit 1 - Revision",
      slug: "legacy-english9-section-02",
      position: 1,
    },
  ]);
});
