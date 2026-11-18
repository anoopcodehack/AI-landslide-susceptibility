"""Smoke and unit tests for the Streamlit GIS frontend module (frontend/app.py)."""

import sys
from pathlib import Path
import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "frontend"))

from frontend.app import resolve_path, predict_susceptibility, load_model


def test_resolve_path() -> None:
    """Verify resolve_path finds repository files accurately."""
    p_readme = resolve_path("README.md")
    assert Path(p_readme).exists()
    assert "README.md" in p_readme

    p_docs = resolve_path("docs/roc_curves.png")
    assert Path(p_docs).exists()


def test_load_model() -> None:
    """Verify model bundle loads into the Streamlit app cache."""
    bundle = load_model()
    assert bundle is not None
    assert "model" in bundle
    assert "features" in bundle


def test_predict_susceptibility_high_and_low() -> None:
    """Verify Streamlit frontend prediction produces expected probabilities."""
    # High risk point
    prob_high, model_name = predict_susceptibility(
        slope=42.0, elevation=1200.0, rainfall=350.0, soil=0.8, ndvi=0.2
    )
    assert 0.80 <= prob_high <= 1.0
    assert "XGBoost" in model_name or "Classifier" in model_name

    # Low risk point
    prob_low, _ = predict_susceptibility(
        slope=5.0, elevation=600.0, rainfall=50.0, soil=0.3, ndvi=0.75
    )
    assert 0.0 <= prob_low <= 0.20
