from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from backend.schemas import (
    DashboardStats,
    ExplanationResponse,
    FeatureContribution,
    PredictionRequest,
    PredictionResponse,
    SimulationRequest,
    SimulationResponse,
)

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / "models" / "landslide_model.joblib"

FEATURES = [
    "slope",
    "rainfall_mm",
    "elevation",
    "twi",
    "ndvi",
    "dist_stream_m",
]

model = None
model_type = "unavailable"
model_error = None
explainer = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, model_type, model_error, explainer

    try:
        model = joblib.load(MODEL_PATH)
        model_type = type(model).__name__
        model_error = None

        estimator = model.steps[-1][1] if hasattr(model, "steps") else model

        try:
            explainer = shap.TreeExplainer(estimator)
        except Exception:
            explainer = None
    except Exception as exc:
        model = None
        model_type = "unavailable"
        model_error = str(exc)

    yield

    model = None
    explainer = None


app = FastAPI(
    title="Wayanad Landslide Susceptibility API",
    description="REST API for AI-based landslide susceptibility assessment.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8501",
        "http://127.0.0.1:8501",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


def require_model():
    if model is None:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "ML model is unavailable.",
                "reason": model_error,
                "expected_path": str(MODEL_PATH),
            },
        )
    return model


def make_frame(data: PredictionRequest) -> pd.DataFrame:
    return pd.DataFrame(
        [[getattr(data, feature) for feature in FEATURES]],
        columns=FEATURES,
    )


def predict_score(data: PredictionRequest) -> float:
    active_model = require_model()

    if not hasattr(active_model, "predict_proba"):
        raise HTTPException(
            status_code=503,
            detail="The loaded model does not support predict_proba.",
        )

    probabilities = active_model.predict_proba(make_frame(data))[0]

    if hasattr(active_model, "classes_"):
        classes = np.asarray(active_model.classes_)
    elif hasattr(active_model, "steps"):
        classes = np.asarray(active_model.steps[-1][1].classes_)
    else:
        classes = None

    if classes is not None:
        positive_indices = np.flatnonzero(classes == 1)
        positive_index = (
            int(positive_indices[0])
            if len(positive_indices)
            else len(probabilities) - 1
        )
    else:
        positive_index = len(probabilities) - 1

    return float(np.clip(probabilities[positive_index], 0, 1))


def category_for(score: float) -> str:
    if score < 0.25:
        return "LOW"
    if score < 0.50:
        return "MODERATE"
    if score < 0.75:
        return "HIGH"
    return "CRITICAL"


def make_prediction_response(score: float) -> PredictionResponse:
    return PredictionResponse(
        susceptibility_score=round(score, 6),
        risk_category=category_for(score),
        evacuation_alert=score >= 0.75,
        model_type=model_type,
    )


@app.get("/health")
async def health():
    return {
        "status": "ok" if model is not None else "degraded",
        "model_loaded": model is not None,
        "model_type": model_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "active_cluster_health": "not_configured",
        "model_error": model_error,
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(data: PredictionRequest):
    score = await run_in_threadpool(predict_score, data)
    return make_prediction_response(score)


@app.post("/simulate", response_model=SimulationResponse)
async def simulate(data: SimulationRequest):
    baseline = PredictionRequest(
        **{feature: getattr(data, feature) for feature in FEATURES}
    )

    scenario_values = baseline.model_dump()
    scenario_values["rainfall_mm"] *= (
        1 + data.rainfall_increase_pct / 100
    )
    scenario_values["ndvi"] *= (
        1 - data.vegetation_loss_pct / 100
    )
    scenario_values["ndvi"] = float(
        np.clip(scenario_values["ndvi"], -1, 1)
    )

    scenario = PredictionRequest(**scenario_values)

    baseline_score, simulated_score = await run_in_threadpool(
        lambda: (
            predict_score(baseline),
            predict_score(scenario),
        )
    )

    return SimulationResponse(
        baseline_score=round(baseline_score, 6),
        simulated_score=round(simulated_score, 6),
        delta=round(simulated_score - baseline_score, 6),
        baseline_category=category_for(baseline_score),
        simulated_category=category_for(simulated_score),
    )


@app.get("/explain", response_model=ExplanationResponse)
async def explain(data: PredictionRequest = Depends()):
    require_model()

    if explainer is None:
        raise HTTPException(
            status_code=503,
            detail="SHAP explainer is unavailable for this model.",
        )

    frame = make_frame(data)

    try:
        explanation = await run_in_threadpool(lambda: explainer(frame))
        values = np.asarray(explanation.values)

        if values.ndim == 3:
            values = values[0, :, -1]
        elif values.ndim == 2:
            values = values[0]
        elif values.ndim != 1:
            raise ValueError("Unexpected SHAP output dimensions.")

        if len(values) != len(FEATURES):
            raise ValueError("SHAP feature count does not match model inputs.")

        contributions = [
            FeatureContribution(
                feature=feature,
                contribution=round(float(value), 6),
            )
            for feature, value in zip(FEATURES, values)
        ]
        contributions.sort(
            key=lambda item: abs(item.contribution),
            reverse=True,
        )

        return ExplanationResponse(
            model_type=model_type,
            method="SHAP",
            contributions=contributions,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"SHAP explanation failed: {exc}",
        ) from exc


@app.get("/dashboard-stats", response_model=DashboardStats)
async def dashboard_stats():
    return DashboardStats(
        mean_susceptibility_pct=74.8,
        active_rain_gauge_mm_24h=312.0,
        sensor_nodes=142,
        sector_breakdown={
            "Chooralmala": 78.0,
            "Meppadi": 72.0,
            "Vythiri": 68.0,
            "Sulthan Bathery": 54.0,
        },
        data_source="DEMO_STATIC_VALUES",
    )
