from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    slope: float = Field(ge=0, le=90)
    rainfall_mm: float = Field(ge=0, le=10000)
    elevation: float = Field(ge=-500, le=9000)
    twi: float = Field(ge=-20, le=40)
    ndvi: float = Field(ge=-1, le=1)
    dist_stream_m: float = Field(ge=0, le=100000)


class PredictionResponse(BaseModel):
    susceptibility_score: float = Field(ge=0, le=1)
    risk_category: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    evacuation_alert: bool
    model_type: str


class SimulationRequest(PredictionRequest):
    rainfall_increase_pct: float = Field(default=0, ge=-100, le=500)
    vegetation_loss_pct: float = Field(default=0, ge=0, le=100)


class SimulationResponse(BaseModel):
    baseline_score: float
    simulated_score: float
    delta: float
    baseline_category: str
    simulated_category: str


class FeatureContribution(BaseModel):
    feature: str
    contribution: float


class ExplanationResponse(BaseModel):
    model_type: str
    method: str
    contributions: list[FeatureContribution]


class DashboardStats(BaseModel):
    mean_susceptibility_pct: float
    active_rain_gauge_mm_24h: float
    sensor_nodes: int
    sector_breakdown: dict[str, float]
    data_source: str
