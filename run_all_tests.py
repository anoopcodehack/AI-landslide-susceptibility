"""Master test runner for GeoShield AI Landslide Susceptibility System.

Executes all testing suites across:
1. Pytest suite: Backend APIs, Pydantic Schemas, ML Pipeline, Geospatial Module, Streamlit App (49 tests)
2. Geospatial Module Standalone Ingestion & Validation
3. ML Prediction Grid Batch Inference
4. Frontend TypeScript Static Type Analysis
"""

import subprocess
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent


def print_banner(text: str) -> None:
    print("\n" + "=" * 78)
    print(f"   {text}")
    print("=" * 78)


def run_step(name: str, cmd: list[str], cwd: Path = ROOT_DIR) -> bool:
    print(f"\n[RUNNING] {name}...")
    t0 = time.time()
    res = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True)
    duration = time.time() - t0

    if res.returncode == 0:
        print(f"[PASS] {name} ({duration:.2f}s)")
        return True
    else:
        print(f"[FAIL] {name} ({duration:.2f}s)")
        if res.stdout:
            print("--- STDOUT ---")
            print(res.stdout[-1500:])
        if res.stderr:
            print("--- STDERR ---")
            print(res.stderr[-1500:])
        return False


def main() -> None:
    print_banner("GEOSHIELD AI // FULL SYSTEM VERIFICATION & TEST SUITE")
    print(f"Working Directory : {ROOT_DIR}")
    print(f"Python Executable : {sys.executable}")

    suites = [
        (
            "1. Pytest Automated Test Suite (49 tests: Backend, Schemas, ML, GIS, Streamlit)",
            [sys.executable, "-m", "pytest", "tests/", "geospatial_module/tests/", "-q"],
            ROOT_DIR,
        ),
        (
            "2. Geospatial Standalone Ingestion & Coordinate Validation Suite",
            [sys.executable, "geospatial_module/tests/test_ingest.py"],
            ROOT_DIR,
        ),
        (
            "3. ML Spatial Grid Inference & Hazard Risk Categorization",
            [sys.executable, "src/predict.py"],
            ROOT_DIR,
        ),
        (
            "4. Frontend TypeScript Static Typing Check (npm test)",
            ["npm.cmd" if sys.platform == "win32" else "npm", "test"],
            ROOT_DIR / "frontend",
        ),
    ]

    results = []
    for title, cmd, cwd in suites:
        success = run_step(title, cmd, cwd)
        results.append((title, success))

    print_banner("TEST EXECUTION AUDIT SUMMARY")
    all_passed = True
    for title, success in results:
        status_str = "PASS [OK]" if success else "FAIL [X]"
        print(f"  {status_str:12s} | {title}")
        if not success:
            all_passed = False

    print("=" * 78)
    if all_passed:
        print(">>> RESULT: ALL TESTING COMPLETE -- 100% PASSING AND VERIFIED! <<<")
        print("=" * 78)
        sys.exit(0)
    else:
        print(">>> RESULT: ONE OR MORE TEST SUITES FAILED! <<<")
        print("=" * 78)
        sys.exit(1)


if __name__ == "__main__":
    main()
