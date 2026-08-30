import importlib.util
import pathlib
import unittest

MODULE_PATH = pathlib.Path(__file__).parents[1] / "tooling" / "alwaslh_go_inventory.py"
SPEC = importlib.util.spec_from_file_location("alwaslh_go_inventory", MODULE_PATH)
assert SPEC and SPEC.loader
inventory = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(inventory)


class FilenameParsingTests(unittest.TestCase):
    def test_arabic_book_and_preliminary_pages(self):
        preliminary = inventory.parse_image_filename("تمهيدي003 - النشيد الوطني.webp")
        self.assertEqual(preliminary["family"], "preliminary")
        self.assertEqual(preliminary["number"], 3)
        self.assertEqual(preliminary["titleHint"], "النشيد الوطني")

        page = inventory.parse_image_filename("ص225 - المصطلحات العلمية.webp")
        self.assertEqual(page["family"], "book_page")
        self.assertEqual(page["number"], 225)

    def test_english_pdf_and_exam_families(self):
        self.assertEqual(inventory.parse_image_filename("front001 - Front Cover.jpg")["family"], "front")
        self.assertEqual(inventory.parse_image_filename("p012 - Shapes and materials.jpg")["number"], 12)
        self.assertEqual(inventory.parse_image_filename("PDF003 - مقدمة.webp")["family"], "pdf")
        self.assertEqual(inventory.parse_image_filename("صفحة_124.jpg")["number"], 124)

    def test_unknown_filename_is_not_silently_ordered(self):
        self.assertIsNone(inventory.parse_image_filename("scan-final.jpg"))


class DocumentClassificationTests(unittest.TestCase):
    def test_textbook_is_not_given_exam_metadata(self):
        result = inventory.classify_document("كتاب الفيزياء", "physics")
        self.assertEqual(result["kind"], "textbook")
        self.assertIsNone(result["hijriYear"])
        self.assertIsNone(result["examTrack"])

    def test_exam_year_and_math_track_are_explicit(self):
        calculus = inventory.classify_document("التفاضل والتكامل نماذج وزاريه 1447", "mathematics")
        self.assertEqual(calculus["kind"], "government_exam")
        self.assertEqual(calculus["hijriYear"], 1447)
        self.assertEqual(calculus["examTrack"], "calculus")

        algebra = inventory.classify_document("الجبر والهندسه نماذج وزاريه 1446", "mathematics")
        self.assertEqual(algebra["examTrack"], "algebra_geometry")

    def test_source_title_cleanup_does_not_infer_lessons(self):
        self.assertEqual(inventory.clean_document_title("01_الانجليزي_ثالث_ثانوي"), "الانجليزي ثالث ثانوي")
        self.assertEqual(inventory.clean_document_title("_رياضيات_تاسع_الجزء_الأول"), "رياضيات تاسع الجزء الأول")


class OrderingTests(unittest.TestCase):
    @staticmethod
    def issues():
        return {
            "sourceRevisionErrors": [],
            "unmappedImages": [],
            "unparsedAssets": [],
            "manifestErrors": [],
            "orderErrors": [],
            "classificationErrors": [],
            "expectedCountErrors": [],
            "otherFiles": [],
            "duplicateBlobGroups": [],
        }

    @staticmethod
    def image(path, sha):
        filename = pathlib.PurePosixPath(path).name
        extension = pathlib.PurePosixPath(path).suffix.lower()
        return {
            "path": path,
            "filename": filename,
            "extension": extension,
            "sha": sha,
            "size": 100,
        }

    def test_numeric_order_beats_lexicographic_order(self):
        issues = self.issues()
        images = [
            self.image("exam/صفحة_10.jpg", "a" * 40),
            self.image("exam/صفحة_2.jpg", "b" * 40),
            self.image("exam/صفحة_1.jpg", "c" * 40),
        ]
        # 1,2,10 is numerically ordered, but the missing 3..9 range is still reported.
        ordered = inventory.order_without_manifest("exam", images, issues)
        self.assertEqual([item["parsed"]["number"] for item in ordered], [1, 2, 10])
        self.assertEqual(len(issues["orderErrors"]), 1)
        self.assertEqual(issues["orderErrors"][0]["problem"], "numeric gaps")

    def test_mixed_preliminary_and_book_page_family_is_deterministic(self):
        issues = self.issues()
        images = [
            self.image("book/ص003 - بداية.webp", "d" * 40),
            self.image("book/تمهيدي02 - عنوان.webp", "e" * 40),
            self.image("book/تمهيدي01 - غلاف.webp", "f" * 40),
            self.image("book/ص004 - تابع.webp", "1" * 40),
        ]
        ordered = inventory.order_without_manifest("book", images, issues)
        self.assertEqual(
            [(item["parsed"]["family"], item["parsed"]["number"]) for item in ordered],
            [("preliminary", 1), ("preliminary", 2), ("book_page", 3), ("book_page", 4)],
        )
        self.assertEqual(issues["orderErrors"], [])


if __name__ == "__main__":
    unittest.main()
