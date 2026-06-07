@echo off
cd /d "%~dp0"

echo [1/4] Clearing any stale git lock...
if exist ".git\index.lock" del ".git\index.lock"

echo [2/4] Staging BIBLE.md + PUSH_ADMIN.bat...
git add BIBLE.md PUSH_ADMIN.bat
git commit -m "docs: update BIBLE.md S12+S13 for admin dashboard"
if errorlevel 1 (
  echo NOTE: Nothing to commit or commit failed — continuing
)

echo [3/4] Pushing to main...
git push origin main
if errorlevel 1 (
  echo ERROR: push failed
  pause
  exit /b 1
)

echo.
echo [4/4] Done. Vercel auto-deploys from main.
echo.
echo ============================================================
echo  REQUIRED: Add ADMIN_SECRET to Vercel env vars
echo  URL: https://vercel.com/seanjohnsonclt-beep/adherix-health/settings/environment-variables
echo.
echo  Key:   ADMIN_SECRET
echo  Value: G1_vjlOWJSgnaM-FNg-TJzicu8PFZd9HeIVynrONgmU
echo.
echo  After adding + redeploying, bookmark:
echo  https://adherixhealth.com/admin?secret=G1_vjlOWJSgnaM-FNg-TJzicu8PFZd9HeIVynrONgmU
echo ============================================================
echo.
pause
