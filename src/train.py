"""Model training and benchmarking pipeline for AI Landslide Susceptibility.

Trains Random Forest and XGBoost classifiers on the spatial modeling matrix,
evaluates precision, recall, f1-score, and ROC-AUC, and exports the top model artifact.
"""

from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

FEATURES = ["slope", "elevation", "rainfall", "soil", "ndvi"]
TARGET = "landslide_label"


def load_and_split_data(data_path: Path, test_size: float = 0.20, random_state: int = 42):
    """Load spatial matrix, validate features, and split 80/20 stratified."""
    if not data_path.exists():
        raise FileNotFoundError(f"Matrix file not found at {data_path}. Run 'python src/preprocess.py' first.")

    df = pd.read_csv(data_path)
    print(f"\n[EDA] Loaded modeling matrix: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"[EDA] Missing values detected: {df[FEATURES + [TARGET]].isnull().sum().to_dict()}")
    print(f"[EDA] Class distribution:\n{df[TARGET].value_counts(normalize=True).to_dict()}")

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    print(f"[SPLIT] Train samples: {len(X_train)} | Test samples: {len(X_test)}")
    return X_train, X_test, y_train, y_test


def evaluate_model(name: str, model, X_test: pd.DataFrame, y_test: pd.Series) -> dict[str, float]:
    """Calculate and display standard evaluation metrics."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    print(f"\n==================== {name.upper()} RESULTS ====================")
    print(f"Accuracy  : {acc:.4f}")
    print(f"Precision : {prec:.4f}")
    print(f"Recall    : {rec:.4f}")
    print(f"F1-Score  : {f1:.4f}")
    print(f"ROC-AUC   : {auc:.4f}")
    print(f"Confusion Matrix:\n{cm}")
    print("---------------------------------------------------------")

    return {
        "model": name,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "roc_auc": auc,
        "cm": cm,
    }


def train_and_benchmark(data_path: Path = Path("data/processed/modeling_matrix.csv"), models_dir: Path = Path("models")):
    """Run full benchmarking suite and persist winning model artifact."""
    X_train, X_test, y_train, y_test = load_and_split_data(data_path)

    # 1. Random Forest Classifier
    print("\n[TRAIN] Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1,
    )
    rf_model.fit(X_train, y_train)
    rf_metrics = evaluate_model("Random Forest", rf_model, X_test, y_test)

    # 2. XGBoost Classifier
    print("\n[TRAIN] Training XGBoost Classifier...")
    xgb_model = XGBClassifier(
        n_estimators=150,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.85,
        eval_metric="logloss",
        random_state=42,
    )
    xgb_model.fit(X_train, y_train)
    xgb_metrics = evaluate_model("XGBoost", xgb_model, X_test, y_test)

    # Benchmarking Summary
    summary_df = pd.DataFrame([rf_metrics, xgb_metrics])[["model", "accuracy", "precision", "recall", "f1_score", "roc_auc"]]
    print("\n[BENCHMARK] MODEL BENCHMARKING COMPARISON:")
    print(summary_df.to_string(index=False))

    # Select Best Model based on ROC-AUC
    best_model, best_name = (
        (xgb_model, "XGBoost") if xgb_metrics["roc_auc"] >= rf_metrics["roc_auc"] else (rf_model, "Random Forest")
    )
    print(f"\n[WINNER] Selected Top Model: {best_name}")

    # Save artifact
    models_dir.mkdir(parents=True, exist_ok=True)
    artifact_path = models_dir / "landslide_model.joblib"
    joblib.dump(
        {
            "model": best_model,
            "model_name": best_name,
            "features": FEATURES,
            "metrics": xgb_metrics if best_name == "XGBoost" else rf_metrics,
        },
        artifact_path,
    )
    print(f"[SAVE] Exported serialized model artifact: {artifact_path}")

    # Also persist test set for SHAP evaluation
    test_artifact_path = models_dir / "test_data.joblib"
    joblib.dump({"X_test": X_test, "y_test": y_test}, test_artifact_path)
    print(f"[SAVE] Exported evaluation test set: {test_artifact_path}")


def main() -> None:
    train_and_benchmark()


if __name__ == "__main__":
    main()
