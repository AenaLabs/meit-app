# 🚀 Instrucciones de Setup - Sistema de Notificaciones

## Estado Actual

Basado en el análisis de la base de datos, esto es lo que encontramos:

### ✅ Lo que YA funciona:
- ✓ La tabla `notifications` existe y está configurada correctamente
- ✓ Los **triggers ya están creando notificaciones para customers**
- ✓ Hay 9 notificaciones con `customer_id` para usuarios de la app móvil
- ✓ Hay 15 notificaciones con `customer_id = NULL` para negocios (web app)
- ✓ Los tipos `gift_card_generated` y `gift_card_redeemed` ya funcionan

### ❌ Lo que falta:
- ✗ Las políticas RLS actuales **solo permiten que business owners** vean notificaciones
- ✗ Los customers **no pueden acceder** a sus notificaciones (aunque existen en la BD)

## 🔧 Solución

Solo necesitas agregar 3 políticas RLS nuevas para que los customers puedan acceder a sus notificaciones **SIN afectar** la web app.

---

## 📝 Pasos de Configuración

### Paso 1: Agregar Políticas RLS para Customers

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de: `scripts/add-customer-notifications-policies.sql`
4. Ejecuta el script (Run)

**¿Qué hace este script?**
- Agrega 3 políticas nuevas **solo para customers**:
  - `Customers can view their own notifications` (SELECT)
  - `Customers can update their own notifications` (UPDATE)
  - `Customers can delete their own notifications` (DELETE)

**¿Afecta a la web app?**
- **NO**. Las políticas existentes para business owners se mantienen intactas
- PostgreSQL RLS usa lógica OR, así que ambos sistemas funcionan en paralelo

---

### Paso 2: Verificar que Todo Funcione

1. En **Supabase Dashboard** → **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de: `scripts/verify-customer-policies.sql`
4. Ejecuta el script (Run)

**Resultado esperado:**

```
📊 Resumen:
- Total Políticas: 7
- Políticas para Customers: 3 ✅
- Políticas para Business: 3 ✅
- Políticas de Sistema: 1 ✅
- Total Notificaciones: 24
- Notificaciones de Customers: 9 ✅
- Notificaciones No Leídas (Customers): 9 ✅
```

---

### Paso 3: Habilitar Realtime (Opcional pero Recomendado)

Para que las notificaciones aparezcan automáticamente en tiempo real:

1. Ve a **Supabase Dashboard** → **Database** → **Replication**
2. Busca la tabla `notifications`
3. Activa el toggle en la columna **"Realtime"**
4. Guarda los cambios

**¿Qué hace?**
- Permite que la app móvil reciba notificaciones instantáneamente
- Sin esto, solo se actualizan al refrescar manualmente

---

### Paso 4: Probar en la App Móvil

1. **Inicia sesión** en la app móvil con un usuario que tenga notificaciones
   - Ejemplo: `2300f829-ae8c-420d-b78d-1387f23fe31f` (según los datos que vimos)

2. **Abre la pantalla principal (Home)**
   - Deberías ver el badge con el número de notificaciones no leídas
   - Deberías ver las últimas 3 notificaciones en la sección "Notificaciones recientes"

3. **Toca el ícono de campana** en el header
   - Deberías navegar a `/notifications`
   - Deberías ver todas tus notificaciones

4. **Toca una notificación**
   - Se debería marcar como leída automáticamente
   - El badge debería actualizarse

---

## 🧪 Testing Completo

### Test 1: Ver notificaciones de un customer específico

```sql
-- Reemplaza con un customer_id real de tu BD
SELECT
    id,
    type,
    title,
    message,
    is_read,
    created_at
FROM public.notifications
WHERE customer_id = '2300f829-ae8c-420d-b78d-1387f23fe31f'
ORDER BY created_at DESC;
```

**Resultado esperado:** Deberías ver las notificaciones de ese customer

---

### Test 2: Simular autenticación de customer

Esto es lo que Supabase hará automáticamente cuando un customer esté autenticado:

```sql
-- Esta query usa auth.uid() que Supabase reemplaza automáticamente
SELECT * FROM notifications
WHERE customer_id = auth.uid()
ORDER BY created_at DESC;
```

**Para probarlo manualmente:** Usa el SQL Editor con una sesión autenticada

---

### Test 3: Verificar que business owners NO vean notificaciones de customers

```sql
-- Esta query debe retornar 0 para business owners
-- (solo ven notificaciones donde customer_id IS NULL)
SELECT COUNT(*) AS customer_notifications_visible
FROM public.notifications
WHERE customer_id IS NOT NULL
  AND business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = 'UUID_BUSINESS_OWNER'
  );
```

**Resultado esperado:** 0 (business owners no ven notificaciones de customers)

---

## 🎯 Cómo Funciona la Seguridad

### Business Owners (Web App)

**Política:**
```sql
WHERE business_settings_id IN (
  SELECT id FROM business_settings WHERE owner = auth.uid()
)
```

**Resultado:**
- ✅ Ven notificaciones donde `customer_id = NULL` (notificaciones del negocio)
- ❌ NO ven notificaciones de customers individuales

---

### Customers (App Móvil)

**Política:**
```sql
WHERE customer_id = auth.uid()
```

**Resultado:**
- ✅ Ven solo sus propias notificaciones
- ❌ NO ven notificaciones de otros customers
- ❌ NO ven notificaciones del negocio (`customer_id = NULL`)

---

## 📊 Estructura de Datos

### Notificación para Business (Web App)
```json
{
  "id": "uuid",
  "business_settings_id": 3,
  "customer_id": null,  ← NULL = para el negocio
  "type": "checkin",
  "title": "Nuevo check-in",
  "message": "Rafael ha hecho check-in en Principal",
  "is_read": false
}
```

### Notificación para Customer (App Móvil)
```json
{
  "id": "uuid",
  "business_settings_id": 3,
  "customer_id": "2300f829-...",  ← UUID del customer
  "type": "gift_card_generated",
  "title": "🎁 ¡Gift Card Generada!",
  "message": "Has canjeado 50 puntos por una gift card de $1 USD",
  "is_read": false
}
```

---

## 🔍 Solución de Problemas

### Problema: "No veo notificaciones en la app"

**Soluciones:**
1. Verifica que las políticas RLS estén creadas (Paso 2)
2. Verifica que el usuario tenga notificaciones en la BD:
   ```sql
   SELECT * FROM notifications WHERE customer_id = 'TU_CUSTOMER_ID';
   ```
3. Revisa los logs de Supabase en Dashboard → Logs
4. Verifica que el customer esté autenticado (revisa `useAuthStore`)

---

### Problema: "Las notificaciones no se actualizan en tiempo real"

**Soluciones:**
1. Verifica que Realtime esté habilitado (Paso 3)
2. Verifica que el store esté suscrito:
   ```typescript
   subscribeToRealtimeNotifications(customer.id);
   ```
3. Revisa la consola del navegador/app para errores de Supabase

---

### Problema: "Error: 'permission denied'"

**Causa:** Las políticas RLS no están aplicadas correctamente

**Solución:**
1. Re-ejecuta el script `add-customer-notifications-policies.sql`
2. Verifica con `verify-customer-policies.sql`
3. Asegúrate de que el customer esté autenticado

---

## ✅ Checklist Final

Antes de considerar el setup completo, verifica:

- [ ] Script `add-customer-notifications-policies.sql` ejecutado exitosamente
- [ ] Script `verify-customer-policies.sql` muestra 3 políticas para customers
- [ ] Realtime habilitado en la tabla `notifications` (opcional)
- [ ] App móvil muestra badge de notificaciones no leídas
- [ ] App móvil muestra sección "Notificaciones recientes" en home
- [ ] Pantalla `/notifications` muestra todas las notificaciones
- [ ] Marcar como leída funciona correctamente
- [ ] Contador de no leídas se actualiza al marcar como leída

---

## 📚 Archivos del Sistema

### Archivos SQL:
- `check-notifications-status.sql` - Verificar estado actual (solo lectura)
- `add-customer-notifications-policies.sql` - **EJECUTAR ESTE** (agrega políticas)
- `verify-customer-policies.sql` - Verificar que todo funcione
- ~~`notifications-setup.sql`~~ - NO ejecutar (es para referencia)

### Archivos TypeScript:
- `src/services/notifications.ts` - Servicio de notificaciones
- `src/store/notificationsStore.ts` - Store de Zustand
- `src/components/NotificationCard.tsx` - Componente UI
- `src/app/notifications.tsx` - Pantalla completa
- `src/app/(tabs)/index.tsx` - Integración en home
- `src/app/_layout.tsx` - Carga inicial

### Documentación:
- `NOTIFICATIONS_README.md` - Documentación completa del sistema
- `SETUP_INSTRUCTIONS.md` - Este archivo

---

## 🎉 ¡Listo!

Si completaste todos los pasos, el sistema de notificaciones está funcionando:

✅ La web app sigue viendo notificaciones de negocios
✅ La app móvil ahora puede ver notificaciones de customers
✅ No hay conflictos entre ambos sistemas
✅ Las políticas RLS protegen correctamente los datos
✅ Las notificaciones se crean automáticamente al generar/redimir gift cards

**Próximos pasos opcionales:**
- Implementar push notifications con Expo Notifications
- Agregar sonidos/vibraciones a las notificaciones
- Crear categorías de notificaciones personalizables
- Implementar preferencias de notificaciones por usuario

---

**¿Necesitas ayuda?**
Revisa la sección de **Solución de Problemas** o consulta `NOTIFICATIONS_README.md` para más detalles.
