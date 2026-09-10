from __future__ import annotations

import argparse
import hashlib
import json
import tempfile
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

from alwaslh_content_prep.images import write_lossless_ocr_input
from alwaslh_content_prep.ocr import OcrError, PaddleOcrAdapter
from alwaslh_content_prep.utils import atomic_write_bytes, atomic_write_json, natural_key

EXTRACTION_VERSION = 1
PAGE_NAMESPACE = uuid.UUID("fa8e9728-8561-4f7e-bdaa-e42f54256882")


def _load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"expected JSON object: {path}")
    return value


def _load_inventory(path: Path) -> list[dict]:
    records: list[dict] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            value = json.loads(line)
            if not isinstance(value, dict):
                raise ValueError(f"invalid inventory row {line_number}")
            records.append(value)
    return records


def _source_sort_key(record: dict) -> tuple:
    page_hint = record.get("page_hint")
    filename = str(record.get("filename") or "")
    group = str(record.get("source_group") or "")
    if isinstance(page_hint, int):
        return (group, 1, page_hint, natural_key(filename))
    return (group, 0, 0, natural_key(filename))


def _raw_url(repository: str, commit: str, source_path: str) -> str:
    encoded = urllib.parse.quote(source_path, safe="/")
    return f"https://raw.githubusercontent.com/{repository}/{commit}/{encoded}"


def _download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "alwaslh-content-corpus-ocr/1"})
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def _git_blob_sha1(data: bytes) -> str:
    digest = hashlib.sha1(usedforsecurity=False)
    digest.update(f"blob {len(data)}\0".encode("ascii"))
    digest.update(data)
    return digest.hexdigest()


def _stable_page_id(repository: str, source_path: str) -> str:
    return str(uuid.uuid5(PAGE_NAMESPACE, f"{repository}:{source_path}"))


def _review_metrics(result, low_confidence: float, weak_fraction_threshold: float) -> dict:
    scores = [block.confidence for block in result.blocks]
    mean = result.mean_confidence
    weak_count = sum(score < low_confidence for score in scores)
    weak_fraction = (weak_count / len(scores)) if scores else 1.0
    reason = None
    if not result.normalized_text.strip():
        reason = "empty_text"
    elif mean is None or mean < low_confidence:
        reason = "low_mean_confidence"
    elif weak_fraction >= weak_fraction_threshold:
        reason = "many_low_confidence_blocks"
    return {
        "mean_confidence": None if mean is None else round(mean * 100, 2),
        "min_confidence": None if result.min_confidence is None else round(result.min_confidence * 100, 2),
        "block_count": len(scores),
        "weak_block_count": weak_count,
        "weak_block_fraction": round(weak_fraction, 6),
        "needs_review": reason is not None,
        "review_reason": reason,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract one bounded textbook OCR batch from the pinned corpus inventory.")
    parser.add_argument("--inventory", type=Path, default=Path("data/content-corpus/inventory.jsonl"))
    parser.add_argument("--config", type=Path, default=Path("tools/local-content-prep/CORPUS_BATCH.json"))
    parser.add_argument("--output-root", type=Path, default=Path("data/content-corpus/textbooks"))
    args = parser.parse_args()

    config = _load_json(args.config)
    if config.get("stage") != "textbook_ocr":
        raise ValueError("CORPUS_BATCH.json stage must be textbook_ocr")
    if config.get("provider") != "paddleocr-local":
        raise ValueError("this extractor currently supports provider=paddleocr-local only")

    class_slug = str(config["class_slug"])
    subject_title = str(config["subject_title"])
    subject_slug = str(config["subject_slug"])
    batch_index = int(config["batch_index"])
    batch_size = int(config["batch_size"])
    low_confidence = float(config.get("low_confidence_threshold", 0.80))
    weak_fraction_threshold = float(config.get("weak_block_fraction_threshold", 0.10))
    if batch_index < 0 or batch_size < 1:
        raise ValueError("batch_index must be >= 0 and batch_size must be >= 1")

    candidates = [
        record
        for record in _load_inventory(args.inventory)
        if record.get("class_slug") == class_slug
        and record.get("subject_title") == subject_title
        and record.get("content_kind") == "textbook"
    ]
    candidates.sort(key=_source_sort_key)
    if not candidates:
        raise RuntimeError(f"no textbook pages found for {class_slug}/{subject_title}")

    start = batch_index * batch_size
    selected = candidates[start : start + batch_size]
    if not selected:
        raise RuntimeError(f"batch {batch_index} starts beyond {len(candidates)} available pages")

    adapter = PaddleOcrAdapter(language="ar", profile_key="arabic-document-v1")
    subject_root = args.output_root / class_slug / subject_slug
    pages_root = subject_root / "pages"
    batches_root = subject_root / "batches"
    pages_root.mkdir(parents=True, exist_ok=True)
    batches_root.mkdir(parents=True, exist_ok=True)

    processed = resumed = failed = 0
    batch_page_files: list[str] = []

    with tempfile.TemporaryDirectory(prefix="alwaslh-corpus-ocr-") as temp_name:
        temp_root = Path(temp_name)
        for offset, source in enumerate(selected):
            sequence = start + offset + 1
            output_path = pages_root / f"{sequence:04d}.json"
            source_repository = str(source["source_repository"])
            source_commit = str(source["source_commit"])
            source_path = str(source["source_path"])
            source_blob = str(source["source_git_blob_sha1"])
            identity = {
                "page_id": _stable_page_id(source_repository, source_path),
                "source_sequence": sequence,
                "page_hint": source.get("page_hint"),
                "class_slug": class_slug,
                "subject_slug": subject_slug,
                "subject_title": subject_title,
            }

            if output_path.exists():
                existing = _load_json(output_path)
                extraction = existing.get("extraction") or {}
                if (
                    existing.get("source", {}).get("git_blob_sha1") == source_blob
                    and extraction.get("provider") == adapter.provider_key
                    and extraction.get("provider_version") == adapter.provider_version
                    and extraction.get("profile") == adapter.profile_key
                    and extraction.get("extraction_version") == EXTRACTION_VERSION
                ):
                    resumed += 1
                    batch_page_files.append(output_path.as_posix())
                    continue

            suffix = str(source.get("extension") or Path(source_path).suffix or ".img")
            downloaded = temp_root / f"{sequence:04d}{suffix}"
            ocr_input = temp_root / f"{sequence:04d}.png"
            try:
                data = _download(_raw_url(source_repository, source_commit, source_path))
                if len(data) != int(source["byte_size"]):
                    raise ValueError(f"downloaded byte size mismatch for {source_path}")
                if _git_blob_sha1(data) != source_blob:
                    raise ValueError(f"git blob checksum mismatch for {source_path}")
                atomic_write_bytes(downloaded, data)
                write_lossless_ocr_input(downloaded, ocr_input)
                result = adapter.extract(ocr_input)
                metrics = _review_metrics(result, low_confidence, weak_fraction_threshold)
                payload = {
                    "schema_version": 1,
                    "identity": identity,
                    "source": {
                        "repository": source_repository,
                        "commit": source_commit,
                        "path": source_path,
                        "git_blob_sha1": source_blob,
                        "filename": source.get("filename"),
                        "source_group": source.get("source_group"),
                        "byte_size": source.get("byte_size"),
                    },
                    "extraction": {
                        "status": "completed",
                        "provider": adapter.provider_key,
                        "provider_version": adapter.provider_version,
                        "profile": adapter.profile_key,
                        "language": adapter.language,
                        "extraction_version": EXTRACTION_VERSION,
                        **metrics,
                    },
                    "content": {
                        "raw_text": result.raw_text,
                        "normalized_text": result.normalized_text,
                        "blocks": [
                            {"text": block.text, "confidence": round(block.confidence * 100, 2)}
                            for block in result.blocks
                        ],
                    },
                }
                atomic_write_json(output_path, payload)
                processed += 1
            except Exception as exc:
                payload = {
                    "schema_version": 1,
                    "identity": identity,
                    "source": {
                        "repository": source_repository,
                        "commit": source_commit,
                        "path": source_path,
                        "git_blob_sha1": source_blob,
                        "filename": source.get("filename"),
                        "source_group": source.get("source_group"),
                        "byte_size": source.get("byte_size"),
                    },
                    "extraction": {
                        "status": "failed",
                        "provider": adapter.provider_key,
                        "provider_version": adapter.provider_version,
                        "profile": adapter.profile_key,
                        "language": adapter.language,
                        "extraction_version": EXTRACTION_VERSION,
                        "needs_review": True,
                        "review_reason": "extraction_error",
                        "error_type": type(exc).__name__,
                        "error": str(exc),
                    },
                    "content": {"raw_text": "", "normalized_text": "", "blocks": []},
                }
                atomic_write_json(output_path, payload)
                failed += 1
            finally:
                downloaded.unlink(missing_ok=True)
                ocr_input.unlink(missing_ok=True)
            batch_page_files.append(output_path.as_posix())

    page_files = sorted(pages_root.glob("*.json"))
    page_records = [_load_json(path) for path in page_files]
    pages_jsonl = "".join(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n" for record in page_records)
    (subject_root / "pages.jsonl").write_text(pages_jsonl, encoding="utf-8")

    completed_count = sum(record.get("extraction", {}).get("status") == "completed" for record in page_records)
    failed_count = sum(record.get("extraction", {}).get("status") == "failed" for record in page_records)
    review_count = sum(bool(record.get("extraction", {}).get("needs_review")) for record in page_records)
    status = {
        "schema_version": 1,
        "class_slug": class_slug,
        "subject_slug": subject_slug,
        "subject_title": subject_title,
        "document_kind": "textbook",
        "total_source_pages": len(candidates),
        "stored_page_records": len(page_records),
        "completed_extractions": completed_count,
        "failed_extractions": failed_count,
        "needs_review": review_count,
        "next_batch_index": batch_index + 1,
        "batch_size": batch_size,
        "provider": adapter.provider_key,
        "provider_version": adapter.provider_version,
        "profile": adapter.profile_key,
    }
    atomic_write_json(subject_root / "status.json", status)
    atomic_write_json(
        batches_root / f"batch-{batch_index:04d}.json",
        {
            "schema_version": 1,
            "batch_index": batch_index,
            "batch_size": batch_size,
            "source_start": start + 1,
            "source_end": start + len(selected),
            "processed": processed,
            "resumed": resumed,
            "failed": failed,
            "page_files": batch_page_files,
            "status_after_batch": status,
        },
    )
    print(json.dumps(status, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
