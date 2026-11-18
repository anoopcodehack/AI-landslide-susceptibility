"""Unit tests for backend Pydantic schemas and input/output validation."""

import pytest
from pydantic import ValidationError

from backend.schemas import (
    CivilDefenseDirective,
    DashboardStats,
    DebrisRunoutSimulation,
    ExplanationResponse,
    FeatureContribution,
    LiveWeatherTelemetry,
    PredictionRequest,
    PredictionResponse,
    RunoutWaypoint,
    SimulationRequest,
    SimulationResponse,
)


def test_prediction_request_valid_5_features() -> None:
    """Verify standard 5-feature request conforms to schema."""
    req = PredictionRequest(
        slope=35.0,
        elevation=1000.0,
        rainfall=250.0,
        soil=0.65,
        ndvi=0.40,
    )
    assert req.slope == 35.0
    assert req.get_rainfall_value() == 250.0
    assert req.get_soil_value() == 0.65
    assert req.ndvi == 0.40


def test_prediction_request_alias_and_fallback_fields() -> None:
    """Verify compatibility with alternative naming (rainfall_mm, soil_moisture)."""
    req = PredictionRequest(
        slope=25.0,
        elevation=800.0,
        rainfall_mm=190.0,
        soil_moisture=0.55,
        ndvi=0.50,
        twi=9.8,
        dist_stream_m=150.0,
    )
    assert req.get_rainfall_value() == 190.0
    assert req.get_soil_value() == 0.55
    assert req.twi == 9.8
    assert req.dist_stream_m == 150.0


def test_prediction_request_validation_errors() -> None:
    """Verify out-of-range physical values trigger ValidationError."""
    # Negative slope
    with pytest.raises(ValidationError):
        PredictionRequest(slope=-5.0, elevation=900.0, rainfall=200.0)

    # Slope > 90
    with pytest.raises(ValidationError):
        PredictionRequest(slope=95.0, elevation=900.0, rainfall=200.0)

    # NDVI outside [-1.0, 1.0]
    with pytest.raises(ValidationError):
        PredictionRequest(slope=20.0, elevation=900.0, rainfall=200.0, ndvi=1.8)


def test_simulation_request_validation() -> None:
    """Verify scenario stress simulation request constraints."""
    sim = SimulationRequest(
        slope=30.0,
        elevation=900.0,
        rainfall=220.0,
        soil=0.6,
        ndvi=0.45,
        rainfall_increase_pct=25.0,
        vegetation_loss_pct=15.0,
    )
    assert sim.rainfall_increase_pct == 25.0
    assert sim.vegetation_loss_pct == 15.0


def test_prediction_response_schema() -> None:
    """Verify prediction response schema serializes correctly."""
    resp = PredictionResponse(
        susceptibility_score=0.9234,
        risk_category="CRITICAL",
        evacuation_alert=True,
        model_type="XGBoost Classifier",
        susceptibility=0.9234,
        zone="High",
        model_used="XGBoost Classifier",
        feature_contributions={"rainfall": 40.0, "slope": 30.0},
    )
    data = resp.model_dump()
    assert data["susceptibility_score"] == 0.9234
    assert data["risk_category"] == "CRITICAL"
    assert data["evacuation_alert"] is True


def test_simulation_response_schema() -> None:
    """Verify simulation response metrics serialization."""
    sim_resp = SimulationResponse(
        baseline_score=0.70,
        simulated_score=0.88,
        delta=0.18,
        baseline_category="HIGH",
        simulated_category="CRITICAL",
    )
    assert sim_resp.delta == 0.18
    assert sim_resp.simulated_category == "CRITICAL"


def test_civil_defense_directive_schema() -> None:
    """Verify KSDMA evacuation directive data model."""
    directive = CivilDefenseDirective(
        directive_id="KSDMA-WAY-2026-CHOO",
        sector_name="Chooralmala Debris Zone",
        hazard_level="CRITICAL",
        susceptibility_pct=99.8,
        evacuation_radius_m=750,
        primary_shelter="Meppadi School Camp",
        secondary_shelter="Kalpetta Polytech",
        transit_corridor="SH 59 Bypass",
        emergency_contact="04936-204151",
        issued_at="18-Nov-2026 12:00 UTC",
        authority="KSDMA // Wayanad DDMA",
    )
    assert directive.evacuation_radius_m == 750
    assert directive.hazard_level == "CRITICAL"


def test_debris_runout_schema() -> None:
    """Verify hydraulic runout waypoint schema."""
    wp = RunoutWaypoint(
        name="Chooralmala Bridge",
        latitude=11.5381,
        longitude=76.1772,
        elevation_m=760.0,
        distance_from_apex_km=4.2,
        estimated_arrival_minutes=14.2,
        debris_velocity_ms=13.4,
        impact_pressure_kpa=64.0,
        hazard_status="ACTIVE_INUNDATION",
    )
    assert wp.debris_velocity_ms == 13.4
    assert wp.impact_pressure_kpa == 64.0
