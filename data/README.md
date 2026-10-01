# Data Directory Guide

This directory holds the spatial, environmental, and inventory datasets used for landslide susceptibility modeling.

## Directory Structure

```
data/
├── raw/            # Original, unmodified datasets (rasters, shapefiles, tabular CSVs)
│   └── .gitkeep
├── processed/      # Resampled, reprojected, aligned modeling matrix (CSV/GeoTIFF)
│   └── .gitkeep
└── README.md       # Data catalog and source documentation
```

> **Note:** Raw raster and processed datasets can be large and are excluded from Git version control via `.gitignore`. Store the data locally in these directories following the structure below.

---

## Planned Data Sources (Study Area: Wayanad, Kerala)

| Factor | Primary Source | Resolution / Scale | Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Landslide Inventory** | Geological Survey of India (GSI Bhukosh) / NASA GLC | Point / Polygon | GeoJSON / Shapefile / CSV | Historical ground-truth landslide occurrences used as training labels. |
| **Digital Elevation Model (DEM)** | NASA SRTM / USGS EarthExplorer | 30m resolution | GeoTIFF (`.tif`) | Used to derive topographic factors: Slope, Aspect, and Elevation. |
| **NDVI (Vegetation Index)** | Copernicus Sentinel-2 / Landsat 8 | 10m - 30m | GeoTIFF (`.tif`) | Surface vegetative cover density and root-reinforcement proxy. |
| **Rainfall Indices** | India Meteorological Department (IMD) / CHIRPS | Daily / Gridded | NetCDF (`.nc`) or CSV | Monsoon precipitation and cumulative rainfall indices triggering slope failure. |
| **Soil Characteristics** | National Bureau of Soil Survey & Land Use Planning (NBSS&LUP) | Regional scale | Vector Shapefile / CSV | Soil texture, depth, and permeability characteristics. |

---

## Processing Workflow

1. Place raw GeoTIFF and Shapefiles in `data/raw/`.
2. Run `python src/preprocess.py` to:
   * Reproject all spatial layers to a uniform Coordinate Reference System (e.g., EPSG:4326 or UTM 43N).
   * Resample rasters to a matching spatial grid resolution.
   * Extract positive (landslide) and negative (non-landslide) samples.
   * Output the final aligned modeling matrix to `data/processed/modeling_matrix.csv`.
