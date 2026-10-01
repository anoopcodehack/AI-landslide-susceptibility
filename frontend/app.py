"""Streamlit frontend for the landslide susceptibility dashboard."""

import requests
import streamlit as st

API_URL = "http://localhost:8000"

st.set_page_config(page_title="Landslide Susceptibility", page_icon="⛰️", layout="wide")
st.title("AI-Based Landslide Susceptibility Assessment")
st.caption("Prototype dashboard for Wayanad District, Kerala")

with st.sidebar:
    st.header("Conditioning factors")
    slope = st.slider("Slope (degrees)", 0.0, 90.0, 25.0)
    elevation = st.number_input("Elevation (metres)", min_value=0.0, value=800.0)
    rainfall = st.number_input("Rainfall index", min_value=0.0, value=150.0)
    soil = st.number_input("Soil characteristic", min_value=0.0, value=0.5)
    ndvi = st.slider("NDVI", -1.0, 1.0, 0.5)
    submit = st.button("Assess susceptibility", type="primary")

if submit:
    payload = {
        "slope": slope,
        "elevation": elevation,
        "rainfall": rainfall,
        "soil": soil,
        "ndvi": ndvi,
    }
    try:
        response = requests.post(f"{API_URL}/api/v1/predict", json=payload, timeout=10)
        response.raise_for_status()
        result = response.json()
        left, right = st.columns(2)
        left.metric("Susceptibility score", f"{result['susceptibility']:.1%}")
        right.metric("Risk zone", result["zone"])
    except requests.RequestException:
        st.error("The backend is unavailable. Start it with: uvicorn backend.main:app --reload")
else:
    st.info("Set the conditioning factors and click **Assess susceptibility**.")
