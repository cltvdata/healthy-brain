# Healthy + Brain: Checklist de Envío a Tiendas

## Google Play Console

### Cuenta
- [ ] Cuenta de Google Play Developer ($25 una vez)
- [ ] Correo verificado
- [ ] Payment verificado

### App Metadata
- [ ] Título: "Healthy + Brain: Bio-Tracking & Longevity"
- [ ] Descripción corta: 80 chars
- [ ] Descripción completa: 4000+ chars
- [ ] Categoría: Health & Fitness / Medical
- [ ] Tags: biohacking, health tracking, HRV, longevity, wellness

### Assets
- [ ] Icono 512x512 PNG
- [ ] Feature graphic 1024x500 PNG
- [ ] Screenshots (mínimo 2, máximo 8)
  - [ ] Dashboard
  - [ ] NTK tokens
  - [ ] IA Nutrition
  - [ ] Enfoque session
- [ ] Privacy Policy URL (host en firebase o Vercel)
- [ ] App trailer (opcional)

### Content Rating
- [ ] Completar questionnaire de contenido
- [ ] Age rating: Everyone or Teen

### Pricing
- [ ] App gratuita con IAP
- [ ] Configurar productos:

| ID | Nombre | Precio |
|----|--------|--------|
| ntK_10 | 10 NTK | $0.99 |
| ntK_50 | 50 NTK | $3.99 |
| ntK_100 | 100 NTK | $6.99 |
| pro_month | Pro Monthly | $9.99 |
| pro_year | Pro Year | $79.99 |
| elite_month | Elite Monthly | $19.99 |

---

## Apple App Store

### Cuenta
- [ ] Apple Developer Program ($99/año)
- [ ] Agreements aceptados
- [ ] Bank/Tax info completado

### App Information
- [ ] Nombre: "Healthy + Brain"
- [ ] Subtítulo: "Bio-Tracking & Longevity Coach"
- [ ] Categoría: Health & Fitness
- [ ] Subcategoría: Medical (opcional)

### Screenshots
- [ ] iPhone 6.7" (1290x2796) - 3 screenshots mínimo
- [ ] iPhone 6.5" (1242x2688)
- [ ] iPad Pro 12.9" (2048x2732) - opcional

### Metadata
- [ ] Keywords: 100 chars max
- [ ] Descripción: 4000 chars
- [ ] What's New: para updates

### Build
- [ ] Subir build via EAS or Xcode
- [ ] Wait for processing (10-30 min)
- [ ] Select build in App Store Connect

### Review Info
- [ ] Login demo account
- [ ] Video demo (si requerido)
- [ ] Contact info

---

## Pre-Submission QA

### Testing Checklist
- [ ] App launch sin crasheo
- [ ] Login/Signup flow funciona
- [ ] Onboarding completa sin errores
- [ ] Dashboard carga métricas
- [ ] NTK tokens se muestran
- [ ] IA nutrition (si hay cámara) funciona
- [ ] Navegación funciona
- [ ] Dark mode se ve bien
- [ ] Textos en español e inglés
- [ ] No hardcoded sensitive data

### Performance
- [ ] App abre en < 3 segundos
- [ ] No ANRs (Application Not Responding)
- [ ] No memory leaks obvios
- [ ] Images optimizadas

### Privacy
- [ ] Privacy Policy accesible
- [ ] No data sent to third parties sin consent
- [ ] Firebase + Sentry only
- [ ] Analytics opt-in

---

## Post-Submission

### Day 1-7
- [ ] Monitorear crash reports
- [ ] Responder a reviews
- [ ] Fix critical bugs
- [ ] Update screenshots if needed

### Week 2-4
- [ ] Analizar métricas de la tienda
- [ ] Ajustar keywords basado en search
- [ ] Incrementar ratings/reviews
- [ ] Planificar update

---

## Timeline Sugerido

```
Semana 1:
- Día 1-2: Preparar assets
- Día 3: Configurar Play Console
- Día 4: Submit Android
- Día 5: Configurar App Store Connect
- Día 6: Submit iOS
- Día 7: Monitorear

Semana 2:
- Esperar approval (1-5 días típicamente)
- Si rejected, fix y resubmit

Semana 3:
- Soft launch
- Collect reviews
- Iterate
```