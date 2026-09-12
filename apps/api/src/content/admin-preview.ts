import { createHash } from "node:crypto";
import type { Database } from "../db.js";
import { AppError } from "../errors.js";
import type { MediaStorage } from "../media/storage.js";

const PREVIEW_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface PreviewRow {
  storage_key: string;
  mime_type: string;
  byte_size: string;
  checksum_sha256: string;
}

export interface AdminOcrSourcePreview {
  bytes: Buffer;
  mimeType: string;
  byteSize: number;
  checksumSha256: string;
}

export class AdminContentPreviewService {
  constructor(
    private readonly database: Database,
    private readonly storage: MediaStorage,
  ) {}

  async ocrSource(extractionId: string): Promise<AdminOcrSourcePreview> {
    const rows = await this.database.query<PreviewRow>(
      `select v.storage_key, v.mime_type, v.byte_size::text, v.checksum_sha256
       from ocr_extractions e
       join media_variants v on v.id = e.input_media_variant_id
       join media_assets m on m.id = v.media_asset_id and m.status = 'ready'
       where e.id = $1
       limit 1`,
      [extractionId],
    );
    const preview = rows[0];
    if (!preview) throw new AppError("NOT_FOUND", "مصدر OCR غير موجود", 404);
    if (!PREVIEW_MIME_TYPES.has(preview.mime_type)) {
      throw new AppError("CONFLICT", "معاينة مصدر OCR غير متاحة لهذا النوع", 409);
    }

    let bytes: Buffer;
    try {
      bytes = await this.storage.read(preview.storage_key);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new AppError("SERVICE_UNAVAILABLE", "معاينة المصدر غير متاحة مؤقتًا", 503);
      }
      throw error;
    }

    const byteSize = Number(preview.byte_size);
    const checksumSha256 = preview.checksum_sha256.toLowerCase();
    const actualChecksum = createHash("sha256").update(bytes).digest("hex");
    if (
      !Number.isSafeInteger(byteSize) ||
      byteSize < 1 ||
      bytes.byteLength !== byteSize ||
      actualChecksum !== checksumSha256
    ) {
      throw new AppError("SERVICE_UNAVAILABLE", "تعذر التحقق من سلامة معاينة المصدر", 503);
    }

    return {
      bytes,
      mimeType: preview.mime_type,
      byteSize,
      checksumSha256,
    };
  }
}
