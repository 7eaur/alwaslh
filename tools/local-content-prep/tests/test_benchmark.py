import json
from pathlib import Path

from alwaslh_content_prep.benchmark import _distance, benchmark_package


def test_edit_distance() -> None:
    assert _distance("كتاب", "كتاب") == 0
    assert _distance("كتاب", "كتتب") == 1
    assert _distance("", "نص") == 2


def test_benchmark_reads_ground_truth_and_writes_reports(tmp_path: Path) -> None:
    prepared = tmp_path / "prepared"
    page_dir = prepared / "content" / "g12" / "physics" / "lesson-01" / "pages" / "0001"
    page_dir.mkdir(parents=True)
    page = {
        "page_id": "p1",
        "identity": {
            "class_title": "الثالث",
            "subject_title": "الفيزياء",
            "lesson_title": "الحركة",
            "page_number": 1,
        },
        "files": {"page_metadata": "content/g12/physics/lesson-01/pages/0001/page.json"},
        "ocr": {"normalized_text": "هذا نص تجربي", "mean_confidence": 93.0},
    }
    (prepared / "pages.jsonl").write_text(json.dumps(page, ensure_ascii=False) + "\n", encoding="utf-8")
    (page_dir / "ground-truth.txt").write_text("هذا نص تجريبي\n", encoding="utf-8")
    summary = benchmark_package(tmp_path)
    assert summary["evaluated_page_count"] == 1
    assert summary["micro_cer"] is not None
    assert summary["micro_cer"] > 0
    assert (prepared / "reports" / "ocr-benchmark.csv").exists()
    assert (prepared / "reports" / "ocr-benchmark.json").exists()
