from __future__ import annotations

import importlib.metadata
from pathlib import Path
from typing import Any, Iterable

from .models import OcrBlock, OcrResult
from .utils import json_safe, normalize_ocr_text


class OcrError(RuntimeError):
    pass


def _clamp_score(value: Any) -> float:
    try:
        score = float(value)
    except (TypeError, ValueError):
        return 0.0
    if score > 1.0 and score <= 100.0:
        score /= 100.0
    return max(0.0, min(1.0, score))


def _polygon(value: Any) -> list[list[float]] | None:
    safe = json_safe(value)
    if not isinstance(safe, list):
        return None
    points: list[list[float]] = []
    for point in safe:
        if isinstance(point, list) and len(point) >= 2:
            try:
                points.append([float(point[0]), float(point[1])])
            except (TypeError, ValueError):
                return None
    return points or None


def _walk_dicts(value: Any) -> Iterable[dict[str, Any]]:
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from _walk_dicts(item)
    elif isinstance(value, list):
        for item in value:
            yield from _walk_dicts(item)


def _blocks_from_v3(payload: Any) -> list[OcrBlock]:
    for candidate in _walk_dicts(payload):
        texts = candidate.get("rec_texts")
        scores = candidate.get("rec_scores")
        if isinstance(texts, list) and isinstance(scores, list) and len(texts) == len(scores):
            polys = candidate.get("rec_polys") or candidate.get("dt_polys") or candidate.get("rec_boxes") or []
            result: list[OcrBlock] = []
            for index, text in enumerate(texts):
                if not str(text).strip():
                    continue
                poly = _polygon(polys[index]) if isinstance(polys, list) and index < len(polys) else None
                result.append(OcrBlock(text=str(text), confidence=_clamp_score(scores[index]), polygon=poly))
            if result:
                return result
    return []


def _blocks_from_legacy(value: Any) -> list[OcrBlock]:
    result: list[OcrBlock] = []

    def visit(node: Any) -> None:
        if not isinstance(node, (list, tuple)):
            return
        if len(node) == 2 and isinstance(node[1], (list, tuple)) and len(node[1]) >= 2:
            text_candidate, score_candidate = node[1][0], node[1][1]
            if isinstance(text_candidate, str):
                result.append(
                    OcrBlock(
                        text=text_candidate,
                        confidence=_clamp_score(score_candidate),
                        polygon=_polygon(node[0]),
                    )
                )
                return
        for child in node:
            visit(child)

    visit(value)
    return result


class PaddleOcrAdapter:
    provider_key = "paddleocr-local"

    def __init__(self, *, language: str = "ar", profile_key: str = "arabic-document-v1") -> None:
        try:
            from paddleocr import PaddleOCR
        except ImportError as exc:
            raise OcrError(
                "PaddleOCR is not installed. Install PaddlePaddle for your OS, then `pip install -e .[ocr]`."
            ) from exc

        try:
            self.provider_version = importlib.metadata.version("paddleocr")
        except importlib.metadata.PackageNotFoundError:
            self.provider_version = "unknown"
        self.profile_key = profile_key
        self.language = language

        try:
            self._engine = PaddleOCR(
                lang=language,
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False,
            )
        except TypeError:
            self._engine = PaddleOCR(lang=language, use_angle_cls=True)

    def extract(self, image_path: Path) -> OcrResult:
        try:
            if hasattr(self._engine, "predict"):
                engine_output = list(self._engine.predict(str(image_path)))
            else:
                engine_output = self._engine.ocr(str(image_path), cls=True)
        except Exception as exc:
            raise OcrError(f"PaddleOCR failed for {image_path}: {exc}") from exc

        raw_payload = json_safe(engine_output)
        blocks = _blocks_from_v3(raw_payload) or _blocks_from_legacy(raw_payload)
        if not blocks:
            raise OcrError(
                "PaddleOCR returned a result shape that contained no recognized text blocks. "
                "The raw provider result should be inspected before changing the adapter."
            )
        raw_text = "\n".join(block.text for block in blocks if block.text.strip())
        normalized_text = normalize_ocr_text(block.text for block in blocks)
        scores = [block.confidence for block in blocks]
        return OcrResult(
            provider_key=self.provider_key,
            provider_version=self.provider_version,
            profile_key=self.profile_key,
            language=self.language,
            blocks=tuple(blocks),
            raw_text=raw_text,
            normalized_text=normalized_text,
            mean_confidence=(sum(scores) / len(scores)) if scores else None,
            min_confidence=min(scores) if scores else None,
            raw_provider_payload=raw_payload,
        )
