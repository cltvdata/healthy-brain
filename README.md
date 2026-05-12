# HEALTHY + BRAIN 🚀

## Versión: 1.0.0 - Production Ready

### Tech Stack
- **Web**: Vite + HTML/CSS/JS
- **Mobile**: Expo (React Native)
- **IA**: NotebookLM Integration
- **Design**: Pomelli/Stitch (Google DNA)

---

## Quick Start

### Web App
```bash
npm run dev
# Abrir http://localhost:3000
```

### Mobile App (Android)
```bash
npm run mobile:build:preview
# Descargar APK de EAS Build
```

---

## Features

### 🤖 IA System
- `notebooklm-integration.js` - Motor de pesos (médico > fitness)
- Micro-intervenciones de 10 min personalizadas

### 📳 Haptics
- `haptic-feedback.js` - 7 patrones de vibración
- Sedentarismo, Estrés, Sueño, Meditación, Logros

### 🎨 UI Adaptativa
- `stitch-adapter.js` - Contexto Pomelli/Stitch
- Paletas según hora del día y estado biométrico

### 🧪 Testing
- Panel de control: **Botón ⚡** (esquina inferior izq)
- Haptic Debug: **Botón ⬡** (esquina inferior der)

---

## Build Commands

| Comando | Función |
|---------|---------|
| `npm run dev` | Servidor web local |
| `npm run build` | Build web producción |
| `npm run mobile:dev` | Expo dev server |
| `npm run mobile:build:preview` | APK preview |
| `npm run mobile:build:prod` | APK producción |

---

## Permisos Mobile
- ✅ Cámara (análisis nutrition IA)
- ✅ Health API (pasos, HR, sueño)
- ✅ Vibración (haptics)
- ✅ Notificaciones push

---

## Estructura

```
├── index.html          # Web App Principal
├── mobile-app/        # Expo Mobile App
│   ├── app/           # Rutas y screens
│   └── app.json       # Config Expo
├── js/
│   ├── notebooklm-integration.js
│   ├── haptic-feedback.js
│   ├── stitch-adapter.js
│   └── master-control.js
└── assets/css/
```

---

## 🎯READY FOR LAUNCH