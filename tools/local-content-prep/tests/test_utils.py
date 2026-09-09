from alwaslh_content_prep.utils import natural_key, stable_page_id


def test_natural_sort_supports_western_and_arabic_indic_digits() -> None:
    names = ["10.jpg", "٢.jpg", "١.jpg", "20.jpg", "3.jpg"]
    assert sorted(names, key=natural_key) == ["١.jpg", "٢.jpg", "3.jpg", "10.jpg", "20.jpg"]


def test_page_id_is_stable_and_semantic() -> None:
    first = stable_page_id("collection", "g12", "physics", "motion", 1)
    assert first == stable_page_id("collection", "g12", "physics", "motion", 1)
    assert first != stable_page_id("collection", "g12", "physics", "motion", 2)
