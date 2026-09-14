# STUDENT DATA RESIDENCY & CACHE V2

Date: 2026-09-14
Status: **APPROVED ARCHITECTURE — IMPLEMENT IN BOUNDED BATCHES**

## 1. Goal

تجربة الطالب يجب أن تكون سريعة وسلسة عند الانتقال بين الشاشات بدون إعادة طلب نفس البيانات في كل Route، مع الحفاظ على قاعدة الأمان الحالية:

**API + PostgreSQL are canonical business authority. Browser storage is never allowed to become hidden server authority.**

هذه الوثيقة تحدد ما يبقى في الذاكرة، ما يمكن حفظه على الجهاز، وما يمنع تخزينه محليًا.

## 2. Storage classes

### A. Server-authoritative data + short-lived client cache

Examples:

- curriculum/classes/subjects/sections/lessons;
- quiz/practice catalog;
- attempts/history/result read models;
- entitlements/access state;
- notifications when Stage18 exists;
- progress/statistics when Stage19 exists.

Client behavior:

- keep a memory read-through cache during the active app session;
- deduplicate concurrent requests;
- use bounded TTL;
- invalidate after access/content-changing actions;
- later add durable IndexedDB read-model snapshots only when revision/delta semantics are authoritative.

Cached values are display optimization, not permission/business authority.

### B. Durable offline packages

Existing lesson offline packages remain in the verified Stage16 IndexedDB/storage path with:

- signed authorization;
- profile/device scope;
- integrity/checksum verification;
- expiry/revocation/reconnect rules.

Do not duplicate lesson bytes into a second cache.

### C. Local-first personal data

Product direction for private learner-owned items:

- Notes;
- Saved/bookmarked questions;
- Needs Review state;
- reader/device preferences where persistence is useful.

Target storage: account-scoped IndexedDB repositories.

Rules:

- stable IDs and source provenance;
- no cross-account leakage;
- explicit logout/reset retention policy;
- attachments stored as Blob, not base64;
- if future server backup/sync is approved, add it as an explicit contract rather than a fake queue.

Until Stage17 ownership/conflict rules are implemented, UI may reserve the surfaces but must not fabricate local records.

### D. Small UI preferences

Safe examples for localStorage or an equivalent tiny preference store:

- welcome/onboarding seen;
- last selected class for convenience;
- reader font/readability preference;
- theme if product supports it;
- reduced non-sensitive UI preferences.

These values are never authorization proof.

### E. Ephemeral UI state only

Keep in React/session memory only:

- current open accordion;
- search query;
- temporary form state;
- loading/error state;
- unsaved modal/sheet visibility.

Do not persist noise unnecessarily.

## 3. Forbidden local persistence

Never persist as ordinary browser app data:

- plaintext password/PIN;
- reusable session tokens;
- private device keys outside the dedicated security mechanism;
- raw authentication challenges;
- server secrets;
- trusted progress/score/ranking values as independent local authority;
- entitlement state that bypasses signed/verified offline authorization;
- `/v1` responses in Service Worker Cache API as durable authority.

## 4. Session memory cache contract

V2 introduces a small shared cache layer for server read models.

Required behavior:

1. cache key is account/profile scoped;
2. concurrent identical reads share one Promise;
3. successful values have bounded TTL;
4. failed requests are not retained as successful cache entries;
5. `force` refresh bypasses freshness but still deduplicates the active request;
6. access changes invalidate curriculum/practice-related entries;
7. logout/session expiry must clear active profile cache in the final integration;
8. stale values must never grant authority to protected actions.

Recommended initial TTLs:

- curriculum: 2 minutes in memory;
- quiz catalog: 1 minute in memory;
- recent attempts: 30 seconds in memory.

These are UX cache values, not data-retention guarantees.

## 5. Navigation behavior

Navigation must not cause a visible full reload when data is already fresh.

Desired sequence:

`open app → fetch once → navigate Home/Learn/Subject → reuse cached read model → background/explicit refresh only when needed`

Manual refresh means refresh the shared read model, not create a second feature-local source of truth.

## 6. Persistent read-model cache — deferred boundary

Do not add a second durable curriculum/quiz database before Stage16 reconnect/delta/revision rules are closed.

After authoritative revision/tombstone/cursor semantics exist, IndexedDB may persist safe read-model snapshots for:

- curriculum shell/listing;
- practice catalog;
- recent non-sensitive display history;
- cached notifications.

Every durable snapshot must carry enough version/scope metadata to be invalidated correctly.

## 7. Notes architecture direction

Notes are expected to be one of the main device-local personal datasets.

Target record shape conceptually includes:

- note ID;
- profile/account scope;
- lesson ID;
- optional page/source reference;
- text;
- optional supported attachment metadata/Blob;
- created/updated time;
- source-title snapshot for graceful degradation.

No note should depend on the current page DOM to remain readable.

## 8. Saved / Needs Review architecture direction

Use stable question/source IDs, not copied display text as identity.

A saved item should retain human context:

- question/item ID;
- lesson/quiz/source provenance;
- subject/lesson labels snapshot where useful;
- created/updated time.

Needs Review is a learner-owned state/collection. Do not compute a hidden weakness diagnosis on the client.

## 9. Cache invalidation triggers

Invalidate affected read models after:

- successful class-code redemption;
- access expiry/revoke observed;
- explicit refresh;
- publication/content revision event once Stage16 sync exists;
- account switch/logout;
- quiz completion where recent attempts/home summary should update.

Do not clear unrelated local notes/downloads merely because a list refresh failed.

## 10. Performance rules

- lazy-load destination features;
- do not refetch the same catalog on every route transition;
- derive counts from already loaded read models when possible;
- avoid duplicating large arrays in multiple stores;
- large media remains lazy/offline-package managed;
- use skeletons only for first meaningful load, not every cached transition;
- avoid blocking Home on low-priority secondary data.

## 11. Acceptance

The data layer is accepted when:

- repeated navigation does not produce needless identical network reads;
- account A cache cannot be displayed to account B;
- access changes refresh relevant data;
- no new durable security authority is introduced;
- offline package integrity rules remain intact;
- local personal data has explicit profile scope and lifecycle;
- UI can render quickly from fresh memory state and revalidate predictably.
