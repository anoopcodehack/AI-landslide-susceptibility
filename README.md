# AI-Based Landslide Susceptibility Assessment Using Geospatial and Environmental Data

A machine learning and GIS framework for identifying and mapping landslide-prone terrain, with explainable factor analysis and an interactive risk-zone visualization interface.

![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![Status](https://img.shields.io/badge/status-in%20development-orange)
![License](https://img.shields.io/badge/license-MIT-green)

Mini Project | V Semester, B.E. Computer Science & Engineering | Academic Year 2026-27
Sahyadri College of Engineering & Management (An Autonomous Institution), Mangaluru
Affiliated to Visvesvaraya Technological University (VTU), Belagavi

---

## Table of Contents

1. [Abstract](#abstract)
2. [Problem Statement](#problem-statement)
3. [Objectives](#objectives)
4. [Methodology](#methodology)
5. [Data and Conditioning Factors](#data-and-conditioning-factors)
6. [System Architecture](#system-architecture)
7. [Tech Stack](#tech-stack)
8. [Project Structure](#project-structure)
9. [Getting Started](#getting-started)
10. [Results](#results)
11. [Scope](#scope)
12. [Limitations and Out of Scope](#limitations-and-out-of-scope)
13. [Societal Impact and Outcomes](#societal-impact-and-outcomes)
14. [Sustainable Development Goals](#sustainable-development-goals)
15. [Roadmap](#roadmap)
16. [References](#references)
17. [Team](#team)
18. [License](#license)
19. [Acknowledgements](#acknowledgements)

---

## Abstract

Landslides are significant natural hazards in hilly and mountainous regions, threatening human life, settlements, transportation infrastructure, agriculture, and the environment. Identifying areas susceptible to slope failure supports disaster risk reduction, land-use planning, and mitigation efforts.

This project presents an AI-driven landslide susceptibility assessment system for landslide-prone areas. The framework integrates historical landslide records with key geospatial and environmental factors, including digital elevation models (slope, aspect, elevation), rainfall indices, soil characteristics, and vegetation indices. Preprocessed datasets are aligned to construct a structured spatial modeling matrix. Machine learning classifiers, namely Random Forest and XGBoost, are trained and benchmarked using Precision, Recall, F1-Score, ROC-AUC, and confusion matrices. Model interpretability using SHapley Additive exPlanations (SHAP) is incorporated to evaluate factor contributions. The final output is rendered through an interactive Geographic Information System (GIS) visualization interface displaying classified risk zones.

The initial case study region is **Wayanad District, Kerala (Western Ghats)**. The methodology itself is region-agnostic and can be adapted to other landslide-prone geographies by substituting the input data layers.

## Problem Statement

Landslide risk assessment in hilly terrain often depends on manual field surveys and static hazard maps that are slow to update and difficult to scale. This project addresses the need for a reproducible, data-driven approach that:

- Learns the relationship between terrain and environmental conditions and past slope failures.
- Classifies an entire study region into graded susceptibility zones.
- Explains which factors drive the predicted risk, so results are interpretable by planners and domain experts.
- Presents the output in an accessible interactive map interface.

## Objectives

1. **Data Integration and Spatial Processing**
   Compile and preprocess historical landslide inventory data with spatial layers (DEM-derived slope, elevation, and aspect; NDVI; rainfall; soil) for the study region.

2. **Machine Learning Development and Benchmarking**
   Train, evaluate, and compare tree-based algorithms (Random Forest and XGBoost) using ROC-AUC, Precision, Recall, and F1-Score.

3. **Model Interpretability (Explainable AI)**
   Apply SHAP analysis to determine the contribution of each factor driving slope failure across the region.

4. **Interactive GIS Visualization**
   Develop an interactive software interface (Streamlit and Folium) that maps high-to-low susceptibility zones across the study region.

## Methodology

1. **Data acquisition:** Collect the historical landslide inventory and the raster/vector layers for terrain, rainfall, soil, and vegetation.
2. **Preprocessing and alignment:** Reproject, resample, and align all layers to a common grid and coordinate reference system.
3. **Spatial modeling matrix:** Extract conditioning-factor values at landslide and non-landslide locations to build the labeled training matrix.
4. **Model training:** Train Random Forest and XGBoost classifiers on the matrix with a held-out validation split.
5. **Evaluation and benchmarking:** Compare models using Precision, Recall, F1-Score, ROC-AUC, and confusion matrices.
6. **Explainability:** Compute SHAP values to rank and interpret factor contributions, globally and per prediction.
7. **Susceptibility mapping:** Apply the selected model across the study grid and classify output probabilities into risk zones, from low to high.
8. **Visualization:** Render the classified zones on an interactive web map.

## Data and Conditioning Factors

| Factor | Derived From | Role |
|---|---|---|
| Slope | Digital Elevation Model (DEM) | Terrain steepness driving gravitational stress |
| Elevation | DEM | Topographic position and associated climate effects |
| Aspect | DEM | Slope orientation affecting moisture and exposure |
| Rainfall index | Rainfall records | Primary triggering factor through soil saturation |
| Soil characteristics | Soil maps | Material strength and permeability |
| Vegetation index (NDVI) | Satellite imagery | Root reinforcement and land-cover condition |
| Landslide inventory | Historical records | Ground-truth labels for supervised learning |

Data sources and licensing details will be documented in `data/README.md` once the datasets are finalized.

## System Architecture

```
Landslide Inventory ─┐
DEM (slope/aspect/   │
elevation)           │
Rainfall Indices     ├──> Preprocessing ──> Spatial Modeling ──> Model Training ──> Evaluation
Soil Data            │    and Alignment     Matrix               (RF, XGBoost)      (P, R, F1, AUC)
NDVI                 ┘                                                 │
                                                                       v
                                                              SHAP Explainability
                                                                       │
                                                                       v
                                                        Susceptibility Classification
                                                                       │
                                                                       v
                                                     Streamlit + Folium GIS Dashboard
```

## Tech Stack

| Area | Tools |
|---|---|
| Language | Python |
| Machine learning | scikit-learn, XGBoost |
| Explainability | SHAP |
| Geospatial processing | GIS tooling for DEM, NDVI, and spatial feature extraction |
| Web interface and visualization | Streamlit, Folium |

## Project Structure

```
.
├── data/
│   ├── raw/                # Landslide inventory, DEM, NDVI, rainfall, soil
│   └── processed/          # Aligned spatial modeling matrix
├── notebooks/              # Exploratory data analysis and experiments
├── src/
│   ├── preprocess.py       # Layer alignment and feature extraction
│   ├── train.py            # Model training and benchmarking
│   ├── explain.py          # SHAP analysis
│   └── predict.py          # Susceptibility classification over the study grid
├── app/
│   └── app.py              # Streamlit + Folium dashboard
├── docs/                   # Abstract, report, figures
├── requirements.txt
├── LICENSE
└── README.md
```

The structure above is the planned layout and will be updated as the repository develops.

## Getting Started

### Prerequisites

- Python 3.10 or higher
- pip
- Git

### Installation

```bash
git clone https://github.com/anoopcodehack/<repo-name>.git
cd <repo-name>
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Usage

```bash
# 1. Preprocess and build the spatial modeling matrix
python src/preprocess.py

# 2. Train and benchmark the models
python src/train.py

# 3. Generate SHAP explanations
python src/explain.py

# 4. Launch the interactive dashboard
streamlit run app/app.py
```

## Results

To be added after model training and validation.

| Model | Precision | Recall | F1-Score | ROC-AUC |
|---|---|---|---|---|
| Random Forest | - | - | - | - |
| XGBoost | - | - | - | - |

Planned outputs: confusion matrices, ROC curves, SHAP summary plots, and the classified susceptibility map.

## Scope

The system is designed as a spatial decision-support tool for the following use cases.

1. **Disaster management and mitigation prioritization**
   Helps state and district disaster management authorities identify critical high-risk zones and prioritize mitigation resources ahead of monsoon seasons.

2. **Regional land-use and infrastructure planning**
   Gives city planners, civil engineers, and public works departments data-backed terrain safety assessments before approving road construction, building development, or hillside infrastructure.

3. **Environmental and forest conservation**
   Assists environmental officers in tracking how land-use change, deforestation, and vegetation cover variation (monitored through vegetation indices) affect regional slope stability.

## Limitations and Out of Scope

**In scope:** software-based spatial susceptibility mapping, machine learning model comparison, explainable AI factor ranking, and a working prototype interactive GIS web interface.

**Out of scope:**
- Exact temporal prediction (forecasting when a landslide will occur)
- Large-scale commercial hardware deployment across a district
- Real-time satellite or radar integration
- Automated government alert or siren systems

**Disclaimer:** This is an academic project. Outputs are intended for research and preliminary planning only and must not be used as an official hazard warning or as a substitute for field investigation by qualified geotechnical professionals.

## Societal Impact and Outcomes

Landslides in vulnerable mountainous terrain cause sudden loss of life and severe infrastructure damage. The proposed system provides a data-driven machine learning model to identify and map high-risk terrain. The resulting GIS visualization interface acts as a decision-support tool for preliminary land-use planning, hazard mitigation, and disaster preparedness. The underlying software methodology is scalable and adaptable across diverse landslide-prone geographic regions.

## Sustainable Development Goals

This project aligns with the following United Nations Sustainable Development Goals:

| Goal | Title |
|---|---|
| SDG 11 | Sustainable Cities and Communities |
| SDG 13 | Climate Action |
| SDG 15 | Life on Land |

## Roadmap

- [ ] Data collection and preprocessing
- [ ] Spatial modeling matrix construction
- [ ] Random Forest and XGBoost training and benchmarking
- [ ] SHAP-based interpretability analysis
- [ ] Susceptibility classification and mapping
- [ ] Streamlit and Folium dashboard
- [ ] Testing, documentation, and demo
- [ ] Extension to additional study regions

## References

1. A. L. Achu et al., "Machine-learning based landslide susceptibility modelling with emphasis on uncertainty analysis," *Geoscience Frontiers*, vol. 14, no. 6, Art. no. 101657, 2023.
2. M. M. Abdelkader and Á. Csámer, "Comparative assessment of machine learning models for landslide susceptibility mapping: a focus on validation and accuracy," *Natural Hazards*, vol. 121, pp. 10299-10321, 2025.

## Team

| Name | USN | GitHub |
|---|---|---|
| Ashith C | 4SF24CS027 | |
| Anoop A | 4SF24CS021 | [@anoopcodehack](https://github.com/anoopcodehack) |
| Dishant Jain | 4SF24CS057 | |
| Dhruv Shetty | 4SF24CS055 | |

**Project Guide:** Dr. Joylin D'sa, Professor, Department of Computer Science & Engineering, Sahyadri College of Engineering & Management, Mangaluru.

**Submitted in partial fulfillment of the requirements of the V Semester, Bachelor of Engineering in Computer Science & Engineering, Visvesvaraya Technological University, Belagavi, 2026-27.**

## License

Distributed under the MIT License. See `LICENSE` for details.

## Acknowledgements

- Dr. Joylin D'sa, for guidance and support throughout the project.
- Department of Computer Science & Engineering, Sahyadri College of Engineering & Management, for the platform and resources.
- CLOUDS, the CSE Students' Association, Sahyadri, and the organizers of PosterPitch 2026, where this project was presented and recognized as Winner in Panel 6.