import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for content ingestion integration tests");

const origin = "http://localhost:5173";
const imageFixture = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCACgAHgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAqvfXtvpun3N/dyeXbW0TTSvtJ2ooJY4HJ4B6VYrI8VWVxqXhDW7G0j8y5ubCeGJMgbnaNgoyeByR1oAjfxbo6FVeS7WVpREsBsZ/NLFXcfu9m7BWNznGPlPPFK3irSB9nCzXEr3AkKRw2c0jjyyqvuVUJQqXUEMAcmsvUdCubLVNL1WBb7WLqK9DXLM8KyeStvcIoA/dpgPN9fmPWq1t4d1efxSurNLcaYtwt3JJ5DQu0Rb7IkcbblYEssDMdoIB4z6gHSX2v6fp0ltFcG5824ieaOOK0llbYm3cSEUlcb164605Ne0uS9gtEvI2muLb7XFgEq0X97djHPbnJAJHQ1n6to97f+JtMuYLy5tIIbG6iluLcx7tzvblVw6t1COcgcbeozzzeseB7+6sLsWEk1sU2WNla7oyi2oiMG4sRuyFlmcDcO3GaAOrTxbor211cfa3WK2tmu5Gkt5EzCoyZEBUb191z1HqKtRazZS2dxdsbiCC3UvK9zaywYAGScOoJGB2rkdXsvEms22pRf2VJBFPoN3arDJJbkC5YIEWNl+YI3zcsccDIXAzv2smpR6NfNNYane3CqWit79rRWmOOFBiO0DPdvXvQBqafqdpqkMkto7kRyGORZImjdGABwysAwOCDyOhB71brF8MW1xb6dNJe208N/czma6M3l5kkKqMqEZgFACqATnCDPqdqgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//Z",
  "base64",
);
const pdfFixture = Buffer.from(
  "JVBERi0xLjQKJSBjcmVhdGVkIGJ5IFBpbGxvdyBQREYgZHJpdmVyCjcgMCBvYmo8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgOCAwIFIKPj5lbmRvYmoKOCAwIG9iajw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMgovS2lkcyBbIDIgMCBSIDUgMCBSIF0KPj5lbmRvYmoKMSAwIG9iajw8Ci9UeXBlIC9YT2JqZWN0Ci9TdWJ0eXBlIC9JbWFnZQovV2lkdGggMjAwCi9IZWlnaHQgMjYwCi9GaWx0ZXIgL0RDVERlY29kZQovQml0c1BlckNvbXBvbmVudCA4Ci9Db2xvclNwYWNlIC9EZXZpY2VSR0IKL0xlbmd0aCAyMDAzCj4+c3RyZWFtCv/Y/+AAEEpGSUYAAQEAAAEAAQAA/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgBBADIAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKr317b6bp9zf3cnl21tE00r7SdqKCWOByeAelWKyPFVlcal4Q1uxtI/MubmwnhiTIG52jYKMngckdaAI38W6OhVXku1laURLAbGfzSxV3H7vZuwVjc5xj5TzxSt4q0gfZws1xK9wJCkcNnNI48sqr7lVCUKl1BDAHJrL1HQrmy1TS9VgW+1i6ivQ1yzPCsnkrb3CKAP3aYDzfX5j1qtbeHdXn8UrqzS3GmLcLdySeQ0LtEW+yJHG25WBLLAzHaCAeM+oB0l9r+n6dJbRXBufNuInmjjitJZW2Jt3EhFJXG9euOtOTXtLkvYLRLyNpri2+1xYBKtF/e3Yxz25yQCR0NZ+raPe3/ibTLmC8ubSCGxuopbi3Me7c725VcOrdQjnIHG3qM883rHge/urC7FhJNbFNljZWu6MotqIjBuLEbshZZnA3DtxmgDq08W6K9tdXH2t1itrZruRpLeRMwqMmRAVG9fdc9R6irlZPhyyuLDTJobmPy5Gv7yYDcDlJLmV0PHqrKfx55rWoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//ZCmVuZHN0cmVhbQplbmRvYmoKMiAwIG9iajw8Ci9SZXNvdXJjZXMgPDwKL1Byb2NTZXQgWyAvUERGIC9JbWFnZUMgXQovWE9iamVjdCA8PAovaW1hZ2UgMSAwIFIKPj4KPj4KL01lZGlhQm94IFsgMCAwIDE0NC4wIDE4Ny4yIF0KL0NvbnRlbnRzIDMgMCBSCi9UeXBlIC9QYWdlCi9QYXJlbnQgOCAwIFIKPj5lbmRvYmoKMyAwIG9iajw8Ci9MZW5ndGggNDcKPj5zdHJlYW0KcSAxNDQuMDAwMDAwIDAgMCAxODcuMjAwMDAwIDAgMCBjbSAvaW1hZ2UgRG8gUQoKZW5kc3RyZWFtCmVuZG9iago0IDAgb2JqPDwKL1R5cGUgL1hPYmplY3QKL1N1YnR5cGUgL0ltYWdlCi9XaWR0aCAyMDAKL0hlaWdodCAyNjAKL0ZpbHRlciAvRENURGVjb2RlCi9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZVJHQgovTGVuZ3RoIDIwMTgKPj5zdHJlYW0K/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAEEAMgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9/ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAqvfXtvpun3N/dyeXbW0TTSvtJ2ooJY4HJ4B6VYrI8VWVxqXhDW7G0j8y5ubCeGJMgbnaNgoyeByR1oAjfxbo6FVeS7WVpREsBsZ/NLFXcfu9m7BWNznGPlPPFK3irSB9nCzXEr3AkKRw2c0jjyyqvuVUJQqXUEMAcmsvUdCubLVNL1WBb7WLqK9DXLM8KyeStvcIoA/dpgPN9fmPWq1t4d1efxSurNLcaYtwt3JJ5DQu0Rb7IkcbblYEssDMdoIB4z6gHSX2v6fp0ltFcG5824ieaOOK0llbYm3cSEUlcb164605Ne0uS9gtEvI2muLb7XFgEq0X97djHPbnJAJHQ1n6to97f+JtMuYLy5tIIbG6iluLcx7tzvblVw6t1COcgcbeozzzeseB7+6sLsWEk1sU2WNla7oyi2oiMG4sRuyFlmcDcO3GaAOrTxbor211cfa3WK2tmu5Gkt5EzCoyZEBUb191z1HqKtRazZS2dxdsbiCC3UvK9zaywYAGScOoJGB2rkdXsvEms22pRf2VJBFPoN3arDJJbkC5YIEWNl+YI3zcsccDIXAzv2smpR6NfNNYane3CqWit79rRWmOOFBiO0DPdvXvQBqafqdpqkMkto7kRyGORZImjdGABwysAwOCDyOhB71brF8MW1xb6dNJe208N/czma6M3l5kkKqMqEZgFACqATnCDPqdqgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//ZKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqPDwKL1Jlc291cmNlcyA8PAovUHJvY1NldCBbIC9QREYgL0ltYWdlQyBdCi9YT2JqZWN0IDw8Ci9pbWFnZSA0IDAgUgo+Pgo+PgovTWVkaWFCb3ggWyAwIDAgMTQ0LjAgMTg3LjIgXQovQ29udGVudHMgNiAwIFIKL1R5cGUgL1BhZ2UKL1BhcmVudCA4IDAgUgo+PmVuZG9iago2IDAgb2JqPDwKL0xlbmd0aCA0Nwo+PnN0cmVhbQpxIDE0NC4wMDAwMDAgMCAwIDE4Ny4yMDAwMDAgMCAwIGNtIC9pbWFnZSBEbyBRCgplbmRzdHJlYW0KZW5kb2JqCjkgMCBvYmo8PAovQ3JlYXRpb25EYXRlIChEOjIwMjYwOTA4MDA1NzQzWikKL01vZERhdGUgKEQ6MjAyNjA5MDgwMDU3NDNaKQo+PmVuZG9iagp4cmVmCjAgMTAKMDAwMDAwMDAwMCA2NTUzNiBmIAowMDAwMDAwMTUwIDAwMDAwIG4gCjAwMDAwMDIzMTkgMDAwMDAgbiAKMDAwMDAwMjQ4MSAwMDAwMCBuIAowMDAwMDAyNTc2IDAwMDAwIG4gCjAwMDAwMDQ3NjAgMDAwMDAgbiAKMDAwMDAwNDkyMiAwMDAwMCBuIAowMDAwMDAwMDQwIDAwMDAwIG4gCjAwMDAwMDAwODcgMDAwMDAgbiAKMDAwMDAwNTAxNyAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9Sb290IDcgMCBSCi9TaXplIDEwCi9JbmZvIDkgMCBSCj4+CnN0YXJ0eHJlZgo1MDk5CiUlRU9G",
  "base64",
);

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("Admin mixed ingestion preserves order, keeps ready media unpublished, then links and publishes explicitly", async () => {
  const storageRoot = await mkdtemp(join(tmpdir(), "alwaslh-stage13d-"));
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
    MEDIA_STORAGE_ROOT: storageRoot,
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير رفع المحتوى') returning id",
  );
  const adminId = adminRows[0]?.id;
  assert.ok(adminId);
  await auth.createCredential(adminId, `stage13d-admin-${adminId}`, "Stage13dAdminPass123!");

  const classRows = await db.query<{ id: string }>(
    `insert into classes (slug, name, position) values ($1, 'صف اختبار الرفع', 0) returning id`,
    [`stage13d-class-${adminId}`],
  );
  const subjectRows = await db.query<{ id: string }>(
    `insert into subjects (slug, name) values ($1, 'مادة اختبار الرفع') returning id`,
    [`stage13d-subject-${adminId}`],
  );
  const classId = classRows[0]?.id;
  const subjectId = subjectRows[0]?.id;
  assert.ok(classId);
  assert.ok(subjectId);
  await db.query("insert into subject_class_links (class_id, subject_id, position) values ($1, $2, 0)", [
    classId,
    subjectId,
  ]);
  const lessonRows = await db.query<{ id: string }>(
    `insert into lessons (class_id, subject_id, slug, title, position)
     values ($1, $2, $3, 'درس الرفع المختلط', 0)
     returning id`,
    [classId, subjectId, `stage13d-lesson-${adminId}`],
  );
  const lessonId = lessonRows[0]?.id;
  assert.ok(lessonId);

  const app = buildApp({ config, database: db });
  try {
    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: `stage13d-admin-${adminId}`, password: "Stage13dAdminPass123!" },
    });
    assert.equal(login.statusCode, 200);
    const cookie = cookieFrom(login);

    const studentRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('student', 'طالب غير مخول') returning id",
    );
    const studentId = studentRows[0]?.id;
    assert.ok(studentId);
    await auth.createCredential(studentId, `stage13d-student-${studentId}`, "Stage13dStudentPass123!");
    const studentLogin = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: `stage13d-student-${studentId}`, password: "Stage13dStudentPass123!" },
    });
    const studentCookie = cookieFrom(studentLogin);
    const forbidden = await app.inject({
      method: "GET",
      url: "/v1/admin/content-ingestions",
      headers: { origin, cookie: studentCookie },
    });
    assert.equal(forbidden.statusCode, 403);

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/admin/content-ingestions",
      headers: { origin, cookie },
      payload: {
        lessonId,
        clientRequestId: crypto.randomUUID(),
        items: [
          { filename: "01-cover.jpg", mimeType: "image/jpeg", byteSize: imageFixture.byteLength },
          { filename: "02-chapter.pdf", mimeType: "application/pdf", byteSize: pdfFixture.byteLength },
          { filename: "03-tail.jpg", mimeType: "image/jpeg", byteSize: imageFixture.byteLength },
        ],
      },
    });
    assert.equal(createResponse.statusCode, 200, createResponse.body);
    let task = createResponse.json().task as {
      id: string;
      status: string;
      items: Array<{ id: string; position: number; status: string }>;
      media: Array<{ sourcePosition: number; sourcePageNumber: number | null }>;
      lessonAssets: Array<{ publicationStatus: string; position: number }>;
    };
    assert.equal(task.status, "uploading");
    assert.deepEqual(
      task.items.map((item) => item.position),
      [0, 1, 2],
    );

    for (const [index, bytes] of [imageFixture, pdfFixture, imageFixture].entries()) {
      const item = task.items[index];
      assert.ok(item);
      const upload = await app.inject({
        method: "PUT",
        url: `/v1/admin/content-ingestions/${task.id}/items/${item.id}/content`,
        headers: { origin, cookie, "content-type": "application/octet-stream" },
        payload: bytes,
      });
      assert.equal(upload.statusCode, 200, upload.body);
      task = upload.json().task;
    }
    assert.equal(task.status, "ready");

    const process = await app.inject({
      method: "POST",
      url: `/v1/admin/content-ingestions/${task.id}/process`,
      headers: { origin, cookie },
    });
    assert.equal(process.statusCode, 200, process.body);
    task = process.json().task;
    assert.equal(task.status, "completed", process.body);
    assert.deepEqual(
      task.media.map((media) => media.sourcePosition),
      [0, 1, 2, 3],
    );
    assert.deepEqual(
      task.media.map((media) => media.sourcePageNumber),
      [null, 1, 2, null],
    );
    assert.equal(task.lessonAssets.length, 0, "ready media must not publish or attach implicitly");

    const beforeLink = await db.query<{ published_at: Date | null; content_revision: string }>(
      "select published_at, content_revision::text from lessons where id = $1",
      [lessonId],
    );
    assert.equal(beforeLink[0]?.published_at, null);
    assert.equal(beforeLink[0]?.content_revision, "1");

    const link = await app.inject({
      method: "POST",
      url: `/v1/admin/content-ingestions/${task.id}/link`,
      headers: { origin, cookie },
    });
    assert.equal(link.statusCode, 200, link.body);
    task = link.json().task;
    assert.equal(task.lessonAssets.length, 4);
    assert.deepEqual(
      task.lessonAssets.map((asset) => asset.publicationStatus),
      ["draft", "draft", "draft", "draft"],
    );
    assert.deepEqual(
      task.lessonAssets.map((asset) => asset.position),
      [0, 1, 2, 3],
    );

    const review = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-ingestions/${task.id}/publication`,
      headers: { origin, cookie },
      payload: { action: "submit_review" },
    });
    assert.equal(review.statusCode, 200, review.body);
    task = review.json().task;
    assert.ok(task.lessonAssets.every((asset) => asset.publicationStatus === "review"));

    const publish = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-ingestions/${task.id}/publication`,
      headers: { origin, cookie },
      payload: { action: "publish" },
    });
    assert.equal(publish.statusCode, 200, publish.body);
    task = publish.json().task;
    assert.ok(task.lessonAssets.every((asset) => asset.publicationStatus === "published"));

    const publishedLesson = await db.query<{ published_at: Date | null; content_revision: string }>(
      "select published_at, content_revision::text from lessons where id = $1",
      [lessonId],
    );
    assert.ok(publishedLesson[0]?.published_at);
    assert.equal(publishedLesson[0]?.content_revision, "2");

    const orderedLinks = await db.query<{
      source_position: number;
      asset_position: number;
      media_asset_id: string;
    }>(
      `select cim.source_position, la.position as asset_position, la.media_asset_id
         from content_ingestion_media cim
         join lesson_assets la on la.media_asset_id = cim.media_asset_id
        where cim.task_id = $1
        order by cim.source_position`,
      [task.id],
    );
    assert.deepEqual(
      orderedLinks.map((row) => [row.source_position, row.asset_position]),
      [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
      ],
    );

    const archive = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-ingestions/${task.id}/archive`,
      headers: { origin, cookie },
    });
    assert.equal(archive.statusCode, 200, archive.body);
    assert.ok(archive.json().task.archivedAt);
    const retained = await db.query<{ count: string }>(
      "select count(*)::text as count from lesson_assets where ingestion_task_id = $1",
      [task.id],
    );
    assert.equal(retained[0]?.count, "4", "archiving history must not delete lesson dependencies");
  } finally {
    await app.close();
    await rm(storageRoot, { recursive: true, force: true });
  }
});
