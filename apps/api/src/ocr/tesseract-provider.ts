import { spawn } from "node:child_process";
import {
  type OcrProvider,
  OcrProviderError,
  type OcrProviderInput,
  type OcrProviderResult,
} from "./provider.js";

interface ParsedWord {
  lineKey: string;
  text: string;
  confidence: number | null;
}

export interface ParsedTesseractTsv {
  rawText: string;
  meanConfidence: number | null;
  wordCount: number;
}

function parseConfidence(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null;
}

export function parseTesseractTsv(tsv: string): ParsedTesseractTsv {
  const rows = tsv.replace(/^\uFEFF/, "").split(/\r?\n/);
  const words: ParsedWord[] = [];
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row) continue;
    const columns = row.split("\t");
    if (columns.length < 12 || columns[0] !== "5") continue;
    const text = columns.slice(11).join("\t").trim();
    if (!text) continue;
    const lineKey = [columns[1], columns[2], columns[3], columns[4]].join(":");
    words.push({ lineKey, text, confidence: parseConfidence(columns[10] ?? "") });
  }

  const lines = new Map<string, string[]>();
  let weightedConfidence = 0;
  let confidenceWeight = 0;
  for (const word of words) {
    const line = lines.get(word.lineKey) ?? [];
    line.push(word.text);
    lines.set(word.lineKey, line);
    if (word.confidence !== null) {
      const weight = Math.max(1, [...word.text].length);
      weightedConfidence += word.confidence * weight;
      confidenceWeight += weight;
    }
  }

  return {
    rawText: [...lines.values()].map((line) => line.join(" ")).join("\n"),
    meanConfidence:
      confidenceWeight === 0 ? null : Math.round((weightedConfidence / confidenceWeight) * 100) / 100,
    wordCount: words.length,
  };
}

export interface TesseractOcrProviderOptions {
  binary?: string;
  pageSegmentationMode?: number;
  timeoutMs?: number;
  maxOutputBytes?: number;
}

export class TesseractOcrProvider implements OcrProvider {
  readonly key = "tesseract";
  readonly version = "cli-tsv-v1";
  private readonly binary: string;
  private readonly pageSegmentationMode: number;
  private readonly timeoutMs: number;
  private readonly maxOutputBytes: number;

  constructor(options: TesseractOcrProviderOptions = {}) {
    this.binary = options.binary ?? "tesseract";
    this.pageSegmentationMode = options.pageSegmentationMode ?? 6;
    this.timeoutMs = options.timeoutMs ?? 60_000;
    this.maxOutputBytes = options.maxOutputBytes ?? 12 * 1024 * 1024;
    if (
      !Number.isInteger(this.pageSegmentationMode) ||
      this.pageSegmentationMode < 0 ||
      this.pageSegmentationMode > 13
    ) {
      throw new Error("ocr_tesseract_psm_invalid");
    }
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 1_000 || this.timeoutMs > 5 * 60_000) {
      throw new Error("ocr_tesseract_timeout_invalid");
    }
  }

  async extract(input: OcrProviderInput): Promise<OcrProviderResult> {
    if (!input.mimeType.startsWith("image/")) {
      throw new OcrProviderError("ocr_unsupported_input", "Tesseract requires an image input", false);
    }
    const languages = input.languageHints.map((value) => value.trim()).filter(Boolean);
    if (languages.length === 0 || languages.some((value) => !/^[A-Za-z0-9_]+$/.test(value))) {
      throw new OcrProviderError("ocr_language_invalid", "OCR language hints are invalid", false);
    }
    const languageSpec = languages.join("+");
    const tsv = await this.runTesseract(input.bytes, languageSpec, input.signal);
    const parsed = parseTesseractTsv(tsv);
    return {
      rawText: parsed.rawText,
      meanConfidence: parsed.meanConfidence,
      metadata: {
        adapterVersion: this.version,
        languageSpec,
        pageSegmentationMode: this.pageSegmentationMode,
        wordCount: parsed.wordCount,
      },
    };
  }

  private runTesseract(bytes: Buffer, languageSpec: string, signal?: AbortSignal): Promise<string> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new OcrProviderError("ocr_aborted", "OCR request was aborted", true));
        return;
      }

      const child = spawn(
        this.binary,
        ["stdin", "stdout", "-l", languageSpec, "--psm", String(this.pageSegmentationMode), "tsv"],
        { stdio: ["pipe", "pipe", "pipe"] },
      );
      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];
      let outputBytes = 0;
      let settled = false;

      const cleanup = () => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", handleAbort);
      };
      const fail = (error: OcrProviderError) => {
        if (settled) return;
        settled = true;
        cleanup();
        child.kill("SIGKILL");
        reject(error);
      };
      const handleAbort = () => fail(new OcrProviderError("ocr_aborted", "OCR request was aborted", true));
      const timer = setTimeout(
        () => fail(new OcrProviderError("ocr_engine_timeout", "Tesseract OCR timed out", true)),
        this.timeoutMs,
      );
      signal?.addEventListener("abort", handleAbort, { once: true });

      child.on("error", (error) => {
        fail(
          new OcrProviderError("ocr_engine_unavailable", "Tesseract executable is unavailable", false, {
            cause: error,
          }),
        );
      });
      child.stdout.on("data", (chunk: Buffer) => {
        if (settled) return;
        outputBytes += chunk.byteLength;
        if (outputBytes > this.maxOutputBytes) {
          fail(
            new OcrProviderError(
              "ocr_engine_output_too_large",
              "Tesseract output exceeded the safety limit",
              false,
            ),
          );
          return;
        }
        stdout.push(chunk);
      });
      child.stderr.on("data", (chunk: Buffer) => {
        if (stderr.reduce((total, value) => total + value.byteLength, 0) < 8_192) stderr.push(chunk);
      });
      child.stdin.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code !== "EPIPE") {
          fail(
            new OcrProviderError("ocr_engine_input_failed", "Failed to send image bytes to Tesseract", true, {
              cause: error,
            }),
          );
        }
      });
      child.on("close", (code) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (code !== 0) {
          const detail = Buffer.concat(stderr).toString("utf8").trim().slice(0, 500);
          reject(
            new OcrProviderError(
              "ocr_engine_failed",
              detail ? `Tesseract failed: ${detail}` : "Tesseract OCR failed",
              true,
            ),
          );
          return;
        }
        resolve(Buffer.concat(stdout).toString("utf8"));
      });

      child.stdin.end(bytes);
    });
  }
}
