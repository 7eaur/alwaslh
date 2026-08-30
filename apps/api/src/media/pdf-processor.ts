import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MAX_PDF_BYTES = 100 * 1024 * 1024;
const MAX_PDF_PAGES = 600;

export interface ExtractedPdfPage {
  pageNumber: number;
  bytes: Buffer;
  filename: string;
  mimeType: "image/jpeg";
}

export async function verifyPopplerAvailable(): Promise<void> {
  await Promise.all([
    execFileAsync("pdfinfo", ["-v"], { timeout: 5_000 }).catch((error) => {
      throw new Error(`pdf_inspection_failed:${String(error)}`);
    }),
    execFileAsync("pdftoppm", ["-v"], { timeout: 5_000 }).catch((error) => {
      throw new Error(`pdf_render_failed:${String(error)}`);
    }),
  ]);
}

function parsePageCount(output: string): number {
  const match = output.match(/^Pages:\s+(\d+)$/m);
  if (!match) throw new Error("pdf_inspection_failed");
  const pages = Number(match[1]);
  if (!Number.isInteger(pages) || pages < 1 || pages > MAX_PDF_PAGES) throw new Error("pdf_page_limit_exceeded");
  return pages;
}

export async function extractPdfPages(bytes: Buffer): Promise<readonly ExtractedPdfPage[]> {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_PDF_BYTES) throw new Error("invalid_input");

  const directory = await mkdtemp(join(tmpdir(), "alwaslh-pdf-"));
  const inputPath = join(directory, "source.pdf");
  const outputPrefix = join(directory, "page");

  try {
    await writeFile(inputPath, bytes, { flag: "wx" });
    const inspection = await execFileAsync("pdfinfo", [inputPath], {
      timeout: 15_000,
      maxBuffer: 1024 * 1024,
    }).catch((error) => {
      throw new Error(`pdf_inspection_failed:${String(error)}`);
    });
    const expectedPages = parsePageCount(inspection.stdout);

    await execFileAsync("pdftoppm", ["-jpeg", "-r", "150", inputPath, outputPrefix], {
      timeout: 120_000,
      maxBuffer: 1024 * 1024,
    }).catch((error) => {
      throw new Error(`pdf_render_failed:${String(error)}`);
    });

    const files = (await readdir(directory))
      .map((filename) => {
        const match = filename.match(/^page-(\d+)\.jpg$/);
        return match ? { filename, pageNumber: Number(match[1]) } : undefined;
      })
      .filter((entry): entry is { filename: string; pageNumber: number } => Boolean(entry))
      .sort((a, b) => a.pageNumber - b.pageNumber);

    if (files.length !== expectedPages) throw new Error("pdf_render_page_count_mismatch");
    for (let index = 0; index < files.length; index += 1) {
      if (files[index]?.pageNumber !== index + 1) throw new Error("pdf_render_page_order_invalid");
    }

    return Promise.all(
      files.map(async ({ filename, pageNumber }) => ({
        pageNumber,
        bytes: await readFile(join(directory, filename)),
        filename: `page-${pageNumber}.jpg`,
        mimeType: "image/jpeg" as const,
      })),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
