@echo off
echo ========================================
echo   HEALTHY + BRAIN - MOBILE BUILD
echo ========================================
cd /d "%~dp0"
echo.
echo [1/3] Instalando dependencias...
npm install
echo.
echo [2/3] Generando Android (Release)...
npx expo run:android --variant release
echo.
echo ========================================
echo   BUILD COMPLETO
echo ========================================
pause