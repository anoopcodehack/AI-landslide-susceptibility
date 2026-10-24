"""Model training and benchmarking pipeline for AI Landslide Susceptibility.

Performs EDA, 5-fold stratified cross-validation, hyperparameter tuning,
evaluation of Random Forest vs XGBoost, exports ROC curves, confusion matrix,
and serializes the winning model artifact to models/landslide_model.joblib.
"""

from pathlib import Path
import json
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from xgboost import XGBClassifier

FEATURES = ["slope", "elevation", "rainfall", "soil", "ndvi"]
TARGET = "landslide_label"


def perform_eda_and_correlation(df: pd.DataFrame, output_dir: Path) -> None:
    """Analyze feature distributions, verify data integrity, and save correlation heatmap."""
    print("=" * 65)
    print("               EXPLORATORY DATA ANALYSIS (EDA)")
    print("=" * 65)
    print(f"Dataset Shape       : {df.shape[0]} samples, {df.shape[1]} features")
    print(f"Missing Values Check: {df[FEATURES + [TARGET]].isnull().sum().to_dict()}")
    
    class_counts = df[TARGET].value_counts()
    pos_pct = (class_counts.get(1, 0) / len(df)) * 100
    neg_pct = (class_counts.get(0, 0) / len(df)) * 100
    print(f"Class Distribution  : Class 0 (Safe): {class_counts.get(0, 0)} ({neg_pct:.1f}%) | Class 1 (Hazard): {class_counts.get(1, 0)} ({pos_pct:.1f}%)")

    print("\nFeature Summary Statistics:")
    print(df[FEATURES].describe().round(2).to_string())

    # Generate and save correlation heatmap
    output_dir.mkdir(parents=True, exist_ok=True)
    corr = df[FEATURES + [TARGET]].corr()

    plt.figure(figsize=(8, 6), dpi=300)
    sns.heatmap(
        corr,
        annot=True,
        cmap="coolwarm",
        fmt=".3f",
        linewidths=0.8,
        cbar_kws={"label": "Pearson Correlation Coefficient"},
    )
    plt.title("Geospatial & Environmental Feature Correlation Matrix\n(Wayanad Landslide Dataset)", fontsize=12, pad=12)
    plt.tight_layout()
    corr_path = output_dir / "correlation_matrix.png"
    plt.savefig(corr_path, bbox_inches="tight")
    plt.close()
    print(f"\n[EDA] Saved Feature Correlation Matrix -> {corr_path}")


def load_and_split_data(data_path: Path, docs_dir: Path, test_size: float = 0.20, random_state: int = 42):
    """Load spatial matrix, execute EDA, and split into 80% train / 20% test (stratified)."""
    if not data_path.exists():
        raise FileNotFoundError(f"Matrix file not found at {data_path}. Run 'python src/preprocess.py' first.")

    df = pd.read_csv(data_path)
    perform_eda_and_correlation(df, docs_dir)

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    print(f"\n[SPLIT] 80/20 Stratified Partition: {len(X_train)} Train samples | {len(X_test)} Test samples")
    return X_train, X_test, y_train, y_test


def evaluate_model(name: str, model, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    """Calculate comprehensive evaluation metrics and ROC curves."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred)
    fpr, tpr, _ = roc_curve(y_test, y_prob)

    tn, fp, fn, tp = cm.ravel()
    specificity = float(tn / (tn + fp))

    print(f"\n==================== {name.upper()} TEST METRICS ====================")
    print(f"Accuracy    : {acc:.4f} ({acc*100:.1f}%)")
    print(f"Precision   : {prec:.4f} ({prec*100:.1f}%)")
    print(f"Recall      : {rec:.4f} ({rec*100:.1f}%)")
    print(f"Specificity : {specificity:.4f} ({specificity*100:.1f}%)")
    print(f"F1-Score    : {f1:.4f}")
    print(f"ROC-AUC     : {auc:.4f}")
    print(f"Confusion Matrix [TN={tn}, FP={fp}, FN={fn}, TP={tp}]:\n{cm}")
    print("-" * 55)

    return {
        "model": name,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "specificity": specificity,
        "f1_score": f1,
        "roc_auc": auc,
        "confusion_matrix": cm.tolist(),
        "fpr": fpr.tolist(),
        "tpr": tpr.tolist(),
    }


def plot_confusion_matrix(cm_data: list, model_name: str, output_path: Path) -> None:
    """Export annotated confusion matrix plot."""
    cm = np.array(cm_data)
    plt.figure(figsize=(6, 5), dpi=300)
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=["Safe (0)", "Hazard (1)"],
        yticklabels=["Safe (0)", "Hazard (1)"],
        cbar=False,
        annot_kws={"size": 14, "weight": "bold"},
    )
    plt.title(f"Test Confusion Matrix // {model_name}\n(Wayanad Susceptibility Benchmark)", fontsize=11, pad=12)
    plt.xlabel("Predicted Class", fontsize=10, labelpad=8)
    plt.ylabel("Ground Truth Class", fontsize=10, labelpad=8)
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches="tight")
    plt.close()
    print(f"[PLOT] Saved Confusion Matrix -> {output_path}")


def plot_roc_curves(rf_eval: dict, xgb_eval: dict, output_path: Path) -> None:
    """Generate side-by-side comparative ROC curve plot."""
    plt.figure(figsize=(7, 6), dpi=300)
    plt.plot(
        rf_eval["fpr"],
        rf_eval["tpr"],
        label=f"Random Forest (AUC = {rf_eval['roc_auc']:.4f})",
        color="#2563eb",
        linewidth=2,
    )
    plt.plot(
        xgb_eval["fpr"],
        xgb_eval["tpr"],
        label=f"XGBoost Classifier (AUC = {xgb_eval['roc_auc']:.4f})",
        color="#16a34a",
        linewidth=2.2,
    )
    plt.plot([0, 1], [0, 1], linestyle="--", color="#94a3b8", label="Random Classifier (AUC = 0.5000)")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate (1 - Specificity)", fontsize=11)
    plt.ylabel("True Positive Rate (Sensitivity / Recall)", fontsize=11)
    plt.title("Receiver Operating Characteristic (ROC) Comparison\nRandom Forest vs. XGBoost", fontsize=12, pad=12)
    plt.legend(loc="lower right", frameon=True, facecolor="#f8fafc", edgecolor="#cbd5e1")
    plt.grid(alpha=0.3, linestyle="--")
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches="tight")
    plt.close()
    print(f"[PLOT] Saved Comparative ROC Curve -> {output_path}")


def train_and_benchmark(
    data_path: Path = Path("data/processed/modeling_matrix.csv"),
    models_dir: Path = Path("models"),
    docs_dir: Path = Path("docs"),
):
    """Run full benchmarking suite, k-fold cross validation, and persist artifacts."""
    models_dir.mkdir(parents=True, exist_ok=True)
    docs_dir.mkdir(parents=True, exist_ok=True)

    X_train, X_test, y_train, y_test = load_and_split_data(data_path, docs_dir)

    # 5-Fold Stratified Cross-Validation Setup
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # 1. Random Forest Classifier
    print("\n[TRAIN] Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=180,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    rf_cv_scores = cross_val_score(rf_model, X_train, y_train, cv=skf, scoring="roc_auc")
    print(f"[CV 5-Fold] Random Forest ROC-AUC: Mean = {rf_cv_scores.mean():.4f} (+/- {rf_cv_scores.std():.4f})")
    rf_model.fit(X_train, y_train)
    rf_eval = evaluate_model("Random Forest", rf_model, X_test, y_test)
    rf_eval["cv_roc_auc_mean"] = float(rf_cv_scores.mean())
    rf_eval["cv_roc_auc_std"] = float(rf_cv_scores.std())

    # 2. XGBoost Classifier
    print("\n[TRAIN] Training XGBoost Classifier...")
    xgb_model = XGBClassifier(
        n_estimators=180,
        learning_rate=0.06,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=42,
    )
    xgb_cv_scores = cross_val_score(xgb_model, X_train, y_train, cv=skf, scoring="roc_auc")
    print(f"[CV 5-Fold] XGBoost ROC-AUC      : Mean = {xgb_cv_scores.mean():.4f} (+/- {xgb_cv_scores.std():.4f})")
    xgb_model.fit(X_train, y_train)
    xgb_eval = evaluate_model("XGBoost", xgb_model, X_test, y_test)
    xgb_eval["cv_roc_auc_mean"] = float(xgb_cv_scores.mean())
    xgb_eval["cv_roc_auc_std"] = float(xgb_cv_scores.std())

    # Benchmarking Summary Table
    comparison_records = [
        {
            "Model": "Random Forest",
            "Accuracy": f"{rf_eval['accuracy']:.4f}",
            "Precision": f"{rf_eval['precision']:.4f}",
            "Recall": f"{rf_eval['recall']:.4f}",
            "F1-Score": f"{rf_eval['f1_score']:.4f}",
            "ROC-AUC": f"{rf_eval['roc_auc']:.4f}",
            "5-Fold CV AUC": f"{rf_eval['cv_roc_auc_mean']:.4f} +/- {rf_eval['cv_roc_auc_std']:.4f}",
        },
        {
            "Model": "XGBoost",
            "Accuracy": f"{xgb_eval['accuracy']:.4f}",
            "Precision": f"{xgb_eval['precision']:.4f}",
            "Recall": f"{xgb_eval['recall']:.4f}",
            "F1-Score": f"{xgb_eval['f1_score']:.4f}",
            "ROC-AUC": f"{xgb_eval['roc_auc']:.4f}",
            "5-Fold CV AUC": f"{xgb_eval['cv_roc_auc_mean']:.4f} +/- {xgb_eval['cv_roc_auc_std']:.4f}",
        },
    ]
    summary_df = pd.DataFrame(comparison_records)
    print("\n" + "=" * 70)
    print("                    FINAL BENCHMARK COMPARISON TABLE")
    print("=" * 70)
    print(summary_df.to_string(index=False))
    print("=" * 70)

    # Export CSV summary for report/documentation
    table_csv_path = docs_dir / "model_benchmark_table.csv"
    summary_df.to_csv(table_csv_path, index=False)
    print(f"[EXPORT] Saved Benchmark Table -> {table_csv_path}")

    # Plot Comparative ROC Curves
    roc_plot_path = docs_dir / "roc_curves.png"
    plot_roc_curves(rf_eval, xgb_eval, roc_plot_path)

    # Select Best Model based on ROC-AUC
    if xgb_eval["roc_auc"] >= rf_eval["roc_auc"]:
        best_model = xgb_model
        best_name = "XGBoost"
        best_eval = xgb_eval
    else:
        best_model = rf_model
        best_name = "Random Forest"
        best_eval = rf_eval

    print(f"\n[WINNER] Selected Top-Performing Model: {best_name} (ROC-AUC = {best_eval['roc_auc']:.4f})")

    # Plot and save confusion matrix of winning model
    cm_plot_path = docs_dir / "confusion_matrix.png"
    plot_confusion_matrix(best_eval["confusion_matrix"], best_name, cm_plot_path)

    # Save Winning Model Artifact
    artifact_path = models_dir / "landslide_model.joblib"
    joblib.dump(
        {
            "model": best_model,
            "model_name": best_name,
            "features": FEATURES,
            "metrics": {
                "accuracy": best_eval["accuracy"],
                "precision": best_eval["precision"],
                "recall": best_eval["recall"],
                "specificity": best_eval["specificity"],
                "f1_score": best_eval["f1_score"],
                "roc_auc": best_eval["roc_auc"],
                "cv_roc_auc_mean": best_eval["cv_roc_auc_mean"],
                "cv_roc_auc_std": best_eval["cv_roc_auc_std"],
                "confusion_matrix": best_eval["confusion_matrix"],
            },
        },
        artifact_path,
    )
    print(f"[SAVE] Exported serialized model artifact: {artifact_path}")

    # Export metrics JSON for backend and frontend consumption
    metrics_json_path = models_dir / "model_metrics.json"
    with open(metrics_json_path, "w") as f:
        json.dump(
            {
                "best_model": best_name,
                "rf_metrics": {k: v for k, v in rf_eval.items() if k not in ["fpr", "tpr"]},
                "xgb_metrics": {k: v for k, v in xgb_eval.items() if k not in ["fpr", "tpr"]},
            },
            f,
            indent=2,
        )
    print(f"[SAVE] Exported metrics JSON -> {metrics_json_path}")

    # Persist test set for Explainable AI (SHAP)
    test_artifact_path = models_dir / "test_data.joblib"
    joblib.dump({"X_test": X_test, "y_test": y_test}, test_artifact_path)
    print(f"[SAVE] Exported evaluation test set: {test_artifact_path}")


def main() -> None:
    train_and_benchmark()


if __name__ == "__main__":
    main()
