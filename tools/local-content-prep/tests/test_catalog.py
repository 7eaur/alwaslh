from pathlib import Path

from PIL import Image

from alwaslh_content_prep.catalog import scan_input_tree


def test_scan_builds_deterministic_three_level_catalog(tmp_path: Path) -> None:
    lesson = tmp_path / "input" / "grade-12" / "physics" / "lesson-01"
    lesson.mkdir(parents=True)
    Image.new("RGB", (10, 10), "white").save(lesson / "001.jpg")
    payload = scan_input_tree(tmp_path / "input", collection_slug="test", collection_title="اختبار")
    discovered = payload["classes"][0]["subjects"][0]["lessons"][0]
    assert discovered["source_dir"] == "grade-12/physics/lesson-01"
    assert discovered["position"] == 0
