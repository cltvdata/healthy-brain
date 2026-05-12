@echo off
echo ========================================
echo   HEALTHY + BRAIN - WEB BUILD
echo ========================================
cd /d "%~dp0"
npm install
npm run build
echo.
echo ========================================
echo   BUILD COMPLETO - Revisa carpeta dist/
echo ========================================
pause