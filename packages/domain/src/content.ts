export type EducationStage = "grade_9" | "grade_12";
export type ContentAssetKind = "textbook_page" | "exam_page" | "cover" | "supplement";

export interface ContentSourceRef {
  repository: "alwaslh-go";
  sourcePath: string;
  sourceCommit?: string;
  checksum?: string;
}

export interface ContentPageManifestItem {
  id: string;
  stage: EducationStage;
  subjectKey: string;
  bookKey: string;
  collectionKey: string | null;
  kind: ContentAssetKind;
  pageNumber: number | null;
  sourceOrder: number;
  title: string | null;
  lessonTitle: string | null;
  yearHijri: number | null;
  source: ContentSourceRef;
}

export interface ContentCollectionManifest {
  schemaVersion: 1;
  key: string;
  stage: EducationStage;
  subjectKey: string;
  bookKey: string;
  title: string;
  pages: ContentPageManifestItem[];
}

/**
 * Stable ordering is a product invariant. File processing concurrency must never
 * become page ordering. The importer assigns sourceOrder before asynchronous work.
 */
export function sortContentPages<T extends Pick<ContentPageManifestItem, "sourceOrder" | "source">>(
  pages: readonly T[],
): T[] {
  return [...pages].sort((a, b) => {
    const order = a.sourceOrder - b.sourceOrder;
    if (order !== 0) return order;
    return a.source.sourcePath.localeCompare(b.source.sourcePath, "ar");
  });
}

export function assertUniqueContentOrder(
  pages: readonly Pick<ContentPageManifestItem, "sourceOrder" | "source">[],
): void {
  const seen = new Set<number>();
  for (const page of pages) {
    if (seen.has(page.sourceOrder)) {
      throw new Error(`Duplicate sourceOrder ${page.sourceOrder} in content manifest`);
    }
    seen.add(page.sourceOrder);
  }
}
