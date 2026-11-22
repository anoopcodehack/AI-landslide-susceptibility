"""Unit and integration tests for backend FastAPI endpoints and inference services."""

import pytest
from backend.main import (
    category_for,
    dashboard_stats,
    dispatch_telegram_alert,
    explain,
    get_civil_defense_directive,
    get_chooralmala_runout,
    get_dashboard,
    get_live_weather,
    get_metrics,
    get_stats,
    health,
    init_model,
    make_frame,
    predict,
    predict_score,
    require_model,
    root,
    simulate,
    zone_for,
)
from backend.schemas import PredictionRequest, SimulationRequest, TelegramAlertRequest


@pytest.fixture(scope="module", autouse=True)
def setup_backend_model():
    """Ensure ML model artifact is initialized before running tests."""
    init_model()


def test_root_endpoint() -> None:
    """Verify root HTML splash page renders."""
    response = root()
    assert response.status_code == 200
    assert "GeoShield AI" in response.body.decode()


def test_health_endpoint() -> None:
    """Verify health status, active model, and threshold metadata."""
    data = health()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert "model_type" in data
    assert isinstance(data["model_features"], list)
    assert len(data["model_features"]) == 5
    assert data["calibrated_threshold"] > 0.0


def test_predict_standard_vector() -> None:
    """Verify standard 5-factor prediction."""
    req = PredictionRequest(
        slope=38.5,
        elevation=950.0,
        rainfall=280.0,
        soil=0.75,
        ndvi=0.35,
    )
    resp = predict(req)
    assert 0.0 <= resp.susceptibility_score <= 1.0
    assert resp.risk_category in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert resp.zone in ["Low", "Moderate", "High"]
    assert isinstance(resp.feature_contributions, dict)
    assert "rainfall" in resp.feature_contributions
    assert "slope" in resp.feature_contributions


def test_predict_extreme_scenarios() -> None:
    """High-hazard vs Low-hazard slope contrast verification."""
    # High risk: steep slope + heavy rain + degraded canopy
    high_req = PredictionRequest(
        slope=42.0,
        elevation=1200.0,
        rainfall=350.0,
        soil=0.85,
        ndvi=0.20,
    )
    high_resp = predict(high_req)
    assert high_resp.susceptibility_score > 0.80
    assert high_resp.risk_category == "CRITICAL"
    assert high_resp.evacuation_alert is True

    # Low risk: flat slope + minimal rain + dense canopy
    low_req = PredictionRequest(
        slope=5.0,
        elevation=600.0,
        rainfall=60.0,
        soil=0.30,
        ndvi=0.75,
    )
    low_resp = predict(low_req)
    assert low_resp.susceptibility_score < 0.20
    assert low_resp.risk_category == "LOW"
    assert low_resp.evacuation_alert is False


def test_predict_alternative_features() -> None:
    """Verify compatibility with rainfall_mm and TWI fields."""
    req = PredictionRequest(
        slope=32.0,
        elevation=850.0,
        rainfall_mm=210.0,
        twi=10.5,
        dist_stream_m=80.0,
        ndvi=0.42,
    )
    resp = predict(req)
    assert 0.0 <= resp.susceptibility_score <= 1.0
    assert resp.model_type is not None


def test_simulate_climate_stress() -> None:
    """Verify scenario stress testing with increased precipitation and deforestation."""
    sim_req = SimulationRequest(
        slope=34.0,
        elevation=900.0,
        rainfall=220.0,
        soil=0.65,
        ndvi=0.45,
        rainfall_increase_pct=30.0,
        vegetation_loss_pct=25.0,
    )
    sim_resp = simulate(sim_req)
    assert 0.0 <= sim_resp.baseline_score <= 1.0
    assert 0.0 <= sim_resp.simulated_score <= 1.0
    # Stress increase should elevate susceptibility
    assert sim_resp.simulated_score >= sim_resp.baseline_score
    assert sim_resp.delta >= 0.0


def test_explain_shap_attribution() -> None:
    """Verify SHAP local factor decomposition."""
    req = PredictionRequest(
        slope=38.5,
        elevation=950.0,
        rainfall=280.0,
        soil=0.75,
        ndvi=0.35,
    )
    exp_resp = explain(req)
    assert exp_resp.method == "SHAP (TreeExplainer)"
    assert len(exp_resp.contributions) == 5

    # Should be sorted in descending order of absolute contribution
    abs_vals = [abs(c.contribution) for c in exp_resp.contributions]
    assert abs_vals == sorted(abs_vals, reverse=True)


def test_dashboard_stats_endpoint() -> None:
    """Verify dashboard stats summary metrics."""
    stats = dashboard_stats()
    assert stats.mean_susceptibility_pct > 0.0
    assert stats.sensor_nodes > 0
    assert "Chooralmala" in stats.sector_breakdown
    assert "Vythiri" in stats.sector_breakdown


def test_api_v1_dashboard_payload() -> None:
    """Verify Next.js enterprise console telemetry contract."""
    payload = get_dashboard()
    assert payload["status"] == "operational"
    assert "overview" in payload
    assert "stats" in payload
    assert "trend_chart" in payload
    assert "sectors" in payload
    assert "alerts" in payload
    assert "hotspots" in payload

    # Verify sector items
    sectors = payload["sectors"]
    assert len(sectors) >= 3
    assert any(s["id"] == "bathery" for s in sectors)
    assert any(s["id"] == "chooralmala" or s["id"] == "meppadi" for s in sectors)


def test_api_v1_stats_endpoint() -> None:
    """Verify high-level stats endpoint."""
    res = get_stats()
    assert res["total_survey_points"] > 0
    assert res["active_high_risk_points"] >= 0
    assert "model_name" in res


def test_api_v1_model_metrics() -> None:
    """Verify model metrics endpoint returns trained evaluation parameters."""
    res = get_metrics()
    assert "model_name" in res
    assert "features" in res
    assert "threshold_meta" in res


def test_civil_defense_directive_sectors() -> None:
    """Verify KSDMA evacuation directive for multiple sectors and default fallback."""
    for sector in ["chooralmala", "meppadi", "vythiri", "bathery"]:
        d = get_civil_defense_directive(sector)
        assert d.hazard_level in ["LOW", "HIGH", "CRITICAL"]
        assert len(d.primary_shelter) > 0
        assert len(d.transit_corridor) > 0
        assert len(d.emergency_contact) > 0

    # Unknown sector fallback
    unknown = get_civil_defense_directive("unknown_remote_sector")
    assert unknown.directive_id.startswith("KSDMA-WAY-2026")


def test_live_weather_telemetry() -> None:
    """Verify live meteorological telemetry with automated inference score."""
    telemetry = get_live_weather()
    assert telemetry.station_name.startswith("Meppadi-Chooralmala")
    assert telemetry.latitude == 11.5518
    assert telemetry.longitude == 76.1265
    assert telemetry.past_24h_rainfall_mm >= 0.0
    assert 0.0 <= telemetry.live_susceptibility_score <= 1.0
    assert telemetry.source in ["LIVE_OPEN_METEO_API", "OFFLINE_CALIBRATED_FALLBACK"]


def test_chooralmala_runout_routing() -> None:
    """Verify hydraulic debris flow channel waypoints and timing."""
    runout = get_chooralmala_runout()
    assert runout.corridor_id == "CORRIDOR-IRUVAIPUZHA-01"
    assert runout.total_drop_height_m == 800.0
    assert runout.total_runout_distance_km == 6.1
    assert len(runout.channel_axis_points) >= 5
    assert len(runout.affected_waypoints) == 5

    # Check temporal ordering: arrival time must increase downstream
    times = [w.estimated_arrival_minutes for w in runout.affected_waypoints]
    assert times == sorted(times)


def test_classification_helper_functions() -> None:
    """Verify score-to-category and score-to-zone helper mapping."""
    assert category_for(0.10) == "LOW"
    assert category_for(0.35) == "MODERATE"
    assert category_for(0.60) == "HIGH"
    assert category_for(0.85) == "CRITICAL"

    assert zone_for(0.10) == "Low"
    assert zone_for(0.40) == "Moderate"
    assert zone_for(0.80) == "High"


def test_telegram_alert_simulation_and_formatting() -> None:
    """Verify bilingual (English + Kannada) alert formatting without emoji clutter."""
    req = TelegramAlertRequest(
        level="RED",
        sector="Chooralmala & Mundakkai",
        sector_kn="ಚೂರಲ್ಮಲಾ ಮತ್ತು ಮುಂಡಕ್ಕೈ",
        rainfall_mm=372.0,
        susceptibility_pct=96.4,
        message_en="Immediate valley-floor evacuation order active. Relocate to Meppadi relief shelter.",
        message_kn="ತೀವ್ರ ಭೂಕುಸಿತದ ಸಾಧ್ಯತೆ ಇರುವುದರಿಂದ ನದಿ ಪಾತ್ರದ ನಿವಾಸಿಗಳು ತಕ್ಷಣ ಸುರಕ್ಷಿತ ಸ್ಥಳಗಳಿಗೆ ತೆರಳಿ.",
        bot_token="SIMULATED",
        chat_id="SIMULATED",
    )
    res = dispatch_telegram_alert(req)
    assert res.status == "SIMULATED"
    assert "KSDMA CIVIL DEFENSE ALERT" in res.formatted_message
    assert "ತುರ್ತು ವಿಪತ್ತು ಎಚ್ಚರಿಕೆ" in res.formatted_message
    assert "ಚೂರಲ್ಮಲಾ ಮತ್ತು ಮುಂಡಕ್ಕೈ" in res.formatted_message
    assert "372.0 mm" in res.formatted_message
    assert "96.4%" in res.formatted_message
    assert "DIRECTIVE (English):" in res.formatted_message
    assert "ತುರ್ತು ನಿರ್ದೇಶನ (ಕನ್ನಡ):" in res.formatted_message
