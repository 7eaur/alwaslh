#!/usr/bin/env python3
"""Build a deterministic inventory for the pinned 7eaur/alwaslh-go source repository.

Only Git tree metadata and small manifest blobs are read. Curriculum image bytes are
not materialized during Stage 9 inventory verification.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import posixpath
import re
import subprocess
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path, PurePosixPath
from typing import Any

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".webp", ".png"}
HELPER_BASENAMES = {
    "manifest.json",
    "دليل_الصور_صفحة_بصفحة.txt",
    "دليل_الصور_صفحة_بصفحة.xlsx",
    "تقرير_المعالجة.json",
}
MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".png": "image/png",
}

FAMILY_PATTERNS: tuple[tuple[str, int, re.Pattern[str]], ...] = (
    ("preliminary", 0, re.compile(r"^تمهيدي\s*([0-9]+)(?:\s*-\s*(.*))?$", re.IGNORECASE)),
    ("front", 1, re.compile(r"^front\s*([0-9]+)(?:\s*-\s*(.*))?$", re.IGNORECASE)),
    ("pdf", 2, re.compile(r"^PDF\s*([0-9]+)(?:\s*-\s*(.*))?$", re.IGNORECASE)),
    ("book_page", 3, re.compile(r"^ص\s*([0-9]+)(?:\s*-\s*(.*))?$", re.IGNORECASE)),
    ("english_page", 4, re.compile(r"^p\s*([0-9]+)(?:\s*-\s*(.*))?$", re.IGNORECASE)),
    ("exam_page", 5, re.compile(r"^صفحة[_\s-]*([0-9]+)(?:\s*-\s*(.*))?$", re.IGNORECASE)),
)


def nfc(value: str) -> str:
    return unicodedata.normalize("NFC", value)


def normalize_source_path(value: str) -> str:
    return nfc(value.replace("\\", "/")).strip("/")


def parse_image_filename(filename: str) -> dict[str, Any] | None:
    stem = PurePosixPath(nfc(filename)).stem
    for family, rank, pattern in FAMILY_PATTERNS:
        match = pattern.fullmatch(stem)
        if match:
            return {
                "family": family,
                "familyRank": rank,
                "number": int(match.group(1)),
                "titleHint": (match.group(2) or "").strip() or None,
            }
    return None


def clean_document_title(unit_name: str) -> str:
    title = nfc(unit_name).replace("_", " ").strip()
    title = re.sub(r"^[_\s-]+", "", title)
    title = re.sub(r"^[0-9]+[\s_-]*", "", title)
    title = re.sub(r"\s+", " ", title).strip()
    return title or nfc(unit_name).strip()


def classify_document(unit_name: str, subject_slug: str) -> dict[str, Any]:
    normalized = nfc(unit_name)
    is_exam = "نماذج" in normalized and ("وزاري" in normalized or "وزارية" in normalized)
    year_match = re.search(r"(?<![0-9])(14[0-9]{2})(?![0-9])", normalized)
    hijri_year = int(year_match.group(1)) if year_match else None
    exam_track: str | None = None
    if is_exam and subject_slug == "mathematics":
        if "التفاضل" in normalized or "التكامل" in normalized:
            exam_track = "calculus"
        elif "الجبر" in normalized or "الهندس" in normalized:
            exam_track = "algebra_geometry"
    return {
        "kind": "government_exam" if is_exam else "textbook",
        "hijriYear": hijri_year if is_exam else None,
        "examTrack": exam_track if is_exam else None,
        "title": clean_document_title(unit_name),
    }


def document_sort_key(document: dict[str, Any]) -> tuple[Any, ...]:
    if document["kind"] == "textbook":
        return (0, nfc(document["title"]).casefold(), nfc(document["sourcePath"]).casefold())
    track_rank = {None: 0, "calculus": 1, "algebra_geometry": 2}.get(document.get("examTrack"), 9)
    return (
        1,
        track_rank,
        document.get("hijriYear") or 9999,
        nfc(document["title"]).casefold(),
        nfc(document["sourcePath"]).casefold(),
    )


def run_git(repo: Path, args: list[str]) -> bytes:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        stderr = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"git {' '.join(args)} failed: {stderr}")
    return result.stdout


def git_head(repo: Path) -> str:
    return run_git(repo, ["rev-parse", "HEAD"]).decode("ascii").strip().lower()


def git_tree_blobs(repo: Path, revision: str) -> list[dict[str, Any]]:
    raw = run_git(repo, ["ls-tree", "-r", "-l", "-z", revision])
    blobs: list[dict[str, Any]] = []
    for record in raw.split(b"\0"):
        if not record:
            continue
        left, path_raw = record.split(b"\t", 1)
        mode, object_type, object_sha, size_raw = left.decode("ascii").split()
        if object_type != "blob":
            continue
        path = normalize_source_path(path_raw.decode("utf-8", errors="strict"))
        blobs.append(
            {
                "mode": mode,
                "sha": object_sha.lower(),
                "size": int(size_raw),
                "path": path,
                "filename": PurePosixPath(path).name,
                "extension": PurePosixPath(path).suffix.lower(),
            }
        )
    blobs.sort(key=lambda item: item["path"])
    return blobs


def read_git_blob(repo: Path, sha: str) -> bytes:
    return run_git(repo, ["cat-file", "-p", sha])


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return payload


def add_issue(issues: dict[str, list[Any]], kind: str, payload: Any) -> None:
    issues[kind].append(payload)


def resolve_manifest_path(manifest_path: str, relative_path: str) -> str:
    parent = posixpath.dirname(manifest_path)
    resolved = posixpath.normpath(posixpath.join(parent, normalize_source_path(relative_path)))
    return normalize_source_path(resolved)


def normalize_manifest_entry(entry: dict[str, Any]) -> dict[str, Any] | None:
    """Normalize both real manifest schemas found in the pinned source tree."""
    seq = entry.get("seq")
    relative_path = entry.get("relative_path")
    if isinstance(seq, int) and seq > 0 and isinstance(relative_path, str) and relative_path.strip():
        return {
            "seq": seq,
            "relative_path": relative_path,
            "new_name": entry.get("new_name"),
            "metadata": {
                key: entry.get(key)
                for key in ("seq", "source_page", "book_page", "section", "title", "original_name", "new_name")
                if key in entry
            },
        }

    arabic_seq = entry.get("م")
    image_name = entry.get("اسم الصورة")
    if isinstance(arabic_seq, int) and arabic_seq > 0 and isinstance(image_name, str) and image_name.strip():
        return {
            "seq": arabic_seq,
            "relative_path": f"الصور/{image_name}",
            "new_name": image_name,
            "metadata": {
                "seq": arabic_seq,
                "source_page": entry.get("رقم صفحة PDF"),
                "book_page": entry.get("رقم الصفحة في الكتاب"),
                "title": entry.get("عنوان الدرس/الصفحة"),
                "new_name": image_name,
                "width": entry.get("العرض"),
                "height": entry.get("الارتفاع"),
                "source_size_kb": entry.get("حجم المصدر KB"),
                "image_size_kb": entry.get("حجم الصورة KB"),
                "savings_percent": entry.get("التوفير %"),
                "schema": "arabic_processing_manifest",
            },
        }
    return None


def order_with_manifest(
    repo: Path,
    document_path: str,
    images: list[dict[str, Any]],
    manifest_blob: dict[str, Any],
    issues: dict[str, list[Any]],
) -> list[dict[str, Any]]:
    try:
        manifest = json.loads(read_git_blob(repo, manifest_blob["sha"]).decode("utf-8"))
    except Exception as error:
        add_issue(
            issues,
            "manifestErrors",
            {"document": document_path, "manifest": manifest_blob["path"], "problem": f"invalid JSON: {error}"},
        )
        return order_without_manifest(document_path, images, issues)

    if not isinstance(manifest, list):
        add_issue(
            issues,
            "manifestErrors",
            {"document": document_path, "manifest": manifest_blob["path"], "problem": "manifest root must be an array"},
        )
        return order_without_manifest(document_path, images, issues)

    image_by_path = {item["path"]: item for item in images}
    seen_paths: set[str] = set()
    seen_seq: set[int] = set()
    ordered: list[dict[str, Any]] = []

    for raw_entry in manifest:
        if not isinstance(raw_entry, dict):
            add_issue(issues, "manifestErrors", {"document": document_path, "problem": "manifest entry is not an object"})
            continue
        entry = normalize_manifest_entry(raw_entry)
        if entry is None:
            add_issue(
                issues,
                "manifestErrors",
                {"document": document_path, "entry": raw_entry, "problem": "unsupported manifest entry schema"},
            )
            continue
        seq = entry["seq"]
        if seq in seen_seq:
            add_issue(issues, "manifestErrors", {"document": document_path, "seq": seq, "problem": "duplicate seq"})
            continue
        seen_seq.add(seq)
        resolved = resolve_manifest_path(manifest_blob["path"], entry["relative_path"])
        image = image_by_path.get(resolved)
        if image is None:
            add_issue(
                issues,
                "manifestErrors",
                {"document": document_path, "seq": seq, "path": resolved, "problem": "manifest image does not exist"},
            )
            continue
        if resolved in seen_paths:
            add_issue(
                issues,
                "manifestErrors",
                {"document": document_path, "seq": seq, "path": resolved, "problem": "image referenced more than once"},
            )
            continue
        seen_paths.add(resolved)

        new_name = entry.get("new_name")
        if isinstance(new_name, str) and new_name and nfc(new_name) != nfc(image["filename"]):
            add_issue(
                issues,
                "manifestErrors",
                {
                    "document": document_path,
                    "seq": seq,
                    "path": resolved,
                    "problem": "manifest image name does not match basename",
                    "newName": new_name,
                    "filename": image["filename"],
                },
            )

        parsed = parse_image_filename(image["filename"])
        if parsed is None:
            add_issue(issues, "unparsedAssets", {"document": document_path, "path": image["path"]})
            parsed = {"family": "unparsed", "familyRank": 99, "number": seq, "titleHint": None}
        item = dict(image)
        item["parsed"] = parsed
        item["sourceOrder"] = seq - 1
        item["manifestMetadata"] = entry["metadata"]
        ordered.append(item)

    expected_seq = list(range(1, len(manifest) + 1))
    if sorted(seen_seq) != expected_seq:
        add_issue(
            issues,
            "manifestErrors",
            {"document": document_path, "problem": "manifest seq is not contiguous from 1", "observed": sorted(seen_seq)},
        )
    missing_from_manifest = sorted(set(image_by_path) - seen_paths)
    if missing_from_manifest:
        add_issue(
            issues,
            "manifestErrors",
            {"document": document_path, "problem": "source images missing from manifest", "paths": missing_from_manifest},
        )
    ordered.sort(key=lambda item: (item["sourceOrder"], item["path"]))
    return ordered


def order_without_manifest(
    document_path: str,
    images: list[dict[str, Any]],
    issues: dict[str, list[Any]],
) -> list[dict[str, Any]]:
    prepared: list[dict[str, Any]] = []
    family_numbers: dict[str, list[int]] = defaultdict(list)
    for image in images:
        parsed = parse_image_filename(image["filename"])
        if parsed is None:
            add_issue(issues, "unparsedAssets", {"document": document_path, "path": image["path"]})
            parsed = {"family": "unparsed", "familyRank": 99, "number": 0, "titleHint": None}
        else:
            family_numbers[parsed["family"]].append(parsed["number"])
        item = dict(image)
        item["parsed"] = parsed
        item["manifestMetadata"] = None
        prepared.append(item)

    for family, numbers in sorted(family_numbers.items()):
        counts = Counter(numbers)
        duplicates = sorted(number for number, count in counts.items() if count > 1)
        if duplicates:
            add_issue(
                issues,
                "orderErrors",
                {"document": document_path, "family": family, "problem": "duplicate source numbers", "numbers": duplicates},
            )
        unique_numbers = sorted(counts)
        if unique_numbers:
            expected = set(range(unique_numbers[0], unique_numbers[-1] + 1))
            gaps = sorted(expected - set(unique_numbers))
            if gaps:
                add_issue(
                    issues,
                    "orderErrors",
                    {"document": document_path, "family": family, "problem": "numeric gaps", "numbers": gaps},
                )

    prepared.sort(
        key=lambda item: (
            item["parsed"]["familyRank"],
            item["parsed"]["number"],
            nfc(item["path"]).casefold(),
        )
    )
    for position, item in enumerate(prepared):
        item["sourceOrder"] = position
    return prepared


def public_asset(item: dict[str, Any]) -> dict[str, Any]:
    metadata: dict[str, Any] = {}
    if item.get("manifestMetadata") is not None:
        metadata["manifest"] = item["manifestMetadata"]
    parsed = item["parsed"]
    extension = item["extension"]
    return {
        "sourcePath": item["path"],
        "filename": item["filename"],
        "extension": extension,
        "mimeType": MIME_TYPES[extension],
        "byteSize": item["size"],
        "sourceGitBlobSha1": item["sha"],
        "namingFamily": parsed["family"],
        "sourceNumber": parsed["number"],
        "sourceOrder": item["sourceOrder"],
        "titleHint": parsed["titleHint"],
        "sourceMetadata": metadata,
    }


def canonical_bytes(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def build_inventory(repo: Path, config: dict[str, Any]) -> tuple[dict[str, Any], bool]:
    revision = git_head(repo)
    configured_revision = str(config.get("sourceRevision", "")).lower()
    issues: dict[str, list[Any]] = {
        "sourceRevisionErrors": [],
        "unmappedImages": [],
        "unparsedAssets": [],
        "manifestErrors": [],
        "orderErrors": [],
        "classificationErrors": [],
        "expectedCountErrors": [],
        "otherFiles": [],
        "duplicateBlobGroups": [],
    }
    if revision != configured_revision:
        add_issue(issues, "sourceRevisionErrors", {"expected": configured_revision, "observed": revision})

    subject_entries = config.get("subjects")
    if not isinstance(subject_entries, list) or not subject_entries:
        raise ValueError("source map requires a non-empty subjects array")
    subjects_by_root: dict[str, dict[str, Any]] = {}
    for subject in subject_entries:
        if not isinstance(subject, dict) or not isinstance(subject.get("sourceRoot"), str):
            raise ValueError("each subject mapping requires sourceRoot")
        root = normalize_source_path(subject["sourceRoot"])
        if root in subjects_by_root:
            raise ValueError(f"duplicate sourceRoot in source map: {root}")
        subjects_by_root[root] = subject

    blobs = git_tree_blobs(repo, revision)
    unit_files: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    subject_image_counts: Counter[str] = Counter()
    extension_counts: Counter[str] = Counter()
    helper_count = 0
    for blob in blobs:
        path = blob["path"]
        parts = path.split("/")
        root = parts[0] if parts else ""
        is_image = blob["extension"] in IMAGE_EXTENSIONS
        if root not in subjects_by_root:
            if is_image:
                add_issue(issues, "unmappedImages", {"path": path})
            continue
        if len(parts) < 2:
            if is_image:
                add_issue(issues, "unmappedImages", {"path": path, "problem": "image has no source-unit directory"})
            continue
        unit_files[(root, parts[1])].append(blob)
        if is_image:
            subject_image_counts[root] += 1
            extension_counts[blob["extension"]] += 1
        elif blob["filename"] in HELPER_BASENAMES:
            helper_count += 1
        else:
            add_issue(issues, "otherFiles", {"path": path})

    documents: list[dict[str, Any]] = []
    for (root, unit), files in sorted(unit_files.items(), key=lambda item: (item[0][0], item[0][1])):
        images = [item for item in files if item["extension"] in IMAGE_EXTENSIONS]
        if not images:
            continue
        helpers = [item for item in files if item["filename"] in HELPER_BASENAMES]
        subject = subjects_by_root[root]
        classification = classify_document(unit, str(subject["subjectSlug"]))
        document_path = f"{root}/{unit}"
        if classification["kind"] == "government_exam" and classification["hijriYear"] is None:
            add_issue(
                issues,
                "classificationErrors",
                {"document": document_path, "problem": "government exam has no parseable Hijri year"},
            )

        manifests = [item for item in helpers if item["filename"] == "manifest.json"]
        if len(manifests) > 1:
            add_issue(
                issues,
                "manifestErrors",
                {"document": document_path, "problem": "multiple manifest.json files", "paths": [x["path"] for x in manifests]},
            )
            ordered = order_without_manifest(document_path, images, issues)
        elif len(manifests) == 1:
            ordered = order_with_manifest(repo, document_path, images, manifests[0], issues)
        else:
            ordered = order_without_manifest(document_path, images, issues)

        documents.append(
            {
                "sourcePath": document_path,
                "classSlug": subject["classSlug"],
                "className": subject["className"],
                "subjectSlug": subject["subjectSlug"],
                "subjectName": subject["subjectName"],
                "kind": classification["kind"],
                "title": classification["title"],
                "hijriYear": classification["hijriYear"],
                "examTrack": classification["examTrack"],
                "position": 0,
                "helperFiles": sorted(item["path"] for item in helpers),
                "sourceMetadata": {"assetParentPaths": sorted({posixpath.dirname(item["path"]) for item in images})},
                "assets": [public_asset(item) for item in ordered],
            }
        )

    grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for document in documents:
        grouped[(document["classSlug"], document["subjectSlug"])].append(document)
    for subject_documents in grouped.values():
        subject_documents.sort(key=document_sort_key)
        for position, document in enumerate(subject_documents):
            document["position"] = position
    subject_order = {subject["sourceRoot"]: index for index, subject in enumerate(subject_entries)}
    documents.sort(
        key=lambda document: (
            subject_order.get(document["sourcePath"].split("/")[0], 999),
            document["position"],
            nfc(document["sourcePath"]).casefold(),
        )
    )

    expected = config.get("expected", {})
    observed_subject_roots = sum(1 for root in subjects_by_root if subject_image_counts[root] > 0)
    image_count = sum(extension_counts.values())
    canonical_asset_count = sum(len(document["assets"]) for document in documents)

    def expect_equal(label: str, observed: Any, expected_value: Any) -> None:
        if expected_value is not None and observed != expected_value:
            add_issue(issues, "expectedCountErrors", {"metric": label, "expected": expected_value, "observed": observed})

    expect_equal("subjectRoots", observed_subject_roots, expected.get("subjectRoots"))
    expect_equal("documents", len(documents), expected.get("documents"))
    expect_equal("images", image_count, expected.get("images"))
    expect_equal("canonicalAssets", canonical_asset_count, image_count)
    expect_equal("helperFiles", helper_count, expected.get("helperFiles"))
    expected_extensions = expected.get("extensions", {})
    if isinstance(expected_extensions, dict):
        for extension, expected_count in sorted(expected_extensions.items()):
            expect_equal(f"extensions.{extension}", extension_counts.get(extension, 0), expected_count)
        unexpected = {k: v for k, v in sorted(extension_counts.items()) if k not in expected_extensions and v > 0}
        if unexpected:
            add_issue(issues, "expectedCountErrors", {"metric": "unexpectedExtensions", "observed": unexpected})

    per_subject: list[dict[str, Any]] = []
    for subject in subject_entries:
        root = subject["sourceRoot"]
        observed = subject_image_counts.get(root, 0)
        expected_images = subject.get("expectedImages")
        if observed != expected_images:
            add_issue(
                issues,
                "expectedCountErrors",
                {"metric": "subjectImages", "sourceRoot": root, "expected": expected_images, "observed": observed},
            )
        per_subject.append(
            {
                "sourceRoot": root,
                "classSlug": subject["classSlug"],
                "subjectSlug": subject["subjectSlug"],
                "expectedImages": expected_images,
                "observedImages": observed,
            }
        )

    blobs_to_paths: dict[str, list[str]] = defaultdict(list)
    for document in documents:
        for asset in document["assets"]:
            blobs_to_paths[asset["sourceGitBlobSha1"]].append(asset["sourcePath"])
    for sha, paths in sorted(blobs_to_paths.items()):
        if len(paths) > 1:
            issues["duplicateBlobGroups"].append({"sourceGitBlobSha1": sha, "paths": sorted(paths)})

    fatal_kinds = (
        "sourceRevisionErrors",
        "unmappedImages",
        "unparsedAssets",
        "manifestErrors",
        "orderErrors",
        "classificationErrors",
        "expectedCountErrors",
    )
    fatal_count = sum(len(issues[kind]) for kind in fatal_kinds)
    summary = {
        "subjectRoots": observed_subject_roots,
        "documents": len(documents),
        "images": image_count,
        "helperFiles": helper_count,
        "extensions": dict(sorted(extension_counts.items())),
        "manifestFiles": sum(
            1 for document in documents for path in document["helperFiles"] if PurePosixPath(path).name == "manifest.json"
        ),
        "duplicateBlobGroups": len(issues["duplicateBlobGroups"]),
        "duplicateBlobAssets": sum(len(group["paths"]) for group in issues["duplicateBlobGroups"]),
        "otherFiles": len(issues["otherFiles"]),
        "fatalIssues": fatal_count,
        "perSubject": per_subject,
    }
    payload = {
        "schemaVersion": 1,
        "source": {"repository": config["sourceRepository"], "revision": revision},
        "summary": summary,
        "issues": issues,
        "documents": documents,
    }
    inventory = dict(payload)
    inventory["manifestSha256"] = hashlib.sha256(canonical_bytes(payload)).hexdigest()
    return inventory, fatal_count == 0


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, sort_keys=True, indent=2)
        handle.write("\n")


def compact_summary(inventory: dict[str, Any]) -> dict[str, Any]:
    return {
        "schemaVersion": inventory["schemaVersion"],
        "source": inventory["source"],
        "manifestSha256": inventory["manifestSha256"],
        "summary": inventory["summary"],
        "issueCounts": {key: len(value) for key, value in sorted(inventory["issues"].items())},
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", required=True, type=Path)
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--summary", type=Path)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    repo = args.repo.resolve()
    if not (repo / ".git").exists():
        print(f"ERROR: {repo} is not a Git checkout", file=sys.stderr)
        return 2
    try:
        inventory, valid = build_inventory(repo, load_json(args.config))
    except Exception as error:
        print(f"ERROR: inventory failed: {error}", file=sys.stderr)
        return 2
    write_json(args.output, inventory)
    summary = compact_summary(inventory)
    if args.summary:
        write_json(args.summary, summary)
    print(json.dumps(summary, ensure_ascii=False, sort_keys=True, indent=2))
    if not valid:
        print("ERROR: Stage 9 inventory contract failed; inspect issues in the generated inventory.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
