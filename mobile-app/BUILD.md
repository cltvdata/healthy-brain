# HEALTHY + BRAIN - Build Guide

## Requisitos Previos
- Node.js 18+
- Expo CLI
- EAS CLI (`npm install -g eas-cli`)
- Android Studio (para build local)

## Build Rápido (Cloud)

```bash
# 1.进入 directorio
cd mobile-app

# 2. Login en Expo
npx expo login

# 3. Build Android (Preview)
eas build -p android --profile preview

# 4. Descargar APK de EAS Build
```

## Build Local (Android Studio)

```bash
cd mobile-app
npx expo run:android
```

## Build Production

```bash
eas build -p android --profile production
```

## Permisos Android (ya configurados)
- `CAMERA` - Análisis nutricional IA
- `health.READ_STEPS` - Pasos diarios
- `health.READ_HEART_RATE` - Ritmo cardíaco
- `health.READ_SLEEP` - Datos de sueño
- `VIBRATE` - Haptic feedback

## Hooks Disponibles
- `useHaptics()` - Patrones de vibración
- `useNotebookLM()` - Motor de IA
- `useStitchContext()` - Contexto visual Pomelli/Stitch

## Versión Actual
- **v1.0.0** - Release Candidate
- **Paquete:** com.cltv.healthybrain