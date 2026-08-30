import assert from "node:assert/strict";
import test from "node:test";
import { createOpaqueToken, hashPassword, hashToken, normalizeIdentifier, verifyPassword } from "../src/auth/crypto.js";

test("password hashes are salted scrypt values and verify correctly", async () => {
  const password = "StrongStudentPass123";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.match(first, /^scrypt\$/);
  assert.notEqual(first, second);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("wrong-password", first), false);
  assert.equal(first.includes(password), false);
});

test("opaque session tokens are random and persisted form is SHA-256", () => {
  const first = createOpaqueToken();
  const second = createOpaqueToken();
  assert.notEqual(first, second);
  assert.match(hashToken(first), /^[0-9a-f]{64}$/);
  assert.notEqual(hashToken(first), first);
});

test("account identifiers normalize Arabic and Eastern Arabic digits", () => {
  assert.equal(normalizeIdentifier("  Student-١٢۳  "), "student-123");
});
