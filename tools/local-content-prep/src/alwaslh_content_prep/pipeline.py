from __future__ import annotations

import json
import shutil
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .catalog import discover_image_files
from .images import DISPLAY_PROFILE, optimize_for_display, write_lossless_ocr_input
from .manifest import build_package, build_page_record
from .models import Catalog, LessonSpec, OcrAdapter, OcrResult
from .reports import write_reports
from .utils import atomic_write_json, atomic_write_text, read_json, sha256_bytes, sha256_file, stable_page_id


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _semantic_key(lesson: LessonSpec, page_number: int) -> str:
    return "/".join([lesson.class_slug, lesson.subject_slug, lesson.lesson_slug, str(page_number)])


def _profile_sha(catalog: Catalog, lesson: LessonSpec, adapter: OcrAdapter | None, quality: int, max_edge: int | None, low_confidence: float, max_pixels: int) -> str:
    payload = {
        "collection": asdict(catalog.collection),
        "lesson": {
            "class_slug": lesson.class_slug,
            "class_title": lesson.class_title,
            "subject_slug": lesson.subject_slug,
            "subject_title": lesson.subject_title,
            "lesson_slug": lesson.lesson_slug,
            "lesson_title": lesson.lesson_title,
            "lesson_position": lesson.lesson_position,
            "section_slug": lesson.section_slug,
            "section_title": lesson.section_title,
            "document_kind": lesson.document_kind,
            "metadata": lesson.metadata,
        },
        "display": {
            "profile_version": DISPLAY_PROFILE,
            "quality": quality,
            "max_edge": max_edge,
            "max_pixels": max_pixels,
        },
        "ocr": None if adapter is None else {
            "provider_key": adapter.provider_key,
            "provider_version": adapter.provider_version,
            "profile_key": adapter.profile_key,
            "language": adapter.language,
            "low_confidence": low_confidence,
        },
    }
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return sha256_bytes(canonical)


def _load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"schema_version": 1, "pages": {}}
    state = read_json(path)
    if not isinstance(state, dict) or not isinstance(state.get("pages"), dict):
        raise ValueError(f"invalid state file: {path}")
    return state


def _ocr_dict(result: OcrResult, low_confidence: float) -> dict[str, Any]:
    mean = result.mean_confidence
    reason = None
    if not result.normalized_text.strip():
        reason = "empty_text"
    elif mean is None:
        reason = "missing_confidence"
    elif mean < low_confidence:
        reason = "low_mean_confidence"
    return {
        "status": "completed",
        "provider_key": result.provider_key,
        "provider_version": result.provider_version,
        "profile_key": result.profile_key,
        "language": result.language,
        "blocks": [asdict(block) for block in result.blocks],
        "raw_text": result.raw_text,
        "normalized_text": result.normalized_text,
        "mean_confidence": None if mean is None else round(mean * 100, 2),
        "min_confidence": None if result.min_confidence is None else round(result.min_confidence * 100, 2),
        "raw_provider_payload": result.raw_provider_payload,
        "needs_review": reason is not None,
        "review_reason": reason,
    }


def run_pipeline(*, workspace: Path, catalog: Catalog, ocr_adapter: OcrAdapter | None, quality: int = 82, max_edge: int | None = None, low_confidence: float = 0.80, max_pixels: int = 100_000_000, force: bool = False, fail_fast: bool = False) -> dict[str, Any]:
    if not 0.0 <= low_confidence <= 1.0:
        raise ValueError("low_confidence must be between 0 and 1")
    input_root, prepared = workspace / "input", workspace / "prepared"
    content_root, temp_root = prepared / "content", prepared / ".tmp"
    prepared.mkdir(parents=True, exist_ok=True)
    temp_root.mkdir(parents=True, exist_ok=True)
    state_path = prepared / "state.json"
    state = _load_state(state_path)
    pages: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    processed = resumed = 0
    if (workspace / "catalog.json").exists():
        shutil.copyfile(workspace / "catalog.json", prepared / "catalog.snapshot.json")

    for lesson in sorted(catalog.lessons, key=lambda x: (x.class_slug, x.subject_slug, x.lesson_position, x.lesson_slug)):
        images = discover_image_files(input_root / lesson.source_dir)
        if not images:
            errors.append({"scope": "lesson", "lesson": _semantic_key(lesson, 0), "error": "no supported image files found", "source_dir": lesson.source_dir.as_posix()})
            if fail_fast:
                raise RuntimeError(f"no supported image files found: {lesson.source_dir}")
            continue
        profile = _profile_sha(catalog, lesson, ocr_adapter, quality, max_edge, low_confidence, max_pixels)
        pages_root = content_root / lesson.class_slug / lesson.subject_slug / lesson.lesson_slug / "pages"
        expected_dirs = {f"{n:04d}" for n in range(1, len(images) + 1)}
        if pages_root.is_dir():
            for old_dir in pages_root.iterdir():
                if old_dir.is_dir() and old_dir.name.isdigit() and old_dir.name not in expected_dirs:
                    shutil.rmtree(old_dir)
        prefix = f"{lesson.class_slug}/{lesson.subject_slug}/{lesson.lesson_slug}/"
        for key in list(state["pages"]):
            if key.startswith(prefix):
                try:
                    if int(key.rsplit("/", 1)[1]) > len(images):
                        state["pages"].pop(key, None)
                except ValueError:
                    pass

        lesson_pages: list[dict[str, Any]] = []
        for position, source in enumerate(images):
            page_number = position + 1
            key = _semantic_key(lesson, page_number)
            page_id = stable_page_id(catalog.collection.slug, lesson.class_slug, lesson.subject_slug, lesson.lesson_slug, page_number)
            page_dir = pages_root / f"{page_number:04d}"
            page_json, display_path = page_dir / "page.json", page_dir / "image.webp"
            text_path, ocr_json = page_dir / "text.txt", page_dir / "ocr.json"
            try:
                source_sha = sha256_file(source)
                previous = state["pages"].get(key)
                reusable = (
                    not force
                    and isinstance(previous, dict)
                    and previous.get("source_checksum_sha256") == source_sha
                    and previous.get("processing_profile_sha256") == profile
                    and all(p.exists() for p in (page_json, display_path, text_path, ocr_json))
                )
                if reusable:
                    record = read_json(page_json)
                    pages.append(record)
                    lesson_pages.append(record)
                    resumed += 1
                    continue

                display = optimize_for_display(source, display_path, quality=quality, max_edge=max_edge, max_pixels=max_pixels)
                if ocr_adapter is None:
                    ocr_data = {
                        "status": "skipped", "provider_key": None, "provider_version": None,
                        "profile_key": None, "language": None, "raw_text": "", "normalized_text": "",
                        "mean_confidence": None, "min_confidence": None, "needs_review": False,
                        "review_reason": "ocr_skipped",
                    }
                else:
                    temp = temp_root / f"{page_id}.png"
                    try:
                        write_lossless_ocr_input(source, temp, max_pixels=max_pixels)
                        ocr_data = _ocr_dict(ocr_adapter.extract(temp), low_confidence)
                    finally:
                        temp.unlink(missing_ok=True)
                normalized = ocr_data.get("normalized_text") or ""
                atomic_write_text(text_path, normalized + ("\n" if normalized else ""))
                atomic_write_json(ocr_json, ocr_data)
                record = build_page_record(
                    catalog=catalog, lesson=lesson, page_id=page_id, profile_sha256=profile, processed_at=_now(),
                    source_path=source, input_root=input_root, source_position=position, page_number=page_number,
                    source_checksum=source_sha, display=display,
                    display_rel=display_path.relative_to(prepared).as_posix(), text_rel=text_path.relative_to(prepared).as_posix(),
                    ocr_rel=ocr_json.relative_to(prepared).as_posix(), page_metadata_rel=page_json.relative_to(prepared).as_posix(),
                    ocr_data=ocr_data, quality=quality, max_edge=max_edge,
                )
                atomic_write_json(page_json, record)
                pages.append(record)
                lesson_pages.append(record)
                processed += 1
                state["pages"][key] = {
                    "page_id": page_id,
                    "source_checksum_sha256": source_sha,
                    "processing_profile_sha256": profile,
                    "page_metadata": record["files"]["page_metadata"],
                    "completed_at": record["processed_at"],
                }
                atomic_write_json(state_path, state)
            except Exception as exc:
                errors.append({
                    "scope": "page", "semantic_key": key,
                    "source_path": source.relative_to(input_root).as_posix(),
                    "error_type": type(exc).__name__, "error": str(exc), "at": _now(),
                })
                if fail_fast:
                    raise

        lesson_dir = content_root / lesson.class_slug / lesson.subject_slug / lesson.lesson_slug
        atomic_write_json(lesson_dir / "lesson.json", {
            "schema_version": 1,
            "collection": asdict(catalog.collection),
            "lesson": {
                "class_slug": lesson.class_slug, "class_title": lesson.class_title,
                "subject_slug": lesson.subject_slug, "subject_title": lesson.subject_title,
                "section_slug": lesson.section_slug, "section_title": lesson.section_title,
                "lesson_slug": lesson.lesson_slug, "lesson_title": lesson.lesson_title,
                "lesson_position": lesson.lesson_position, "document_kind": lesson.document_kind,
                "metadata": lesson.metadata,
            },
            "page_count": len(lesson_pages),
            "pages": [
                {"page_id": p["page_id"], "page_number": p["identity"]["page_number"], "page_metadata": p["files"]["page_metadata"], "needs_review": p["ocr"]["needs_review"]}
                for p in lesson_pages
            ],
        })

    pages.sort(key=lambda p: (
        p["identity"]["class_slug"], p["identity"]["subject_slug"], p["identity"]["lesson_position"],
        p["identity"]["lesson_slug"], p["identity"]["source_position"],
    ))
    jsonl = "".join(json.dumps(page, ensure_ascii=False, sort_keys=True) + "\n" for page in pages)
    atomic_write_text(prepared / "pages.jsonl", jsonl)
    manifest_sha = sha256_bytes(jsonl.encode("utf-8"))
    package = build_package(
        catalog=catalog, created_at=_now(), pages_manifest_sha256=manifest_sha, page_count=len(pages),
        processed=processed, resumed=resumed, errors=len(errors),
        needs_review=sum(p["ocr"]["needs_review"] for p in pages), quality=quality, max_edge=max_edge,
        ocr_adapter=ocr_adapter, low_confidence=low_confidence,
    )
    atomic_write_json(prepared / "package.json", package)
    state.update({"last_package_sha256": manifest_sha, "updated_at": _now()})
    atomic_write_json(state_path, state)
    write_reports(prepared, pages, errors)
    try:
        temp_root.rmdir()
    except OSError:
        pass
    return package
