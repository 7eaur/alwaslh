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
    assert sha256_file(source) == before
    with Image.open(tmp_path / "image.webp") as display:
        assert display.size == (640, 900)


def test_optional_max_edge_downscales_without_upscaling(tmp_path: Path) -> None:
    source = tmp_path / "page.png"
    Image.new("RGB", (1000, 500), "white").save(source)
    result = optimize_for_display(source, tmp_path / "small.webp", max_edge=400)
    assert (result.width, result.height) == (400, 200)
