#!/usr/bin/env python3
"""Render machine-readable and human-readable Stage 9 source inventory audit reports.

This tool is intentionally read-only with respect to the database/importer. It consumes
an already-generated canonical inventory JSON and summarizes naming families, expected
vs observed counts, duplicate/order/manifest/helper mismatches, and per-document facts.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path, PurePosixPath
from typing import Any

RECOGNIZED_HELPERS = {
    "manifest.json",
    "دليل_الصور_صفحة_بصفحة.txt",
    "دليل_الصور_صفحة_بصفحة.xlsx",
    "تقرير_المعالجة.json",
}


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError("inventory must be a JSON object")
    return value


def helper_candidates(inventory: dict[str, Any]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for entry in inventory.get("issues", {}).get("otherFiles", []):
        if not isinstance(entry, dict):
            continue
        path = str(entry.get("path", ""))
        name = PurePosixPath(path).name
        lower = name.casefold()
        looks_helper = (
            lower.endswith((".json", ".txt", ".xlsx", ".xls", ".csv"))
            or "دليل" in name
            or "تقرير" in name
            or "manifest" in lower
        )
        if looks_helper and name not in RECOGNIZED_HELPERS:
            result.append({"path": path, "basename": name})
    return sorted(result, key=lambda item: item["path"])


def build_audit(inventory: dict[str, Any], expected: dict[str, Any]) -> dict[str, Any]:
    naming = Counter()
    documents: list[dict[str, Any]] = []
    helper_names = Counter()

    for document in inventory.get("documents", []):
        if not isinstance(document, dict):
            continue
        document_naming = Counter()
        assets = document.get("assets", [])
        for asset in assets:
            if not isinstance(asset, dict):
                continue
            family = str(asset.get("namingFamily", "unknown"))
            naming[family] += 1
            document_naming[family] += 1
        helpers = [str(path) for path in document.get("helperFiles", [])]
        for path in helpers:
            helper_names[PurePosixPath(path).name] += 1
        documents.append(
            {
                "sourcePath": document.get("sourcePath"),
                "kind": document.get("kind"),
                "hijriYear": document.get("hijriYear"),
                "examTrack": document.get("examTrack"),
                "assetCount": len(assets),
                "helperCount": len(helpers),
                "helperFiles": helpers,
                "namingFamilies": dict(sorted(document_naming.items())),
            }
        )

    issues = inventory.get("issues", {})
    mismatch_keys = [
        "sourceRevisionErrors",
        "unmappedImages",
        "unparsedAssets",
        "manifestErrors",
        "orderErrors",
        "classificationErrors",
        "expectedCountErrors",
    ]
    issue_counts = {key: len(issues.get(key, [])) for key in sorted(issues)}
    observed = inventory.get("summary", {})

    expected_summary = expected.get("expected", {})
    expected_vs_observed = {
        "subjectRoots": {"expected": expected_summary.get("subjectRoots"), "observed": observed.get("subjectRoots")},
        "documents": {"expected": expected_summary.get("documents"), "observed": observed.get("documents")},
        "images": {"expected": expected_summary.get("images"), "observed": observed.get("images")},
        "helperFiles": {"expected": expected_summary.get("helperFiles"), "observed": observed.get("helperFiles")},
        "extensions": {"expected": expected_summary.get("extensions", {}), "observed": observed.get("extensions", {})},
    }

    return {
        "schemaVersion": 1,
        "auditType": "alwaslh-go-full-inventory",
        "source": inventory.get("source"),
        "manifestSha256": inventory.get("manifestSha256"),
        "status": "PASS" if all(issue_counts.get(key, 0) == 0 for key in mismatch_keys) else "FAIL",
        "expectedVsObserved": expected_vs_observed,
        "namingPatterns": dict(sorted(naming.items())),
        "helperPatterns": dict(sorted(helper_names.items())),
        "helperMismatches": helper_candidates(inventory),
        "issueCounts": issue_counts,
        "issues": {
            "missingOrExpectedCount": issues.get("expectedCountErrors", []),
            "duplicates": issues.get("duplicateBlobGroups", []),
            "order": issues.get("orderErrors", []),
            "manifest": issues.get("manifestErrors", []),
            "unparsedNaming": issues.get("unparsedAssets", []),
            "unmappedImages": issues.get("unmappedImages", []),
            "classification": issues.get("classificationErrors", []),
            "sourceRevision": issues.get("sourceRevisionErrors", []),
        },
        "summary": observed,
        "documents": documents,
    }


def md_table(rows: list[list[Any]], headers: list[str]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    for row in rows:
        lines.append("| " + " | ".join(str(value).replace("|", "\\|") for value in row) + " |")
    return "\n".join(lines)


def render_markdown(audit: dict[str, Any]) -> str:
    observed = audit["summary"]
    expected = audit["expectedVsObserved"]
    lines = [
        "# Stage 9 — Full `alwaslh-go` Inventory Audit",
        "",
        f"- Status: **{audit['status']}**",
        f"- Source: `{audit['source']['repository']}@{audit['source']['revision']}`",
        f"- Canonical inventory SHA-256: `{audit['manifestSha256']}`",
        "",
        "## Expected vs observed",
        "",
        md_table(
            [[key, value.get('expected'), value.get('observed')] for key, value in expected.items() if key != 'extensions'],
            ["Metric", "Expected", "Observed"],
        ),
        "",
        f"Extensions expected: `{expected['extensions']['expected']}`",
        f"Extensions observed: `{expected['extensions']['observed']}`",
        "",
        "## Naming patterns",
        "",
        md_table([[name, count] for name, count in audit["namingPatterns"].items()], ["Family", "Assets"]),
        "",
        "## Helper patterns",
        "",
        md_table([[name, count] for name, count in audit["helperPatterns"].items()], ["Helper basename", "Files"]),
        "",
        "## Integrity findings",
        "",
        md_table([[name, count] for name, count in audit["issueCounts"].items()], ["Issue kind", "Count"]),
        "",
        f"Duplicate blob groups: **{observed.get('duplicateBlobGroups', 0)}** (reported, not automatically fatal).",
        f"Potential helper-name mismatches: **{len(audit['helperMismatches'])}**.",
        "",
    ]

    if audit["helperMismatches"]:
        lines += ["### Helper mismatches", ""]
        lines += [f"- `{item['path']}`" for item in audit["helperMismatches"]]
        lines.append("")

    for title, key in [
        ("Missing / expected-count mismatches", "missingOrExpectedCount"),
        ("Order mismatches", "order"),
        ("Manifest/helper reference mismatches", "manifest"),
        ("Unparsed naming", "unparsedNaming"),
        ("Unmapped images", "unmappedImages"),
        ("Classification mismatches", "classification"),
        ("Source revision mismatches", "sourceRevision"),
    ]:
        values = audit["issues"][key]
        lines += [f"### {title}", ""]
        if not values:
            lines += ["None.", ""]
        else:
            lines += [f"- `{json.dumps(value, ensure_ascii=False, sort_keys=True)}`" for value in values]
            lines.append("")

    lines += ["## Per-document inventory", ""]
    lines.append(
        md_table(
            [
                [
                    item["sourcePath"],
                    item["kind"],
                    item["assetCount"],
                    item["helperCount"],
                    json.dumps(item["namingFamilies"], ensure_ascii=False, sort_keys=True),
                ]
                for item in audit["documents"]
            ],
            ["Source document", "Kind", "Assets", "Helpers", "Naming families"],
        )
    )
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", required=True, type=Path)
    parser.add_argument("--source-map", required=True, type=Path)
    parser.add_argument("--json", required=True, type=Path)
    parser.add_argument("--markdown", required=True, type=Path)
    args = parser.parse_args()

    inventory = load_json(args.inventory)
    source_map = load_json(args.source_map)
    audit = build_audit(inventory, source_map)
    args.json.parent.mkdir(parents=True, exist_ok=True)
    args.markdown.parent.mkdir(parents=True, exist_ok=True)
    args.json.write_text(json.dumps(audit, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    args.markdown.write_text(render_markdown(audit), encoding="utf-8")
    print(json.dumps({"status": audit["status"], "manifestSha256": audit["manifestSha256"], "issueCounts": audit["issueCounts"]}, ensure_ascii=False, sort_keys=True, indent=2))
    return 0 if audit["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
