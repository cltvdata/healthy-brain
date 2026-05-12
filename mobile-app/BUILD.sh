# HEALTHY + BRAIN - Build Script
# Ejecutar en terminal: bash BUILD.sh

echo "========================================="
echo "   HEALTHY + BRAIN - PRODUCTION BUILD"
echo "========================================="

echo ""
echo "[1/4] Limpiando build anterior..."
rm -rf dist
rm -rf android/app/build

echo ""
echo "[2/4] Exportando app..."
npx expo export --platform android

echo ""
echo "[3/4] Generando Android APK..."
cd android
./gradlew assembleRelease

echo ""
echo "[4/4] APK generado en:"
echo "   android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "========================================="
echo "   ✓ BUILD COMPLETO"
echo "========================================="