import { describe, expect, it } from "vitest";
import { ApiRequestError } from "./api-errors";
import { studentErrorMessage } from "./student-error-copy";

describe("studentErrorMessage", () => {
  it("turns activation not-found into an actionable learner message", () => {
    const message = studentErrorMessage(new ApiRequestError("NOT_FOUND", "internal activation detail", 404), "activation");
    expect(message).toContain("رمز التفعيل");
    expect(message).toContain("تحقق");
    expect(message).not.toContain("internal");
  });

  it("does not leak raw backend messages for internal failures", () => {
    const message = studentErrorMessage(new ApiRequestError("INTERNAL_ERROR", "database timeout row 4", 500), "reader");
    expect(message).toContain("تعذر فتح الدرس");
    expect(message).not.toContain("database");
  });

  it("gives login, rate-limit and connection failures a next action", () => {
    expect(studentErrorMessage(new ApiRequestError("UNAUTHORIZED", "raw", 401), "login")).toContain("تحقق");
    expect(studentErrorMessage(new ApiRequestError("RATE_LIMITED", "raw", 429), "login")).toContain("انتظر");
    expect(studentErrorMessage(new ApiRequestError("SERVICE_UNAVAILABLE", "raw", 0), "generic")).toContain("الإنترنت");
  });

  it("explains device recovery without cryptography jargon", () => {
    const message = studentErrorMessage(new Error("device_key_missing"), "login");
    expect(message).toContain("صفحة الدعم");
    expect(message).not.toContain(/مفتاح|تشفير|crypto/i);
  });
});
