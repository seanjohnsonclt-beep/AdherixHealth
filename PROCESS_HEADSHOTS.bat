@echo off
cd /d "%~dp0"
echo Processing advisor headshots...
python process_headshots.py
if errorlevel 1 (
  echo Failed. Make sure advisor-clair.png and advisor-brandon.png are in the public\ folder.
  pause
  exit /b 1
)
echo Done. Headshots saved to public\.
pause
