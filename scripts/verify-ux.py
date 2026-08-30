#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UX = ROOT / "docs" / "ux"

REQUIRED_FILES = [
    UX / "UX_ARCHITECTURE.md",
    UX / "UX_FEATURE_PARITY_REVIEW.md",
    UX / "UX_STAGE_DOD.md",
    UX / "wireframes/admin-overview.svg",
    UX / "wireframes/student-core.svg",
    ROOT / "PRODUCT_FEATURE_PARITY_MATRIX.md",
]

REQUIRED_ARCHITECTURE_TERMS = [
    "Admin Information Architecture",
    "Student Information Architecture",
    "Upload & Processing",
    "AI Operations",
    "Full Access Codes",
    "Class Codes",
    "Lesson Reader",
    "Notes / Saved",
    "Required UI states",
    "Offline",
    "Accessibility contract",
    "6-digit",
    "7-digit",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    print("[Stage 3] UX CLI verification")
    for path in REQUIRED_FILES:
        if not path.is_file() or path.stat().st_size == 0:
            fail(f"missing/empty required file: {path.relative_to(ROOT)}")

    architecture = (UX / "UX_ARCHITECTURE.md").read_text(encoding="utf-8")
    for term in REQUIRED_ARCHITECTURE_TERMS:
        if term not in architecture:
            fail(f"UX architecture missing required contract: {term}")

    # Five permanent Student destinations are a deliberate product rule.
    for label in ["Home", "Lessons", "Quizzes", "Notes", "More"]:
        if label not in architecture:
            fail(f"Student primary destination missing: {label}")

    parity = (UX / "UX_FEATURE_PARITY_REVIEW.md").read_text(encoding="utf-8")
    rows = [line for line in parity.splitlines() if line.startswith("|") and "COVERED" in line]
    if len(rows) < 40:
        fail(f"UX parity review has only {len(rows)} covered rows; expected comprehensive coverage")
    bad_markers = ["NOT COVERED", "MISSING", "DROPPED"]
    for marker in bad_markers:
        if marker in parity:
            fail(f"UX parity review contains unresolved marker: {marker}")

    product = (ROOT / "PRODUCT_FEATURE_PARITY_MATRIX.md").read_text(encoding="utf-8")
    feature_ids = set(re.findall(r"\|\s*([A-Z][A-Z0-9-]+-\d{3})\s*\|", product))
    if len(feature_ids) < 100:
        fail(f"Feature parity matrix unexpectedly small: {len(feature_ids)} feature IDs")

    # Wireframes must at least be valid standalone SVG documents.
    for path in [UX / "wireframes/admin-overview.svg", UX / "wireframes/student-core.svg"]:
        try:
            root = ET.parse(path).getroot()
        except ET.ParseError as exc:
            fail(f"invalid wireframe SVG {path.name}: {exc}")
        if not root.tag.endswith("svg"):
            fail(f"wireframe root is not SVG: {path.name}")

    dod = (UX / "UX_STAGE_DOD.md").read_text(encoding="utf-8")
    unchecked = [line for line in dod.splitlines() if line.lstrip().startswith("- [ ]")]
    if unchecked:
        fail("UX Stage DoD still has unchecked items: " + "; ".join(unchecked))

    print(f"PASS: Stage 3 UX architecture files, {len(rows)} coverage rows, {len(feature_ids)} product feature IDs and SVG wireframes")


if __name__ == "__main__":
    main()
