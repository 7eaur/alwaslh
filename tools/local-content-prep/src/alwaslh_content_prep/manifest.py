from __future__ import annotations

from dataclasses import asdict
from typing import Any

from .images import OptimizedImage, source_mime_type
from .models import Catalog, LessonSpec, OcrAdapter
from .utils import git_blob_sha1, sha256_bytes

PIPELINE_VERSION = "0.1.0"
DISPLAY_PROFILE = "localprep-webp-v1"


def build_page_record(
    *,
    catalog: Catalog,
    lesson: LessonSpec,
    page_id: str,
    profile_sha256: str,
    processed_at: str,
    source_path,
    input_root,
    source_position: int,
    page_number: int,
    source_checksum: str,
    display: OptimizedImage,
    display_rel: str,
    text_rel: str,
    ocr_rel: str,
    page_metadata_rel: str,
    ocr_data: dict[str, Any],
    quality: int,
    max_edge: int | None,
) -> dict[str, Any]:
    source_size = source_path.stat().st_size
    mime = source_mime_type(source_path)
    source_rel = source_path.relative_to(input_root).as_posix()
    git_sha1 = git_blob_sha1(source_path)
    normalized_text = ocr_data.get("normalized_text") or ""
    return {
        "schema_version": 1,
        "pipeline_version": PIPELINE_VERSION,
        "page_id": page_id,
        "processing_profile_sha256": profile_sha256,
        "processed_at": processed_at,
        "identity": {
            "collection_slug": catalog.collection.slug,
            "collection_title": catalog.collection.title,
            "class_slug": lesson.class_slug,
            "class_title": lesson.class_title,
            "subject_slug": lesson.subject_slug,
            "subject_title": lesson.subject_title,
            "section_slug": lesson.section_slug,
            "section_title": lesson.section_title,
            "lesson_slug": lesson.lesson_slug,
            "lesson_title": lesson.lesson_title,
            "lesson_position": lesson.lesson_position,
            "page_number": page_number,
            "source_position": source_position,
        },
        "source": {
            "relative_path": source_rel,
            "filename": source_path.name,
            "mime_type": mime,
            "byte_size": source_size,
            "width": display.source_width,
            "height": display.source_height,
            "checksum_sha256": source_checksum,
            "git_blob_sha1": git_sha1,
        },
        "display": {
            "profile_version": DISPLAY_PROFILE,
            "relative_path": display_rel,
            "mime_type": display.mime_type,
            "byte_size": display.byte_size,
            "width": display.width,
            "height": display.height,
            "checksum_sha256": display.checksum_sha256,
            "quality": quality,
            "max_edge": max_edge,
            "preserved_dimensions": display.width == display.source_width and display.height == display.source_height,
            "compression_ratio": round(display.byte_size / source_size, 6) if source_size else None,
        },
        "ocr": {
            "status": ocr_data["status"],
            "provider_key": ocr_data.get("provider_key"),
            "provider_version": ocr_data.get("provider_version"),
            "profile_key": ocr_data.get("profile_key"),
            "language": ocr_data.get("language"),
            "mean_confidence": ocr_data.get("mean_confidence"),
            "min_confidence": ocr_data.get("min_confidence"),
            "needs_review": ocr_data.get("needs_review", False),
            "review_reason": ocr_data.get("review_reason"),
            "raw_text": ocr_data.get("raw_text", ""),
            "normalized_text": normalized_text,
            "text_sha256": sha256_bytes(normalized_text.encode("utf-8")),
        },
        "files": {
            "display_image": display_rel,
            "text": text_rel,
            "ocr_detail": ocr_rel,
            "page_metadata": page_metadata_rel,
        },
        "import_hints": {
            "source_repository": f"local-content-prep:{catalog.collection.slug}",
            "content_source_document": {
                "source_path": f"{lesson.class_slug}/{lesson.subject_slug}/{lesson.lesson_slug}",
                "class_slug": lesson.class_slug,
                "class_name": lesson.class_title,
                "subject_slug": lesson.subject_slug,
                "subject_name": lesson.subject_title,
                "kind": lesson.document_kind,
                "title": lesson.lesson_title,
                "position": lesson.lesson_position,
                "source_metadata": lesson.metadata,
            },
            "content_source_asset": {
                "source_path": source_rel,
                "filename": source_path.name,
                "position": source_position,
                "mime_type": mime,
                "byte_size": source_size,
                "source_git_blob_sha1": git_sha1,
                "checksum_sha256": source_checksum,
                "naming_family": "local-prepared-page",
                "source_number": page_number,
                "title_hint": f"{lesson.lesson_title} — صفحة {page_number}",
            },
            "media_asset": {
                "idempotency_key": f"localprep:v1:{page_id}:{source_checksum}",
                "source_position": source_position,
                "source_filename": source_path.name,
                "source_mime_type": mime,
                "source_page_number": page_number,
                "source_checksum_sha256": source_checksum,
                "source_byte_size": source_size,
            },
            "media_variant": {
                "kind": "display",
                "profile_version": DISPLAY_PROFILE,
                "storage_key_hint": display_rel,
                "mime_type": display.mime_type,
                "byte_size": display.byte_size,
                "width": display.width,
                "height": display.height,
                "checksum_sha256": display.checksum_sha256,
            },
            "ocr_extraction": {
                "input_checksum_sha256": display.checksum_sha256,
                "provider_key": ocr_data.get("provider_key"),
                "provider_version": ocr_data.get("provider_version"),
                "profile_key": ocr_data.get("profile_key"),
                "raw_text": ocr_data.get("raw_text", ""),
                "normalized_text": normalized_text,
                "mean_confidence": ocr_data.get("mean_confidence"),
                "review_status_hint": "pending" if ocr_data.get("needs_review") else "not_required",
            },
            "lesson_asset": {
                "lesson_slug": lesson.lesson_slug,
                "position": source_position,
                "publication_status": "draft",
            },
        },
    }


def build_package(
    *,
    catalog: Catalog,
    created_at: str,
    pages_manifest_sha256: str,
    page_count: int,
    processed: int,
    resumed: int,
    errors: int,
    needs_review: int,
    quality: int,
    max_edge: int | None,
    ocr_adapter: OcrAdapter | None,
    low_confidence: float,
) -> dict[str, Any]:
    return {
        "schema_version": 1,
        "pipeline_version": PIPELINE_VERSION,
        "created_at": created_at,
        "collection": asdict(catalog.collection),
        "pages_manifest": "pages.jsonl",
        "pages_manifest_sha256": pages_manifest_sha256,
        "page_count": page_count,
        "processed_page_count": processed,
        "resumed_page_count": resumed,
        "error_count": errors,
        "needs_review_count": needs_review,
        "profiles": {
            "display": {
                "profile_version": DISPLAY_PROFILE,
                "format": "webp",
                "quality": quality,
                "max_edge": max_edge,
            },
            "ocr": None
            if ocr_adapter is None
            else {
                "provider_key": ocr_adapter.provider_key,
                "provider_version": ocr_adapter.provider_version,
                "profile_key": ocr_adapter.profile_key,
                "language": ocr_adapter.language,
                "low_confidence_threshold": low_confidence,
            },
        },
        "import_contract": {
            "database_write_performed": False,
            "target_tables": [
                "content_import_runs",
                "content_source_documents",
                "content_source_assets",
                "media_assets",
                "media_variants",
                "ocr_extractions",
                "lesson_assets",
            ],
            "note": "Import hints are portable preparation data, not authoritative database IDs.",
        },
    }
