from pathlib import Path

from PIL import Image

from alwaslh_content_prep.images import optimize_for_display
from alwaslh_content_prep.utils import sha256_file


def test_optimization_preserves_dimensions_and_never_mutates_source(tmp_path: Path) -> None:
    source = tmp_path / "page.jpg"
    Image.new("RGB", (640, 900), "white").save(source, quality=95)
    before = sha256_file(source)
    result = optimize_for_display(source, tmp_path / "image.webp", quality=82)
    assert result.source_width == result.width == 640
    assert result.source_height == result.height == 900
    assert result.encoding_strategy == "webp-reencoded"
    assert sha256_file(source) == before
    with Image.open(tmp_path / "image.webp") as display:
        assert display.size == (640, 900)


def test_optional_max_edge_downscales_without_upscaling(tmp_path: Path) -> None:
    source = tmp_path / "page.png"
    Image.new("RGB", (1000, 500), "white").save(source)
    result = optimize_for_display(source, tmp_path / "small.webp", max_edge=400)
    assert (result.width, result.height) == (400, 200)
    assert result.encoding_strategy == "webp-reencoded"


def test_already_smaller_webp_is_preserved_byte_for_byte(tmp_path: Path) -> None:
    source = tmp_path / "already-optimized.webp"
    image = Image.effect_noise((640, 900), 80).convert("RGB")
    image.save(source, format="WEBP", quality=35, method=6)
    before = source.read_bytes()

    destination = tmp_path / "image.webp"
    result = optimize_for_display(source, destination, quality=82)

    assert result.encoding_strategy == "source-webp-preserved"
    assert destination.read_bytes() == before
    assert result.byte_size == len(before)
    assert result.source_width == result.width == 640
    assert result.source_height == result.height == 900


def test_webp_is_reencoded_when_resize_is_requested(tmp_path: Path) -> None:
    source = tmp_path / "large.webp"
    Image.new("RGB", (1000, 500), "white").save(source, format="WEBP", quality=50)

    result = optimize_for_display(source, tmp_path / "small.webp", quality=82, max_edge=400)

    assert result.encoding_strategy == "webp-reencoded"
    assert (result.width, result.height) == (400, 200)
