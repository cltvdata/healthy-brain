#!/bin/bash
echo "========================================"
echo "  HEALTHY + BRAIN - APK BUILD"
echo "========================================"
echo ""
echo "[1/4] Verificando entorno..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no esta instalado"
    echo "Instala desde: https://nodejs.org"
    read -p "Presiona Enter para salir..."
    exit 1
fi

cd "$(dirname "$0")"

echo "[2/4] Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo npm install"
    echo "Intentando con --legacy-peer-deps..."
    npm install --legacy-peer-deps
fi

echo ""
echo "[3/4] Generando prebuild Android..."
npx expo prebuild --platform android --clean

echo ""
export JAVA_HOME="/c/Program Files/Amazon Corretto/jdk17.0.19_10"
export PATH="$JAVA_HOME/bin:$PATH"
echo "[4/4] Compilando APK (Release)..."
cd android
./gradlew assembleRelease

echo ""
echo "========================================"
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✓ APK GENERADO EXITOSAMENTE!"
    echo ""
    echo "Ubicacion:"
    echo "$(pwd)/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "Para instalar:"
    echo "1. Transfer APK a tu Android"
    echo "2. Habilita 'Origen desconocido' en ajustes"
    echo "3. Instala el APK"
else
    echo "✗ ERROR: APK no generado"
    echo "Revisa los errores arriba"
fi
echo "========================================"
read -p "Presiona Enter para continuar..."