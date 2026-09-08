import assert from "node:assert/strict";
import test from "node:test";
import { normalizeOcrText } from "../src/ocr/normalize.js";
import { parseTesseractTsv } from "../src/ocr/tesseract-provider.js";

test("OCR normalization is conservative and preserves Arabic/source characters", () => {
  const raw = "  بِسْمِ\u00a0اللَّهِ   الرَّحْمَنِ  \r\n\r\n\r\n  ALWASLH\tOCR  ";
  assert.equal(normalizeOcrText(raw), "بِسْمِ اللَّهِ الرَّحْمَنِ\n\nALWASLH OCR");
});

test("Tesseract TSV parser preserves line order and calculates weighted confidence", () => {
  const tsv = [
    "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext",
    "5\t1\t1\t1\t1\t1\t0\t0\t10\t10\t90.0\tALWASLH",
    "5\t1\t1\t1\t1\t2\t10\t0\t10\t10\t80.0\tOCR",
    "5\t1\t1\t1\t2\t1\t0\t20\t10\t10\t70.0\t123",
    "4\t1\t1\t1\t2\t0\t0\t20\t20\t10\t-1\t",
    "",
  ].join("\n");

  const result = parseTesseractTsv(tsv);
  assert.equal(result.rawText, "ALWASLH OCR\n123");
  assert.equal(result.wordCount, 3);
  assert.ok(result.meanConfidence !== null);
  assert.ok(result.meanConfidence > 80 && result.meanConfidence < 90);
});

test("Tesseract TSV parser treats missing provider confidence as unknown", () => {
  const tsv = [
    "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext",
    "5\t1\t1\t1\t1\t1\t0\t0\t10\t10\t-1\tنص",
  ].join("\n");
  const result = parseTesseractTsv(tsv);
  assert.equal(result.rawText, "نص");
  assert.equal(result.meanConfidence, null);
});
