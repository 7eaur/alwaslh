#!/usr/bin/env python3
from __future__ import annotations

import json
import struct
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "packages" / "brand"

EXPECTED = [
    "BRAND_GUIDELINES.md",
    "BRAND_STAGE_DOD.md",
    "brand-assets.json",
    "identity.json",
    "src/tokens.css",
    "src/tokens.ts",
    "assets/logo/logo-mark.svg",
    "assets/logo/logo-mark-white.svg",
    "assets/logo/logo-mark-monochrome.svg",
    "assets/logo/logo-primary.svg",
    "assets/logo/logo-horizontal.svg",
    "assets/logo/logo-horizontal-white.svg",
    "assets/app-icons/favicon.svg",
    "assets/app-icons/icon-192.png",
    "assets/app-icons/icon-512.png",
    "assets/app-icons/icon-maskable.svg",
    "assets/app-icons/icon-maskable-512.png",
]

REQUIRED_COLORS = {
    "primary": "#00B5A9",
    "primaryDark": "#007F78",
    "ink": "#123C43",
    "mint": "#E6F7F6",
    "surface": "#F2F4F7",
    "charcoal": "#1F2937",
}


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def png_size(path: Path) -> tuple[int, int]:
    raw = path.read_bytes()
    if len(raw) < 24 or raw[:8] != b"\x89PNG\r\n\x1a\n":
        fail(f"{path} is not a valid PNG")
    return struct.unpack(">II", raw[16:24])


def main() -> None:
    print("[Stage 2] Brand CLI verification")

    for rel in EXPECTED:
        path = BRAND / rel
        if not path.is_file() or path.stat().st_size == 0:
            fail(f"missing/empty required asset: {rel}")

    for path in list((BRAND / "assets" / "logo").glob("*.svg")) + list((BRAND / "assets" / "app-icons").glob("*.svg")):
        try:
            root = ET.parse(path).getroot()
        except ET.ParseError as exc:
            fail(f"invalid SVG XML {path.relative_to(ROOT)}: {exc}")
        if not root.tag.endswith("svg"):
            fail(f"unexpected SVG root: {path.relative_to(ROOT)}")

    expected_png = {
        BRAND / "assets/app-icons/icon-192.png": (192, 192),
        BRAND / "assets/app-icons/icon-512.png": (512, 512),
        BRAND / "assets/app-icons/icon-maskable-512.png": (512, 512),
    }
    for path, expected in expected_png.items():
        actual = png_size(path)
        if actual != expected:
            fail(f"{path.relative_to(ROOT)} dimensions {actual}, expected {expected}")

    identity = json.loads((BRAND / "identity.json").read_text(encoding="utf-8"))
    assets = json.loads((BRAND / "brand-assets.json").read_text(encoding="utf-8"))
    if identity.get("name") != "الوسيلة الذكية" or assets.get("brand") != "الوسيلة الذكية":
        fail("canonical Arabic brand name mismatch")
    if identity.get("tagline") != "الوسيلة التفاعلية الأولى في اليمن":
        fail("canonical tagline mismatch")
    for key, value in REQUIRED_COLORS.items():
        if identity.get("colors", {}).get(key) != value:
            fail(f"identity color mismatch: {key}")
    if identity.get("typography", {}).get("primaryArabic") != "Cairo":
        fail("Cairo must remain the primary Arabic typeface")

    token_text = (BRAND / "src/tokens.css").read_text(encoding="utf-8")
    for value in REQUIRED_COLORS.values():
        if value.lower() not in token_text.lower():
            fail(f"brand token missing color {value}")
    for required in ["prefers-reduced-motion", ":focus-visible", "--touch-target-min", "[data-theme=\"dark\"]"]:
        if required not in token_text:
            fail(f"accessibility/theme token contract missing: {required}")

    # Canonical production identity must not regress to template/remote branding.
    scan_files = [
        BRAND / "BRAND_GUIDELINES.md",
        BRAND / "src/tokens.css",
        BRAND / "src/tokens.ts",
        *list((BRAND / "assets" / "logo").glob("*.svg")),
        *list((BRAND / "assets" / "app-icons").glob("*.svg")),
    ]
    forbidden = ["miaoda-conversation-file", "TailAdmin"]
    for path in scan_files:
        text = path.read_text(encoding="utf-8")
        for term in forbidden:
            if term in text and path.name != "BRAND_GUIDELINES.md":
                fail(f"forbidden template/remote brand reference {term!r} in {path.relative_to(ROOT)}")

    print("PASS: Stage 2 brand assets, SVGs, PNG sizes, identity JSON, tokens and canonical references")


if __name__ == "__main__":
    main()
