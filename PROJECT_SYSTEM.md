# HEALTHY + BRAIN - Unified Project System

Este repositorio contiene el sistema completo de **HEALTHY + BRAIN**, unificado bajo una arquitectura de "Bio-Cloud" compartida.

## Estructura del Proyecto

- **Raíz (/)**: Aplicación Web Premium (Vite + Vanilla JS + Tailwind). Es la interfaz principal para escritorio y web móvil.
- **mobile-app/**: Aplicación Móvil Nativa (Expo + React Native). Optimizada para wearables e integración profunda con iOS/Android.
- **js/**: Motores de lógica compartida para la web.
- **mobile-app/services/**: Servicios de lógica para la aplicación móvil.

## Unificación de Lógica (Bio-Cloud)

Ambas plataformas están unificadas mediante:

1.  **Firebase Backend**: Comparten la misma base de datos Firestore, Storage y Auth. Los datos sincronizados en el móvil aparecen instantáneamente en la web.
2.  **Sistema NTK (Neuro-Tokens)**: El balance de tokens es global. Ganar tokens en el móvil (por wearables) permite usarlos en la web (para reportes IA).
3.  **Bono de Veterano**: Ambas plataformas reconocen a los usuarios con más de 6 meses de antigüedad y aplican un bono automático de **+15 NTK** en todas las acciones de sincronización.
4.  **Extracción IA**: Ambas plataformas utilizan la API de Gemini para extraer biomarcadores de capturas de pantalla de laboratorios.

## Guía de Desarrollo

### Web (Vite)
```bash
npm run dev
```

### Móvil (Expo)
```bash
npm run mobile:dev
```

## Pruebas de Veterano
Para probar la lógica de veterano en la web, abre la consola del navegador y ejecuta:
```javascript
window.VeteranTest.simulateVeteranStatus();
```
Luego realiza una sincronización de datos o importación de CSV.
