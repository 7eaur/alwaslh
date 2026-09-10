from __future__ import annotations

import argparse
import json
import re
import subprocess
from collections import defaultdict
from pathlib import Path

SUPPORTED_IMAGES = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}
ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")


def _git_blob_map(repo: Path) -> dict[str, str]:
    result = subprocess.run(
        ["git", "-C", str(repo), "ls-files", "-s", "-z"],
        check=True,
        capture_output=True,
    ).stdout.decode("utf-8", errors="strict")
    mapping: dict[str, str] = {}
    for entry in result.split("\0"):
        if not entry:
            continue
        meta, path = entry.split("\t", 1)
        _mode, sha, _stage = meta.split(" ", 2)
        mapping[path] = sha
    return mapping


def _page_hint(filename: str) -> int | None:
    normalized = filename.translate(ARABIC_DIGITS)
    patterns = [
        r"(?:^|[^A-Za-z])ص\s*0*(\d+)",
        r"صفحة[_\s-]*0*(\d+)",
        r"page[_\s-]*0*(\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, normalized, flags=re.IGNORECASE)
        if match:
            return int(match.group(1))
    return None


def _kind(parts: tuple[str, ...]) -> str:
    joined = "/".join(parts).lower()
    if "وزار" in joined or "نموذج" in joined or "exam" in joined:
        return "government_exam"
    return "textbook"


def _subject_from_top(top: str) -> str:
    suffixes = (" ثالث ثانوي", " ثالثة ثانوي", " الثالث الثانوي")
    for suffix in suffixes:
        if top.endswith(suffix):
            value = top[: -len(suffix)].strip()
            return value or top
    return top


def main() -> int:
    parser = argparse.ArgumentParser(description="Inventory real alwaslh-go image corpus without OCR.")
    parser.add_argument("source_root", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--source-repository", default="7eaur/alwaslh-go")
    parser.add_argument("--source-commit", required=True)
    args = parser.parse_args()

    source_root = args.source_root.resolve()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    blob_map = _git_blob_map(source_root)

    records: list[dict[str, object]] = []
    summary: dict[tuple[str, str], dict[str, int]] = defaultdict(lambda: {"images": 0, "bytes": 0})

    for path in sorted(source_root.rglob("*"), key=lambda p: p.as_posix()):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED_IMAGES:
            continue
        relative = path.relative_to(source_root).as_posix()
        parts = tuple(Path(relative).parts)
        if not parts:
            continue
        top = parts[0]
        subject_title = _subject_from_top(top)
        content_kind = _kind(parts)
        source_group = "/".join(parts[1:-1])
        byte_size = path.stat().st_size
        blob_sha = blob_map.get(relative)
        if not blob_sha:
            raise RuntimeError(f"missing git blob SHA for tracked image: {relative}")

        record = {
            "schema_version": 1,
            "source_repository": args.source_repository,
            "source_commit": args.source_commit,
            "source_path": relative,
            "source_git_blob_sha1": blob_sha,
            "filename": path.name,
            "extension": path.suffix.lower(),
            "byte_size": byte_size,
            "class_slug": "grade-12",
            "class_title": "الثالث الثانوي",
            "subject_title": subject_title,
            "source_group": source_group,
            "content_kind": content_kind,
            "page_hint": _page_hint(path.name),
        }
        records.append(record)
        key = (subject_title, content_kind)
        summary[key]["images"] += 1
        summary[key]["bytes"] += byte_size

    if not records:
        raise RuntimeError("inventory contained no supported images")

    jsonl_path = output_dir / "inventory.jsonl"
    jsonl_path.write_text(
        "".join(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n" for record in records),
        encoding="utf-8",
    )

    groups = [
        {
            "subject_title": subject,
            "content_kind": kind,
            "image_count": values["images"],
            "byte_size": values["bytes"],
        }
        for (subject, kind), values in sorted(summary.items())
    ]
    payload = {
        "schema_version": 1,
        "source_repository": args.source_repository,
        "source_commit": args.source_commit,
        "image_count": len(records),
        "byte_size": sum(int(record["byte_size"]) for record in records),
        "groups": groups,
        "inventory_jsonl": "inventory.jsonl",
    }
    (output_dir / "inventory.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    lines = [
        "# Content Corpus Inventory\n",
        f"Source: `{args.source_repository}@{args.source_commit}`\n",
        f"Images: **{len(records)}**\n",
        "| Subject | Kind | Images | Bytes |\n",
        "| --- | --- | ---: | ---: |\n",
    ]
    for group in groups:
        lines.append(
            f"| {group['subject_title']} | {group['content_kind']} | {group['image_count']} | {group['byte_size']} |\n"
        )
    (output_dir / "INVENTORY.md").write_text("".join(lines), encoding="utf-8")

    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
