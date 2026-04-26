@echo off
setlocal
REM ─────────────────────────────────────────────────────────────────────────────
REM  Adherix — commit + push helper (v4)
REM
REM  Ships:
REM    • Public marketing site (/(marketing)) + /pilot request form
REM    • Dashboard moved to /dashboard
REM    • Brand Kit: Sage/Paper/Ink/Clay palette, Fraunces + Geist, Cohort A logo
REM    • "Request a pilot" CTAs renamed → "Request a demo"
REM    • Client-portal surfaces rebranded Adherix℞ → MyAdherix
REM      (Topbar, login, /roi, print PDF reports, delivery/weekly emails)
REM    • Plain "Adherix" (no ℞) on marketing/internal surfaces
REM
REM  v2 fixed the Windows CMD paren bug (unquoted (auth)/(marketing)).
REM  v3 dropped ../BIBLE.md from the stage (it lives outside the repo).
REM  v4 removed demo/page.tsx, roi/page.tsx, and lib/email.ts from the
REM     HEAD-restore list because they now carry rebrand edits — restoring
REM     them would wipe the work. They are staged as normal edits instead.
REM ─────────────────────────────────────────────────────────────────────────────

cd /d "%~dp0"

echo.
echo [1/6] Removing stale index.lock...
if exist ".git\index.lock" (
  del /f ".git\index.lock"
  echo   - index.lock removed
) else (
  echo   - no index.lock present
)

echo.
echo [2/6] Restoring pre-existing truncated files from HEAD...
REM NOTE: demo/page.tsx, roi/page.tsx, lib/email.ts are INTENTIONALLY not
REM       restored here — they were restored in-session and now carry
REM       rebrand edits that must be preserved. They go in [3/6] instead.
git checkout HEAD -- ^
  "package-lock.json" ^
  "src/app/api/demo/reseed/route.ts" ^
  "src/app/api/export/action-list/route.ts" ^
  "src/app/api/export/exec-summary/route.ts" ^
  "src/app/api/export/recovery-ledger/route.ts" ^
  "src/app/api/export/roster/route.ts" ^
  "src/app/patients/[id]/_components/PatientActions.tsx" ^
  "src/engine/demoSeed.ts" ^
  "src/lib/csv.ts" ^
  "src/lib/metrics.ts" ^
  "src/workers/tick.ts"
if errorlevel 1 (
  echo   ! git checkout failed with errorlevel %errorlevel%
  goto :fail
)
echo   - truncated files restored

echo.
echo [3/6] Staging intentional changes...
git add ^
  "src/app/(auth)/actions.ts" ^
  "src/app/_components/Topbar.tsx" ^
  "src/app/api/cron/tick/route.ts" ^
  "src/app/globals.css" ^
  "src/app/page.tsx" ^
  "src/app/patients/[id]/page.tsx" ^
  "src/app/patients/actions.ts" ^
  "src/app/patients/new/page.tsx" ^
  "src/app/dashboard/page.tsx" ^
  "src/app/login/page.tsx" ^
  "src/app/demo/page.tsx" ^
  "src/app/roi/page.tsx" ^
  "src/app/reports/print/exec-summary/page.tsx" ^
  "src/app/reports/print/recovery-ledger/page.tsx" ^
  "src/app/(marketing)" ^
  "src/app/api/pilot" ^
  "src/lib/email.ts" ^
  "public/logo.svg" ^
  "public/logo-mark.svg" ^
  "public/favicon.svg"
REM Note: BIBLE.md lives in the workspace root (one level above the repo),
REM so it is NOT staged here. It is a living doc outside git by design.
if errorlevel 1 (
  echo   ! git add failed with errorlevel %errorlevel%
  goto :fail
)

echo.
echo [4/6] Verifying stage is non-empty...
git diff --cached --quiet
if not errorlevel 1 (
  echo   ! Nothing is staged. Aborting — refusing to make an empty commit.
  echo   Run: git status
  goto :fail
)
echo   - stage has changes; proceeding
git diff --cached --stat

echo.
echo [5/6] Committing...
git commit -m "feat: public marketing site + /pilot form; move dashboard to /dashboard; apply Brand Kit (Sage/Paper/Ink/Clay + Fraunces/Geist + Cohort A logo); rename 'Request a pilot' CTAs to 'Request a demo'; rebrand client portal to MyAdherix (drop the ℞ glyph)"
if errorlevel 1 (
  echo   ! git commit failed with errorlevel %errorlevel%
  goto :fail
)

echo.
echo [6/6] Pushing to origin/main (Vercel will auto-deploy)...
git push origin main
if errorlevel 1 (
  echo   ! git push failed with errorlevel %errorlevel%
  goto :fail
)

echo.
echo ============================================================================
echo  Done. Check the deploy at https://adherix-health.vercel.app
echo ============================================================================
pause
exit /b 0

:fail
echo.
echo ============================================================================
echo  FAILED. See the error(s) above. Nothing was pushed.
echo ============================================================================
pause
exit /b 1
