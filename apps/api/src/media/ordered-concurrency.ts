const MAX_MEDIA_CONCURRENCY = 8;

export async function mapWithConcurrencyOrdered<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > MAX_MEDIA_CONCURRENCY) {
    throw new Error("invalid_concurrency");
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (true) {
      const index = nextIndex;
      if (index >= items.length) return;
      nextIndex += 1;
      results[index] = await worker(items[index] as T, index);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return results;
}
