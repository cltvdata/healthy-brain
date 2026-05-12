# 🚀 BUILD APK - GUIDE

## Opción 1: EAS Build (Recomendado)

```bash
# 1. Instalar EAS CLI global
npm install -g eas-cli

# 2. Login a Expo
eas login

# 3. Build APK (Preview)
cd mobile-app
eas build -p android --profile preview

# Descargar APK desde el link que te da EAS
```

---

## Opción 2: Build Local

```bash
cd mobile-app

# Generar android folder
npx expo prebuild --platform android

# Compilar
cd android
./gradlew assembleDebug

# APK en: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Opción 3: Expo Go (Desarrollo)

```bash
cd mobile-app
npx expo start
# Escanea QR con Expo Go en tu Android/iOS
```

---

## ✅ Requisitos

- Node.js 18+
- Cuenta Expo (gratis)
- Para build local: Android Studio

## 📱 APK Output

- Preview: `app-debug.apk`
- Production: `app-release.apk`

## 🐛 Solución Problemas

```bash
# Limpiar cache
npx expo start --clear

# Resetear proyecto
npm run reset-project
```

---

**Easy Mode:** Solo ejecuta en terminal:
```
cd mobile-app
npx expo build:android
```