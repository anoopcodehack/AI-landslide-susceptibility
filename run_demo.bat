@echo off
TITLE GeoShield AI - Landslide Susceptibility System Launcher
COLOR 0A

echo ==============================================================================
echo        GEO-SHIELD AI: LANDSLIDE SUSCEPTIBILITY ASSESSMENT SYSTEM
echo        Sahyadri College of Engineering ^& Management (Mangaluru)
echo        Guide: Dr. Joyline D'sa ^| Team: Ashith, Anoop, Dishant, Dhruv
echo ==============================================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in system PATH.
    pause
    exit /b 1
)

:: 2. Check Node
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in system PATH.
    pause
    exit /b 1
)

echo [1/3] Starting FastAPI Inference Backend (Port 8000)...
start "GeoShield FastAPI Backend" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Starting Streamlit Geospatial Viva Dashboard (Port 8501)...
start "GeoShield Streamlit App" cmd /k "streamlit run frontend/app.py --server.port 8501"

echo [3/3] Starting Next.js Production Tactical Dashboard (Port 3000)...
cd frontend
start "GeoShield Next.js UI" cmd /k "npm run dev"
cd ..

echo.
echo ==============================================================================
echo  All 3 services successfully launched!
echo  - Next.js Tactical UI:     http://localhost:3000
echo  - FastAPI Swagger Docs:    http://localhost:8000/docs
echo  - Streamlit Viva Folium:   http://localhost:8501
echo ==============================================================================
echo.
echo Opening browser to http://localhost:3000 in 3 seconds...
timeout /t 3 >nul
start http://localhost:3000

pause
