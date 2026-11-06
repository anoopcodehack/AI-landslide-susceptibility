"""Validation and integration tests for the geospatial module.

Run with:  python -m pytest tests/test_ingest.py  (from geospatial_module/)
  or:      python tests/test_ingest.py             (standalone)
"""

import os
import sys
import pathlib

# Ensure the geospatial_module/src is importable
_THIS_DIR = pathlib.Path(__file__).resolve().parent
_GEO_SRC = _THIS_DIR.parent / "src"
if str(_GEO_SRC) not in sys.path:
    sys.path.insert(0, str(_GEO_SRC))

from ingest import (
    download_dem,
    download_sentinel,
    download_rainfall,
    reproject_raster,
    generate_modeling_matrix,
    validate_matrix,
    integrate_with_main_project,
)

try:
    import pytest

    @pytest.fixture
    def tmp_dir(tmp_path: pathlib.Path) -> pathlib.Path:
        """Pytest fixture providing a temporary pathlib.Path directory."""
        return tmp_path
except ImportError:
    pass


def test_download_dem(tmp_dir: pathlib.Path) -> None:
    """DEM placeholder is created and is a valid file."""
    out = tmp_dir / "dem.tif"
    download_dem(out)
    assert out.exists(), "DEM placeholder not created"
    assert out.stat().st_size > 0, "DEM placeholder is empty (should have TIFF header)"
    print("  PASS: download_dem")


def test_download_sentinel(tmp_dir: pathlib.Path) -> None:
    """Sentinel-2 NDVI placeholder is created."""
    out_dir = tmp_dir / "sentinel"
    download_sentinel(out_dir)
    ndvi = out_dir / "ndvi_placeholder.tif"
    assert ndvi.exists(), "NDVI placeholder not created"
    print("  PASS: download_sentinel")


def test_download_rainfall(tmp_dir: pathlib.Path) -> None:
    """Rainfall placeholder is created."""
    out = tmp_dir / "rainfall.tif"
    download_rainfall(out)
    assert out.exists(), "Rainfall placeholder not created"
    print("  PASS: download_rainfall")


def test_reproject_raster(tmp_dir: pathlib.Path) -> None:
    """Reprojection stub copies source to destination."""
    src = tmp_dir / "input.tif"
    src.write_bytes(b"FAKE_RASTER_DATA")
    dst = tmp_dir / "reprojected.tif"
    reproject_raster(src, dst)
    assert dst.exists(), "Reprojected raster not created"
    assert dst.read_bytes() == b"FAKE_RASTER_DATA", "Reprojected content mismatch"
    print("  PASS: reproject_raster")


def test_generate_modeling_matrix(tmp_dir: pathlib.Path) -> None:
    """Matrix generation produces a valid CSV with correct structure."""
    out = tmp_dir / "modeling_matrix.csv"
    generate_modeling_matrix(out, n_samples=100, random_seed=42)
    assert out.exists(), "Matrix CSV not created"

    with open(out, "r") as f:
        lines = f.readlines()

    assert len(lines) == 101, f"Expected 101 lines (header + 100 rows), got {len(lines)}"

    header = lines[0].strip().split(",")
    expected = ["latitude", "longitude", "slope", "elevation", "rainfall", "soil", "ndvi", "landslide_label"]
    assert header == expected, f"Header mismatch: {header}"

    # Check a sample row has 8 numeric fields
    fields = lines[1].strip().split(",")
    assert len(fields) == 8, f"Expected 8 fields, got {len(fields)}"

    # All fields should be parseable as float
    for field in fields:
        float(field)

    print("  PASS: generate_modeling_matrix")


def test_validate_matrix(tmp_dir: pathlib.Path) -> None:
    """Validation passes on a correctly generated matrix."""
    out = tmp_dir / "valid_matrix.csv"
    generate_modeling_matrix(out, n_samples=50, random_seed=99)
    result = validate_matrix(out)
    assert result is True, "Validation should return True for valid data"
    print("  PASS: validate_matrix")


def test_validate_matrix_bad_header(tmp_dir: pathlib.Path) -> None:
    """Validation fails on bad header."""
    bad = tmp_dir / "bad_header.csv"
    with open(bad, "w") as f:
        f.write("col_a,col_b\n1,2\n")
    try:
        validate_matrix(bad)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Unexpected header" in str(e)
    print("  PASS: validate_matrix (bad header)")


def test_validate_matrix_bad_range(tmp_dir: pathlib.Path) -> None:
    """Validation fails when values are out of geotechnical range."""
    bad = tmp_dir / "bad_range.csv"
    with open(bad, "w") as f:
        f.write("latitude,longitude,slope,elevation,rainfall,soil,ndvi,landslide_label\n")
        f.write("99.0,76.0,25.0,1000.0,200.0,0.5,0.5,1\n")  # lat 99 is invalid
    try:
        validate_matrix(bad)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "latitude" in str(e).lower()
    print("  PASS: validate_matrix (bad range)")


def test_integration(tmp_dir: pathlib.Path) -> None:
    """Integration copies the CSV to the target data directory."""
    csv_path = tmp_dir / "integration_test.csv"
    generate_modeling_matrix(csv_path, n_samples=20, random_seed=7)

    target_dir = tmp_dir / "mock_processed"
    integrated_file = integrate_with_main_project(csv_path, target_dir=target_dir)

    assert integrated_file.exists(), f"Integration failed -- {integrated_file} does not exist"
    assert csv_path.read_text() == integrated_file.read_text(), "Integrated file content mismatch"
    print("  PASS: integrate_with_main_project")


def run_all_tests() -> None:
    """Run all tests with a temporary directory."""
    import tempfile

    print("=" * 60)
    print("  GeoShield Geospatial Module -- Test Suite")
    print("=" * 60)

    with tempfile.TemporaryDirectory() as td:
        tmp = pathlib.Path(td)

        tests = [
            test_download_dem,
            test_download_sentinel,
            test_download_rainfall,
            test_reproject_raster,
            test_generate_modeling_matrix,
            test_validate_matrix,
            test_validate_matrix_bad_header,
            test_validate_matrix_bad_range,
            test_integration,
        ]

        passed = 0
        failed = 0
        for test_fn in tests:
            try:
                test_fn(tmp)
                passed += 1
            except Exception as e:
                print(f"  FAIL: {test_fn.__name__} -- {e}")
                failed += 1

    print()
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    if failed > 0:
        print("SOME TESTS FAILED!")
        sys.exit(1)
    else:
        print("ALL TESTS PASSED!")


if __name__ == "__main__":
    run_all_tests()
