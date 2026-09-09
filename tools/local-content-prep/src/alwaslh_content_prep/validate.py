from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Any

from PIL import Image

from .utils import read_json, sha256_bytes, sha256_file


def validate_package(workspace: Path) -> list[str]:
    prepared = workspace / "prepared"
    package_path = prepared / "package.json"
    pages_path = prepared / "pages.jsonl"
    errors: list[str] = []
    if not package_path.exists():
        return [f"missing {package_path}"]
    if not pages_path.exists():
        return [f"missing {pages_path}"]
    package = read_json(package_path)
    jsonl_bytes = pages_path.read_bytes()
    if sha256_bytes(jsonl_bytes) != package.get("pages_manifest_sha256"):
        errors.append("pages.jsonl checksum does not match package.json")

    pages: list[dict[str, Any]] = []
    for line_number, line in enumerate(jsonl_bytes.decode("utf-8").splitlines(), 1):
        try:
            page = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"pages.jsonl:{line_number}: invalid JSON: {exc}")
            continue
        pages.append(page)

    if len(pages) != package.get("page_count"):
        errors.append(f"page_count mismatch: package={package.get('page_count')} actual={len(pages)}")
    ids: set[str] = set()
    lesson_positions: dict[tuple[str, str, str], list[int]] = defaultdict(list)
    for page in pages:
        page_id = page.get("page_id")
        if page_id in ids:
            errors.append(f"duplicate page_id: {page_id}")
        ids.add(page_id)
        identity = page["identity"]
        lesson_key = (identity["class_slug"], identity["subject_slug"], identity["lesson_slug"])
        lesson_positions[lesson_key].append(identity["source_position"])
        display_path = prepared / page["files"]["display_image"]
        text_path = prepared / page["files"]["text"]
        ocr_path = prepared / page["files"]["ocr_detail"]
        metadata_path = prepared / page["files"]["page_metadata"]
        for path in (display_path, text_path, ocr_path, metadata_path):
            if not path.exists():
                errors.append(f"{page_id}: missing file {path.relative_to(prepared)}")
        if display_path.exists():
            if sha256_file(display_path) != page["display"]["checksum_sha256"]:
                errors.append(f"{page_id}: display checksum mismatch")
            try:
                with Image.open(display_path) as image:
                    if image.size != (page["display"]["width"], page["display"]["height"]):
                        errors.append(f"{page_id}: display dimensions mismatch")
            except Exception as exc:
                errors.append(f"{page_id}: display image unreadable: {exc}")
        if text_path.exists():
            normalized = text_path.read_text(encoding="utf-8").rstrip("\n")
            expected = page["ocr"]["normalized_text"]
            if normalized != expected:
                errors.append(f"{page_id}: text.txt differs from page.json normalized_text")

    for lesson_key, positions in lesson_positions.items():
        expected = list(range(len(positions)))
        if sorted(positions) != expected:
            errors.append(f"{lesson_key}: source positions are not contiguous from zero: {sorted(positions)}")
    return errors
