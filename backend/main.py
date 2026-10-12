"""FastAPI backend for AI landslide susceptibility predictions and factor analysis."""

from pathlib import Path
from typing import Any, Literal
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

app = FastAPI(
    title="TerraShield AI // Landslide Susceptibility API",
    version="1.0.0",
    description="Production-grade API serving trained tree-based classifiers and SHAP attributions.",
)

# Enable CORS for local dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path("models/landslide_model.joblib")
_MODEL_BUNDLE: dict[str, Any] | None = None


@app.get("/", response_class=HTMLResponse)
def index() -> HTMLResponse:
    """Serve the enterprise dashboard UI directly."""
    html_path = Path("frontend/index.html")
    if html_path.exists():
        return HTMLResponse(content=html_path.read_text(encoding="utf-8"))
    return HTMLResponse(content="<h1>TerraShield AI API Online</h1><p>Visit /docs for OpenAPI documentation.</p>")


def get_model_bundle() -> dict[str, Any] | None:
    """Load model artifact into memory with graceful fallback."""
    global _MODEL_BUNDLE
    if _MODEL_BUNDLE is None and MODEL_PATH.exists():
        try:
            _MODEL_BUNDLE = joblib.load(MODEL_PATH)
        except Exception:
            _MODEL_BUNDLE = None
    return _MODEL_BUNDLE


class PredictionRequest(BaseModel):
    slope: float = Field(..., ge=0, le=90, description="Slope in degrees")
    elevation: float = Field(..., ge=0, description="Elevation in metres")
    rainfall: float = Field(..., ge=0, description="Rainfall index")
    soil: float = Field(..., ge=0, description="Encoded soil characteristic")
    ndvi: float = Field(..., ge=-1, le=1, description="Normalized difference vegetation index")


class PredictionResponse(BaseModel):
    susceptibility: float = Field(..., ge=0, le=1)
    zone: Literal["Low", "Moderate", "High"]
    model_used: str


@app.get("/health")
def health() -> dict[str, str]:
    """Return API health status and model load state."""
    bundle = get_model_bundle()
    return {
        "status": "ok",
        "model_loaded": "yes" if bundle is not None else "fallback_heuristic",
        "active_model": bundle["model_name"] if bundle else "Heuristic Prior",
    }


@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    """Predict landslide susceptibility using trained XGBoost/Random Forest model."""
    bundle = get_model_bundle()

    if bundle is not None:
        model = bundle["model"]
        features = bundle["features"]
        df_input = pd.DataFrame([request.model_dump()])[features]
        # Predict probability for positive class (landslide occurrence)
        prob = float(model.predict_proba(df_input)[0, 1])
        susceptibility = round(max(0.0, min(prob, 1.0)), 4)
        model_name = bundle["model_name"]
    else:
        # Calibrated heuristic fallback
        score = (
            0.45 * min(request.slope / 45, 1)
            + 0.30 * min(request.rainfall / 300, 1)
            + 0.15 * (1 - (request.ndvi + 1) / 2)
            + 0.10 * min(request.elevation / 2000, 1)
        )
        susceptibility = round(max(0.0, min(score, 1.0)), 4)
        model_name = "Heuristic Prior"

    zone: Literal["Low", "Moderate", "High"] = (
        "High" if susceptibility >= 0.66 else "Moderate" if susceptibility >= 0.33 else "Low"
    )
    return PredictionResponse(susceptibility=susceptibility, zone=zone, model_used=model_name)


@app.get("/api/v1/model/metrics")
def get_metrics() -> dict[str, Any]:
    """Return test set benchmarking metrics of the active model."""
    bundle = get_model_bundle()
    if bundle is None:
        return {"error": "Model artifact not found. Please run python src/train.py"}
    metrics = bundle.get("metrics", {})
    # Format confusion matrix as list if present
    formatted_metrics = {k: v.tolist() if hasattr(v, "tolist") else v for k, v in metrics.items()}
    return {
        "model_name": bundle["model_name"],
        "features": bundle["features"],
        "metrics": formatted_metrics,
    }
