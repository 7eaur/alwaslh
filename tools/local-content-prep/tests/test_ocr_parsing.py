import importlib.metadata
import os
import sys
import types

from alwaslh_content_prep.ocr import PaddleOcrAdapter, _blocks_from_legacy, _blocks_from_v3


def test_v3_result_shape_extracts_text_scores_and_polygons() -> None:
    payload = {
        "res": {
            "rec_texts": ["مرحبا", "العالم"],
            "rec_scores": [0.91, 0.88],
            "rec_polys": [
                [[0, 0], [10, 0], [10, 4], [0, 4]],
                [[0, 5], [10, 5], [10, 9], [0, 9]],
            ],
        }
    }
    blocks = _blocks_from_v3(payload)
    assert [block.text for block in blocks] == ["مرحبا", "العالم"]
    assert blocks[0].confidence == 0.91
    assert blocks[1].polygon == [[0.0, 5.0], [10.0, 5.0], [10.0, 9.0], [0.0, 9.0]]


def test_legacy_result_shape_is_supported() -> None:
    payload = [
        [
            [[[0, 0], [10, 0], [10, 4], [0, 4]], ("نص", 0.95)],
            [[[0, 5], [10, 5], [10, 9], [0, 9]], ("آخر", 0.90)],
        ]
    ]
    blocks = _blocks_from_legacy(payload)
    assert [block.text for block in blocks] == ["نص", "آخر"]


def test_cpu_adapter_disables_unstable_mkldnn_path(monkeypatch) -> None:
    captured: dict[str, object] = {}

    class FakePaddleOCR:
        def __init__(self, **kwargs: object) -> None:
            captured.update(kwargs)

    fake_module = types.ModuleType("paddleocr")
    fake_module.PaddleOCR = FakePaddleOCR  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "paddleocr", fake_module)
    monkeypatch.setattr(importlib.metadata, "version", lambda package: "3.7.0")
    for name in ("PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT", "FLAGS_use_mkldnn", "FLAGS_enable_pir_api"):
        monkeypatch.delenv(name, raising=False)

    PaddleOcrAdapter(language="ar")

    assert captured["enable_mkldnn"] is False
    assert captured["lang"] == "ar"
    assert os.environ["PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT"] == "0"
    assert os.environ["FLAGS_use_mkldnn"] == "0"
    assert os.environ["FLAGS_enable_pir_api"] == "0"
