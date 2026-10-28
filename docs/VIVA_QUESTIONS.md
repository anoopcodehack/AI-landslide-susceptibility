# GeoShield AI // Mini Project Viva Defense & Technical Q&A Guide
### Visvesvaraya Technological University (VTU) — CSE Department
**Project Title:** AI-Based Landslide Susceptibility Assessment of Wayanad District Using Machine Learning & Explainable AI  
**Team Members:** Anoop A (`4SF24CS021`), Dhruv Shetty (`4SF24CS055`), Dishant Jain (`4SF24CS057`), Ashith C (`4SF24CS027`)

---

## ⚡ 30-Second Elevator Pitch (For Evaluators)
> *"GeoShield is an enterprise-grade spatial hazard decision system designed to predict rainfall-triggered slope failures in the Western Ghats (Wayanad Sector). By fusing NASA SRTM 30m DEM, Sentinel-2 NDVI canopy cohesion, and IMD precipitation telemetry, our system uses an optimized XGBoost & Tree-Ensemble architecture with sub-8ms inference latency. Unlike black-box models, we integrated SHAP TreeExplainer to deliver exact physical factor decompositions (Rainfall 36.5%, Slope 24.3%), tuned an operational threshold of 0.25 guaranteeing >95% disaster recall, and exposed the pipeline via an asynchronous FastAPI backend and a Next.js 14 tactical radar cockpit."*

---

## 🧠 Section A: Machine Learning & Modeling (Anoop A)

### Q1: Why did you compare Random Forest and XGBoost specifically?
**Answer:** Random Forest (bagging) builds deep, independent parallel trees that reduce model variance and prevent overfitting on rugged terrain features. XGBoost (gradient boosting) sequentially builds shallow trees optimizing the residual loss gradient, allowing it to capture subtle nonlinear interactions between steep slopes (>35°) and extreme cloudburst rainfall (>300mm). Under 5-fold cross-validation, XGBoost achieved an ROC-AUC of **0.9400** and PR-AUC of **0.9643**, outperforming baseline models.

### Q2: What is the calibrated threshold of 0.25, and why not use the standard 0.50?
**Answer:** In landslide early warning systems, a **False Negative (missed disaster) is catastrophic and fatal**, whereas a **False Positive (precautionary alert) carries only temporary economic or logistical disruption**. The default 0.50 threshold yielded a Recall of only ~89%. By minimizing the cost function $C = c_{\text{FN}} \times \text{FN} + c_{\text{FP}} \times \text{FP}$ (with $c_{\text{FN}} = 5 \times c_{\text{FP}}$), we tuned the decision threshold to **0.25**, increasing disaster recall to **>95%** while maintaining strong specificity.

### Q3: Why is PR-AUC (Precision-Recall AUC) reported alongside ROC-AUC?
**Answer:** While ROC-AUC evaluates the true positive rate versus false positive rate, it can be overly optimistic when landslide events are geographically localized. PR-AUC focuses directly on the minority positive class without being inflated by the large volume of stable plateau pixels, proving our model maintains high precision under real-world class distributions.

### Q4: How does SHAP (TreeExplainer) provide transparency?
**Answer:** Traditional feature importances (e.g., Gini impurity or gain) give only global rankings and suffer from attribution bias. **SHAP TreeExplainer computes exact Shapley values** from cooperative game theory in $O(TLD^2)$ time. For any individual hillside, it decomposes the log-odds into exact additive physical contributions, proving whether a 95% hazard alert was triggered primarily by torrential rainfall (+0.165) or severe deforestation (+0.032).

---

## ⚙️ Section B: Backend & REST Architecture (Dishant Jain)

### Q1: Why did you choose FastAPI over Flask or Django?
**Answer:** FastAPI is built on Starlette and Pydantic v2, providing asynchronous ASGI concurrency that handles hundreds of simultaneous sensor node telemetry streams without blocking. It provides automatic compile-time request validation, sub-8ms response latency, and auto-generates interactive OpenAPI/Swagger contracts at `/docs`.

### Q2: How does the backend communicate with the machine learning model?
**Answer:** At application startup, FastAPI uses an asynchronous `lifespan` context manager to deserialize `models/landslide_model.joblib` into memory. When an inference request arrives at `POST /api/v1/predict`, the vector is validated against Pydantic schema constraints and executed against the pre-loaded XGBoost model.

### Q3: How do you handle schema mismatches and client flexibility?
**Answer:** Our `PredictionRequest` schema uses a dynamic mapping layer: it natively accepts both standard 5-feature payloads (`rainfall`, `soil`) and Dishant's 6-feature hydrological payloads (`rainfall_mm`, `twi`, `dist_stream_m`) with fallback defaults, ensuring zero runtime HTTP 422 errors.

### Q4: What is the purpose of the `/simulate` endpoint?
**Answer:** The `POST /simulate` endpoint allows civil defense officers to perform parametric stress testing. It takes baseline terrain parameters and applies simulated environmental perturbations (e.g., +30% monsoon burst, -20% vegetation canopy loss), returning the exact hazard delta ($\Delta \text{Risk}$) to anticipate catastrophic events before rainfall begins.

---

## 💻 Section C: Frontend & Decision UI (Dhruv Shetty)

### Q1: Why does GeoShield provide two separate frontends?
**Answer:** 
1. **Streamlit + Folium (`frontend/app.py`):** Fulfills **Objective 3** of the VTU syllabus abstract, delivering a clean, interactive GIS map canvas with slider controls tailored for the viva demonstration.
2. **Next.js 14 App Router (`frontend/`):** Represents an enterprise command center with TypeScript, Tailwind CSS, tactical GIS radar, 72-hour disaster replay player, and printable DDMA civil defense evacuation advisories.

### Q2: What happens if the backend server is offline during a demo?
**Answer:** The Next.js frontend implements an **intelligent multi-tier fallback architecture**. When `POST /api/v1/predict` or `GET /api/v1/dashboard` is unreachable, the frontend seamlessly engages an analytical prior calibrated to Anoop's trained weights and turns the navbar badge to degraded mode. The UI never crashes or shows a blank screen to the evaluator.

### Q3: What is the 72-Hour Historical Replay Player in the Radar?
**Answer:** Located at `/radar`, the replay player reconstructs the hourly meteorological progression of the July 2024 Wayanad disaster (from baseline pre-monsoon up to the 372mm cloudburst at 02:00 IST), demonstrating the dynamic transition of Chooralmala from moderate stability to catastrophic slope failure.

---

## 📐 Section D: Key Mathematical Formulas (Write on Blackboard if Asked!)

1. **Topographic Wetness Index (TWI):**
   $$\text{TWI} = \ln\left(\frac{\alpha}{\tan \beta}\right)$$
   *(Where $\alpha$ is upslope contributing drainage area per unit contour length, and $\beta$ is slope gradient).*

2. **Infinite Slope Factor of Safety ($FS$):**
   $$FS = \frac{c' + (\gamma - m \gamma_w) z \cos^2 \beta \tan \phi'}{\gamma z \sin \beta \cos \beta}$$
   *(When $FS < 1.0$, shear stress exceeds shear strength, triggering failure).*

3. **SHAP Additive Feature Attribution:**
   $$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i$$
   *(Where $\phi_0$ is base expected prediction, and $\phi_i$ is feature attribution).*
