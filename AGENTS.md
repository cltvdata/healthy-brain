# Healthy + Brain Developer Guidelines (AGENTS.md)

This file contains the strict architectural and technical rules for the development of the "Healthy + Brain" full-stack platform (React + Vite + Tailwind + Firebase). Follow these guidelines in every update:

## 1. APK Download Path
* **Local Distribution**: The native Android APK must always be distributed locally using the relative path `/healthy-brain.apk` to avoid 404 errors on GitHub releases in private repositories.
* **Direct Button**: Ensure download buttons or anchor tags target `/healthy-brain.apk`.

## 2. Dynamic QR Codes
* **Generation**: Any QR code used to download the mobile application must be generated dynamically.
* **Dynamic URL**: The QR target must point to `window.location.origin + '/healthy-brain.apk'`.
* **Rendering**: Use a reliable, fast external QR code generator (e.g., `api.qrserver.com`) as an image source, passing the URL encoded correctly.

## 3. Approved Payment Gateways
* **Supported Gateways**: Keep and maintain only **Zelle**, **Bitcoin**, and **Square** for premium license approvals.
* **Prohibited Gateways**: Do not include PayPal or other unauthorized payment processors.

## 4. Firebase Auth & Firestore Integration
* **Synchronization**: Keep Firebase Authentication and Firestore database sync active to track and preserve the user's premium status (`isPaymentApproved`).
* **Sovereignty & Security**: Maintain the confidentiality of bio-data and ensure offline-first support where applicable.

## 5. Build Integrity
* **Compilation**: Every modification must build successfully. Ensure `npm run build` succeeds prior to completing changes.
