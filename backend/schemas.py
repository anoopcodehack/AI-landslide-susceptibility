from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    """
    Input feature vector for landslide susceptibility inference.
    Supports both 5-feature (Anoop/Ashith/Dhruv) and 6-feature (Dishant) schemas seamlessly.
    """
    model_config = ConfigDict(extra="ignore")

    # Primary geomorphological & vegetation factors
    slope: float = Field(..., ge=0, le=90, description="Slope angle in degrees")
    elevation: float = Field(..., ge=-500, le=9000, description="Elevation in metres above sea level")
    ndvi: float = Field(..., ge=-1, le=1, description="Normalized Difference Vegetation Index (-1.0 to 1.0)")

    # Rainfall parameters (accepts either rainfall or rainfall_mm)
    rainfall: float | None = Field(default=None, ge=0, le=10000, description="24h rainfall precipitation in mm")
    rainfall_mm: float | None = Field(default=None, ge=0, le=10000, description="24h cumulative rainfall in mm")

    # Geotechnical & hydrological parameters
    soil: float | None = Field(default=2.0, ge=0, description="Soil type / cohesion factor (Default: 2.0 Loam)")
    twi: float | None = Field(default=10.5, ge=-20, le=40, description="Topographic Wetness Index")
    dist_stream_m: float | None = Field(default=120.0, ge=0, le=100000, description="Distance to nearest drainage stream in metres")

    def get_rainfall_value(self) -> float:
        if self.rainfall is not None:
            return float(self.rainfall)
        if self.rainfall_mm is not None:
            return float(self.rainfall_mm)
        return 0.0

    def get_soil_value(self) -> float:
        return float(self.soil if self.soil is not None else 2.0)


class PredictionResponse(BaseModel):
    """
    Unified prediction response combining Dishant's schema with Dhruv's frontend requirements.
    """
    # Dishant's schema
    susceptibility_score: float = Field(ge=0, le=1, description="Continuous susceptibility probability (0.0 - 1.0)")
    risk_category: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    evacuation_alert: bool
    model_type: str

    # Dhruv's Next.js & Streamlit frontend compatibility
    susceptibility: float = Field(ge=0, le=1, description="Mapped probability for UI gauge")
    zone: Literal["Low", "Moderate", "High"]
    model_used: str
    feature_contributions: dict[str, float]


class SimulationRequest(PredictionRequest):
    """Scenario simulation with climate and deforestation perturbations."""
    rainfall_increase_pct: float = Field(default=0, ge=-100, le=500, description="Rainfall surge percentage")
    vegetation_loss_pct: float = Field(default=0, ge=0, le=100, description="Deforestation / canopy loss percentage")


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


class CivilDefenseDirective(BaseModel):
    """Official DDMA Civil Defense evacuation alert directive."""
    directive_id: str
    sector_name: str
    hazard_level: Literal["CRITICAL", "HIGH", "MODERATE", "LOW"]
    susceptibility_pct: float
    evacuation_radius_m: int
    primary_shelter: str
    secondary_shelter: str
    transit_corridor: str
    emergency_contact: str
    issued_at: str
    authority: str
