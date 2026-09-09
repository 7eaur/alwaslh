from __future__ import annotations

import argparse
import importlib.util
import json
import platform
import sys
from pathlib import Path

from PIL import __version__ as pillow_version

from . import __version__
from .catalog import load_catalog, scan_input_tree, write_draft_catalog
from .ocr import PaddleOcrAdapter
from .pipeline import run_pipeline
from .validate import validate_package


def _workspace(value: str) -> Path:
    return Path(value).expanduser().resolve()


def command_init(args: argparse.Namespace) -> int:
    workspace = _workspace(args.workspace)
    (workspace / "input").mkdir(parents=True, exist_ok=True)
    (workspace / "prepared").mkdir(parents=True, exist_ok=True)
    catalog = workspace / "catalog.json"
    if catalog.exists() and not args.force:
        print(f"catalog already exists: {catalog}")
        return 2
    payload = {
        "schema_version": 1,
        "collection": {"slug": "my-curriculum", "title": "محتوى الوسيلة", "source_label": "local-content-prep"},
        "classes": [
            {
                "slug": "grade-12",
                "title": "الصف الثالث الثانوي",
                "subjects": [
                    {
                        "slug": "physics",
                        "title": "الفيزياء",
                        "lessons": [
                            {
                                "slug": "lesson-01",
                                "title": "اسم الدرس",
                                "position": 0,
                                "source_dir": "grade-12/physics/lesson-01",
                                "document_kind": "textbook",
                            }
                        ],
                    }
                ],
            }
        ],
    }
    write_draft_catalog(catalog, payload)
    print(f"created workspace: {workspace}")
    print(f"edit catalog: {catalog}")
    print(f"put lesson images under: {workspace / 'input' / 'grade-12' / 'physics' / 'lesson-01'}")
    return 0


def command_scan(args: argparse.Namespace) -> int:
    workspace = _workspace(args.workspace)
    input_root = workspace / "input"
    if not input_root.is_dir():
        print(f"input directory does not exist: {input_root}", file=sys.stderr)
        return 2
    payload = scan_input_tree(input_root, collection_slug=args.collection_slug, collection_title=args.collection_title)
    output = workspace / ("catalog.scan.json" if (workspace / "catalog.json").exists() else "catalog.json")
    write_draft_catalog(output, payload)
    print(f"discovered catalog written to: {output}")
    print("review and correct Arabic titles before running prepare.")
    return 0


def command_doctor(args: argparse.Namespace) -> int:
    workspace = _workspace(args.workspace)
    paddleocr = importlib.util.find_spec("paddleocr") is not None
    paddle = importlib.util.find_spec("paddle") is not None
    checks = {
        "tool_version": __version__,
        "python": platform.python_version(),
        "python_supported": sys.version_info >= (3, 11),
        "pillow": pillow_version,
        "paddleocr_installed": paddleocr,
        "paddlepaddle_installed": paddle,
        "workspace": str(workspace),
        "catalog_exists": (workspace / "catalog.json").exists(),
        "input_exists": (workspace / "input").is_dir(),
    }
    print(json.dumps(checks, ensure_ascii=False, indent=2))
    if not checks["python_supported"]:
        return 1
    if not paddleocr or not paddle:
        print("OCR is not ready yet. Image-only preparation can still run with --skip-ocr.")
    return 0


def command_prepare(args: argparse.Namespace) -> int:
    workspace = _workspace(args.workspace)
    catalog = load_catalog(workspace / "catalog.json")
    adapter = None if args.skip_ocr else PaddleOcrAdapter(language=args.ocr_language, profile_key=args.ocr_profile)
    package = run_pipeline(
        workspace=workspace,
        catalog=catalog,
        ocr_adapter=adapter,
        quality=args.quality,
        max_edge=args.max_edge,
        low_confidence=args.low_confidence,
        max_pixels=args.max_pixels,
        force=args.force,
        fail_fast=args.fail_fast,
    )
    print(json.dumps(package, ensure_ascii=False, indent=2))
    print(f"review report: {workspace / 'prepared' / 'reports' / 'review' / 'index.html'}")
    return 1 if package["error_count"] else 0


def command_validate(args: argparse.Namespace) -> int:
    workspace = _workspace(args.workspace)
    errors = validate_package(workspace)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        print(f"validation failed: {len(errors)} issue(s)")
        return 1
    print("package validation: OK")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="alwaslh-content-prep",
        description="Prepare lesson images and Arabic OCR locally without writing to the Alwaslh database.",
    )
    parser.add_argument("--version", action="version", version=__version__)
    sub = parser.add_subparsers(dest="command", required=True)

    init = sub.add_parser("init", help="Create an empty local workspace and catalog template.")
    init.add_argument("workspace")
    init.add_argument("--force", action="store_true")
    init.set_defaults(func=command_init)

    scan = sub.add_parser("scan", help="Generate an editable catalog from input/class/subject/lesson folders.")
    scan.add_argument("workspace")
    scan.add_argument("--collection-slug", default="my-curriculum")
    scan.add_argument("--collection-title", default="محتوى الوسيلة")
    scan.set_defaults(func=command_scan)

    doctor = sub.add_parser("doctor", help="Check local Python/Pillow/PaddleOCR readiness.")
    doctor.add_argument("workspace")
    doctor.set_defaults(func=command_doctor)

    prepare = sub.add_parser("prepare", help="Optimize images, OCR originals, and create an import-ready package.")
    prepare.add_argument("workspace")
    prepare.add_argument("--quality", type=int, default=82, help="WebP display quality; dimensions are preserved by default.")
    prepare.add_argument("--max-edge", type=int, default=None, help="Optional maximum display edge in pixels; omitted preserves dimensions.")
    prepare.add_argument("--max-pixels", type=int, default=100_000_000)
    prepare.add_argument("--low-confidence", type=float, default=0.80, help="Mark OCR below this 0..1 mean confidence for review.")
    prepare.add_argument("--ocr-language", default="ar")
    prepare.add_argument("--ocr-profile", default="arabic-document-v1")
    prepare.add_argument("--skip-ocr", action="store_true", help="Test image packaging without PaddleOCR.")
    prepare.add_argument("--force", action="store_true", help="Reprocess unchanged pages instead of resuming.")
    prepare.add_argument("--fail-fast", action="store_true")
    prepare.set_defaults(func=command_prepare)

    validate = sub.add_parser("validate", help="Verify package checksums, references, image dimensions and ordering.")
    validate.add_argument("workspace")
    validate.set_defaults(func=command_validate)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.func(args))
    except (ValueError, RuntimeError, FileNotFoundError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
