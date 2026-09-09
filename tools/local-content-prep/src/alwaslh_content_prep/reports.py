from __future__ import annotations

import csv
import html
import json
from pathlib import Path
from typing import Any

from .utils import atomic_write_json, atomic_write_text


def _lesson_key(page: dict[str, Any]) -> tuple[str, str, str]:
    identity = page["identity"]
    return identity["class_slug"], identity["subject_slug"], identity["lesson_slug"]


def write_reports(prepared_root: Path, pages: list[dict[str, Any]], errors: list[dict[str, Any]]) -> None:
    reports = prepared_root / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    low_confidence = [page for page in pages if page["ocr"]["needs_review"]]
    summary = {
        "page_count": len(pages),
        "lesson_count": len({_lesson_key(page) for page in pages}),
        "ocr_completed_count": sum(page["ocr"]["status"] == "completed" for page in pages),
        "ocr_skipped_count": sum(page["ocr"]["status"] == "skipped" for page in pages),
        "needs_review_count": len(low_confidence),
        "error_count": len(errors),
        "source_bytes": sum(page["source"]["byte_size"] for page in pages),
        "display_bytes": sum(page["display"]["byte_size"] for page in pages),
    }
    source_bytes = summary["source_bytes"]
    summary["display_to_source_ratio"] = (summary["display_bytes"] / source_bytes) if source_bytes else None
    atomic_write_json(reports / "summary.json", summary)

    columns = [
        "page_id", "class", "subject", "lesson", "page_number", "source_filename",
        "source_bytes", "display_bytes", "mean_confidence", "min_confidence", "needs_review", "text_chars",
    ]
    for name, selected in (("pages.csv", pages), ("needs-review.csv", low_confidence)):
        rows: list[dict[str, Any]] = []
        for page in selected:
            identity = page["identity"]
            rows.append({
                "page_id": page["page_id"],
                "class": identity["class_title"],
                "subject": identity["subject_title"],
                "lesson": identity["lesson_title"],
                "page_number": identity["page_number"],
                "source_filename": page["source"]["filename"],
                "source_bytes": page["source"]["byte_size"],
                "display_bytes": page["display"]["byte_size"],
                "mean_confidence": page["ocr"]["mean_confidence"],
                "min_confidence": page["ocr"]["min_confidence"],
                "needs_review": page["ocr"]["needs_review"],
                "text_chars": len(page["ocr"].get("normalized_text") or ""),
            })
        output = reports / name
        with output.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=columns)
            writer.writeheader()
            writer.writerows(rows)

    review_root = reports / "review"
    review_root.mkdir(parents=True, exist_ok=True)
    grouped: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for page in pages:
        grouped.setdefault(_lesson_key(page), []).append(page)

    index_links: list[str] = []
    for key, lesson_pages in sorted(grouped.items()):
        class_slug, subject_slug, lesson_slug = key
        filename = f"{class_slug}__{subject_slug}__{lesson_slug}.html"
        first = lesson_pages[0]["identity"]
        title = f"{first['class_title']} — {first['subject_title']} — {first['lesson_title']}"
        index_links.append(f'<li><a href="{html.escape(filename)}">{html.escape(title)}</a> ({len(lesson_pages)} صفحة)</li>')
        cards: list[str] = []
        for page in lesson_pages:
            identity = page["identity"]
            image_rel = "../../" + page["files"]["display_image"]
            confidence = page["ocr"]["mean_confidence"]
            confidence_text = "—" if confidence is None else f"{confidence:.2f}%"
            review_flag = "⚠ يحتاج مراجعة" if page["ocr"]["needs_review"] else "✓"
            text = html.escape(page["ocr"].get("normalized_text") or "(OCR غير منفذ)")
            cards.append(f'''<section class="card">
  <div class="meta"><strong>صفحة {identity['page_number']}</strong> · {html.escape(page['source']['filename'])} · الثقة {confidence_text} · {review_flag}</div>
  <div class="pair"><img loading="lazy" src="{html.escape(image_rel)}" alt="صفحة {identity['page_number']}"><pre>{text}</pre></div>
</section>''')
        atomic_write_text(review_root / filename, _html_shell(title, "\n".join(cards)))

    index_body = "<h1>مراجعة OCR</h1><ul>" + "\n".join(index_links) + "</ul>"
    atomic_write_text(review_root / "index.html", _html_shell("مراجعة OCR", index_body))
    error_lines = "".join(json.dumps(error, ensure_ascii=False, sort_keys=True) + "\n" for error in errors)
    atomic_write_text(reports / "errors.jsonl", error_lines)


def _html_shell(title: str, body: str) -> str:
    return f'''<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<style>
body{{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:24px;background:#f6f7f8;color:#171717}}h1{{margin-top:0}}a{{color:#174ea6}}ul{{line-height:2}}.card{{background:white;border:1px solid #ddd;border-radius:12px;padding:14px;margin:0 0 18px}}.meta{{margin-bottom:12px}}.pair{{display:grid;grid-template-columns:minmax(260px,42%) 1fr;gap:16px;align-items:start}}img{{max-width:100%;height:auto;border:1px solid #ddd}}pre{{white-space:pre-wrap;word-break:break-word;font:16px/1.9 system-ui;margin:0;direction:rtl}}@media(max-width:800px){{.pair{{grid-template-columns:1fr}}}}
</style></head><body>{body}</body></html>'''
