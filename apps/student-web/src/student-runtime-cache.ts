import {
  listStudentAttempts,
  listStudentCurriculum,
  listStudentQuizzes,
  type StudentAssessmentAttempt,
  type StudentAssessmentCatalogItem,
  type StudentCurriculumCatalog,
} from "./auth-api";

type CacheEntry<T> = {
  value?: T;
  expiresAt: number;
  pending?: Promise<T>;
};

type ReadOptions = { force?: boolean };

const cache = new Map<string, CacheEntry<unknown>>();

const TTL = {
  curriculum: 120_000,
  quizzes: 60_000,
  attempts: 30_000,
} as const;

function scopedKey(profileId: string, resource: string): string {
  return `${profileId}:${resource}`;
}

async function readThrough<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
  options: ReadOptions = {},
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (!options.force && existing?.value !== undefined && existing.expiresAt > now) {
    return existing.value;
  }

  if (existing?.pending) return existing.pending;

  const pending = loader()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .catch((error) => {
      if (existing?.value !== undefined) {
        cache.set(key, { value: existing.value, expiresAt: existing.expiresAt });
      } else {
        cache.delete(key);
      }
      throw error;
    });

  cache.set(key, {
    value: existing?.value,
    expiresAt: existing?.expiresAt ?? 0,
    pending,
  });

  return pending;
}

function peek<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  return entry?.value ?? null;
}

export function getCachedStudentCurriculum(profileId: string, options?: ReadOptions): Promise<StudentCurriculumCatalog> {
  return readThrough(scopedKey(profileId, "curriculum"), TTL.curriculum, listStudentCurriculum, options);
}

export function peekCachedStudentCurriculum(profileId: string): StudentCurriculumCatalog | null {
  return peek<StudentCurriculumCatalog>(scopedKey(profileId, "curriculum"));
}

export function getCachedStudentQuizzes(profileId: string, options?: ReadOptions): Promise<StudentAssessmentCatalogItem[]> {
  return readThrough(scopedKey(profileId, "quizzes"), TTL.quizzes, listStudentQuizzes, options);
}

export function peekCachedStudentQuizzes(profileId: string): StudentAssessmentCatalogItem[] | null {
  return peek<StudentAssessmentCatalogItem[]>(scopedKey(profileId, "quizzes"));
}

export function getCachedStudentAttempts(
  profileId: string,
  limit = 8,
  options?: ReadOptions,
): Promise<StudentAssessmentAttempt[]> {
  return readThrough(
    scopedKey(profileId, `attempts:${limit}`),
    TTL.attempts,
    () => listStudentAttempts(limit),
    options,
  );
}

export function peekCachedStudentAttempts(profileId: string, limit = 8): StudentAssessmentAttempt[] | null {
  return peek<StudentAssessmentAttempt[]>(scopedKey(profileId, `attempts:${limit}`));
}

export function invalidateStudentRuntimeCache(
  profileId: string,
  resources: Array<"curriculum" | "quizzes" | "attempts"> = ["curriculum", "quizzes", "attempts"],
): void {
  for (const key of [...cache.keys()]) {
    if (!key.startsWith(`${profileId}:`)) continue;
    if (resources.some((resource) => key.startsWith(`${profileId}:${resource}`))) cache.delete(key);
  }
}

export function clearStudentRuntimeCache(profileId?: string): void {
  if (!profileId) {
    cache.clear();
    return;
  }
  for (const key of [...cache.keys()]) {
    if (key.startsWith(`${profileId}:`)) cache.delete(key);
  }
}
