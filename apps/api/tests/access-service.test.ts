import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAccessCode } from "../src/access/service.js";

test("access codes normalize Arabic digits, Eastern Arabic digits, spaces and hyphens", () => {
  assert.equal(normalizeAccessCode(" ١٢٣-٤٥٦ "), "123456");
  assert.equal(normalizeAccessCode("۱۲۳ ۴۵۶۷"), "1234567");
});
