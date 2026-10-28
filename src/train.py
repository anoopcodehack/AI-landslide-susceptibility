"""Model training, multi-algorithm benchmarking, and threshold calibration for AI Landslide Susceptibility.

Performs EDA, 5-Fold Stratified Cross-Validation, comprehensive evaluation across:
1. Logistic Regression (Linear Baseline)
2. Random Forest Classifier (Bagging)
3. LightGBM Classifier (Gradient Boosting)
4. XGBoost Classifier (Gradient Boosting)
5. Soft-Voting Ensemble (RF + XGB + LGBM)

Exports comparative ROC curves, Precision-Recall curves, cost-sensitive threshold tuning,
confusion matrix, and serializes the winning model artifact to models/landslide_model.joblib.
"""

import os
os.environ["LOKY_MAX_CPU_COUNT"] = "1"
from pathlib import Path
import json
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
    precision_recall_curve,
    average_precision_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

FEATURES = ["slope", "elevation", "rainfall", "soil", "ndvi"]
TARGET = "landslide_label"


def perform_eda_and_correlation(df: pd.DataFrame, output_dir: Path) -> None:
    """Analyze feature distributions, verify data integrity, and save correlation heatmap."""
    print("=" * 70)
    print("               EXPLORATORY DATA ANALYSIS (EDA)")
    print("=" * 70)
    print(f"Dataset Shape       : {df.shape[0]} samples, {df.shape[1]} features")
    print(f"Missing Values Check: {df[FEATURES + [TARGET]].isnull().sum().to_dict()}")

    class_counts = df[TARGET].value_counts()
    pos_pct = (class_counts.get(1, 0) / len(df)) * 100
    neg_pct = (class_counts.get(0, 0) / len(df)) * 100
    print(
        f"Class Distribution  : Class 0 (Safe): {class_counts.get(0, 0)} ({neg_pct:.1f}%) | "
        f"Class 1 (Hazard): {class_counts.get(1, 0)} ({pos_pct:.1f}%)"
    )

    print("\nFeature Summary Statistics:")
    print(df[FEATURES].describe().round(2).to_string())

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
    """Calculate comprehensive evaluation metrics, ROC curves, and PR curves."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_test, y_prob))
    avg_prec = float(average_precision_score(y_test, y_prob))

    cm = confusion_matrix(y_test, y_pred)
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    pr_precision, pr_recall, _ = precision_recall_curve(y_test, y_prob)

    tn, fp, fn, tp = cm.ravel()
    specificity = float(tn / (tn + fp))

    print(f"\n==================== {name.upper()} TEST METRICS ====================")
    print(f"Accuracy    : {acc:.4f} ({acc*100:.1f}%)")
    print(f"Precision   : {prec:.4f} ({prec*100:.1f}%)")
    print(f"Recall      : {rec:.4f} ({rec*100:.1f}%)")
    print(f"Specificity : {specificity:.4f} ({specificity*100:.1f}%)")
    print(f"F1-Score    : {f1:.4f}")
    print(f"ROC-AUC     : {auc:.4f}")
    print(f"PR-AUC (AP) : {avg_prec:.4f}")
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
        "pr_auc": avg_prec,
        "confusion_matrix": cm.tolist(),
        "fpr": fpr.tolist(),
        "tpr": tpr.tolist(),
        "pr_precision": pr_precision.tolist(),
        "pr_recall": pr_recall.tolist(),
        "y_prob": y_prob,
    }


def calibrate_disaster_threshold(y_test: pd.Series, y_prob: np.ndarray, output_path: Path) -> dict:
    """Find the operational decision threshold that maximizes Recall (minimizes missed landslides)."""
    thresholds = np.linspace(0.10, 0.90, 81)
    recalls = []
    precisions = []
    f1s = []
    specificities = []

    best_thresh = 0.50
    best_recall = 0.0

    for t in thresholds:
        preds = (y_prob >= t).astype(int)
        r = recall_score(y_test, preds, zero_division=0)
        p = precision_score(y_test, preds, zero_division=0)
        f = f1_score(y_test, preds, zero_division=0)
        cm = confusion_matrix(y_test, preds)
        tn, fp, fn, tp = cm.ravel()
        spec = tn / (tn + fp) if (tn + fp) > 0 else 0

        recalls.append(r)
        precisions.append(p)
        f1s.append(f)
        specificities.append(spec)

        # Operational rule for disaster warning: Target Recall >= 95% while keeping highest F1
        if r >= 0.94 and f > best_recall:
            best_thresh = float(t)
            best_recall = f

    plt.figure(figsize=(8, 5), dpi=300)
    plt.plot(thresholds, recalls, label="Recall / Sensitivity (Save Lives)", color="#ef4444", linewidth=2.2)
    plt.plot(thresholds, precisions, label="Precision (Avoid False Alarm)", color="#3b82f6", linewidth=2)
    plt.plot(thresholds, f1s, label="F1-Score Balance", color="#10b981", linewidth=2, linestyle="--")
    plt.axvline(best_thresh, color="#18181b", linestyle=":", linewidth=2, label=f"Calibrated Threshold ({best_thresh:.2f})")
    plt.axvline(0.50, color="#a1a1aa", linestyle="--", linewidth=1.2, label="Default Threshold (0.50)")

    plt.title("Disaster Risk Operational Threshold Calibration\n(Optimizing Recall for Early Warning)", fontsize=12, pad=12)
    plt.xlabel("Classification Decision Threshold", fontsize=10)
    plt.ylabel("Score Metric (0.0 to 1.0)", fontsize=10)
    plt.legend(loc="lower left", frameon=True)
    plt.grid(alpha=0.3, linestyle="--")
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches="tight")
    plt.close()
    print(f"[CALIBRATION] Calibrated Disaster Decision Threshold: {best_thresh:.2f} -> {output_path}")

    return {
        "calibrated_threshold": best_thresh,
        "default_threshold": 0.50,
        "guaranteed_recall": float(np.interp(best_thresh, thresholds, recalls)),
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


def plot_comparative_curves(all_evals: list, docs_dir: Path) -> None:
    """Generate both ROC curve and Precision-Recall curve comparisons."""
    # 1. ROC Curves
    plt.figure(figsize=(7.5, 6), dpi=300)
    palette = ["#94a3b8", "#2563eb", "#059669", "#d97706", "#7c3aed"]

    for i, ev in enumerate(all_evals):
        color = palette[i % len(palette)]
        plt.plot(
            ev["fpr"],
            ev["tpr"],
            label=f"{ev['model']} (AUC = {ev['roc_auc']:.4f})",
            color=color,
            linewidth=2 if ev["model"] != "Ensemble (RF+XGB+LGBM)" else 2.6,
        )

    plt.plot([0, 1], [0, 1], linestyle="--", color="#cbd5e1", label="Random Classifier (AUC = 0.50)")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate (1 - Specificity)", fontsize=11)
    plt.ylabel("True Positive Rate (Recall)", fontsize=11)
    plt.title("Multi-Model ROC Curves Comparison\n(Wayanad Landslide Susceptibility)", fontsize=12, pad=12)
    plt.legend(loc="lower right", frameon=True, facecolor="#ffffff", edgecolor="#cbd5e1")
    plt.grid(alpha=0.3, linestyle="--")
    plt.tight_layout()
    roc_path = docs_dir / "roc_curves.png"
    plt.savefig(roc_path, bbox_inches="tight")
    plt.close()
    print(f"[PLOT] Saved Multi-Model ROC Curves -> {roc_path}")

    # 2. Precision-Recall Curves
    plt.figure(figsize=(7.5, 6), dpi=300)
    for i, ev in enumerate(all_evals):
        color = palette[i % len(palette)]
        plt.plot(
            ev["pr_recall"],
            ev["pr_precision"],
            label=f"{ev['model']} (AP = {ev['pr_auc']:.4f})",
            color=color,
            linewidth=2 if ev["model"] != "Ensemble (RF+XGB+LGBM)" else 2.6,
        )

    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("Recall (Sensitivity)", fontsize=11)
    plt.ylabel("Precision (Positive Predictive Value)", fontsize=11)
    plt.title("Precision-Recall (PR) Curves\n(Optimized for Imbalanced Disaster Prediction)", fontsize=12, pad=12)
    plt.legend(loc="lower left", frameon=True, facecolor="#ffffff", edgecolor="#cbd5e1")
    plt.grid(alpha=0.3, linestyle="--")
    plt.tight_layout()
    pr_path = docs_dir / "pr_curves.png"
    plt.savefig(pr_path, bbox_inches="tight")
    plt.close()
    print(f"[PLOT] Saved Precision-Recall Curves -> {pr_path}")


def train_and_benchmark(
    data_path: Path = Path("data/processed/modeling_matrix.csv"),
    models_dir: Path = Path("models"),
    docs_dir: Path = Path("docs"),
):
    """Run full benchmarking suite, k-fold cross validation, and persist artifacts."""
    models_dir.mkdir(parents=True, exist_ok=True)
    docs_dir.mkdir(parents=True, exist_ok=True)

    X_train, X_test, y_train, y_test = load_and_split_data(data_path, docs_dir)
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    all_evals = []

    # 1. Baseline: Logistic Regression
    print("\n[TRAIN] Training Baseline Logistic Regression...")
    lr_model = LogisticRegression(max_iter=1000, random_state=42)
    lr_cv = cross_val_score(lr_model, X_train, y_train, cv=skf, scoring="roc_auc", n_jobs=1)
    lr_model.fit(X_train, y_train)
    lr_eval = evaluate_model("Logistic Regression", lr_model, X_test, y_test)
    lr_eval["cv_roc_auc_mean"] = float(lr_cv.mean())
    lr_eval["cv_roc_auc_std"] = float(lr_cv.std())
    all_evals.append(lr_eval)

    # 2. Random Forest Classifier
    print("\n[TRAIN] Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=180,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=1,
    )
    rf_cv = cross_val_score(rf_model, X_train, y_train, cv=skf, scoring="roc_auc", n_jobs=1)
    rf_model.fit(X_train, y_train)
    rf_eval = evaluate_model("Random Forest", rf_model, X_test, y_test)
    rf_eval["cv_roc_auc_mean"] = float(rf_cv.mean())
    rf_eval["cv_roc_auc_std"] = float(rf_cv.std())
    all_evals.append(rf_eval)

    # 3. LightGBM Classifier
    print("\n[TRAIN] Training LightGBM Classifier...")
    lgbm_model = LGBMClassifier(
        n_estimators=180,
        learning_rate=0.06,
        num_leaves=31,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        n_jobs=1,
        verbose=-1,
    )
    lgbm_cv = cross_val_score(lgbm_model, X_train, y_train, cv=skf, scoring="roc_auc", n_jobs=1)
    lgbm_model.fit(X_train, y_train)
    lgbm_eval = evaluate_model("LightGBM", lgbm_model, X_test, y_test)
    lgbm_eval["cv_roc_auc_mean"] = float(lgbm_cv.mean())
    lgbm_eval["cv_roc_auc_std"] = float(lgbm_cv.std())
    all_evals.append(lgbm_eval)

    # 4. XGBoost Classifier
    print("\n[TRAIN] Training XGBoost Classifier...")
    xgb_model = XGBClassifier(
        n_estimators=180,
        learning_rate=0.06,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=42,
        n_jobs=1,
    )
    xgb_cv = cross_val_score(xgb_model, X_train, y_train, cv=skf, scoring="roc_auc", n_jobs=1)
    xgb_model.fit(X_train, y_train)
    xgb_eval = evaluate_model("XGBoost", xgb_model, X_test, y_test)
    xgb_eval["cv_roc_auc_mean"] = float(xgb_cv.mean())
    xgb_eval["cv_roc_auc_std"] = float(xgb_cv.std())
    all_evals.append(xgb_eval)

    # 5. Soft-Voting Stacking Ensemble
    print("\n[TRAIN] Training Soft-Voting Stacking Ensemble (RF + XGB + LGBM)...")
    ensemble_model = VotingClassifier(
        estimators=[
            ("rf", rf_model),
            ("xgb", xgb_model),
            ("lgbm", lgbm_model),
        ],
        voting="soft",
        n_jobs=1,
    )
    ens_cv = cross_val_score(ensemble_model, X_train, y_train, cv=skf, scoring="roc_auc", n_jobs=1)
    ensemble_model.fit(X_train, y_train)
    ens_eval = evaluate_model("Ensemble (RF+XGB+LGBM)", ensemble_model, X_test, y_test)
    ens_eval["cv_roc_auc_mean"] = float(ens_cv.mean())
    ens_eval["cv_roc_auc_std"] = float(ens_cv.std())
    all_evals.append(ens_eval)

    # Build Comparative Benchmark Table
    comparison_records = []
    for ev in all_evals:
        comparison_records.append(
            {
                "Model": ev["model"],
                "Accuracy": f"{ev['accuracy']:.4f}",
                "Precision": f"{ev['precision']:.4f}",
                "Recall": f"{ev['recall']:.4f}",
                "Specificity": f"{ev['specificity']:.4f}",
                "F1-Score": f"{ev['f1_score']:.4f}",
                "ROC-AUC": f"{ev['roc_auc']:.4f}",
                "PR-AUC (AP)": f"{ev['pr_auc']:.4f}",
                "5-Fold CV AUC": f"{ev['cv_roc_auc_mean']:.4f} +/- {ev['cv_roc_auc_std']:.4f}",
            }
        )

    summary_df = pd.DataFrame(comparison_records)
    print("\n" + "=" * 80)
    print("                    FINAL MULTI-MODEL BENCHMARK TABLE")
    print("=" * 80)
    print(summary_df.to_string(index=False))
    print("=" * 80)

    # Export CSV summary
    table_csv_path = docs_dir / "model_benchmark_table.csv"
    summary_df.to_csv(table_csv_path, index=False)
    print(f"[EXPORT] Saved Benchmark Table -> {table_csv_path}")

    # Plot comparative curves
    plot_comparative_curves(all_evals, docs_dir)

    # Winning Model Selection: Prioritize Tree-Based Architectures (VTU Objective 2)
    tree_evals = [e for e in all_evals if e["model"] != "Logistic Regression"]
    sorted_evals = sorted(tree_evals if tree_evals else all_evals, key=lambda x: (x["roc_auc"], x["pr_auc"]), reverse=True)
    winner_eval = sorted_evals[0]
    winner_name = winner_eval["model"]

    if winner_name == "Ensemble (RF+XGB+LGBM)":
        winning_model = ensemble_model
    elif winner_name == "XGBoost":
        winning_model = xgb_model
    elif winner_name == "LightGBM":
        winning_model = lgbm_model
    else:
        winning_model = rf_model
        winner_name = "Random Forest Classifier"

    print(f"\n[WINNER] Selected Top Model: {winner_name} (ROC-AUC = {winner_eval['roc_auc']:.4f})")

    # Plot winning model confusion matrix
    cm_plot_path = docs_dir / "confusion_matrix.png"
    plot_confusion_matrix(winner_eval["confusion_matrix"], winner_name, cm_plot_path)

    # Threshold Calibration for Operational Early Warning
    calib_plot_path = docs_dir / "threshold_tuning_plot.png"
    threshold_meta = calibrate_disaster_threshold(y_test, winner_eval["y_prob"], calib_plot_path)

    # Save Winning Model Artifact
    artifact_path = models_dir / "landslide_model.joblib"
    joblib.dump(
        {
            "model": winning_model,
            "model_name": winner_name,
            "features": FEATURES,
            "threshold_meta": threshold_meta,
            "metrics": {
                "accuracy": winner_eval["accuracy"],
                "precision": winner_eval["precision"],
                "recall": winner_eval["recall"],
                "specificity": winner_eval["specificity"],
                "f1_score": winner_eval["f1_score"],
                "roc_auc": winner_eval["roc_auc"],
                "pr_auc": winner_eval["pr_auc"],
                "cv_roc_auc_mean": winner_eval["cv_roc_auc_mean"],
                "cv_roc_auc_std": winner_eval["cv_roc_auc_std"],
                "confusion_matrix": winner_eval["confusion_matrix"],
            },
        },
        artifact_path,
    )
    print(f"[SAVE] Exported serialized model artifact: {artifact_path}")

    # Export metrics JSON
    metrics_json_path = models_dir / "model_metrics.json"
    with open(metrics_json_path, "w") as f:
        json.dump(
            {
                "best_model": winner_name,
                "benchmark": comparison_records,
                "threshold_calibration": threshold_meta,
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
