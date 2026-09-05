import { createHash } from "node:crypto";
import sharp from "sharp";
import type { PreparedVariant } from "./media-types.js";

const PROFILE_VERSION = "v1";
const SOURCE_MIME_BY_FORMAT: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function extensionForFormat(format: string | undefined): string {
  if (format === "jpeg" || format === "jpg") return "jpg";
  if (format === "png") return "png";
  if (format === "webp") return "webp";
  throw new Error("unsupported_media");
}

export async function prepareImageVariants(bytes: Buffer): Promise<readonly PreparedVariant[]> {
  const source = sharp(bytes, { failOn: "error", limitInputPixels: 80_000_000 });
  const metadata = await source.metadata();
  if (!metadata.format || !metadata.width || !metadata.height) throw new Error("image_decode_failed");

  const sourceExtension = extensionForFormat(metadata.format);
  const sourceMime = SOURCE_MIME_BY_FORMAT[metadata.format];
  if (!sourceMime) throw new Error("unsupported_media");

  const displayBytes = await sharp(bytes)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, effort: 4 })
    .toBuffer();
  const displayMeta = await sharp(displayBytes).metadata();

  const thumbnailBytes = await sharp(bytes)
    .rotate()
    .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();
  const thumbnailMeta = await sharp(thumbnailBytes).metadata();

  const aiBytes = await sharp(bytes)
    .rotate()
    .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
  const aiMeta = await sharp(aiBytes).metadata();

  return [
    {
      kind: "source",
      profileVersion: "source",
      extension: sourceExtension,
      mimeType: sourceMime,
      bytes,
      width: metadata.width,
      height: metadata.height,
      checksumSha256: sha256(bytes),
    },
    {
      kind: "display",
      profileVersion: PROFILE_VERSION,
      extension: "webp",
      mimeType: "image/webp",
      bytes: displayBytes,
      width: displayMeta.width,
      height: displayMeta.height,
      checksumSha256: sha256(displayBytes),
    },
    {
      kind: "thumbnail",
      profileVersion: PROFILE_VERSION,
      extension: "webp",
      mimeType: "image/webp",
      bytes: thumbnailBytes,
      width: thumbnailMeta.width,
      height: thumbnailMeta.height,
      checksumSha256: sha256(thumbnailBytes),
    },
    {
      kind: "ai",
      profileVersion: PROFILE_VERSION,
      extension: "webp",
      mimeType: "image/webp",
      bytes: aiBytes,
      width: aiMeta.width,
      height: aiMeta.height,
      checksumSha256: sha256(aiBytes),
    },
  ];
}
