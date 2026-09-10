from __future__ import annotations

import argparse
import json
import re
import urllib.request
from collections import defaultdict
from pathlib import Path, PurePosixPath

SUPPORTED_IMAGES = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}
ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")


def _github_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "alwaslh-content-corpus-inventory/1",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def _tracked_blobs(repository: str, commit: str) -> list[tuple[str, str, int]]:
    commit_payload = _github_json(f"https://api.github.com/repos/{repository}/git/commits/{commit}")
    tree_sha = commit_payload["tree"]["sha"]
    tree_payload = _github_json(f"https://api.github.com/repos/{repository}/git/trees/{tree_sha}?recursive=1")
    if tree_payload.get("truncated"):
        raise RuntimeError("GitHub recursive tree response was truncated; inventory cannot be trusted")
    rows: list[tuple[str, str, int]] = []
    for entry in tree_payload.get("tree", []):
        if entry.get("type") != "blob":
            continue
        path = entry.get("path")
        sha = entry.get("sha")
        size = entry.get("size")
        if not isinstance(path, str) or not isinstance(sha, str) or not isinstance(size, int):
            continue
        rows.append((path, sha, size))
    return rows


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
    # Content kind is a property of the source directory, not the page title.
    # Textbook page filenames can legitimately contain words such as "نموذج".
    directory_text = "/".join(parts[:-1]).lower()
    if "وزار" in directory_text or "نموذج" in directory_text or "exam" in directory_text:
        return "government_exam"
    return "textbook"


def _class_and_subject(top: str) -> tuple[str, str, str]:
    grade12_suffixes = (" ثالث ثانوي", " ثالثة ثانوي", " الثالث الثانوي")
    for suffix in grade12_suffixes:
        if top.endswith(suffix):
            subject = top[: -len(suffix)].strip() or top
            return "grade-12", "الثالث الثانوي", subject

    grade9_prefixes = ("تاسع ", "التاسع ")
    for prefix in grade9_prefixes:
        if top.startswith(prefix):
            subject = top[len(prefix) :].strip() or top
            return "grade-9", "التاسع", subject

    if top.endswith(" تاسع"):
        subject = top[: -len(" تاسع")].strip() or top
        return "grade-9", "التاسع", subject

    return "unclassified", "غير مصنف", top


def main() -> int:
    parser = argparse.ArgumentParser(description="Inventory alwaslh-go images via GitHub tree metadata; no image download.")
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--source-repository", default="7eaur/alwaslh-go")
    parser.add_argument("--source-commit", required=True)
    args = parser.parse_args()

    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    records: list[dict[str, object]] = []
    summary: dict[tuple[str, str, str, str], dict[str, int]] = defaultdict(lambda: {"images": 0, "bytes": 0})

    for relative, blob_sha, byte_size in sorted(
        _tracked_blobs(args.source_repository, args.source_commit), key=lambda row: row[0]
    ):
        posix = PurePosixPath(relative)
        if posix.suffix.lower() not in SUPPORTED_IMAGES:
            continue
        parts = posix.parts
        if not parts:
            continue
        class_slug, class_title, subject_title = _class_and_subject(parts[0])
        content_kind = _kind(parts)
        source_group = "/".join(parts[1:-1])
        record = {
            "schema_version": 1,
            "source_repository": args.source_repository,
            "source_commit": args.source_commit,
            "source_path": relative,
            "source_git_blob_sha1": blob_sha,
            "filename": posix.name,
            "extension": posix.suffix.lower(),
            "byte_size": byte_size,
            "class_slug": class_slug,
            "class_title": class_title,
            "subject_title": subject_title,
            "source_group": source_group,
            "content_kind": content_kind,
            "page_hint": _page_hint(posix.name),
        }
        records.append(record)
        key = (class_slug, class_title, subject_title, content_kind)
        summary[key]["images"] += 1
        summary[key]["bytes"] += byte_size

    if not records:
        raise RuntimeError("inventory contained no supported images")

    (output_dir / "inventory.jsonl").write_text(
        "".join(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n" for record in records),
        encoding="utf-8",
    )
    groups = [
        {
            "class_slug": class_slug,
            "class_title": class_title,
            "subject_title": subject,
            "content_kind": kind,
            "image_count": values["images"],
            "byte_size": values["bytes"],
        }
        for (class_slug, class_title, subject, kind), values in sorted(summary.items())
    ]
    unclassified_count = sum(
        int(group["image_count"]) for group in groups if group["class_slug"] == "unclassified"
    )
    payload = {
        "schema_version": 1,
        "source_repository": args.source_repository,
        "source_commit": args.source_commit,
        "image_count": len(records),
        "byte_size": sum(int(record["byte_size"]) for record in records),
        "unclassified_image_count": unclassified_count,
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
        f"Unclassified: **{unclassified_count}**\n",
        "| Class | Subject | Kind | Images | Bytes |\n",
        "| --- | --- | --- | ---: | ---: |\n",
    ]
    for group in groups:
        lines.append(
            f"| {group['class_slug']} | {group['subject_title']} | {group['content_kind']} | {group['image_count']} | {group['byte_size']} |\n"
        )
    (output_dir / "INVENTORY.md").write_text("".join(lines), encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
