import importlib.util
import pathlib
import unittest

TOOLING = pathlib.Path(__file__).parents[1] / "tooling"
MODULE_PATH = TOOLING / "alwaslh_go_manifest_compat.py"
SPEC = importlib.util.spec_from_file_location("alwaslh_go_manifest_compat", MODULE_PATH)
assert SPEC and SPEC.loader
compat = importlib.util.module_from_spec(SPEC)
import sys
sys.path.insert(0, str(TOOLING))
SPEC.loader.exec_module(compat)


class ManifestCompatibilityTests(unittest.TestCase):
    def test_filename_pdf_page_schema_is_normalized(self):
        normalized = compat.normalize_manifest_entry(
            {
                "pdf_page": 5,
                "book_page": 4,
                "filename": "ص004 - تصدير.jpg",
                "title": "تصدير",
                "width": 2008,
                "height": 2835,
                "bytes": 429560,
            }
        )
        self.assertIsNotNone(normalized)
        assert normalized is not None
        self.assertEqual(normalized["seq"], 5)
        self.assertEqual(normalized["relative_path"], "الصور/ص004 - تصدير.jpg")
        self.assertEqual(normalized["metadata"]["book_page"], 4)
        self.assertEqual(normalized["metadata"]["schema"], "filename_pdf_page_manifest")

    def test_existing_manifest_variants_remain_supported(self):
        canonical = compat.normalize_manifest_entry({"seq": 1, "relative_path": "الصور/ص001.jpg"})
        arabic = compat.normalize_manifest_entry({"م": 1, "اسم الصورة": "PDF001 - غلاف.webp"})
        self.assertEqual(canonical["seq"], 1)
        self.assertEqual(arabic["relative_path"], "الصور/PDF001 - غلاف.webp")


if __name__ == "__main__":
    unittest.main()
