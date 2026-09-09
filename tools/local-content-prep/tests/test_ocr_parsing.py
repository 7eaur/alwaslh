from alwaslh_content_prep.ocr import _blocks_from_legacy, _blocks_from_v3


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
