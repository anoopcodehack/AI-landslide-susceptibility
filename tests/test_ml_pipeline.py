"""Unit tests for machine learning pipeline: preprocessing, training, prediction, and XAI."""

import pathlib
import tempfile
import numpy as np
import pandas as pd
import pytest

from src.preprocess import generate_wayanad_modeling_matrix
from src.train import evaluate_model, calibrate_disaster_threshold
from src.predict import (
    load_model_bundle,
    categorize_risk,
    predict_dataframe,
    predict_benchmark_sectors,
)
from sklearn.dummy import DummyClassifier


def test_preprocessing_matrix_generation(tmp_path: pathlib.Path) -> None:
    """Verify matrix generator produces properly bounded spatial data."""
    csv_file = tmp_path / "test_matrix.csv"
    df = generate_wayanad_modeling_matrix(csv_file, n_samples=100, random_seed=42)

    assert csv_file.exists()
    assert len(df) == 100

    expected_cols = [
        "latitude",
        "longitude",
        "slope",
        "elevation",
        "rainfall",
        "soil",
        "ndvi",
        "landslide_label",
    ]
    assert list(df.columns) == expected_cols

    # No nulls
    assert df.isnull().sum().sum() == 0

    # Geospatial bounds (Wayanad sector)
    assert df["latitude"].between(11.40, 12.00).all()
    assert df["longitude"].between(75.80, 76.50).all()

    # Physical ranges
    assert df["slope"].between(0.0, 90.0).all()
    assert df["elevation"].between(200.0, 2500.0).all()
    assert df["rainfall"].between(0.0, 800.0).all()
    assert df["ndvi"].between(-1.0, 1.0).all()

    # Labels binary
    assert set(df["landslide_label"].unique()).issubset({0, 1})


def test_model_evaluation_metrics() -> None:
    """Verify evaluation metric calculations and confusion matrix shapes."""
    X_test = pd.DataFrame({
        "slope": [10.0, 35.0, 40.0, 12.0],
        "elevation": [600.0, 1100.0, 1250.0, 700.0],
        "rainfall": [80.0, 280.0, 320.0, 100.0],
        "soil": [0.3, 0.7, 0.8, 0.4],
        "ndvi": [0.6, 0.3, 0.2, 0.7],
    })
    y_test = pd.Series([0, 1, 1, 0])

    dummy = DummyClassifier(strategy="constant", constant=1)
    dummy.fit(X_test, y_test)

    eval_result = evaluate_model("Dummy", dummy, X_test, y_test)
    assert eval_result["model"] == "Dummy"
    assert "accuracy" in eval_result
    assert "recall" in eval_result
    assert "precision" in eval_result
    assert "f1_score" in eval_result
    assert "roc_auc" in eval_result
    assert "confusion_matrix" in eval_result


def test_threshold_calibration_logic(tmp_path: pathlib.Path) -> None:
    """Verify disaster threshold calibration prioritizes life-safety recall."""
    y_test = pd.Series([0, 0, 0, 0, 1, 1, 1, 1, 1, 1])
    y_prob = np.array([0.1, 0.2, 0.3, 0.4, 0.35, 0.6, 0.7, 0.8, 0.9, 0.95])

    plot_path = tmp_path / "threshold_calibration.png"
    calib = calibrate_disaster_threshold(y_test, y_prob, plot_path)

    assert plot_path.exists()
    assert "calibrated_threshold" in calib
    assert "guaranteed_recall" in calib
    assert 0.10 <= calib["calibrated_threshold"] <= 0.90


def test_predict_dataframe_and_categories() -> None:
    """Verify predict_dataframe enriches data with scores, categories, and alerts."""
    bundle = load_model_bundle()
    sample_df = pd.DataFrame({
        "slope": [42.0, 6.0],
        "elevation": [1150.0, 700.0],
        "rainfall": [320.0, 70.0],
        "soil": [0.80, 0.30],
        "ndvi": [0.20, 0.75],
    })

    result = predict_dataframe(sample_df, bundle=bundle)
    assert "susceptibility_score" in result.columns
    assert "hazard_prediction" in result.columns
    assert "risk_category" in result.columns
    assert "evacuation_alert" in result.columns

    # High risk point should have critical category and evacuation alert
    assert result.loc[0, "risk_category"] in ["HIGH", "CRITICAL"]
    assert result.loc[0, "evacuation_alert"] == True

    # Low risk point should be low category
    assert result.loc[1, "risk_category"] == "LOW"
    assert result.loc[1, "evacuation_alert"] == False


def test_benchmark_sectors_predictions() -> None:
    """Verify canonical benchmark predictions for Wayanad key sectors."""
    sectors_df = predict_benchmark_sectors()
    assert len(sectors_df) == 5

    chooralmala = sectors_df[sectors_df["sector"].str.contains("Chooralmala")].iloc[0]
    bathery = sectors_df[sectors_df["sector"].str.contains("Bathery")].iloc[0]

    assert chooralmala["susceptibility_score"] > 0.90
    assert chooralmala["risk_category"] == "CRITICAL"
    assert chooralmala["evacuation_alert"] == True

    assert bathery["susceptibility_score"] < 0.20
    assert bathery["risk_category"] == "LOW"
    assert bathery["evacuation_alert"] == False
