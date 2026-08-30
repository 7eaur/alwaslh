import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, posix, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

export interface MediaStorage {
  put(key: string, bytes: Uint8Array): Promise<void>;
  read(key: string): Promise<Buffer>;
  exists(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}

const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

export function assertMediaStorageKey(key: string): string {
  if (!key || key.startsWith("/") || key.includes("\\") || key.includes("\0")) {
    throw new Error("invalid_media_storage_key");
  }

  const normalized = posix.normalize(key);
  if (normalized !== key || normalized === "." || normalized.startsWith("../") || normalized.includes("/../")) {
    throw new Error("invalid_media_storage_key");
  }

  const segments = normalized.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === ".." || !SAFE_SEGMENT.test(segment))) {
    throw new Error("invalid_media_storage_key");
  }

  return normalized;
}

export class FileSystemMediaStorage implements MediaStorage {
  readonly root: string;

  constructor(root: string) {
    if (!root.trim()) throw new Error("media_storage_root_required");
    this.root = resolve(root);
  }

  private resolveKey(key: string): string {
    const safeKey = assertMediaStorageKey(key);
    const absolute = resolve(this.root, ...safeKey.split("/"));
    const prefix = this.root.endsWith(sep) ? this.root : `${this.root}${sep}`;
    if (!absolute.startsWith(prefix)) throw new Error("invalid_media_storage_key");
    return absolute;
  }

  async put(key: string, bytes: Uint8Array): Promise<void> {
    const target = this.resolveKey(key);
    await mkdir(dirname(target), { recursive: true });
    const temp = join(dirname(target), `.${randomUUID()}.tmp`);
    try {
      await writeFile(temp, bytes, { flag: "wx" });
      await rename(temp, target);
    } finally {
      await rm(temp, { force: true }).catch(() => undefined);
    }
  }

  async read(key: string): Promise<Buffer> {
    return readFile(this.resolveKey(key));
  }

  async exists(key: string): Promise<boolean> {
    try {
      await stat(this.resolveKey(key));
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    await rm(this.resolveKey(key), { force: true });
  }
}
