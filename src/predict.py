"""Susceptibility grid inference and zone classification.

Loads the trained machine learning model artifact to perform regional landslide
susceptibility mapping, risk classification, and spatial grid inference across
Wayanad District.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import joblib
import numpy as np
import pandas as pd

DEFAULT_MODEL_PATH = Path("models/landslide_model.joblib")
DEFAULT_DATA_PATH = Path("data/processed/modeling_matrix.csv")
DEFAULT_OUTPUT_PATH = Path("data/processed/landslide_predictions.csv")

# Wayanad Reference Benchmark Sectors
WAYANAD_SECTORS = [
    {
        "sector": "Chooralmala Debris Zone",
        "latitude": 11.5381,
        "longitude": 76.1772,
        "slope": 38.5,
        "elevation": 950.0,
        "rainfall": 280.0,
        "soil": 0.75,
        "ndvi": 0.35,
    },
    {
        "sector": "Meppadi Incline Catchment",
        "latitude": 11.5518,
        "longitude": 76.1265,
        "slope": 34.0,
        "elevation": 880.0,
        "rainfall": 250.0,
        "soil": 0.70,
        "ndvi": 0.40,
    },
    {
        "sector": "Vythiri Ghat Corridor",
        "latitude": 11.5524,
        "longitude": 76.0425,
        "slope": 30.5,
        "elevation": 790.0,
        "rainfall": 230.0,
        "soil": 0.65,
        "ndvi": 0.45,
    },
    {
        "sector": "Kalpetta Urban Basin",
        "latitude": 11.6050,
        "longitude": 76.0820,
        "slope": 15.0,
        "elevation": 780.0,
        "rainfall": 140.0,
        "soil": 0.45,
        "ndvi": 0.58,
    },
    {
        "sector": "Sulthan Bathery Plateau",
        "latitude": 11.6628,
        "longitude": 76.2570,
        "slope": 8.0,
        "elevation": 890.0,
        "rainfall": 105.0,
        "soil": 0.35,
        "ndvi": 0.68,
    },
]


def load_model_bundle(model_path: Path = DEFAULT_MODEL_PATH) -> Dict[str, Any]:
    """Load model artifact dictionary or raw estimator."""
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model artifact not found at {model_path}. Please execute 'python src/train.py' first."
        )

    bundle = joblib.load(model_path)
    if isinstance(bundle, dict) and "model" in bundle:
        return bundle
    return {
        "model": bundle,
        "model_name": type(bundle).__name__,
        "features": ["slope", "elevation", "rainfall", "soil", "ndvi"],
        "threshold_meta": {"calibrated_threshold": 0.35},
    }


def categorize_risk(score: float, threshold: float = 0.35) -> str:
    """Classify risk category using cost-sensitive calibrated decision threshold."""
    if score >= 0.75:
        return "CRITICAL"
    if score >= threshold:
        return "HIGH"
    if score >= 0.20:
        return "MODERATE"
    return "LOW"


def predict_dataframe(
    df: pd.DataFrame,
    bundle: Optional[Dict[str, Any]] = None,
    model_path: Path = DEFAULT_MODEL_PATH,
) -> pd.DataFrame:
    """Perform batch prediction and risk tagging on an input DataFrame."""
    if bundle is None:
        bundle = load_model_bundle(model_path)

    model = bundle["model"]
    features = bundle.get("features", ["slope", "elevation", "rainfall", "soil", "ndvi"])
    threshold = bundle.get("threshold_meta", {}).get("calibrated_threshold", 0.35)

    missing = [f for f in features if f not in df.columns]
    if missing:
        raise ValueError(f"Input data is missing required feature columns: {missing}")

    X = df[features]
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)[:, 1]
    else:
        probs = model.predict(X).astype(float)

    result_df = df.copy()
    result_df["susceptibility_score"] = np.round(probs, 4)
    result_df["hazard_prediction"] = (probs >= threshold).astype(int)
    result_df["risk_category"] = [categorize_risk(p, threshold) for p in probs]
    result_df["evacuation_alert"] = probs >= 0.75
    return result_df


def predict_benchmark_sectors(bundle: Optional[Dict[str, Any]] = None) -> pd.DataFrame:
    """Run inference against canonical Wayanad ground-truth monitoring sectors."""
    df_sectors = pd.DataFrame(WAYANAD_SECTORS)
    return predict_dataframe(df_sectors, bundle=bundle)


def run_spatial_grid_inference(
    input_path: Path = DEFAULT_DATA_PATH,
    output_path: Path = DEFAULT_OUTPUT_PATH,
    model_path: Path = DEFAULT_MODEL_PATH,
) -> pd.DataFrame:
    """Run full spatial grid inference and save annotated geospatial predictions."""
    bundle = load_model_bundle(model_path)
    model_name = bundle.get("model_name", "Landslide Model")
    threshold = bundle.get("threshold_meta", {}).get("calibrated_threshold", 0.35)

    print("=" * 70)
    print(f"      GEO-SHIELD SPATIAL GRID INFERENCE // {model_name.upper()}")
    print(f"      Calibrated Operational Decision Threshold: {threshold:.2f}")
    print("=" * 70)

    # 1. Benchmark Reference Sectors
    print("\n--- Canonical Sector Risk Assessment ---")
    sector_results = predict_benchmark_sectors(bundle)
    cols_display = [
        "sector",
        "slope",
        "rainfall",
        "susceptibility_score",
        "risk_category",
        "evacuation_alert",
    ]
    print(sector_results[cols_display].to_string(index=False))

    # 2. Batch Grid Dataset Inference
    if input_path.exists():
        print(f"\n--- Batch Spatial Matrix Inference ({input_path}) ---")
        df_input = pd.read_csv(input_path)
        predictions_df = predict_dataframe(df_input, bundle=bundle)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        predictions_df.to_csv(output_path, index=False)
        print(f"[SAVE] Exported predictions -> {output_path} ({len(predictions_df)} grid points)")

        # Risk breakdown summary
        breakdown = predictions_df["risk_category"].value_counts()
        print("\nPredicted Hazard Risk Distribution:")
        for cat, cnt in breakdown.items():
            pct = (cnt / len(predictions_df)) * 100
            print(f"  - {cat:8s}: {cnt:4d} ({pct:5.1f}%)")
        return predictions_df

    return sector_results


def main() -> None:
    run_spatial_grid_inference()


if __name__ == "__main__":
    main()
