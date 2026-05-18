@echo off
echo ====================================================
echo   INICIANDO PREPARACION Y COMPILACION DE EAS CLOUD
echo ====================================================
echo.
echo [1/3] Guardando todos los cambios recientes en Git...
git add .
git commit -m "fix: remove old projectId to use new expo account maonew1403"
echo.
echo [2/3] Entrando a la carpeta de la app movil...
cd mobile-app
echo.
echo [3/3] Iniciando EAS Build en la nube...
echo Recuerda responder 'Y' (Si) cuando te pregunte sobre crear el proyecto en @maonew1403
echo.
call npx eas-cli build --platform android --profile preview --clear-cache
echo.
echo ====================================================
echo   PROCESO TERMINADO
echo ====================================================
pause
