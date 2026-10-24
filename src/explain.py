"""Explainable AI (XAI) pipeline using SHAP (SHapley Additive exPlanations).

Computes TreeExplainer attributions for the best-performing landslide model,
ranks conditioning factor contributions, and exports both Global (beeswarm, bar)
and Local (instance waterfall) visualizations for technical documentation and viva.
"""

from pathlib import Path
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap


def generate_shap_explanations(
    model_path: Path = Path("models/landslide_model.joblib"),
    test_path: Path = Path("models/test_data.joblib"),
    docs_dir: Path = Path("docs"),
) -> None:
    """Compute SHAP values and save global and local explainability artifacts."""
    if not model_path.exists() or not test_path.exists():
        raise FileNotFoundError("Model or test artifacts missing. Please run 'python src/train.py' first.")

    docs_dir.mkdir(parents=True, exist_ok=True)

    model_bundle = joblib.load(model_path)
    test_bundle = joblib.load(test_path)

    model = model_bundle["model"]
    model_name = model_bundle["model_name"]
    features = model_bundle["features"]
    X_test = test_bundle["X_test"]
    y_test = test_bundle["y_test"]

    print(f"\n[XAI] Initializing SHAP TreeExplainer for {model_name}...")
    explainer = shap.TreeExplainer(model)
    shap_explanation = explainer(X_test)

    # For binary classification with XGBoost or Random Forest, handle probability dimension
    if len(shap_explanation.shape) == 3:
        # Output shape is (samples, features, classes) -> choose positive class (1)
        shap_vals_class1 = shap_explanation[:, :, 1]
    else:
        shap_vals_class1 = shap_explanation

    # 1. Global Factor Ranking Table & CSV Export
    mean_abs_shap = np.abs(shap_vals_class1.values).mean(axis=0)
    ranking_df = pd.DataFrame({
        "Conditioning Factor": features,
        "Mean |SHAP| Attribution": np.round(mean_abs_shap, 4),
        "Relative Importance (%)": np.round((mean_abs_shap / mean_abs_shap.sum()) * 100, 1),
    }).sort_values(by="Mean |SHAP| Attribution", ascending=False)

    print("\n" + "=" * 60)
    print(f"       SHAP GLOBAL FACTOR IMPORTANCE RANKING ({model_name})")
    print("=" * 60)
    print(ranking_df.to_string(index=False))
    print("=" * 60)

    csv_path = docs_dir / "feature_importance.csv"
    ranking_df.to_csv(csv_path, index=False)
    print(f"[EXPORT] Saved Factor Importance CSV -> {csv_path}")

    # 2. Global Feature Importance Bar Plot
    bar_plot_path = docs_dir / "shap_importance_bar.png"
    plt.figure(figsize=(8, 4.5), dpi=300)
    shap.plots.bar(shap_vals_class1, max_display=10, show=False)
    plt.title(f"Global Factor Importance Ranking // {model_name}\n(Mean |SHAP Value| Across Wayanad Test Points)", fontsize=11, pad=12)
    plt.tight_layout()
    plt.savefig(bar_plot_path, bbox_inches="tight")
    plt.close()
    print(f"[PLOT] Saved Global SHAP Bar Plot -> {bar_plot_path}")

    # 3. Global Beeswarm Summary Plot (Feature value vs impact on risk)
    beeswarm_plot_path = docs_dir / "shap_summary.png"
    plt.figure(figsize=(9, 5.5), dpi=300)
    shap.plots.beeswarm(shap_vals_class1, max_display=10, show=False)
    plt.title(f"SHAP Factor Attribution Summary ({model_name})\nRed = High Feature Value, Blue = Low Feature Value", fontsize=11, pad=12)
    plt.tight_layout()
    plt.savefig(beeswarm_plot_path, bbox_inches="tight")
    plt.close()
    print(f"[PLOT] Saved Global SHAP Beeswarm Summary -> {beeswarm_plot_path}")

    # 4. Local Explainability: High-Risk Case Study (e.g. Chooralmala / Vythiri Simulation)
    y_prob = model.predict_proba(X_test)[:, 1]
    high_risk_idx = int(np.argmax(y_prob))
    low_risk_idx = int(np.argmin(y_prob))

    print(f"\n[LOCAL XAI] Generating High-Risk Case Study (Test Index {high_risk_idx}, Prob = {y_prob[high_risk_idx]*100:.1f}%)...")
    plt.figure(figsize=(9, 5), dpi=300)
    shap.plots.waterfall(shap_vals_class1[high_risk_idx], max_display=6, show=False)
    plt.title(f"Local XAI Waterfall Plot // High-Risk Hazard Scenario\n(Predicted Hazard Probability: {y_prob[high_risk_idx]*100:.1f}%)", fontsize=11, pad=12)
    plt.tight_layout()
    local_high_path = docs_dir / "shap_local_high_risk.png"
    plt.savefig(local_high_path, bbox_inches="tight")
    plt.close()
    print(f"[PLOT] Saved High-Risk Local Waterfall -> {local_high_path}")

    print(f"[LOCAL XAI] Generating Low-Risk Safe Case Study (Test Index {low_risk_idx}, Prob = {y_prob[low_risk_idx]*100:.1f}%)...")
    plt.figure(figsize=(9, 5), dpi=300)
    shap.plots.waterfall(shap_vals_class1[low_risk_idx], max_display=6, show=False)
    plt.title(f"Local XAI Waterfall Plot // Low-Risk Safe Scenario\n(Predicted Hazard Probability: {y_prob[low_risk_idx]*100:.1f}%)", fontsize=11, pad=12)
    plt.tight_layout()
    local_low_path = docs_dir / "shap_local_low_risk.png"
    plt.savefig(local_low_path, bbox_inches="tight")
    plt.close()
    print(f"[PLOT] Saved Low-Risk Local Waterfall -> {local_low_path}")

    # 5. SHAP Dependence Plot (Slope vs SHAP value colored by Rainfall)
    try:
        dep_plot_path = docs_dir / "shap_dependence_slope.png"
        plt.figure(figsize=(8, 5), dpi=300)
        shap.plots.scatter(shap_vals_class1[:, "slope"], color=shap_vals_class1[:, "rainfall"], show=False)
        plt.title(f"SHAP Dependence: Terrain Slope Interaction with Rainfall\n({model_name} Model)", fontsize=11, pad=12)
        plt.tight_layout()
        plt.savefig(dep_plot_path, bbox_inches="tight")
        plt.close()
        print(f"[PLOT] Saved SHAP Slope-Rainfall Dependence -> {dep_plot_path}")
    except Exception as e:
        print(f"[WARN] Skipping dependence plot due to shape formatting: {e}")

    print(f"\n[COMPLETE] All SHAP Explainability deliverables generated successfully in {docs_dir}/")


def main() -> None:
    generate_shap_explanations()


if __name__ == "__main__":
    main()
