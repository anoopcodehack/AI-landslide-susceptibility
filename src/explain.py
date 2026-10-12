"""Explainable AI (XAI) pipeline using SHAP (SHapley Additive exPlanations).

Computes TreeExplainer attributions for the best-performing landslide model,
ranks conditioning factor contributions, and exports visualizations to docs/shap_summary.png.
"""

from pathlib import Path
import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap


def generate_shap_explanations(
    model_path: Path = Path("models/landslide_model.joblib"),
    test_path: Path = Path("models/test_data.joblib"),
    output_img: Path = Path("docs/shap_summary.png"),
):
    """Compute SHAP values and save visual explainability summary."""
    if not model_path.exists() or not test_path.exists():
        raise FileNotFoundError("Model or test artifacts missing. Please run 'python src/train.py' first.")

    model_bundle = joblib.load(model_path)
    test_bundle = joblib.load(test_path)

    model = model_bundle["model"]
    model_name = model_bundle["model_name"]
    features = model_bundle["features"]
    X_test = test_bundle["X_test"]

    print(f"\n[XAI] Initializing SHAP TreeExplainer for {model_name}...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer(X_test)

    # For binary classification with XGBoost or Random Forest, handle probability output dimension
    if len(shap_values.shape) == 3:
        # Output shape is (samples, features, classes) -> choose positive class (1)
        shap_vals_class1 = shap_values[:, :, 1]
    else:
        shap_vals_class1 = shap_values

    # 1. Calculate Mean Absolute SHAP values (Global Factor Ranking)
    mean_abs_shap = np.abs(shap_vals_class1.values).mean(axis=0)
    ranking_df = pd.DataFrame({
        "Conditioning Factor": features,
        "Mean |SHAP| Value": np.round(mean_abs_shap, 4),
    }).sort_values(by="Mean |SHAP| Value", ascending=False)

    print("\n[XAI] SHAP GLOBAL FACTOR IMPORTANCE RANKING:")
    print(ranking_df.to_string(index=False))

    # 2. Render and save visualization
    output_img.parent.mkdir(parents=True, exist_ok=True)
    plt.figure(figsize=(9, 5.5), dpi=300)

    # Beeswarm plot shows both magnitude and directional impact
    shap.plots.beeswarm(shap_vals_class1, max_display=10, show=False)
    plt.title(f"SHAP Factor Attribution Summary ({model_name} Model)", fontsize=13, pad=15)
    plt.tight_layout()
    plt.savefig(output_img, bbox_inches="tight")
    plt.close()

    print(f"\n[XAI] Successfully generated and saved SHAP summary plot: {output_img}")


def main() -> None:
    generate_shap_explanations()


if __name__ == "__main__":
    main()
