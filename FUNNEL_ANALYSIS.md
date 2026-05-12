# Healthy + Brain: Análisis del Funnel de Conversión

## Funnel Actual

```
VISITANTE
    ↓ (30-50%)
LANDING / INDEX
    ↓ (40-60%)
REGISTRO (perfil-setup.html)
    ↓ (50-70%)
VERIFICACIÓN EMAIL (verify-email.html)
    ↓ (30-50%)
ONBOARDING COMPLETO
    ↓ (20-30%)
PRIMER USO (ganar NTK)
    ↓ (5-10%)
SUSCRIPCIÓN PREMIUM
```

---

## Etapa 1: Landing → Registro

### Puntos de entrada:
- Directo (index.html)
- Búsqueda orgánica
- Redes sociales
- Referencias

### Problemas identificados:
1. ❌ **Sin página de landing dedicada** - Llega directo al dashboard
2. ❌ **No hay propuesta de valor clara** en primer screen
3. ❌ **Sin social proof** (testimonios, números de usuarios)
4. ❌ **Onboarding extenso** (muchos campos antes de ver valor)

### Métricas objetivo:
- Tiempo en página: > 30 seg
- Scroll depth: > 70%
- CTR botón "Comenzar": > 15%

---

## Etapa 2: Registro → Verificación

### Flujo actual:
1. Seleccionar género
2. Ingresar edad
3. Ingresar altura/peso
4. Objetivos de salud
5. Crear cuenta (email/password)
6. Verificar email

### Problemas identificados:
1. ❌ **Demasiados campos** (8+ campos antes de crear cuenta)
2. ❌ **Sin opción de login social** (Google, Apple)
3. ❌ **No hay progreso visual** (stepper)
4. ❌ **Form validation** no clara

### Optimizaciones propuestas:
1. ✅ Reducir a 3 campos esenciales: email, password, objetivo
2. ✅ Agregar progreso (Step 1 of 4)
3. ✅ Login con Google/Apple
4. ✅ Email + password primero, resto después de verificación

---

## Etapa 3: Verificación → Dashboard

### Problemas:
1. ❌ **Email de verificación** puede llegar a spam
2. ❌ **Sin reenvío automático** si no llega
3. ❌ **Tiempo de espera** sin feedback claro
4. ❌ **Landing post-verificación** no tiene next action clara

### Optimizaciones:
1. ✅ Email con asunto optimizado
2. ✅ "No te llegó? Reenviar" visible
3. ✅ Loading state con progress
4. ✅ Post-verificación → "Completa tu perfil" o "Explora"

---

## Etapa 4: Dashboard → Primer Uso

### Puntos de fricción:
1. ❌ **Datos no visibles** hasta que los ingresa
2. ❌ **Sin valor inmediato** (no hay métricas hasta que tracking)
3. ❌ **NTK no visible** si no ha completado acciones

### Optimizaciones:
1. ✅ Mostrar "Bienvenido, aquí está tu primer NTK" con tutorial
2. ✅ Quick actions visibles: "Sincroniza luz solar", "Registra comida"
3. ✅ Gamificación inmediata con logro "Primer paso"

---

## Etapa 5: Free → Premium

### Problemas:
1. ❌ **Paywall después del valor** - Usuario ya tiene lo que necesita
2. ❌ **Sin trial** de funciones premium
3. ❌ **Precios no claros** - hay que ir a "Precios" para ver
4. ❌ **CTA débil** - "Desbloquear Premium" vs "7 días gratis"

### Optimizaciones:
1. ✅ Trial 7 días de Pro
2. ✅ Feature gating - mostrar qué pierde sin Premium
3. ✅ CTA mejorado: "Prueba Pro 7 días gratis"
4. ✅ Pricing visible en dashboard como "Upgrade"

---

## Puntos de Conversión Clave (CRO)

| Punto | Acción | Optimización |
|-------|--------|---------------|
| Header | "Comenzar" | CTA más visible, contraste |
| Post-registro | "Verificar email" | Timer, resend button |
| Dashboard | "Sincronizar" | Tutorial tooltip |
| Perfil | "Completar" | Gamificar, mostrar % |
| NTK earned | "Ver recompensas" | Mostrar canjeables |
| Header nav | "Precios" | Mostrar badge "Pro" |

---

## Eventos de Analytics a Trackear

```javascript
// Funnel tracking
hb_analytics.event('funnel', 'visited_landing');
hb_analytics.event('funnel', 'started_registration');
hb_analytics.event('funnel', 'completed_registration');
hb_analytics.event('funnel', 'sent_verification');
hb_analytics.event('funnel', 'verified_email');
hb_analytics.event('funnel', 'completed_onboarding');
hb_analytics.event('funnel', 'first_ntk_earned');
hb_analytics.event('funnel', 'viewed_pricing');
hb_analytics.event('funnel', 'clicked_upgrade');
hb_analytics.event('funnel', 'completed_payment');
```

---

## A/B Testing Sugeridos

1. **Landing headline**: 
   - A: "Optimiza tu biológico" 
   - B: "Gana NTK por hábitos saludables"

2. **Onboarding steps**:
   - A: 8 campos ahora
   - B: 3 campos + completar después

3. **CTA Premium**:
   - A: "Desbloquear Premium $9.99/mes"
   - B: "Prueba Pro 7 días gratis"

4. **Social login**:
   - A: Solo email/password
   - B: + Google + Apple sign in

---

## Quick Wins (Implementar ahora)

1. ✅ Agregar stepper a onboarding
2. ✅ Login con Google
3. ✅ Trial 7 días visible
4. ✅ Quick action "Ganar NTK" más visible
5. ✅流失 - Mostrar "Aún no has terminado" si sale

---

## Metrics Dashboard

| Métrica | Target | Actual | Estado |
|---------|--------|--------|--------|
| Landing → Registro | 15% | ? | 🔴 |
| Registro → Verificación | 70% | ? | 🔴 |
| Verificación → Dashboard | 60% | ? | 🔴 |
| Dashboard → Primer NTK | 40% | ? | 🔴 |
| Free → Premium | 5% | ? | 🔴 |
| Day 1 retention | 40% | ? | 🔴 |
| Day 7 retention | 20% | ? | 🔴 |