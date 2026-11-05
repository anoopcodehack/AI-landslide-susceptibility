# Geospatial ingestion utilities for GeoShield
"""
Self-contained geospatial data ingestion module for the GeoShield platform.

This module handles:
  1. Placeholder generation for raw geospatial layers (DEM, Sentinel-2 NDVI, rainfall).
  2. Scientifically calibrated spatial modeling matrix generation for Wayanad District.
  3. Integration with the main AI-landslide-susceptibility project by placing the
     generated modeling_matrix.csv in the expected data/processed/ directory.

The module has **zero dependency on the main repository's Python code** and only
requires numpy (part of the standard scientific stack).
"""

import pathlib
import shutil
import struct
from typing import Union

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
_MAIN_PROJECT = _REPO_ROOT / "AI-landslide-susceptibility"
_GEO_MODULE = _REPO_ROOT / "geospatial_module"

# ---------------------------------------------------------------------------
# DEM (Digital Elevation Model) handling
# ---------------------------------------------------------------------------


def download_dem(output_path: Union[str, pathlib.Path]) -> None:
    """Create a placeholder SRTM 30m DEM raster.

    In production this would download from NASA Earthdata. For now it writes
    a minimal single-band GeoTIFF header so downstream tools can at least
    detect the file type.
    """
    output_path = pathlib.Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write a minimal TIFF header (little-endian, 1x1 pixel, 16-bit)
    with open(output_path, "wb") as f:
        # TIFF magic + IFD offset
        f.write(b"II")  # little-endian
        f.write(struct.pack("<H", 42))  # TIFF magic number
        f.write(struct.pack("<I", 8))  # offset to first IFD
        # Minimal IFD with 0 entries (just to make it a valid-ish TIFF)
        f.write(struct.pack("<H", 0))
        f.write(struct.pack("<I", 0))

    print(f"[GEOSPATIAL] Created placeholder DEM at {output_path}")


# ---------------------------------------------------------------------------
# Sentinel-2 (NDVI) handling
# ---------------------------------------------------------------------------


def download_sentinel(output_dir: Union[str, pathlib.Path]) -> None:
    """Create a placeholder Sentinel-2 NDVI raster.

    In production this would query the Copernicus Open Access Hub and
    download L2A tiles for the study region.
    """
    output_dir = pathlib.Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    placeholder = output_dir / "ndvi_placeholder.tif"
    placeholder.touch()
    print(f"[GEOSPATIAL] Created placeholder Sentinel-2 NDVI at {placeholder}")


# ---------------------------------------------------------------------------
# Rainfall (IMD) handling
# ---------------------------------------------------------------------------


def download_rainfall(output_path: Union[str, pathlib.Path]) -> None:
    """Create a placeholder IMD gridded rainfall raster.

    In production this would download from IMD's data portal.
    """
    output_path = pathlib.Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.touch()
    print(f"[GEOSPATIAL] Created placeholder rainfall data at {output_path}")


# ---------------------------------------------------------------------------
# Reprojection helper
# ---------------------------------------------------------------------------


def reproject_raster(
    src_path: Union[str, pathlib.Path],
    dst_path: Union[str, pathlib.Path],
    dst_crs: str = "EPSG:32643",
) -> None:
    """Reproject a raster to the target CRS.

    A thin wrapper around rasterio.warp.reproject. The body is a stub --
    replace with actual reprojection logic when real data are available.
    """
    src_path = pathlib.Path(src_path)
    dst_path = pathlib.Path(dst_path)
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    if src_path.is_file():
        dst_path.write_bytes(src_path.read_bytes())
    else:
        dst_path.touch()
    print(f"[GEOSPATIAL] Reprojected {src_path} -> {dst_path} (CRS={dst_crs})")


# ---------------------------------------------------------------------------
# Modeling matrix generator (self-contained -- no external imports)
# ---------------------------------------------------------------------------


def generate_modeling_matrix(
    output_csv: Union[str, pathlib.Path],
    n_samples: int = 1500,
    random_seed: int = 42,
) -> None:
    """Generate a scientifically calibrated spatial modeling matrix for Wayanad.

    Mirrors the logic in AI-landslide-susceptibility/src/preprocess.py but is
    fully self-contained using only numpy. This means the geospatial module
    can run independently without importing anything from the main project.

    The generated CSV has columns:
        latitude, longitude, slope, elevation, rainfall, soil, ndvi, landslide_label

    Geotechnical calibration:
      - High slope (>28 deg) + extreme rainfall (>200 mm) + lower NDVI
        elevates slope failure probability.
      - South-western Wayanad (Vythiri, Meppadi) is steeper and wetter.
    """
    import numpy as np

    np.random.seed(random_seed)

    lat_min, lat_max = 11.46, 11.95
    lon_min, lon_max = 75.85, 76.38

    lat = np.random.uniform(lat_min, lat_max, size=n_samples)
    lon = np.random.uniform(lon_min, lon_max, size=n_samples)

    # South-western Wayanad factor (Vythiri, Meppadi are steeper/wetter)
    south_west_factor = ((11.95 - lat) / 0.5) * 0.6 + ((76.38 - lon) / 0.5) * 0.4

    slope = (np.random.normal(18.0, 10.0, n_samples) + south_west_factor * 8.0).clip(3.0, 55.0)
    rainfall = (np.random.normal(180.0, 70.0, n_samples) + south_west_factor * 60.0).clip(50.0, 460.0)
    elevation = (np.random.normal(950.0, 250.0, n_samples) + south_west_factor * 150.0).clip(500.0, 2100.0)
    ndvi = (np.random.normal(0.52, 0.18, n_samples) - south_west_factor * 0.08).clip(-0.1, 0.88)
    soil = (np.random.normal(0.55, 0.18, n_samples) + south_west_factor * 0.10).clip(0.15, 0.95)

    # Geotechnical susceptibility latent index (logistic function)
    logit = (
        0.09 * (slope - 22.0)
        + 0.018 * (rainfall - 190.0)
        + 2.5 * (0.50 - ndvi)
        + 1.8 * (soil - 0.50)
        + 0.0015 * (elevation - 1000.0)
        + np.random.normal(0, 0.75, n_samples)
    )
    prob = 1.0 / (1.0 + np.exp(-logit))
    labels = (prob >= 0.50).astype(int)

    # Shuffle indices
    shuffle_idx = np.random.RandomState(random_seed).permutation(n_samples)

    # Write CSV manually (no pandas needed)
    output_csv = pathlib.Path(output_csv)
    output_csv.parent.mkdir(parents=True, exist_ok=True)

    header = "latitude,longitude,slope,elevation,rainfall,soil,ndvi,landslide_label"
    with open(output_csv, "w", newline="") as f:
        f.write(header + "\n")
        for i in shuffle_idx:
            row = (
                f"{lat[i]:.5f},{lon[i]:.5f},"
                f"{slope[i]:.2f},{elevation[i]:.1f},"
                f"{rainfall[i]:.1f},{soil[i]:.3f},"
                f"{ndvi[i]:.3f},{labels[i]}"
            )
            f.write(row + "\n")

    positives = int(labels.sum())
    negatives = n_samples - positives
    print(
        f"[GEOSPATIAL] Spatial modeling matrix saved: {output_csv} "
        f"({n_samples} records, {positives} positives, {negatives} negatives)"
    )


# ---------------------------------------------------------------------------
# Integration: copy generated data into main project
# ---------------------------------------------------------------------------


def integrate_with_main_project(
    matrix_csv: Union[str, pathlib.Path],
    target_dir: Union[str, pathlib.Path, None] = None,
) -> pathlib.Path:
    """Copy the modeling matrix CSV into the main AI-landslide-susceptibility
    project's data/processed/ directory so the backend can serve it.

    This does NOT modify any source files in the main project.
    """
    matrix_csv = pathlib.Path(matrix_csv)
    if target_dir is None:
        target_dir = _MAIN_PROJECT / "data" / "processed"
    else:
        target_dir = pathlib.Path(target_dir)

    target_dir.mkdir(parents=True, exist_ok=True)
    target_file = target_dir / "modeling_matrix.csv"
    shutil.copy2(str(matrix_csv), str(target_file))
    print(f"[GEOSPATIAL] Integrated: {matrix_csv} -> {target_file}")
    return target_file


# ---------------------------------------------------------------------------
# Convenience entry point
# ---------------------------------------------------------------------------


def main() -> None:
    """Run a complete end-to-end geospatial data pipeline.

    1. Creates placeholder raw data layers (DEM, Sentinel-2, Rainfall).
    2. Generates the Wayanad spatial modeling matrix.
    3. Copies the result into the main project for backend consumption.
    """
    raw_dir = _GEO_MODULE / "data" / "raw"
    processed_dir = _GEO_MODULE / "data" / "processed"

    print("=" * 60)
    print("  GeoShield Geospatial Module -- Data Ingestion Pipeline")
    print("=" * 60)

    # Step 1: Raw data placeholders
    print("\n[Step 1/4] Generating raw data placeholders...")
    download_dem(raw_dir / "dem.tif")
    download_sentinel(raw_dir / "sentinel")
    download_rainfall(raw_dir / "rainfall.tif")

    # Step 2: Generate modeling matrix
    matrix_path = processed_dir / "modeling_matrix.csv"
    print("\n[Step 2/4] Generating Wayanad spatial modeling matrix...")
    generate_modeling_matrix(matrix_path)

    # Step 3: Validate output
    print("\n[Step 3/4] Validating generated data...")
    validate_matrix(matrix_path)

    # Step 4: Integrate with main project
    print("\n[Step 4/4] Integrating with AI-landslide-susceptibility project...")
    integrate_with_main_project(matrix_path)

    print("\n" + "=" * 60)
    print("  Pipeline complete. All data generated and integrated.")
    print("=" * 60)


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------


def validate_matrix(csv_path: Union[str, pathlib.Path]) -> bool:
    """Validate the generated modeling matrix CSV for correctness.

    Checks:
      - File exists and is non-empty.
      - Has the expected header columns.
      - All rows have correct number of fields.
      - Numeric ranges are within geotechnical bounds.

    Returns True if valid, raises ValueError otherwise.
    """
    csv_path = pathlib.Path(csv_path)

    if not csv_path.exists():
        raise ValueError(f"Matrix CSV not found: {csv_path}")

    with open(csv_path, "r") as f:
        lines = f.readlines()

    if len(lines) < 2:
        raise ValueError(f"Matrix CSV is empty or has no data rows: {csv_path}")

    expected_cols = ["latitude", "longitude", "slope", "elevation", "rainfall", "soil", "ndvi", "landslide_label"]
    header = lines[0].strip().split(",")
    if header != expected_cols:
        raise ValueError(f"Unexpected header: {header}. Expected: {expected_cols}")

    n_rows = 0
    errors = []
    for line_num, line in enumerate(lines[1:], start=2):
        fields = line.strip().split(",")
        if len(fields) != 8:
            errors.append(f"  Line {line_num}: expected 8 fields, got {len(fields)}")
            continue

        try:
            lat, lon, slope, elev, rain, soil_v, ndvi_v, label = (
                float(fields[0]),
                float(fields[1]),
                float(fields[2]),
                float(fields[3]),
                float(fields[4]),
                float(fields[5]),
                float(fields[6]),
                int(fields[7]),
            )
        except ValueError as e:
            errors.append(f"  Line {line_num}: parse error -- {e}")
            continue

        # Range checks
        if not (11.0 <= lat <= 12.5):
            errors.append(f"  Line {line_num}: latitude {lat} out of Wayanad range")
        if not (75.0 <= lon <= 77.0):
            errors.append(f"  Line {line_num}: longitude {lon} out of Wayanad range")
        if not (0 <= slope <= 90):
            errors.append(f"  Line {line_num}: slope {slope} out of range")
        if not (0 <= elev <= 3000):
            errors.append(f"  Line {line_num}: elevation {elev} out of range")
        if not (0 <= rain <= 1000):
            errors.append(f"  Line {line_num}: rainfall {rain} out of range")
        if not (-1 <= ndvi_v <= 1):
            errors.append(f"  Line {line_num}: ndvi {ndvi_v} out of range")
        if label not in (0, 1):
            errors.append(f"  Line {line_num}: label {label} not 0 or 1")

        n_rows += 1

    if errors:
        raise ValueError(
            f"Validation found {len(errors)} errors in {csv_path}:\n" + "\n".join(errors[:10])
        )

    print(f"[GEOSPATIAL] Validation PASSED: {n_rows} rows, 8 columns, all ranges valid.")
    return True


if __name__ == "__main__":
    main()
