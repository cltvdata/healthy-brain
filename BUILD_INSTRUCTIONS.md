# BUILD INSTRUCTIONS

## Quick Start (Desarrollo Local)

### Requisitos
- Node.js 18+
- Android Studio (para build Android)
- Xcode (para build iOS)

### Web App
```bash
cd healthy-brain
npm install
npm run dev
# Abrir http://localhost:3000
```

### Mobile App (Expo)

#### Install Dependencies
```bash
cd mobile-app
npm install
```

#### Development Build
```bash
# Android
npm run android

# iOS (Mac solo)
npm run ios
```

#### Production Build

**Opción 1: EAS Build (Cloud)**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build Preview APK
eas build -p android --profile preview

# Build Production
eas build -p android --profile production
```

**Opción 2: Local Build**
```bash
# Generate android folder
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleDebug

# APK output: android/app/build/outputs/apk/debug/app-debug.apk
```

## Build Scripts

### Windows
```bash
# Web
build-web.bat

# Mobile
mobile-app\build-android.bat
```

### Manual
```bash
# Web Build
npm run build
# Output: dist/

# Mobile Build
cd mobile-app
npx expo build:android
```

## APK Installation (Android)

1. Build完成后，APK在: `mobile-app/android/app/build/outputs/apk/`
2. Transfer APK到手机
3. 安装前需启用"允许安装未知来源应用"
4. 安装并测试

## Troubleshooting

### Expo Issues
```bash
# Clear cache
npx expo start --clear

# Reset project
cd mobile-app
npm run reset-project
```

### Android Build Issues
```bash
# Clean build
cd android
./gradlew clean

# Rebuild
./gradlew assembleDebug
```

## Current Version
- **Web**: v1.3.0
- **Mobile**: Ready for build
- **Package**: com.cltv.healthybrain