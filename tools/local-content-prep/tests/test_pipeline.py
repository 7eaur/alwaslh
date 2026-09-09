from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

from alwaslh_content_prep.catalog import load_catalog
from alwaslh_content_prep.models import OcrBlock, OcrResult
from alwaslh_content_prep.pipeline import run_pipeline
from alwaslh_content_prep.validate import validate_package


class FakeOcr:
    provider_key = "fake"
    provider_version = "1"
    profile_key = "test"
    language = "ar"

    def __init__(self, confidence: float = 0.93) -> None:
        self.calls = 0
        self.confidence = confidence

    def extract(self, image_path: Path) -> OcrResult:
        self.calls += 1
        return OcrResult(
            provider_key=self.provider_key,
            provider_version=self.provider_version,
            profile_key=self.profile_key,
            language=self.language,
            blocks=(OcrBlock(text="نص الصفحة", confidence=self.confidence, polygon=[[0, 0], [1, 0], [1, 1], [0, 1]]),),
            raw_text="نص الصفحة",
            normalized_text="نص الصفحة",
            mean_confidence=self.confidence,
            min_confidence=self.confidence,
            raw_provider_payload={"fake": True},
        )


def _workspace(tmp_path: Path):
    workspace = tmp_path / "workspace"
    lesson = workspace / "input" / "grade-12" / "physics" / "lesson-01"
    lesson.mkdir(parents=True)
    Image.new("RGB", (320, 480), "white").save(lesson / "١.jpg")
    Image.new("RGB", (320, 480), "white").save(lesson / "٢.jpg")
    catalog = {
        "schema_version": 1,
        "collection": {"slug": "demo", "title": "تجربة"},
        "classes": [
            {
                "slug": "grade-12",
                "title": "الثالث الثانوي",
                "subjects": [
                    {
                        "slug": "physics",
                        "title": "الفيزياء",
                        "lessons": [
                            {"slug": "lesson-01", "title": "الحركة", "source_dir": "grade-12/physics/lesson-01"}
                        ],
                    }
                ],
            }
        ],
    }
    (workspace / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False), encoding="utf-8")
    return workspace, load_catalog(workspace / "catalog.json")


def test_pipeline_writes_import_ready_package_and_resumes(tmp_path: Path) -> None:
    workspace, catalog = _workspace(tmp_path)
    adapter = FakeOcr()
    first = run_pipeline(workspace=workspace, catalog=catalog, ocr_adapter=adapter)
    assert first["page_count"] == 2
    assert first["processed_page_count"] == 2
    assert adapter.calls == 2
    assert validate_package(workspace) == []

    page_path = workspace / "prepared" / "content" / "grade-12" / "physics" / "lesson-01" / "pages" / "0001" / "page.json"
    page = json.loads(page_path.read_text(encoding="utf-8"))
    assert page["identity"]["page_number"] == 1
    assert page["display"]["preserved_dimensions"] is True
    assert page["ocr"]["normalized_text"] == "نص الصفحة"
    assert page["import_hints"]["lesson_asset"]["publication_status"] == "draft"
    assert len(page["source"]["checksum_sha256"]) == 64
    assert len(page["source"]["git_blob_sha1"]) == 40

    second = run_pipeline(workspace=workspace, catalog=catalog, ocr_adapter=adapter)
    assert second["processed_page_count"] == 0
    assert second["resumed_page_count"] == 2
    assert adapter.calls == 2
    assert validate_package(workspace) == []


def test_low_confidence_is_marked_for_review(tmp_path: Path) -> None:
    workspace, catalog = _workspace(tmp_path)
    run_pipeline(workspace=workspace, catalog=catalog, ocr_adapter=FakeOcr(0.55), low_confidence=0.80)
    page = json.loads((workspace / "prepared" / "pages.jsonl").read_text(encoding="utf-8").splitlines()[0])
    assert page["ocr"]["needs_review"] is True
    assert page["ocr"]["review_reason"] == "low_mean_confidence"


def test_resume_is_invalidated_when_ocr_profile_changes(tmp_path: Path) -> None:
    workspace, catalog = _workspace(tmp_path)
    first = run_pipeline(workspace=workspace, catalog=catalog, ocr_adapter=None)
    assert first["processed_page_count"] == 2

    adapter = FakeOcr()
    second = run_pipeline(workspace=workspace, catalog=catalog, ocr_adapter=adapter)
    assert second["processed_page_count"] == 2
    assert second["resumed_page_count"] == 0
    assert adapter.calls == 2

    third = run_pipeline(workspace=workspace, catalog=catalog, ocr_adapter=adapter)
    assert third["processed_page_count"] == 0
    assert third["resumed_page_count"] == 2
    assert adapter.calls == 2


def test_removed_source_page_is_removed_from_prepared_manifest(tmp_path: Path) -> None:
    workspace, catalog = _workspace(tmp_path)
    adapter = FakeOcr()
    run_pipeline(workspace=workspace, catalog=catalog, ocr_adapter=adapter)
    (workspace / "input" / "grade-12" / "physics" / "lesson-01" / "٢.jpg").unlink()
    package = run_pipeline(workspace=workspace, catalog=catalog, ocr_adapter=adapter)
    assert package["page_count"] == 1
    removed_dir = workspace / "prepared" / "content" / "grade-12" / "physics" / "lesson-01" / "pages" / "0002"
    assert not removed_dir.exists()
    assert validate_package(workspace) == []
