# Wayanad Landslide Susceptibility API

FastAPI backend for the AI-Based Landslide Susceptibility Assessment of Wayanad project.

## Features

- `GET /health`
- `POST /predict`
- `POST /simulate`
- `GET /explain`
- `GET /dashboard-stats`
- Pydantic request validation
- CORS for local Next.js (`3000`) and Streamlit (`8501`)
- Model loading at application startup
- Swagger UI at `/docs`
- Docker support

## Requirements

Python 3.11 is recommended. The trained model is not included in this archive. Obtain the compatible `landslide_model.joblib` from the teammate responsible for model training and place it in `models/landslide_model.joblib`.

The model must accept the six features in the order and names used in `backend/main.py`, and support `predict_proba`. Confirm its positive class label and preprocessing with the model owner.

## Run locally (zsh)

```zsh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

Open http://127.0.0.1:8000/docs.

The API can start without the model, but model-dependent endpoints return HTTP 503 until the model is available.

## Docker

```zsh
docker build -t wayanad-landslide-api .
docker run --rm -p 8000:8000 wayanad-landslide-api
```

## Prediction example

```json
{
  "slope": 38.5,
  "rainfall_mm": 280.0,
  "elevation": 950.0,
  "twi": 11.2,
  "ndvi": 0.35,
  "dist_stream_m": 45.0
}
```

Send this JSON to `POST /predict`.

## Important limitations

- `/dashboard-stats` contains explicitly labeled demonstration values, not live sensor telemetry.
- Risk category boundaries and `evacuation_alert` are demonstration logic, not validated emergency thresholds or official warnings.
- SHAP support depends on the estimator and model preprocessing; validate explanations against the trained pipeline.
- Susceptibility scores are model outputs, not guarantees of a landslide event.
