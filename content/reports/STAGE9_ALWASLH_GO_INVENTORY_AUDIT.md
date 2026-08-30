# Stage 9 — Full `alwaslh-go` Inventory Audit

**Source:** `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`  
**Audit result:** **FAIL**  
**Canonical inventory SHA-256:** `8334bef7cd0efb53ec5bc29778f4ba5281e48a522b2fd56916206833f002bd61`

## Executive result

The pinned Git tree matches the expected **15 subject roots**, **48 source documents**, **5,552 images**, and image extension split (**4,218 JPG + 1,334 WEBP**). Every configured subject's expected image total matches the observed Git tree.

The canonical inventory payload is **not safe to import yet**: only **4,780 assets** appear in `documents[].assets`, so **772 source images are omitted**. This is caused by eight `manifest.json` files whose real schema uses Arabic keys such as `م` and `اسم الصورة`, while the Stage 9 inventory parser expects `seq` and `relative_path`.

## Expected vs observed

| Metric | Expected | Observed |
| --- | ---: | ---: |
| Subject roots | 15 | 15 |
| Source documents | 48 | 48 |
| Git-tree images | 5,552 | 5,552 |
| Canonical inventory assets | 5,552 | 4,780 |
| Omitted canonical assets | 0 | 772 |
| Recognized helper files | 76 | 86 |
| Manifest files | — | 24 |
| JPG | 4,218 | 4,218 |
| WEBP | 1,334 | 1,334 |

## Naming patterns represented in canonical assets

| Naming family | Assets |
| --- | ---: |
| `book_page` | 2,747 |
| `english_page` | 144 |
| `exam_page` | 1,857 |
| `front` | 12 |
| `preliminary` | 20 |

These families total **4,780**, not 5,552, because the 772 manifest-backed images are dropped before they reach the canonical asset list. The audit did not observe unparsed filenames.

## Helper patterns observed

| Helper basename | Count |
| --- | ---: |
| `manifest.json` | 24 |
| `تقرير_المعالجة.json` | 8 |
| `دليل_الصور_صفحة_بصفحة.txt` | 27 |
| `دليل_الصور_صفحة_بصفحة.xlsx` | 27 |

All **86** observed helper files use recognized helper basenames. The helper mismatch is therefore expectation drift (`expected=76`, `observed=86`), not an unknown-helper-name problem.

## Manifest mismatches

| Problem | Count |
| --- | ---: |
| `entry requires positive integer seq and relative_path` | 772 |
| `manifest seq is not contiguous from 1` | 8 |
| `source images missing from manifest` | 8 |

Affected documents and source images omitted from canonical assets:

| Source document | Omitted assets |
| --- | ---: |
| `التربية الاسلاميه ثالث ثانوي/كتاب الإيمان` | 77 |
| `التربية الاسلاميه ثالث ثانوي/كتاب الحديث والتهذيب` | 74 |
| `التربية الاسلاميه ثالث ثانوي/كتاب السيرة النبوية` | 90 |
| `التربية الاسلاميه ثالث ثانوي/كتاب الفقه` | 78 |
| `القران الكريم ثالث ثانوي/كتاب القرآن الكريم` | 106 |
| `اللغة العربية ثالث ثانوي/كتاب الأدب والنصوص` | 130 |
| `اللغة العربية ثالث ثانوي/كتاب القراءة` | 65 |
| `اللغة العربية ثالث ثانوي/كتاب النحو والصرف` | 152 |

Total omitted: **772**.

## Duplicate-content findings

- Duplicate Git blob groups: **100**.
- Asset paths participating in those groups: **201**.
- These duplicates are reported but not automatically fatal under the Stage 9 contract, because repeated educational pages may be intentional.
- Full duplicate-group path details are retained in the workflow artifact `full-inventory.json`.

## Clean checks

- `orderErrors`: **0**
- `unparsedAssets`: **0**
- `unmappedImages`: **0**
- `classificationErrors`: **0**
- `sourceRevisionErrors`: **0**
- `otherFiles`: **0**

## Findings

### S9-AUD-001 — P1 — Manifest compatibility — OPEN

Eight real `manifest.json` files use a different schema than the parser expects. This creates **788 manifest errors** and drops **772 images** from the canonical payload. The source tree count remains 5,552, so relying on `summary.images` alone hides incomplete `documents[].assets`.

**Impact:** importing this canonical payload would be incomplete even though the top-level source count looks correct.

**Required direction:** reconcile the manifest contract/parser with the real source schema, then rerun the full audit. This audit intentionally does not modify the main importer or migration.

### S9-AUD-002 — P2 — Helper expectation drift — OPEN

The source-map expects 76 helper files; the pinned source contains **86 recognized helpers**: 27 TXT guides, 27 XLSX guides, 24 manifests, and 8 processing reports.

**Impact:** the Stage 9 expected-count gate fails with an otherwise recognized helper set.

### S9-AUD-003 — P2 — Duplicate source blobs — REVIEW

There are **100 duplicate Git-blob groups covering 201 asset paths**.

**Impact:** duplicates need content review, but the current contract correctly treats them as reportable rather than automatically fatal.

### S9-AUD-004 — P3 — Naming/order baseline — PASS

Outside manifest compatibility, source revision, filename parsing, classification, unmapped-image checks, and deterministic non-manifest ordering show no errors.

## Evidence

- Audit-only GitHub Actions run: `33293619250`
- Artifact ID: `9726719713`
- Artifact ZIP SHA-256: `1b11c3b14bc0520c3f0c8bc3ea3a7d5848dfa3206e29da97c3b3d47516e3d11b`
- Artifact contains the full generated `full-inventory.json` plus `inventory-summary.json`.
- Audit branch: `rebuild/content-source-audit`
- PR: `#9`

## Scope protection

This audit made **no changes** to:

- `database/migrations/0008_content_source_import.sql`
- the main PostgreSQL content importer implementation

The audit changes are limited to audit tooling, an audit-only workflow, and these reports.
