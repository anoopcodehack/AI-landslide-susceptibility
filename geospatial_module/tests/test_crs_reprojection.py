"""Tests for Coordinate Reference System (CRS) transformations and coordinate ordering.

Tests:
1. Target CRS alignment to EPSG:32643 (UTM 43N).
2. Latitude/Longitude coordinate order verification to prevent Leaflet / Folium flipping errors.
3. Coordinate bounds validation for the Wayanad sector.
"""

import pathlib
import sys
import pytest

_THIS_DIR = pathlib.Path(__file__).resolve().parent
_GEO_SRC = _THIS_DIR.parent / "src"
if str(_GEO_SRC) not in sys.path:
    sys.path.insert(0, str(_GEO_SRC))

from matrix_builder import (
    TARGET_CRS,
    WAYANAD_BOUNDS,
    wgs84_to_utm43n,
    HISTORICAL_LANDSLIDE_INVENTORY,
    build_modeling_matrix,
)


def test_target_crs_definition() -> None:
    """Verify target projection standard is EPSG:32643 (UTM Zone 43N)."""
    assert TARGET_CRS == "EPSG:32643"


def test_wgs84_to_utm43n_projection() -> None:
    """Verify conversion from geographic WGS84 to UTM Zone 43N metric grid."""
    # Test Kalpetta center (~11.605°N, 76.082°E)
    lat, lon = 11.605, 76.082
    easting, northing = wgs84_to_utm43n(lat, lon)

    # In UTM 43N, Wayanad easting is ~600,000m to 650,000m, northing ~1,250,000m to 1,320,000m
    assert 550000.0 < easting < 700000.0, f"Unexpected Easting: {easting}"
    assert 1200000.0 < northing < 1350000.0, f"Unexpected Northing: {northing}"


def test_coordinate_ordering_no_flipping() -> None:
    """Ensure Latitude is strictly in [11.0, 12.5] and Longitude in [75.0, 77.0].

    Guarantees no (lon, lat) vs (lat, lon) inversion that breaks Leaflet or Folium.
    """
    records = build_modeling_matrix(n_samples=100, random_seed=42)

    for r in records:
        lat = r["latitude"]
        lon = r["longitude"]

        # Latitude is around 11°N, Longitude around 76°E
        assert 11.40 <= lat <= 12.00, f"Flipped or invalid latitude: {lat}"
        assert 75.80 <= lon <= 76.45, f"Flipped or invalid longitude: {lon}"

        # If inverted, lat would be ~76 and lon ~11
        assert lat < lon, "Coordinates appear flipped! Longitude should exceed Latitude in Kerala."


def test_historical_inventory_bounds() -> None:
    """Verify all historical inventory locations are situated inside the Wayanad sector."""
    for spot in HISTORICAL_LANDSLIDE_INVENTORY:
        lat = spot["lat"]
        lon = spot["lon"]
        assert WAYANAD_BOUNDS["lat_min"] <= lat <= WAYANAD_BOUNDS["lat_max"]
        assert WAYANAD_BOUNDS["lon_min"] <= lon <= WAYANAD_BOUNDS["lon_max"]
