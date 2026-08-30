import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { extractPdfPages, verifyPopplerAvailable } from "../src/media/pdf-processor.js";

const path = process.env.MEDIA_TEST_PDF;
if (!path) throw new Error("MEDIA_TEST_PDF is required");

await verifyPopplerAvailable();
const pages = await extractPdfPages(await readFile(path));
assert.equal(pages.length, 2);
assert.deepEqual(
  pages.map((page) => page.pageNumber),
  [1, 2],
);
assert.deepEqual(
  pages.map((page) => page.filename),
  ["page-1.jpg", "page-2.jpg"],
);
for (const page of pages) {
  assert.equal(page.mimeType, "image/jpeg");
  assert.ok(page.bytes.byteLength > 0);
}
console.log("Stage 10 PDF smoke: 2 pages extracted in stable numeric order");
