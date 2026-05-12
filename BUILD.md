# 🚀 HEALTHY + BRAIN - Build Instructions

## Opción 1: EAS Build (Cloud) - Recomendado

```bash
cd D:\C.L.T.V\healthy + brain\mobile-app

# Install dependencies (primera vez)
npm install

# Build APK preview
npx eas build -p android --profile preview
```

## Opción 2: Build Local

```bash
cd D:\C.L.T.V\healthy + brain\mobile-app
npx expo run:android
```

## Opción 3: Web Only

```bash
cd D:\C.L.T.V\healthy + brain
npm install
npm run dev
# Abrir http://localhost:3000
```

## Estado del Proyecto: ✅ LISTO

- Web App: index.html (listo)
- Mobile App: mobile-app/ (configurado)
- IA System: notebooklm-integration.js
- Haptics: haptic-feedback.js
- Design: stitch-adapter.js
- Testing: master-control.js (botón ⚡)

## Permisos Android (ya configurados en app.json)
- Cámara, Health API, Vibración, Notificaciones

---

**Para generar APK ahora:**
1. Abrir terminal en `mobile-app/`
2. Ejecutar: `npx expo run:android`