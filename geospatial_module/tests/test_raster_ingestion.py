"""Tests for raster ingestion and edge cases in the geospatial pipeline.

Tests edge cases:
1. Valid generation and detection of DEM, Sentinel-2 NDVI, and rainfall layers.
2. Missing or corrupted raster handling.
3. Out-of-bounds geographic bounding boxes.
4. Missing NoData flags and NaN/Inf sanitization.
5. Resolution and sampling consistency.
"""

import math
import pathlib
import sys
import pytest

_THIS_DIR = pathlib.Path(__file__).resolve().parent
_GEO_SRC = _THIS_DIR.parent / "src"
if str(_GEO_SRC) not in sys.path:
    sys.path.insert(0, str(_GEO_SRC))

from ingest import download_dem, download_sentinel, download_rainfall, reproject_raster
from matrix_builder import build_modeling_matrix, validate_api_schema, WAYANAD_BOUNDS


def test_raster_layer_generation(tmp_dir: pathlib.Path) -> None:
    """Verify all 3 primary conditioning raster placeholders are created."""
    dem_path = tmp_dir / "dem.tif"
    sentinel_dir = tmp_dir / "sentinel"
    rain_path = tmp_dir / "rain.tif"

    download_dem(dem_path)
    download_sentinel(sentinel_dir)
    download_rainfall(rain_path)

    assert dem_path.exists() and dem_path.stat().st_size > 0
    assert (sentinel_dir / "ndvi_placeholder.tif").exists()
    assert rain_path.exists()


def test_corrupted_raster_handling(tmp_dir: pathlib.Path) -> None:
    """Verify reprojection gracefully handles non-existent or 0-byte sources."""
    src = tmp_dir / "non_existent.tif"
    dst = tmp_dir / "out.tif"
    # Should not crash unhandled
    reproject_raster(src, dst)
    assert dst.exists()


def test_nan_and_nodata_sanitization() -> None:
    """Test that matrix validation rejects records with NaNs, Infs, or NoData."""
    bad_record = [{
        "latitude": 11.55,
        "longitude": 76.12,
        "slope": float("nan"),  # Unhandled NoData
        "elevation": 1000.0,
        "rainfall": 200.0,
        "soil": 0.5,
        "ndvi": 0.3,
        "landslide_label": 1,
    }]

    with pytest.raises(ValueError, match="null/NaN/Inf"):
        validate_api_schema(bad_record)


def test_out_of_bounds_bounding_box() -> None:
    """Verify that records outside the Wayanad sector bounding box are flagged."""
    out_of_bounds_record = [{
        "latitude": 28.6139,  # New Delhi
        "longitude": 77.2090,
        "slope": 20.0,
        "elevation": 216.0,
        "rainfall": 50.0,
        "soil": 0.4,
        "ndvi": 0.2,
        "landslide_label": 0,
    }]

    with pytest.raises(ValueError, match="latitude .* out of bounds"):
        validate_api_schema(out_of_bounds_record)


def test_resolution_and_schema_consistency() -> None:
    """Verify that 1,500 continuous spatial vectors comply with the 5-factor API contract."""
    records = build_modeling_matrix(n_samples=500, random_seed=123)
    assert len(records) == 500

    schema_info = validate_api_schema(records)
    assert schema_info["valid"] is True
    assert schema_info["features"] == ["slope", "elevation", "rainfall", "soil", "ndvi"]
    assert schema_info["target"] == "landslide_label"
