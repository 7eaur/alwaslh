from __future__ import annotations

import mimetypes
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps

from .utils import atomic_write_bytes, sha256_bytes

DISPLAY_PROFILE = "localprep-webp-v2"


@dataclass(frozen=True)
class OptimizedImage:
    width: int
    height: int
    source_width: int
    source_height: int
    byte_size: int
    checksum_sha256: str
    encoding_strategy: str
    mime_type: str = "image/webp"


def source_mime_type(path: Path) -> str:
    guessed, _ = mimetypes.guess_type(path.name)
    if guessed in {"image/jpeg", "image/png", "image/webp", "image/tiff", "image/bmp"}:
        return guessed
    return "application/octet-stream"


def _oriented_image(source: Path, *, max_pixels: int) -> Image.Image:
    image = Image.open(source)
    image.load()
    image = ImageOps.exif_transpose(image)
    width, height = image.size
    if width <= 0 or height <= 0 or width * height > max_pixels:
        image.close()
        raise ValueError(f"image dimensions are unsafe: {width}x{height} ({source})")
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    return image


def _source_webp_is_safe_to_preserve(source: Path, *, max_edge: int | None) -> bool:
    if source_mime_type(source) != "image/webp":
        return False
    try:
        with Image.open(source) as original:
            if original.format != "WEBP":
                return False
            width, height = original.size
            if max_edge is not None and max_edge > 0 and max(width, height) > max_edge:
                return False
            orientation = original.getexif().get(274, 1)
            return orientation in (None, 1)
    except (OSError, ValueError):
        return False


def optimize_for_display(
    source: Path,
    destination: Path,
    *,
    quality: int = 82,
    max_edge: int | None = None,
    max_pixels: int = 100_000_000,
) -> OptimizedImage:
    if not 1 <= quality <= 100:
        raise ValueError("quality must be between 1 and 100")
    image = _oriented_image(source, max_pixels=max_pixels)
    try:
        source_width, source_height = image.size
        if max_edge is not None and max_edge > 0 and max(image.size) > max_edge:
            ratio = max_edge / max(image.size)
            target = (max(1, round(image.width * ratio)), max(1, round(image.height * ratio)))
            resized = image.resize(target, Image.Resampling.LANCZOS)
            image.close()
            image = resized
        width, height = image.size

        from io import BytesIO

        buffer = BytesIO()
        image.save(buffer, format="WEBP", quality=quality, method=6, exact=True)
        encoded = buffer.getvalue()
        strategy = "webp-reencoded"
        data = encoded

        # Existing Alwaslh book pages are often already optimized WebP. Re-encoding
        # a lossy WebP can increase size while introducing another generation of
        # loss. Preserve the original bytes when no resize/orientation correction
        # is required and the candidate is not strictly smaller.
        if _source_webp_is_safe_to_preserve(source, max_edge=max_edge):
            original = source.read_bytes()
            if len(encoded) >= len(original):
                data = original
                strategy = "source-webp-preserved"

        atomic_write_bytes(destination, data)
        return OptimizedImage(
            width=width,
            height=height,
            source_width=source_width,
            source_height=source_height,
            byte_size=len(data),
            checksum_sha256=sha256_bytes(data),
            encoding_strategy=strategy,
        )
    finally:
        image.close()


def write_lossless_ocr_input(source: Path, destination: Path, *, max_pixels: int = 100_000_000) -> Path:
    """Write an orientation-corrected PNG for OCR; never OCR the lossy display variant."""
    image = _oriented_image(source, max_pixels=max_pixels)
    try:
        from io import BytesIO

        buffer = BytesIO()
        image.save(buffer, format="PNG", optimize=False)
        atomic_write_bytes(destination, buffer.getvalue())
        return destination
    finally:
        image.close()
