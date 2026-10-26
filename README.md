# AI-Based Landslide Susceptibility Assessment Using Geospatial and Environmental Data

A machine learning and GIS framework for identifying and mapping landslide-prone terrain, with explainable factor analysis and an interactive risk-zone visualization interface.

![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?logo=scikit-learn&logoColor=white)
![Status](https://img.shields.io/badge/status-production--ready-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of Contents

1. [Abstract](#abstract)
2. [Objectives & Syllabus Compliance](#objectives--syllabus-compliance)
3. [Problem Statement](#problem-statement)
4. [Methodology](#methodology)
5. [Data and Conditioning Factors](#data-and-conditioning-factors)
6. [System Architecture](#system-architecture)
7. [Tech Stack](#tech-stack)
8. [Project Structure](#project-structure)
9. [Getting Started & Dual Execution Modes](#getting-started--dual-execution-modes)
10. [Benchmark Results & Decision Threshold Tuning](#benchmark-results--decision-threshold-tuning)
11. [Explainable AI (SHAP) Factor Attribution](#explainable-ai-shap-factor-attribution)
12. [Scope](#scope)
13. [Limitations and Out of Scope](#limitations-and-out-of-scope)
14. [Societal Impact and Outcomes](#societal-impact-and-outcomes)
15. [Sustainable Development Goals](#sustainable-development-goals)
16. [Roadmap](#roadmap)
17. [References](#references)
18. [Project Team & Institutional Affiliation](#project-team--institutional-affiliation)
19. [License](#license)
20. [Acknowledgements](#acknowledgements)

---

## Abstract

Landslides are significant natural hazards in hilly and mountainous regions, threatening human life, settlements, transportation infrastructure, agriculture, and the environment. Identifying areas susceptible to slope failure supports disaster risk reduction, land-use planning, and mitigation efforts. 

The proposed system presents an AI-driven landslide susceptibility assessment system specifically focused on landslide-prone areas. The framework integrates historical landslide records with key geospatial and environmental factors, including digital elevation models (slope, aspect, elevation), rainfall indices, soil characteristics, and vegetation indices. Preprocessed datasets are aligned to construct a structured spatial modeling matrix. Machine learning classifiers, including **Random Forest**, **XGBoost**, **LightGBM**, and a **Soft-Voting Ensemble**, are trained and benchmarked using evaluation metrics such as Precision, Recall, F1-Score, ROC-AUC, Precision-Recall AUC (PR-AUC), and confusion matrices. Model interpretability using SHapley Additive exPlanations (SHAP) is incorporated to evaluate factor contributions. The final output is rendered through interactive GIS visualization interfaces (Streamlit + Folium and a production Next.js 14 Coder-style dashboard) displaying classified risk zones.

The primary case study region is **Wayanad District, Kerala (Western Ghats)**. The methodology itself is region-agnostic and can be adapted to other landslide-prone geographies by substituting the input spatial data layers.

---

## Objectives & Syllabus Compliance

This project directly satisfies all requirements defined in the **VTU V Semester B.E. (Computer Science & Engineering)** mini-project curriculum:

| Objective # | Syllabus Requirement (VTU Abstract) | Project Implementation | Primary File(s) | Verification Command |
|:---:|:---|:---|:---|:---|
| **1** | **Data Integration and Spatial Processing:** Compile and preprocess historical landslide inventory data with spatial layers (DEM slope, elevation, aspect, NDVI, rainfall, soil) for Wayanad District. | Normalized 1,500 spatial vectors covering Wayanad; aligned DEM slope/aspect, IMD precipitation, and Sentinel-2 NDVI into structured matrix. | [`src/preprocess.py`](src/preprocess.py)<br>[`data/processed/modeling_matrix.csv`](data/processed/modeling_matrix.csv) | `python src/preprocess.py` |
| **2** | **ML Development, Benchmarking & Explainable AI:** Train, evaluate, and compare tree-based algorithms (Random Forest vs. XGBoost) using ROC-AUC, Precision, Recall, and F1-score. Apply SHAP analysis to determine factor contributions. | 5-Fold Stratified Cross-Validation on Random Forest, XGBoost, LightGBM, and Soft-Voting Ensemble; dual-curve ROC-AUC / PR-AUC analysis; cost-sensitive 0.25 threshold calibration; global/local SHAP waterfalls. | [`src/train.py`](src/train.py)<br>[`src/explain.py`](src/explain.py)<br>[`models/landslide_model.joblib`](models/landslide_model.joblib) | `python src/train.py`<br>`python src/explain.py` |
| **3** | **Interactive GIS Visualization:** Develop an interactive software interface (Streamlit + Folium) that maps high-to-low susceptibility zones across the study region. | **Dual GIS Frontends:**<br>1. Official syllabus Streamlit + Folium interactive map application.<br>2. Enterprise Next.js 14 + Leaflet cockpit with 72-hour disaster replay player. | [`frontend/app.py`](frontend/app.py)<br>[`frontend/app/radar/page.tsx`](frontend/app/radar/page.tsx) | `streamlit run frontend/app.py`<br>`cd frontend && npm run dev` |

---

## Problem Statement

Landslide risk assessment in hilly terrain often depends on manual field surveys and static hazard maps that are slow to update and difficult to scale. This project addresses the need for a reproducible, data-driven approach that:

- Learns the non-linear relationship between terrain and environmental conditions and past slope failures.
- Classifies an entire study region into graded susceptibility zones (Low, Moderate, High, Critical).
- Explains which factors drive the predicted risk using SHAP, ensuring results are interpretable by civil defense planners and domain experts.
- Optimizes decision thresholds to guarantee $>95\%$ Recall (Sensitivity), preventing life-threatening False Negatives.
- Presents output through accessible, interactive GIS mapping interfaces.

---

## Methodology

1. **Data Acquisition:** Collect historical landslide scars (GSI / KSDMA), NASA SRTM 30m DEM, IMD gridded daily rainfall, and Sentinel-2 multispectral imagery.
2. **Preprocessing & CRS Alignment:** Project and align all rasters to a unified grid (WGS84 / UTM Zone 43N).
3. **Spatial Feature Extraction:** Compute DEM slope, aspect, Topographic Wetness Index (TWI), distance to streams, and vegetation index (NDVI).
4. **Modeling Matrix Construction:** Assemble 1,500 balanced spatial points with ground-truth labels (`0 = Stable`, `1 = Landslide Failure`).
5. **Stratified 5-Fold Cross-Validation:** Train and benchmark Logistic Regression baseline, Random Forest, LightGBM, XGBoost, and a Soft-Voting Ensemble.
6. **Cost-Sensitive Threshold Tuning:** Calibrate operational decision threshold from $0.50$ down to $0.25$ to achieve $\ge 95\%$ Recall.
7. **Explainable AI (XAI):** Generate SHAP summary beeswarms, factor rankings, slope dependence plots, and local waterfall case studies.
8. **Interactive Spatial Visualization:** Render classified zones and 72-hour temporal progression on Streamlit + Folium and Next.js 14 Leaflet dashboards.

---

## Data and Conditioning Factors

| Factor | Derived From | Role |
|---|---|---|
| **Slope (Gradient)** | NASA SRTM 30m DEM | Gravitational shear stress along mountain escarpments |
| **Elevation** | NASA SRTM 30m DEM | Topographic position, gravitational head, and orographic rainfall zones |
| **Aspect** | NASA SRTM 30m DEM | Slope orientation affecting southwest monsoon rain exposure |
| **Rainfall Index** | IMD Gridded Telemetry | Primary triggering mechanism driving pore-water pressure and soil saturation |
| **Soil Saturation / Permeability** | GSI Soil Maps | Material shear strength and subsurface drainage characteristics |
| **Vegetation Index (NDVI)** | Sentinel-2 L2A Reflectance | Root tensile strength acting as natural slope stabilization |
| **Landslide Inventory** | GSI Bhukosh / KSDMA | Ground-truth labels for supervised machine learning |

---

## System Architecture

```
                       +------------------------------------------+
                       |      RAW GEOSPATIAL & SENSOR INGESTION   |
                       | NASA SRTM 30m DEM • IMD Rainfall • Sentinel-2 |
                       +------------------------------------------+
                                            |
                                            v
                       +------------------------------------------+
                       |       SPATIAL DATA ENGINEERING (Ashith)  |
                       |       src/preprocess.py • EPSG:32643     |
                       |   Generates: data/processed/matrix.csv   |
                       +------------------------------------------+
                                            |
                                            v
                       +------------------------------------------+
                       |       MACHINE LEARNING & XAI (Anoop)     |
                       | 5-Fold CV: RF, XGBoost, LightGBM, Ensemble|
                       | Threshold Calib (0.25) • SHAP Explainer  |
                       | Saves: models/landslide_model.joblib     |
                       +------------------------------------------+
                                            |
                                            v
                       +------------------------------------------+
                       |       BACKEND REST GATEWAY (Dishant)     |
                       | FastAPI Asynchronous Engine • Pydantic   |
                       | Exposes: /health, /predict, /simulate    |
                       +------------------------------------------+
                                            |
                                            v
                       +------------------------------------------+
                       |    INTERACTIVE GIS VISUALIZATION (Dhruv) |
                       | 1. Streamlit + Folium GIS (frontend/app.py) |
                       | 2. Next.js 14 Coder Dashboard (frontend/)|
                       +------------------------------------------+
```

---

## Tech Stack

| Area | Technologies |
|---|---|
| **Languages** | Python 3.10+, TypeScript 5.6+ |
| **Machine Learning** | scikit-learn, XGBoost, LightGBM |
| **Explainable AI (XAI)** | SHAP (TreeExplainer) |
| **Backend & REST API** | FastAPI, Uvicorn, Pydantic |
| **Syllabus GIS Interface (Obj. 3)** | Streamlit, Folium, GeoPandas |
| **Production Web Platform** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Geospatial Mapping** | Leaflet, Esri World Imagery, OpenStreetMap |

---

## Project Structure

```
.
├── data/
│   ├── raw/                    # Raw DEM, NDVI, rainfall, soil records
│   └── processed/              # Aligned spatial modeling matrix (1,500 samples)
├── models/
│   ├── landslide_model.joblib  # Serialized winning model artifact with threshold metadata
│   ├── model_metrics.json      # Benchmark records & calibration parameters
│   └── test_data.joblib        # Held-out evaluation test set
├── src/
│   ├── preprocess.py           # Geospatial pre-processing & matrix generator (Ashith C)
│   ├── train.py                # Multi-model benchmarking & threshold tuning (Anoop A)
│   ├── explain.py              # SHAP beeswarm & waterfall explanations (Anoop A)
│   └── predict.py              # Spatial susceptibility inference engine
├── backend/
│   └── main.py                 # FastAPI asynchronous REST endpoints (Dishant Jain)
├── frontend/                   # Full-Stack Next.js 14 & Streamlit Applications (Dhruv Shetty)
│   ├── app.py                  # Objective 3: Interactive Streamlit + Folium GIS app
│   ├── app/                    # Next.js 14 App Router full pages
│   │   ├── page.tsx            # Overview & Telemetry Command Center
│   │   ├── radar/page.tsx      # Full-page GIS Radar & 72h Timeline Replay
│   │   ├── simulation/page.tsx # Full-page Parametric Simulation Studio
│   │   ├── diagnostics/page.tsx# Full-page XAI Benchmarking & Auditing Whitepaper
│   │   └── governance/page.tsx # Full-page System Architecture & UN SDG 11
│   ├── components/             # Reusable enterprise UI components (Navbar, Gauges, Dock)
│   ├── public/docs/            # Publicly served benchmark plots & evaluation figures
│   └── package.json            # Frontend dependencies
├── docs/                       # High-resolution benchmark figures & evaluation CSVs
│   ├── model_benchmark_table.csv
│   ├── roc_curves.png
│   ├── pr_curves.png
│   ├── threshold_tuning_plot.png
│   ├── confusion_matrix.png
│   ├── shap_summary.png
│   ├── shap_importance_bar.png
│   ├── shap_local_high_risk.png
│   ├── shap_local_low_risk.png
│   └── shap_dependence_slope.png
├── requirements.txt
├── LICENSE
└── README.md
```

---

## Getting Started & Dual Execution Modes

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- Git

### Installation

```bash
git clone https://github.com/anoopcodehack/AI-landslide-susceptibility.git
cd AI-landslide-susceptibility
python -m venv venv
venv\Scripts\activate            # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
```

---

### Execution Mode A: Official Syllabus Viva Demo (Streamlit + Folium)
Directly fulfills **Objective 3** of the VTU syllabus abstract:

```bash
streamlit run frontend/app.py
```
* Opens interactive Folium GIS map at [http://localhost:8501](http://localhost:8501) with live parametric hazard sliders and choropleth risk overlays.

---

### Execution Mode B: Enterprise Production Cockpit (FastAPI + Next.js 14)

#### Terminal 1 — Start the FastAPI Backend
```bash
uvicorn backend.main:app --reload --port 8000
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Status: [http://localhost:8000/health](http://localhost:8000/health)

#### Terminal 2 — Start the Next.js 14 Application
```bash
cd frontend
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)
- Full Pages:
  - **Overview:** [http://localhost:3000](http://localhost:3000)
  - **GIS Radar:** [http://localhost:3000/radar](http://localhost:3000/radar)
  - **Simulation Studio:** [http://localhost:3000/simulation](http://localhost:3000/simulation)
  - **XAI Diagnostics:** [http://localhost:3000/diagnostics](http://localhost:3000/diagnostics)
  - **Governance & SDGs:** [http://localhost:3000/governance](http://localhost:3000/governance)

---

## Benchmark Results & Decision Threshold Tuning

Comprehensive 5-Fold Stratified Cross-Validation on held-out test data (300 spatial grid points across Wayanad):

| Architecture | Accuracy | Precision | Recall | Specificity | F1-Score | ROC-AUC | PR-AUC (AP) | 5-Fold CV AUC |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Logistic Regression** | 87.7% | 90.3% | 89.8% | 84.1% | 0.9008 | **0.9472** | **0.9703** | 0.9555 ± 0.0116 |
| **Ensemble (RF+XGB+LGBM)** | 86.0% | 88.4% | 89.3% | 80.5% | 0.8883 | 0.9385 | 0.9640 | 0.9413 ± 0.0157 |
| **XGBoost Classifier** | 85.3% | 87.4% | 89.3% | 78.8% | 0.8836 | 0.9400 | 0.9643 | 0.9417 ± 0.0155 |
| **LightGBM Classifier** | 85.0% | 88.6% | 87.2% | 81.4% | 0.8787 | 0.9380 | 0.9645 | 0.9389 ± 0.0148 |
| **Random Forest Classifier** | 84.7% | 86.9% | 88.8% | 77.9% | 0.8783 | 0.9367 | 0.9635 | 0.9369 ± 0.0178 |

### Cost-Sensitive Threshold Calibration
Standard classification assumes a $0.50$ decision threshold. In landslide disaster prevention, a False Negative (missed landslide) results in casualties, while a False Positive results in temporary evacuation. By tuning the operational threshold to **`0.25`**, the system guarantees **$\ge 95\%$ Recall (Sensitivity)**, virtually eliminating missed disaster events.

---

## Explainable AI (SHAP) Factor Attribution

SHAP (SHapley Additive exPlanations) TreeExplainer analysis highlights the geotechnical ranking of conditioning factors:

| Rank | Conditioning Factor | Code | Relative Importance | Primary Geotechnical Role |
|:---:|:---|:---:|:---:|:---|
| 1 | **24h Rainfall Index** | `rainfall` | **40.5%** | Primary pore-pressure liquefaction trigger |
| 2 | **DEM Slope Incline** | `slope` | **25.8%** | Gravitational shear stress driver along steep slopes |
| 3 | **Sentinel-2 NDVI** | `ndvi` | **13.3%** | Root cohesion deficit in barren / tea plantation slopes |
| 4 | **SRTM Elevation** | `elevation` | **12.8%** | Orographic precipitation and gravitational potential |
| 5 | **Soil Saturation** | `soil` | **7.6%** | Regolith plasticity and subsurface drainage capacity |

---

## Scope

1. **Disaster Management Prioritization:** Enables KSDMA and district authorities to identify vulnerable corridors (Chooralmala, Mundakkai, Vythiri) and deploy resources ahead of extreme monsoon events.
2. **Infrastructure & Highway Protection:** Provides Public Works Departments with quantitative terrain assessments along NH-766 and hillside transit spans.
3. **Environmental Conservation:** Tracks deforestation impact on regional slope stability through Sentinel-2 NDVI telemetry.

---

## Limitations and Out of Scope

- **In Scope:** Spatial susceptibility mapping, multi-model benchmarking, SHAP factor interpretability, cost-sensitive threshold tuning, and interactive GIS visualization.
- **Out of Scope:** Exact millisecond temporal rupture forecasting, physical seismograph sensor deployment, and siren hardware automation.

---

## Societal Impact and Outcomes

The framework directly supports evidence-based disaster mitigation, land-use zoning, and human life preservation across vulnerable mountainous communities in the Western Ghats.

---

## Sustainable Development Goals

| Goal | Title | Target & Alignment |
|:---:|:---|:---|
| **SDG 11** | Sustainable Cities and Communities | **Target 11.5:** Substantially reduce deaths and economic losses caused by water-related disasters. |
| **SDG 13** | Climate Action | **Target 13.1:** Strengthen resilience and adaptive capacity to climate-induced cloudburst hazards. |
| **SDG 15** | Life on Land | **Target 15.4:** Ensure conservation of mountain ecosystems and prevent slope degradation. |

---

## Roadmap

- [x] Data collection and spatial preprocessing (NASA SRTM 30m, IMD Rainfall, Sentinel-2)
- [x] Spatial modeling matrix construction (1,500 samples across Wayanad District)
- [x] Multi-model training and benchmarking (Logistic Regression, RF, LightGBM, XGBoost, Ensemble)
- [x] Precision-Recall curve evaluation and cost-sensitive threshold calibration (0.25 threshold)
- [x] SHAP-based interpretability analysis (Global beeswarm, feature ranking, local waterfalls)
- [x] Objective 3: Interactive Streamlit + Folium GIS dashboard (`frontend/app.py`)
- [x] Production Next.js 14 full-page enterprise console (`/radar`, `/simulation`, `/diagnostics`, `/governance`)
- [x] Testing, documentation, and viva demonstration verification

---

## References

1. A. L. Achu et al., "Machine-learning based landslide susceptibility modelling with emphasis on uncertainty analysis," *Geoscience Frontiers*, vol. 14, no. 6, Art. no. 101657, 2023.
2. M. M. Abdelkader and Á. Csámer, "Comparative assessment of machine learning models for landslide susceptibility mapping: a focus on validation and accuracy," *Natural Hazards*, vol. 121, pp. 10299–10321, 2025.

---

## Project Team & Institutional Affiliation

**Bachelor of Engineering in Computer Science & Engineering (Semester V)**  
**Sahyadri College of Engineering & Management (Autonomous Institution)**  
**Visvesvaraya Technological University (VTU), Belagavi — Academic Year 2026-27**

| Student Name | USN | Project Role | Contribution Area | GitHub |
|:---|:---:|:---|:---|:---:|
| **Anoop A** | `4SF24CS021` | Team Lead & Machine Learning | ML Benchmarking, SHAP Interpretability, Threshold Calibration | [@anoopcodehack](https://github.com/anoopcodehack) |
| **Ashith C** | `4SF24CS027` | Geospatial Data Engineer | Spatial Preprocessing, DEM / NDVI Extraction, Matrix Alignment | — |
| **Dhruv Shetty** | `4SF24CS055` | Frontend & GIS Engineer | Streamlit + Folium Map (Obj. 3) & Next.js 14 Cockpit | — |
| **Dishant Jain** | `4SF24CS057` | Backend Systems Engineer | FastAPI Architecture, Pydantic Validation, REST Gateway | — |

**Project Mentor:** Dr. Joyline D'sa, Professor, Department of Computer Science & Engineering.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

## Acknowledgements

- **Dr. Joyline D'sa**, Professor, Department of CSE, for academic guidance and continuous mentorship.
- **Department of Computer Science & Engineering, Sahyadri College of Engineering & Management**, for providing high-performance computing infrastructure and laboratory facilities.
- **CLOUDS (CSE Students' Association)**, Sahyadri, and the organizers of **PosterPitch 2026**, where this research was recognized as **Winner in Panel 6**.
