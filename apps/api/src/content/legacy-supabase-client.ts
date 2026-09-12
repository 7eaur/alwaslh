import { createHash } from "node:crypto";
import { z } from "zod";
import { legacyPageSchema, type LegacyPage } from "./legacy-supabase-model.js";

const legacySubjectSchema = z.object({
  id: z.string().uuid(),
  class_id: z.string().uuid(),
  name: z.string().trim().min(1),
});

const legacyClassSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
});

export type LegacySubject = z.infer<typeof legacySubjectSchema>;
export type LegacyClass = z.infer<typeof legacyClassSchema>;

export interface LegacyImageBytes {
  sourceUrl: string;
  bucket: string;
  objectPath: string;
  filename: string;
  mimeType: string;
  byteSize: number;
  checksumSha256: string;
  bytes: Buffer;
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizeBaseUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("legacy_supabase_url_must_be_https");
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function mimeFromFilename(filename: string): string | null {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return null;
}

export class LegacySupabaseClient {
  readonly baseUrl: string;
  readonly projectRef: string;

  constructor(
    baseUrl: string,
    private readonly publishableKey: string,
  ) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    const hostname = new URL(this.baseUrl).hostname;
    const match = /^([a-z0-9]+)\.supabase\.co$/i.exec(hostname);
    if (!match?.[1]) throw new Error("legacy_supabase_host_invalid");
    this.projectRef = match[1];
    if (!publishableKey.trim()) throw new Error("legacy_supabase_key_required");
  }

  private async rest(path: string, params: Record<string, string>): Promise<unknown> {
    const url = new URL(`${this.baseUrl}/rest/v1/${path}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: this.publishableKey,
        Accept: "application/json",
        "Accept-Profile": "public",
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`legacy_supabase_rest_failed:${response.status}:${text.slice(0, 300)}`);
    }
    return response.json() as Promise<unknown>;
  }

  async subject(subjectId: string): Promise<{ subject: LegacySubject; class: LegacyClass }> {
    const subjectRaw = await this.rest("subjects", {
      select: "id,class_id,name",
      id: `eq.${subjectId}`,
      limit: "2",
    });
    const subjects = z.array(legacySubjectSchema).parse(subjectRaw);
    const subject = subjects[0];
    if (!subject || subjects.length !== 1) throw new Error(`legacy_subject_not_unique:${subjectId}`);

    const classRaw = await this.rest("classes", {
      select: "id,name",
      id: `eq.${subject.class_id}`,
      limit: "2",
    });
    const classes = z.array(legacyClassSchema).parse(classRaw);
    const legacyClass = classes[0];
    if (!legacyClass || classes.length !== 1) {
      throw new Error(`legacy_class_not_unique:${subject.class_id}`);
    }
    return { subject, class: legacyClass };
  }

  async subjectPages(subjectId: string): Promise<LegacyPage[]> {
    const raw = await this.rest("lessons", {
      select:
        "id,subject_id,title,image_urls,summary,ai_questions,page_number,created_at,extracted_text,audio_url,ai_thumbnails,content_type",
      subject_id: `eq.${subjectId}`,
      order: "page_number.asc,created_at.asc,id.asc",
      limit: "1000",
    });
    return z.array(legacyPageSchema).parse(raw);
  }

  async imageBytes(sourceUrl: string): Promise<LegacyImageBytes> {
    const url = new URL(sourceUrl);
    const expectedHost = new URL(this.baseUrl).hostname;
    if (url.protocol !== "https:" || url.hostname !== expectedHost) {
      throw new Error("legacy_storage_url_outside_project");
    }
    const marker = "/storage/v1/object/public/";
    if (!url.pathname.startsWith(marker)) throw new Error("legacy_storage_url_not_public_object");
    const relative = decodeURIComponent(url.pathname.slice(marker.length));
    const slash = relative.indexOf("/");
    if (slash <= 0 || slash === relative.length - 1) throw new Error("legacy_storage_path_invalid");
    const bucket = relative.slice(0, slash);
    const objectPath = relative.slice(slash + 1);
    if (bucket !== "lesson_content") throw new Error(`legacy_storage_bucket_not_allowed:${bucket}`);

    const response = await fetch(url, { method: "GET", signal: AbortSignal.timeout(45_000) });
    if (!response.ok) throw new Error(`legacy_storage_fetch_failed:${response.status}:${objectPath}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength <= 0 || bytes.byteLength > 50 * 1024 * 1024) {
      throw new Error(`legacy_storage_size_invalid:${objectPath}:${bytes.byteLength}`);
    }
    const filename = objectPath.split("/").pop()?.trim();
    if (!filename) throw new Error(`legacy_storage_filename_missing:${objectPath}`);
    const contentType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
    const mimeType = contentType?.startsWith("image/") ? contentType : mimeFromFilename(filename);
    if (!mimeType || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      throw new Error(`legacy_storage_mime_invalid:${objectPath}:${contentType ?? "missing"}`);
    }

    return {
      sourceUrl,
      bucket,
      objectPath,
      filename,
      mimeType,
      byteSize: bytes.byteLength,
      checksumSha256: sha256(bytes),
      bytes,
    };
  }
}
