import { describe, expect, it } from "vitest";
import {
  nextPageOffset,
  paginationRangeLabel,
  previousPageOffset,
  type AiPaginationView,
} from "./ai-operations-view-model";

describe("Stage13E AI operations pagination", () => {
  it("renders a bounded human range for empty, first, middle and final pages", () => {
    expect(paginationRangeLabel({ total: 0, limit: 30, offset: 0 })).toBe("0 من 0");
    expect(paginationRangeLabel({ total: 75, limit: 30, offset: 0 })).toBe("1–30 من 75");
    expect(paginationRangeLabel({ total: 75, limit: 30, offset: 30 })).toBe("31–60 من 75");
    expect(paginationRangeLabel({ total: 75, limit: 30, offset: 60 })).toBe("61–75 من 75");
  });

  it("keeps previous/next offsets inside the server pagination contract", () => {
    const first: AiPaginationView = { total: 75, limit: 30, offset: 0 };
    const middle: AiPaginationView = { total: 75, limit: 30, offset: 30 };
    const last: AiPaginationView = { total: 75, limit: 30, offset: 60 };

    expect(previousPageOffset(first)).toBeNull();
    expect(nextPageOffset(first)).toBe(30);
    expect(previousPageOffset(middle)).toBe(0);
    expect(nextPageOffset(middle)).toBe(60);
    expect(previousPageOffset(last)).toBe(30);
    expect(nextPageOffset(last)).toBeNull();
  });

  it("never returns a negative previous offset for a partial/non-aligned page", () => {
    expect(previousPageOffset({ total: 17, limit: 10, offset: 3 })).toBe(0);
  });
});
