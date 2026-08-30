import { describe, expect, it } from "vitest";
import { isSixDigitAccessCode, normalizeAccessCode } from "./auth-api";

describe("normalizeAccessCode", () => {
  it("normalizes Arabic-Indic digits", () => {
    expect(normalizeAccessCode(" ١٢٣-٤٥٦ ")).toBe("123456");
  });

  it("normalizes Eastern Arabic digits", () => {
    expect(normalizeAccessCode("۱۲۳ ۴۵۶")).toBe("123456");
  });

  it("removes separators and non-digit characters", () => {
    expect(normalizeAccessCode("12a-34 56")).toBe("123456");
  });
});

describe("isSixDigitAccessCode", () => {
  it("accepts exactly six normalized digits", () => {
    expect(isSixDigitAccessCode("١٢٣٤٥٦")).toBe(true);
    expect(isSixDigitAccessCode("123456")).toBe(true);
  });

  it("rejects shorter and longer values", () => {
    expect(isSixDigitAccessCode("12345")).toBe(false);
    expect(isSixDigitAccessCode("1234567")).toBe(false);
  });
});
