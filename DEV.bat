@echo off
cd /d "%~dp0"
echo Starting Adherix local dev server...
echo.

if not exist "node_modules" (
  echo node_modules not found. Running npm install first...
  echo.
  npm install
  if errorlevel 1 (
    echo npm install failed. Check errors above.
    pause
    exit /b 1
  )
  echo.
)

echo Once ready, open your browser to:
echo   http://localhost:3000
echo.
echo Press Ctrl+C to stop.
echo.
npm run dev
pause
