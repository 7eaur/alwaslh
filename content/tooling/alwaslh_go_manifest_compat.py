#!/usr/bin/env python3
"""Compatibility entrypoint for the pinned alwaslh-go manifest variants.

The source repository contains three manifest entry shapes. The canonical inventory
module handles the canonical and Arabic-processing variants directly; this adapter
adds the older ``filename/pdf_page`` variant without weakening any validation.

It also normalizes integral JSON floats before hashing so the Python producer and
JavaScript consumer share one canonical digest representation (JSON.stringify
serializes ``9.0`` as ``9``).
"""

from __future__ import annotations

import json
import sys
from typing import Any

import alwaslh_go_inventory as inventory

_base_normalize_manifest_entry = inventory.normalize_manifest_entry


def normalize_manifest_entry(entry: dict[str, Any]) -> dict[str, Any] | None:
    normalized = _base_normalize_manifest_entry(entry)
    if normalized is not None:
        return normalized

    pdf_page = entry.get("pdf_page")
    filename = entry.get("filename")
    if not isinstance(pdf_page, int) or pdf_page <= 0 or not isinstance(filename, str) or not filename.strip():
        return None

    return {
        "seq": pdf_page,
        "relative_path": f"الصور/{filename}",
        "new_name": filename,
        "metadata": {
            "seq": pdf_page,
            "source_page": pdf_page,
            "book_page": entry.get("book_page"),
            "title": entry.get("title"),
            "new_name": filename,
            "width": entry.get("width"),
            "height": entry.get("height"),
            "bytes": entry.get("bytes"),
            "schema": "filename_pdf_page_manifest",
        },
    }


def normalize_json_numbers(value: Any) -> Any:
    if isinstance(value, list):
        return [normalize_json_numbers(item) for item in value]
    if isinstance(value, dict):
        return {key: normalize_json_numbers(item) for key, item in value.items()}
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


def canonical_bytes(payload: Any) -> bytes:
    normalized = normalize_json_numbers(payload)
    return json.dumps(normalized, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def main(argv: list[str] | None = None) -> int:
    inventory.normalize_manifest_entry = normalize_manifest_entry
    inventory.canonical_bytes = canonical_bytes
    return inventory.main(argv)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
