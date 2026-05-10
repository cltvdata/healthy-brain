# Instrucciones de Compilación (Build) - Healthy + Brain

El código base ha sido asegurado y el sistema Sentry (Monitoreo de Errores) está integrado. Sigue estos pasos para generar los ejecutables nativos (APK para Android / IPA para iOS) usando Expo Application Services (EAS).

## 1. Completar Configuración de Sentry

1. Crea una cuenta gratuita en [Sentry.io](https://sentry.io/).
2. Crea un nuevo proyecto para **React Native / Expo**.
3. Copia el **DSN** que te proporcionan.
4. Abre el archivo `mobile-app/app/_layout.tsx` y reemplaza el texto `'TU_DSN_AQUI'` con tu DSN real.
5. Abre `mobile-app/app.json` y reemplaza `"tu-organizacion"` con el slug (nombre) de tu organización en Sentry.

## 2. Instalar Dependencias Actualizadas

Como agregamos Sentry al `package.json`, necesitas instalarlo:

```bash
cd "mobile-app"
npm install
```

## 3. Instalar EAS CLI (Si no lo tienes)

EAS es la herramienta oficial de Expo para compilar aplicaciones nativas en la nube.

```bash
npm install -g eas-cli
```

## 4. Iniciar Sesión en EAS

Asegúrate de tener una cuenta creada en [Expo.dev](https://expo.dev/) y ejecuta:

```bash
eas login
```

## 5. Configurar el Proyecto (Solo la primera vez)

Configura el proyecto para preparar el archivo `eas.json` si no existe:

```bash
eas build:configure
```

## 6. Lanzar la Compilación (Build)

### Para Android (APK Instalable Directamente)

Esto generará un archivo `.apk` que puedes descargar e instalar directamente en tu teléfono Android (saltando Google Play para pruebas).

```bash
eas build --platform android --profile preview
```

### Para iOS (Requiere cuenta de desarrollador de Apple)

Para iOS, necesitas una cuenta de Apple Developer de pago ($99/año).

```bash
eas build --platform ios --profile preview
```

## 7. Pruebas Manuales (Sentry)

Una vez instalada la app en tu teléfono, haz una prueba rápida. Si la app se crashea (por ejemplo, si pruebas una función de cámara y le falta un permiso), el error debería aparecer automáticamente en el Dashboard web de tu cuenta de Sentry.io, dándote detalles exactos del archivo y la línea que falló.
