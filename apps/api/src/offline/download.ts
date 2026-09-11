import { AppError } from "../errors.js";
import type {
  StudentAssetContent,
  StudentReaderAssetView,
  StudentReaderService,
} from "../curriculum/student-reader.js";
import type { StudentOfflineLease, StudentOfflineService } from "./service.js";

export interface StudentOfflineLessonAssetManifest {
  id: string;
  kind: StudentReaderAssetView["kind"];
  position: number;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  checksumSha256: string;
  sourcePageNumber: number | null;
  text: string | null;
  downloadPath: string;
}

export interface StudentOfflineLessonManifest {
  version: 1;
  profileId: string;
  deviceId: string;
  issuedAt: Date;
  leaseExpiresAt: Date;
  authorizationExpiresAt: Date;
  lesson: {
    id: string;
    classId: string;
    title: string;
    summary: string | null;
    contentRevision: number;
    publishedAt: Date;
  };
  totalByteSize: number;
  assets: StudentOfflineLessonAssetManifest[];
}

function authorizationExpiry(lease: StudentOfflineLease, classId: string): Date | null {
  let latest: Date | null = null;
  for (const grant of lease.grants) {
    const coversClass = grant.scope === "all_content" || (grant.scope === "class" && grant.classId === classId);
    if (!coversClass) continue;
    if (!latest || grant.expiresAt.getTime() > latest.getTime()) latest = grant.expiresAt;
  }
  return latest;
}

function manifestAsset(
  lessonId: string,
  contentRevision: number,
  asset: StudentReaderAssetView,
): StudentOfflineLessonAssetManifest {
  if (asset.byteSize === null || !Number.isSafeInteger(asset.byteSize) || asset.byteSize < 0) {
    throw new AppError("SERVICE_UNAVAILABLE", "حجم ملف الدرس غير صالح للتنزيل دون اتصال", 503);
  }
  const checksumSha256 = asset.checksumSha256?.toLowerCase() ?? null;
  if (!checksumSha256 || !/^[0-9a-f]{64}$/.test(checksumSha256)) {
    throw new AppError("SERVICE_UNAVAILABLE", "بصمة ملف الدرس غير صالحة للتنزيل دون اتصال", 503);
  }

  return {
    id: asset.id,
    kind: asset.kind,
    position: asset.position,
    mimeType: asset.mimeType,
    byteSize: asset.byteSize,
    width: asset.width,
    height: asset.height,
    checksumSha256,
    sourcePageNumber: asset.sourcePageNumber,
    text: asset.text,
    downloadPath: `/v1/student/offline/lessons/${lessonId}/assets/${asset.id}?revision=${contentRevision}`,
  };
}

export class StudentOfflineDownloadService {
  constructor(
    private readonly offline: StudentOfflineService,
    private readonly reader: StudentReaderService,
  ) {}

  async lessonManifest(
    profileId: string,
    sessionToken: string | undefined,
    lessonId: string,
  ): Promise<StudentOfflineLessonManifest> {
    const lease = await this.offline.lease(profileId, sessionToken);
    const reader = await this.reader.lesson(profileId, lessonId);
    const authorizationExpiresAt = authorizationExpiry(lease, reader.lesson.classId);
    if (!authorizationExpiresAt) {
      throw new AppError("CONFLICT", "تعذر إصدار صلاحية تنزيل مستقرة لهذا الدرس", 409);
    }

    const assets = reader.assets.map((asset) =>
      manifestAsset(reader.lesson.id, reader.lesson.contentRevision, asset),
    );
    let totalByteSize = 0;
    for (const asset of assets) {
      totalByteSize += asset.byteSize;
      if (!Number.isSafeInteger(totalByteSize)) {
        throw new AppError("SERVICE_UNAVAILABLE", "الحجم الإجمالي للدرس غير صالح للتنزيل", 503);
      }
    }

    return {
      version: 1,
      profileId: lease.profileId,
      deviceId: lease.deviceId,
      issuedAt: lease.issuedAt,
      leaseExpiresAt: lease.expiresAt,
      authorizationExpiresAt,
      lesson: reader.lesson,
      totalByteSize,
      assets,
    };
  }

  async lessonAsset(
    profileId: string,
    sessionToken: string | undefined,
    input: {
      lessonId: string;
      assetId: string;
      contentRevision: number;
    },
  ): Promise<StudentAssetContent> {
    await this.offline.lease(profileId, sessionToken);
    return this.reader.offlineAssetContent(
      profileId,
      input.lessonId,
      input.assetId,
      input.contentRevision,
    );
  }
}
