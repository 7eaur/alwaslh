from __future__ import annotations

import hashlib
import json
import os
import re
import tempfile
import unicodedata
import uuid
from pathlib import Path
from typing import Any, Iterable

PAGE_NAMESPACE = uuid.UUID("5f7c1f70-c539-4d07-ae6e-384904f5d67f")
_DIGIT_TRANSLATION = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")
_NATURAL_PARTS = re.compile(r"(\d+)")


def normalize_digits(value: str) -> str:
    return value.translate(_DIGIT_TRANSLATION)


def natural_key(value: str) -> tuple[object, ...]:
    normalized = unicodedata.normalize("NFKC", normalize_digits(value)).casefold()
    parts = _NATURAL_PARTS.split(normalized)
    return tuple(int(part) if part.isdigit() else part for part in parts)


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while chunk := handle.read(chunk_size):
            digest.update(chunk)
    return digest.hexdigest()


def git_blob_sha1(path: Path, chunk_size: int = 1024 * 1024) -> str:
    size = path.stat().st_size
    digest = hashlib.sha1(usedforsecurity=False)
    digest.update(f"blob {size}\0".encode("ascii"))
    with path.open("rb") as handle:
        while chunk := handle.read(chunk_size):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def stable_page_id(collection_slug: str, class_slug: str, subject_slug: str, lesson_slug: str, page_number: int) -> str:
    identity = ":".join(["alwaslh-local-content-v1", collection_slug, class_slug, subject_slug, lesson_slug, str(page_number)])
    return str(uuid.uuid5(PAGE_NAMESPACE, identity))


def ensure_relative_path(value: str, field_name: str) -> Path:
    path = Path(value)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"{field_name} must be a safe relative path: {value!r}")
    if not path.parts:
        raise ValueError(f"{field_name} cannot be empty")
    return path


def atomic_write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, path)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)


def atomic_write_text(path: Path, text: str) -> None:
    atomic_write_bytes(path, text.encode("utf-8"))


def atomic_write_json(path: Path, payload: Any, *, pretty: bool = True) -> None:
    if pretty:
        text = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    else:
        text = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    atomic_write_text(path, text)


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def json_safe(value: Any, *, depth: int = 0) -> Any:
    if depth > 20:
        return repr(value)
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(key): json_safe(item, depth=depth + 1) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_safe(item, depth=depth + 1) for item in value]
    if hasattr(value, "tolist"):
        try:
            return json_safe(value.tolist(), depth=depth + 1)
        except Exception:
            pass
    if hasattr(value, "json"):
        try:
            candidate = value.json
            if callable(candidate):
                candidate = candidate()
            if isinstance(candidate, str):
                return json.loads(candidate)
            return json_safe(candidate, depth=depth + 1)
        except Exception:
            pass
    if hasattr(value, "__dict__"):
        try:
            return json_safe(vars(value), depth=depth + 1)
        except Exception:
            pass
    return repr(value)


def normalize_ocr_text(lines: Iterable[str]) -> str:
    normalized_lines: list[str] = []
    for line in lines:
        line = unicodedata.normalize("NFKC", str(line).replace("\r", " "))
        line = " ".join(line.split())
        if line:
            normalized_lines.append(line)
    return "\n".join(normalized_lines)
