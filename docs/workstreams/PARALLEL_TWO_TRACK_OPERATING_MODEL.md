# PARALLEL TWO-TRACK OPERATING MODEL — HISTORICAL

> **SUPERSEDED FOR NEW WORK as of 2026-09-12.** This document explains the Stage13G / Stage14–16 parallel period. It is no longer task-routing authority.

## Why this model existed

During Stage13G and the early Student Product stages, work was split so Admin/Backend/AI and Student Product could progress in parallel without duplicating durable authority.

Historical ownership:

- Track A — `apps/api`, `apps/admin-web`, DB/shared Admin/AI/Question Bank work.
- Track B — `apps/student-web`, Student-facing Stage14+ work.
- Coordination — Issue #16 + verified `main` contracts.

Historical branches:

- `integration/stage13g-admin-product`
- `parallel/stage14-student-product`

## Why it is superseded

Product Owner later directed that:

1. Stage13G and the latest Student Product work be fully integrated;
2. the integrated product be merged to `main`;
3. the remaining product stages be owned as one continuation after Stage13 rather than kept as two long-lived tracks;
4. the integrated product be hosted on Railway for real inspection.

PR #33 integrated Stage13G + current Student Product into `main` after a **19/19 workflow** verification matrix. Merge commit:

`5e22c3ff157b42b6da47febe205dd91fcb264eed`

Therefore new engineering work must **not** restart from either old long-lived track branch. Start from live `main` and create a short-lived branch for the next verified batch.

## Rules that remain valid

The parallel model is superseded, but these architecture rules remain mandatory:

- shared authority is reused, never duplicated;
- browser is not canonical Auth/Access/Curriculum/Question Bank/Assessment authority;
- no fake API, auth bypass, test weakening or race-masking sleeps;
- shared API/DB changes belong in their owning backend/database layers even when one engineer owns the full remaining product;
- every important batch needs exact-head executable verification and documentation/Issue #16 continuity.

## Current operating authority

Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`, especially **PO-OVR-009 — Unified post-Stage13 continuation**.

Current stage: **Stage16 Offline/PWA**.

Current detailed continuation: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.
