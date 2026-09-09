from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Protocol


@dataclass(frozen=True)
class CollectionMeta:
    slug: str
    title: str
    source_label: str = "local-content-prep"


@dataclass(frozen=True)
class LessonSpec:
    class_slug: str
    class_title: str
    subject_slug: str
    subject_title: str
    lesson_slug: str
    lesson_title: str
    source_dir: Path
    lesson_position: int = 0
    section_slug: str | None = None
    section_title: str | None = None
    document_kind: str = "textbook"
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class Catalog:
    schema_version: int
    collection: CollectionMeta
    lessons: tuple[LessonSpec, ...]


@dataclass(frozen=True)
class OcrBlock:
    text: str
    confidence: float
    polygon: list[list[float]] | None = None


@dataclass(frozen=True)
class OcrResult:
    provider_key: str
    provider_version: str
    profile_key: str
    language: str
    blocks: tuple[OcrBlock, ...]
    raw_text: str
    normalized_text: str
    mean_confidence: float | None
    min_confidence: float | None
    raw_provider_payload: Any = None


class OcrAdapter(Protocol):
    provider_key: str
    provider_version: str
    profile_key: str
    language: str

    def extract(self, image_path: Path) -> OcrResult:
        ...
