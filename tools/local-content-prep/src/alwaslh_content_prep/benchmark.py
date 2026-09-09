from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any

from .utils import atomic_write_json, normalize_ocr_text


def _distance(left: str, right: str) -> int:
    if left == right:
        return 0
    if not left:
        return len(right)
    if not right:
        return len(left)
    previous = list(range(len(right) + 1))
    for i, left_char in enumerate(left, 1):
        current = [i]
        for j, right_char in enumerate(right, 1):
            current.append(min(current[-1] + 1, previous[j] + 1, previous[j - 1] + (left_char != right_char)))
        previous = current
    return previous[-1]


def _normalize(value: str) -> str:
    return normalize_ocr_text(value.splitlines())


def benchmark_package(workspace: Path) -> dict[str, Any]:
    prepared = workspace / "prepared"
    pages_path = prepared / "pages.jsonl"
    if not pages_path.exists():
        raise FileNotFoundError(f"missing {pages_path}; run prepare first")

    rows: list[dict[str, Any]] = []
    total_edits = 0
    total_chars = 0
    for line in pages_path.read_text(encoding="utf-8").splitlines():
        page = json.loads(line)
        page_dir = prepared / Path(page["files"]["page_metadata"]).parent
        truth_path = page_dir / "ground-truth.txt"
        if not truth_path.exists():
            continue
        reference = _normalize(truth_path.read_text(encoding="utf-8"))
        prediction = _normalize(page["ocr"].get("normalized_text") or "")
        edits = _distance(reference, prediction)
        chars = len(reference)
        cer = (edits / chars) if chars else (0.0 if not prediction else 1.0)
        total_edits += edits
        total_chars += chars
        identity = page["identity"]
        rows.append({
            "page_id": page["page_id"],
            "class": identity["class_title"],
            "subject": identity["subject_title"],
            "lesson": identity["lesson_title"],
            "page_number": identity["page_number"],
            "reference_chars": chars,
            "edit_distance": edits,
            "cer": round(cer, 6),
            "accuracy_percent": round(max(0.0, 1.0 - cer) * 100, 2),
            "mean_confidence": page["ocr"].get("mean_confidence"),
            "ground_truth": truth_path.relative_to(prepared).as_posix(),
        })

    reports = prepared / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    summary = {
        "schema_version": 1,
        "evaluated_page_count": len(rows),
        "total_reference_chars": total_chars,
        "total_edit_distance": total_edits,
        "micro_cer": round(total_edits / total_chars, 6) if total_chars else None,
        "micro_accuracy_percent": round(max(0.0, 1.0 - (total_edits / total_chars)) * 100, 2) if total_chars else None,
        "note": "CER is character edit distance divided by manually corrected reference characters. Lower is better.",
    }
    atomic_write_json(reports / "ocr-benchmark.json", summary)
    with (reports / "ocr-benchmark.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        fieldnames = ["page_id", "class", "subject", "lesson", "page_number", "reference_chars", "edit_distance", "cer", "accuracy_percent", "mean_confidence", "ground_truth"]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return summary
