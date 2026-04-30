@echo off
echo Reseeding demo data against live DB...
echo (This runs locally so no Vercel timeout — takes ~15-30 seconds)
echo.
npx tsx src/scripts/reseed-live.ts
