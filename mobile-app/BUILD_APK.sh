@echo off
echo ========================================
echo   HEALTHY + BRAIN - APK BUILD
echo ========================================
echo.
echo [1/4] Verificando entorno...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Instala desde: https://nodejs.org
    pause
    exit /b 1
)

cd /d "%~dp0"

echo [2/4] Instalando dependencias...
call npm install 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Fallo npm install
    echo Intentando con --legacy-peer-deps...
    call npm install --legacy-peer-deps
)

echo.
echo [3/4] Generando prebuild Android...
call npx expo prebuild --platform android --clean

echo.
echo [4/4] Compilando APK...
cd android
call gradlew assembleDebug

echo.
echo ========================================
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo ✓ APK GENERADO EXITOSAMENTE!
    echo.
    echo Ubicacion:
    echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo Para instalar:
    echo 1. Transfer APK a tu Android
    echo 2. Habilita "Origen desconocido" en ajustes
    echo 3. Instala el APK
) else (
    echo ✗ ERROR: APK no generado
    echo Revisa los errores arriba
)
echo ========================================
pause