#!/usr/bin/env python3
"""Compatibility entrypoint for the pinned alwaslh-go manifest variants.

The source repository contains three manifest entry shapes. The canonical inventory
module handles the canonical and Arabic-processing variants directly; this adapter
adds the older ``filename/pdf_page`` variant without weakening any validation.
"""

from __future__ import annotations

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


def main(argv: list[str] | None = None) -> int:
    inventory.normalize_manifest_entry = normalize_manifest_entry
    return inventory.main(argv)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
