"""Corporate Software Company SaaS Dashboard for Landslide Susceptibility.

1:1 Pixel-Perfect replica of enterprise medical/geospatial command mockups.
Embedded into Streamlit with zero margins, responsive Leaflet GIS radar, and live prediction engine.
"""

from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

# -----------------------------------------------------------------------------
# Streamlit Page Setup (Frameless Enterprise Mode)
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="CityCare // GeoGuard Enterprise Dashboard",
    page_icon="⛰️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Strip all default Streamlit padding, headers, footers for true SaaS display
st.markdown(
    """
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
    }
    iframe {
        border: none !important;
        width: 100% !important;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Load the exact 1:1 pixel-perfect HTML/CSS/JS application
HTML_PATH = Path(__file__).parent / "index.html"

if HTML_PATH.exists():
    html_content = HTML_PATH.read_text(encoding="utf-8")
    # Render with responsive 1000px height
    components.html(html_content, height=980, scrolling=True)
else:
    st.error("Dashboard asset 'frontend/index.html' not found.")
