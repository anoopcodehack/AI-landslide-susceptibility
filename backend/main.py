"""FastAPI backend for landslide susceptibility predictions."""

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="AI Landslide Susceptibility API",
    version="0.1.0",
    description="API for health checks and prototype susceptibility scoring.",
)


class PredictionRequest(BaseModel):
    slope: float = Field(..., ge=0, le=90, description="Slope in degrees")
    elevation: float = Field(..., ge=0, description="Elevation in metres")
    rainfall: float = Field(..., ge=0, description="Rainfall index")
    soil: float = Field(..., ge=0, description="Encoded soil characteristic")
    ndvi: float = Field(..., ge=-1, le=1, description="Normalized difference vegetation index")


class PredictionResponse(BaseModel):
    susceptibility: float = Field(..., ge=0, le=1)
    zone: Literal["Low", "Moderate", "High"]


@app.get("/health")
def health() -> dict[str, str]:
    """Return API availability for local development and deployment checks."""
    return {"status": "ok"}


@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    """Return a transparent prototype score until the trained model is connected."""
    score = (
        0.45 * min(request.slope / 45, 1)
        + 0.30 * min(request.rainfall / 300, 1)
        + 0.15 * (1 - (request.ndvi + 1) / 2)
        + 0.10 * min(request.elevation / 2000, 1)
    )
    susceptibility = round(max(0.0, min(score, 1.0)), 4)
    zone = "High" if susceptibility >= 0.66 else "Moderate" if susceptibility >= 0.33 else "Low"
    return PredictionResponse(susceptibility=susceptibility, zone=zone)
