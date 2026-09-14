#!/usr/bin/env python3
"""Architecture dependency ratchet for the Admin + Backend rebuild.

The guard intentionally does not require legacy debt to disappear in one commit.
It compares imports against the frozen AB-00.2 baseline and rejects *new* debt while
allowing recorded legacy seams to be removed incrementally.
"""

from __future__ import annotations

import argparse
import posixpath
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import PurePosixPath

BASELINE_SHA = "7c4e8cadf3da8cb18c199ac866d5d0a913208088"

ADMIN_SRC = "apps/admin-web/src/"
API_SRC = "apps/api/src/"

LEGACY_API_MODULES = {
    "access",
    "activation",
    "admin-access",
    "admin-operations",
    "ai",
    "auth",
    "content",
    "curriculum",
    "media",
    "notifications",
    "offline",
    "question-bank",
    "quiz-builder",
    "student-assessment",
}

IMPORT_RE = re.compile(
    r"(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:[^;\n]*?\s+from\s+)?[\"']([^\"']+)[\"']",
    re.MULTILINE,
)


@dataclass(frozen=True)
class Violation:
    path: str
    message: str


def run_git(*args: str, check: bool = True) -> str:
    result = subprocess.run(
        ["git", *args],
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if check and result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"git {' '.join(args)} failed")
    return result.stdout


def imports_from(text: str) -> set[str]:
    return set(IMPORT_RE.findall(text))


def baseline_text(path: str) -> str:
    result = subprocess.run(
        ["git", "show", f"{BASELINE_SHA}:{path}"],
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    return result.stdout if result.returncode == 0 else ""


def current_text(path: str) -> str:
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return handle.read()
    except FileNotFoundError:
        return ""


def resolve_relative(source_path: str, specifier: str) -> str | None:
    if not specifier.startswith("."):
        return None
    source_dir = posixpath.dirname(source_path)
    resolved = posixpath.normpath(posixpath.join(source_dir, specifier))
    for suffix in (".tsx", ".ts", ".jsx", ".js"):
        if resolved.endswith(suffix):
            resolved = resolved[: -len(suffix)]
            break
    return resolved


def admin_feature_owner(path: str) -> tuple[str, str] | None:
    rel = path[len(ADMIN_SRC) :] if path.startswith(ADMIN_SRC) else path
    parts = PurePosixPath(rel).parts
    if len(parts) >= 2 and parts[0] in {"admin", "features"}:
        return parts[0], parts[1]
    return None


def backend_module_owner(path: str) -> tuple[str, str] | None:
    if not path.startswith(API_SRC):
        return None
    parts = PurePosixPath(path[len(API_SRC) :]).parts
    if len(parts) >= 2 and parts[0] == "modules":
        return "modules", parts[1]
    if parts and parts[0] in LEGACY_API_MODULES:
        return "legacy", parts[0]
    return None


def is_public_module_import(resolved: str, owner: tuple[str, str]) -> bool:
    kind, module = owner
    prefix = f"{API_SRC}modules/{module}/" if kind == "modules" else f"{API_SRC}{module}/"
    if not resolved.startswith(prefix):
        return False
    rel = resolved[len(prefix) :]
    return rel == "public" or rel.startswith("public/")


def check_admin_import(path: str, specifier: str) -> str | None:
    resolved = resolve_relative(path, specifier)
    if resolved is None:
        return None

    rel = path[len(ADMIN_SRC) :] if path.startswith(ADMIN_SRC) else ""
    if rel.startswith("shared/") and (
        resolved.startswith(f"{ADMIN_SRC}features/") or resolved.startswith(f"{ADMIN_SRC}app/")
    ):
        return f"shared code may not import app/features: {specifier}"

    if rel.startswith("features/") and resolved.startswith(f"{ADMIN_SRC}app/"):
        return f"feature code may not import app internals: {specifier}"

    source_owner = admin_feature_owner(path)
    target_owner = admin_feature_owner(resolved)
    if source_owner and target_owner and source_owner[1] != target_owner[1]:
        # Cross-feature collaboration must go through an explicit public entry point.
        target_rel = resolved.split(f"/{target_owner[0]}/{target_owner[1]}/", 1)[-1]
        if target_rel != "public" and not target_rel.startswith("public/"):
            return (
                f"private cross-feature import {source_owner[1]} -> {target_owner[1]}: {specifier}; "
                "use a public feature contract or app orchestration"
            )
    return None


def check_backend_import(path: str, specifier: str) -> str | None:
    resolved = resolve_relative(path, specifier)
    if resolved is None:
        return None

    source_owner = backend_module_owner(path)
    target_owner = backend_module_owner(resolved)
    if source_owner and resolved.startswith(f"{API_SRC}app/"):
        return f"backend module may not import app composition internals: {specifier}"

    if source_owner and target_owner and source_owner[1] != target_owner[1]:
        if not is_public_module_import(resolved, target_owner):
            return (
                f"private cross-module import {source_owner[1]} -> {target_owner[1]}: {specifier}; "
                "depend on an explicit public application contract"
            )
    return None


def changed_files() -> list[tuple[str, str]]:
    output = run_git(
        "diff",
        "--name-status",
        f"{BASELINE_SHA}..HEAD",
        "--",
        "apps/admin-web/src",
        "apps/api/src",
    )
    items: list[tuple[str, str]] = []
    for raw in output.splitlines():
        if not raw.strip():
            continue
        parts = raw.split("\t")
        status = parts[0]
        # For renames, the destination is the last path.
        path = parts[-1]
        items.append((status, path))
    return items


def validate() -> list[Violation]:
    violations: list[Violation] = []

    # Fail clearly when the frozen baseline is unavailable; the guard depends on
    # a real history comparison rather than silently becoming permissive.
    run_git("cat-file", "-e", f"{BASELINE_SHA}^{{commit}}")

    for status, path in changed_files():
        if status.startswith("D"):
            continue

        if path.startswith(ADMIN_SRC):
            rel = path[len(ADMIN_SRC) :]
            if status.startswith("A") and "/" not in rel and rel.endswith((".ts", ".tsx", ".css")):
                violations.append(
                    Violation(path, "new Admin feature/infrastructure files may not be added directly to src root")
                )

        if not path.endswith((".ts", ".tsx", ".js", ".jsx")):
            continue

        current_imports = imports_from(current_text(path))
        old_imports = imports_from(baseline_text(path))
        added_imports = current_imports - old_imports

        for specifier in sorted(added_imports):
            message = None
            if path.startswith(ADMIN_SRC):
                message = check_admin_import(path, specifier)
            elif path.startswith(API_SRC):
                message = check_backend_import(path, specifier)
            if message:
                violations.append(Violation(path, message))

    return violations


def self_test() -> None:
    assert imports_from('import { x } from "../alpha/service.js";') == {"../alpha/service.js"}
    assert imports_from('export type { X } from "./types";') == {"./types"}

    admin_private = check_admin_import(
        "apps/admin-web/src/features/overview/page.tsx",
        "../operations/internal/model",
    )
    assert admin_private and "private cross-feature" in admin_private

    admin_public = check_admin_import(
        "apps/admin-web/src/features/overview/page.tsx",
        "../operations/public",
    )
    assert admin_public is None

    shared_bad = check_admin_import(
        "apps/admin-web/src/shared/ui/Table.tsx",
        "../../features/questions/model",
    )
    assert shared_bad and "shared code" in shared_bad

    backend_private = check_backend_import(
        "apps/api/src/modules/ai/application/apply.ts",
        "../../question-bank/application/service",
    )
    assert backend_private and "private cross-module" in backend_private

    backend_public = check_backend_import(
        "apps/api/src/modules/ai/application/apply.ts",
        "../../question-bank/public",
    )
    assert backend_public is None

    print("architecture boundary self-test: OK")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()

    if args.check:
        violations = validate()
        if violations:
            print("Architecture boundary violations:", file=sys.stderr)
            for item in violations:
                print(f"- {item.path}: {item.message}", file=sys.stderr)
            return 1
        print(f"architecture boundary guard: OK (baseline {BASELINE_SHA[:12]})")

    if not args.self_test and not args.check:
        parser.error("choose --self-test and/or --check")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
