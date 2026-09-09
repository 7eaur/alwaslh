from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from .models import Catalog, CollectionMeta, LessonSpec
from .utils import atomic_write_json, ensure_relative_path, natural_key, read_json

_SLUG = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}


def _required_text(payload: dict[str, Any], key: str, scope: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{scope}.{key} must be a non-empty string")
    return value.strip()


def _slug(payload: dict[str, Any], key: str, scope: str) -> str:
    value = _required_text(payload, key, scope)
    if not _SLUG.fullmatch(value):
        raise ValueError(f"{scope}.{key} must match {_SLUG.pattern}: {value!r}")
    return value


def load_catalog(path: Path) -> Catalog:
    payload = read_json(path)
    if not isinstance(payload, dict):
        raise ValueError("catalog root must be a JSON object")
    if payload.get("schema_version") != 1:
        raise ValueError("catalog.schema_version must be 1")

    collection_raw = payload.get("collection")
    if not isinstance(collection_raw, dict):
        raise ValueError("catalog.collection must be an object")
    collection = CollectionMeta(
        slug=_slug(collection_raw, "slug", "collection"),
        title=_required_text(collection_raw, "title", "collection"),
        source_label=str(collection_raw.get("source_label") or "local-content-prep").strip(),
    )

    classes = payload.get("classes")
    if not isinstance(classes, list) or not classes:
        raise ValueError("catalog.classes must be a non-empty array")

    lessons: list[LessonSpec] = []
    identities: set[tuple[str, str, str]] = set()
    source_dirs: set[Path] = set()
    for class_index, class_raw in enumerate(classes):
        if not isinstance(class_raw, dict):
            raise ValueError(f"classes[{class_index}] must be an object")
        class_scope = f"classes[{class_index}]"
        class_slug = _slug(class_raw, "slug", class_scope)
        class_title = _required_text(class_raw, "title", class_scope)
        subjects = class_raw.get("subjects")
        if not isinstance(subjects, list) or not subjects:
            raise ValueError(f"{class_scope}.subjects must be a non-empty array")

        for subject_index, subject_raw in enumerate(subjects):
            if not isinstance(subject_raw, dict):
                raise ValueError(f"{class_scope}.subjects[{subject_index}] must be an object")
            subject_scope = f"{class_scope}.subjects[{subject_index}]"
            subject_slug = _slug(subject_raw, "slug", subject_scope)
            subject_title = _required_text(subject_raw, "title", subject_scope)
            lesson_items = subject_raw.get("lessons")
            if not isinstance(lesson_items, list) or not lesson_items:
                raise ValueError(f"{subject_scope}.lessons must be a non-empty array")

            for lesson_index, lesson_raw in enumerate(lesson_items):
                if not isinstance(lesson_raw, dict):
                    raise ValueError(f"{subject_scope}.lessons[{lesson_index}] must be an object")
                lesson_scope = f"{subject_scope}.lessons[{lesson_index}]"
                lesson_slug = _slug(lesson_raw, "slug", lesson_scope)
                identity = (class_slug, subject_slug, lesson_slug)
                if identity in identities:
                    raise ValueError(f"duplicate lesson identity: {identity}")
                identities.add(identity)
                source_dir = ensure_relative_path(
                    _required_text(lesson_raw, "source_dir", lesson_scope), f"{lesson_scope}.source_dir"
                )
                if source_dir in source_dirs:
                    raise ValueError(f"source_dir is reused by more than one lesson: {source_dir}")
                source_dirs.add(source_dir)
                section = lesson_raw.get("section")
                section_slug = None
                section_title = None
                if section is not None:
                    if not isinstance(section, dict):
                        raise ValueError(f"{lesson_scope}.section must be an object or null")
                    section_slug = _slug(section, "slug", f"{lesson_scope}.section")
                    section_title = _required_text(section, "title", f"{lesson_scope}.section")
                document_kind = str(lesson_raw.get("document_kind") or "textbook")
                if document_kind not in {"textbook", "government_exam"}:
                    raise ValueError(f"{lesson_scope}.document_kind is unsupported: {document_kind}")
                metadata = lesson_raw.get("metadata") or {}
                if not isinstance(metadata, dict):
                    raise ValueError(f"{lesson_scope}.metadata must be an object")
                position = lesson_raw.get("position", lesson_index)
                if not isinstance(position, int) or position < 0:
                    raise ValueError(f"{lesson_scope}.position must be a non-negative integer")
                lessons.append(
                    LessonSpec(
                        class_slug=class_slug,
                        class_title=class_title,
                        subject_slug=subject_slug,
                        subject_title=subject_title,
                        lesson_slug=lesson_slug,
                        lesson_title=_required_text(lesson_raw, "title", lesson_scope),
                        source_dir=source_dir,
                        lesson_position=position,
                        section_slug=section_slug,
                        section_title=section_title,
                        document_kind=document_kind,
                        metadata=metadata,
                    )
                )
    return Catalog(schema_version=1, collection=collection, lessons=tuple(lessons))


def discover_image_files(directory: Path) -> list[Path]:
    if not directory.is_dir():
        return []
    return sorted(
        [path for path in directory.iterdir() if path.is_file() and path.suffix.casefold() in _IMAGE_SUFFIXES],
        key=lambda path: natural_key(path.name),
    )


def scan_input_tree(input_root: Path, *, collection_slug: str, collection_title: str) -> dict[str, Any]:
    classes: list[dict[str, Any]] = []
    for class_dir in sorted((p for p in input_root.iterdir() if p.is_dir()), key=lambda p: natural_key(p.name)):
        subjects: list[dict[str, Any]] = []
        for subject_dir in sorted((p for p in class_dir.iterdir() if p.is_dir()), key=lambda p: natural_key(p.name)):
            lessons: list[dict[str, Any]] = []
            lesson_dirs = sorted((p for p in subject_dir.iterdir() if p.is_dir()), key=lambda p: natural_key(p.name))
            for lesson_position, lesson_dir in enumerate(lesson_dirs):
                if not discover_image_files(lesson_dir):
                    continue
                lessons.append(
                    {
                        "slug": lesson_dir.name,
                        "title": lesson_dir.name,
                        "position": lesson_position,
                        "source_dir": lesson_dir.relative_to(input_root).as_posix(),
                        "document_kind": "textbook",
                    }
                )
            if lessons:
                subjects.append({"slug": subject_dir.name, "title": subject_dir.name, "lessons": lessons})
        if subjects:
            classes.append({"slug": class_dir.name, "title": class_dir.name, "subjects": subjects})
    return {
        "schema_version": 1,
        "collection": {"slug": collection_slug, "title": collection_title, "source_label": "local-content-prep"},
        "classes": classes,
    }


def write_draft_catalog(path: Path, payload: dict[str, Any]) -> None:
    atomic_write_json(path, payload)
