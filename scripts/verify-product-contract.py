#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MATRIX = ROOT / "PRODUCT_FEATURE_PARITY_MATRIX.md"
ID_RE = re.compile(r"^[A-Z][A-Z0-9-]*-\d{3}$")


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    print("[Stage 1] Product contract CLI verification")
    if not MATRIX.is_file():
        fail("PRODUCT_FEATURE_PARITY_MATRIX.md is missing")

    rows: list[tuple[str, list[str]]] = []
    for line_no, line in enumerate(MATRIX.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if not cells or not ID_RE.match(cells[0]):
            continue
        rows.append((cells[0], cells))
        if len(cells) < 3:
            fail(f"feature row {cells[0]} at line {line_no} is structurally incomplete")
        if any(cell == "" for cell in cells[1:]):
            fail(f"feature row {cells[0]} at line {line_no} contains an empty contract cell")

    ids = [feature_id for feature_id, _ in rows]
    if len(ids) < 100:
        fail(f"feature contract unexpectedly small: {len(ids)} IDs")

    duplicates = [key for key, count in Counter(ids).items() if count > 1]
    if duplicates:
        fail("duplicate feature IDs: " + ", ".join(sorted(duplicates)))

    text = MATRIX.read_text(encoding="utf-8")
    for required in [
        "6-digit",
        "7-digit",
        "Offline",
        "Gemini",
        "Admin",
        "Student",
        "PWA",
        "Export",
        "Accessibility",
    ]:
        if required.lower() not in text.lower():
            fail(f"product contract missing required capability family: {required}")

    print(f"PASS: Stage 1 product contract contains {len(ids)} unique, non-empty feature rows")


if __name__ == "__main__":
    main()
