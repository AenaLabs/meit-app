# 📬 Sistema de Notificaciones - Meit App

## Resumen

Este documento explica cómo funciona el sistema de notificaciones para **usuarios (customers)** en la app móvil Meit. El sistema permite que cuando se genere o redima una gift card, tanto el comercio como el usuario reciban una notificación.

---

## 📋 Componentes del Sistema

### 1. **Base de Datos**

#### Tabla: `public.notifications`

Ya existe en tu base de datos con esta estructura:

```sql
- id (uuid): ID único de la notificación
- business_settings_id (integer): ID del comercio relacionado
- customer_id (uuid): ID del usuario (NULL para notificaciones del comercio)
- type (varchar): Tipo de notificación (gift_card_generated, gift_card_redeemed, etc.)
- title (varchar): Título de la notificación
- message (text): Mensaje descriptivo
- metadata (jsonb): Datos adicionales en formato JSON
- data (jsonb): Datos de acción (ej. qué pantalla abrir)
- is_read (boolean): Si fue leída o no
- read_at (timestamp): Cuándo fue leída
- priority (varchar): Prioridad (low, normal, high, urgent)
- created_at (timestamp): Fecha de creación
```

#### Índices Existentes:
- `idx_notifications_customer_id`: Búsqueda rápida por usuario
- `idx_notifications_is_read`: Filtrar no leídas
- `idx_notifications_type`: Filtrar por tipo
- `idx_notifications_customer_business`: Consultas combinadas

---

### 2. **Triggers de Base de Datos**

#### Trigger 1: `notify_gift_card_generated`
Se ejecuta cuando se **inserta** una nueva gift card.

**Crea 2 notificaciones:**
1. **Para el usuario** (customer_id = id del usuario)
   - Tipo: `gift_card_generated`
   - Título: "¡Gift Card Generada!"
   - Mensaje: "Has generado una nueva gift card por $100 puntos. Código: ABC123"

2. **Para el comercio** (customer_id = NULL)
   - Tipo: `gift_card_generated`
   - Título: "Nueva Gift Card Generada"
   - Mensaje: "Un cliente ha generado una gift card por $100"

#### Trigger 2: `notify_gift_card_redeemed`
Se ejecuta cuando se **actualiza** el status de una gift card a `redeemed`.

**Crea 2 notificaciones:**
1. **Para el usuario**
   - Tipo: `gift_card_redeemed`
   - Título: "¡Gift Card Redimida!"
   - Mensaje: "Has redimido tu gift card de $100. Código: ABC123"

2. **Para el comercio**
   - Tipo: `gift_card_redeemed`
   - Título: "Gift Card Redimida"
   - Mensaje: "Un cliente ha redimido una gift card por $100"

**Script SQL:** Ver `scripts/notifications-setup.sql`

---

### 3. **Servicio de Notificaciones** (`src/services/notifications.ts`)

Funciones principales:

```typescript
// Obtener todas las notificaciones del usuario
getUserNotifications(customerId: string): Promise<Notification[]>

// Obtener solo las no leídas
getUnreadNotifications(customerId: string): Promise<Notification[]>

// Contar no leídas
getUnreadCount(customerId: string): Promise<number>

// Marcar como leída
markAsRead(notificationId: string): Promise<void>

// Marcar todas como leídas
markAllAsRead(customerId: string): Promise<void>

// Suscripción en tiempo real
subscribeToNotifications(
  customerId: string,
  onNotification: (notification) => void
): () => void
```

---

### 4. **Store de Zustand** (`src/store/notificationsStore.ts`)

Maneja el estado global de las notificaciones en la app.

**Estado:**
```typescript
{
  notifications: Notification[],
  unreadCount: number,
  isLoading: boolean,
  error: string | null,
  realtimeUnsubscribe: (() => void) | null
}
```

**Acciones principales:**
- `loadNotifications(customerId)`: Carga todas las notificaciones
- `loadUnreadNotifications(customerId)`: Carga solo las no leídas
- `refreshUnreadCount(customerId)`: Actualiza el contador
- `markNotificationAsRead(notificationId)`: Marca como leída
- `markAllNotificationsAsRead(customerId)`: Marca todas como leídas
- `subscribeToRealtimeNotifications(customerId)`: Escucha cambios en tiempo real
- `clearNotifications()`: Limpia el store (al cerrar sesión)

---

### 5. **Componentes UI**

#### `NotificationCard.tsx`
Componente reutilizable que muestra una notificación con:
- Icono dinámico según el tipo
- Colores de gradiente personalizados
- Indicador de "no leído"
- Badge de prioridad (si es high/urgent)
- Timestamp relativo ("Hace 5 min")

**Tipos soportados:**
- `gift_card_generated` → Icono Gift (púrpura)
- `gift_card_redeemed` → Icono CreditCard (verde)
- `points_assigned` → Icono TrendingUp (naranja)
- `challenge_completed` → Icono Award (azul)
- `customer_milestone` → Icono CheckCircle2 (rosa)
- `checkin` → Icono Users (teal)

#### `notifications.tsx`
Pantalla completa de notificaciones con:
- Header con contador de no leídas
- Botón "Marcar todas como leídas"
- Filtros por tipo (Todas, Gift Cards, Puntos, Desafíos)
- Lista con pull-to-refresh
- Navegación automática según tipo de notificación

---

### 6. **Integración en Home** (`src/app/(tabs)/index.tsx`)

La pantalla principal muestra:

1. **Badge en el ícono de campana**
   - Muestra número de notificaciones no leídas
   - Formato: "5" o "99+" si hay más de 99
   - Color rojo brillante

2. **Sección "Notificaciones recientes"**
   - Muestra las últimas 3 notificaciones no leídas
   - Botón "Ver todas" para ir a `/notifications`
   - Solo se muestra si hay notificaciones

3. **Carga automática**
   - Al cargar la app, se suscriben notificaciones en tiempo real
   - Se actualiza automáticamente cuando llega una nueva notificación
   - Se limpia al cerrar sesión

---

## 🔄 Flujo Completo

### Escenario: Usuario genera una gift card

```
1. Usuario canjea puntos por gift card en la app
   ↓
2. Backend inserta registro en tabla gift_cards
   ↓
3. Trigger notify_gift_card_generated se ejecuta automáticamente
   ↓
4. Se crean 2 notificaciones en tabla notifications:
   - Una para el usuario (customer_id = user_id)
   - Una para el comercio (customer_id = NULL)
   ↓
5. App móvil recibe notificación en tiempo real (Supabase Realtime)
   ↓
6. useNotificationsStore actualiza automáticamente:
   - Agrega nueva notificación al array
   - Incrementa unreadCount
   ↓
7. UI se actualiza:
   - Badge en campana muestra número actualizado
   - Notificación aparece en home (si está en las últimas 3)
   ↓
8. Usuario toca la notificación
   ↓
9. App navega a /gift-cards
   ↓
10. Notificación se marca como leída automáticamente
```

---

## 🛠️ Configuración Inicial

### Paso 1: Ejecutar Script SQL

```bash
# Conéctate a tu base de datos Supabase y ejecuta:
psql -h YOUR_DB_HOST -U postgres -d postgres -f scripts/notifications-setup.sql
```

O copia y pega el contenido en el SQL Editor de Supabase Dashboard.

### Paso 2: Verificar Triggers

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'gift_cards';
```

Deberías ver:
- `trigger_gift_card_generated`
- `trigger_gift_card_redeemed`

### Paso 3: Verificar RLS (Row Level Security)

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'notifications';
```

Deberías ver:
- `Users can view their own notifications`
- `Users can update their own notifications`
- `Users can delete their own notifications`

---

## 🧪 Testing

### Test 1: Crear una gift card de prueba

```sql
INSERT INTO public.gift_cards (
    customer_id,
    business_settings_id,
    code,
    value,
    points_used,
    status,
    expires_at
) VALUES (
    'TU_CUSTOMER_ID_AQUI', -- UUID del usuario de prueba
    1, -- ID del comercio
    'TEST-1234',
    100,
    50,
    'active',
    NOW() + INTERVAL '30 days'
);
```

**Resultado esperado:**
- 2 notificaciones creadas en tabla `notifications`
- La app del usuario recibe la notificación en tiempo real
- Badge actualizado en el ícono de campana

### Test 2: Verificar notificaciones creadas

```sql
SELECT
    id,
    customer_id,
    type,
    title,
    is_read,
    created_at
FROM public.notifications
WHERE metadata->>'gift_card_id' = (
    SELECT id::text FROM public.gift_cards WHERE code = 'TEST-1234'
)
ORDER BY created_at DESC;
```

Deberías ver 2 filas:
1. Una con `customer_id = TU_CUSTOMER_ID` (para el usuario)
2. Una con `customer_id = NULL` (para el comercio)

### Test 3: Redimir gift card

```sql
UPDATE public.gift_cards
SET
    status = 'redeemed',
    redeemed_at = NOW()
WHERE code = 'TEST-1234';
```

**Resultado esperado:**
- 2 notificaciones nuevas de tipo `gift_card_redeemed`
- Usuario recibe notificación en tiempo real

---

## 📱 Uso en la App

### Cargar notificaciones manualmente

```typescript
import { useNotificationsStore } from '@/store/notificationsStore';

const { loadNotifications } = useNotificationsStore();

// En un useEffect o handler
await loadNotifications(customer.id);
```

### Suscribirse a notificaciones en tiempo real

```typescript
import { useNotificationsStore } from '@/store/notificationsStore';

const { subscribeToRealtimeNotifications, unsubscribeFromRealtimeNotifications } = useNotificationsStore();

useEffect(() => {
  if (customer?.id) {
    // Suscribirse
    subscribeToRealtimeNotifications(customer.id, (newNotification) => {
      console.log('Nueva notificación:', newNotification.title);
      // Opcional: mostrar toast, reproducir sonido, etc.
    });

    // Cleanup
    return () => {
      unsubscribeFromRealtimeNotifications();
    };
  }
}, [customer?.id]);
```

### Marcar como leída

```typescript
const { markNotificationAsRead } = useNotificationsStore();

const handleNotificationPress = async (notification) => {
  if (!notification.isRead) {
    await markNotificationAsRead(notification.id);
  }
  // Navegar a la pantalla correspondiente
  router.push('/gift-cards');
};
```

---

## 🎨 Personalización

### Agregar un nuevo tipo de notificación

1. **Actualizar enum en base de datos:**

```sql
ALTER TYPE notification_type ADD VALUE 'mi_nuevo_tipo';
```

2. **Actualizar TypeScript:**

```typescript
// src/services/notifications.ts
export type NotificationType =
  | 'checkin'
  | 'gift_card_generated'
  | 'gift_card_redeemed'
  | 'points_assigned'
  | 'customer_milestone'
  | 'challenge_completed'
  | 'new_customer'
  | 'mi_nuevo_tipo'; // ← Agregar aquí
```

3. **Actualizar componente NotificationCard:**

```typescript
// src/components/NotificationCard.tsx
function getNotificationStyle(type: NotificationType) {
  switch (type) {
    // ... casos existentes ...
    case 'mi_nuevo_tipo':
      return {
        icon: MiIcono,
        colors: ['#COLOR1', '#COLOR2'],
        bgColor: '#BGCOLOR',
        iconColor: '#ICONCOLOR',
      };
  }
}
```

---

## ⚠️ Notas Importantes

1. **Realtime requiere configuración en Supabase:**
   - Asegúrate de tener habilitado Realtime en la tabla `notifications`
   - Dashboard > Database > Replication > Habilitar para `notifications`

2. **RLS debe estar configurado:**
   - Los usuarios solo ven notificaciones donde `customer_id = auth.uid()`
   - Las notificaciones del comercio tienen `customer_id = NULL`

3. **Limpiar notificaciones al cerrar sesión:**
   - Automático en `src/app/_layout.tsx`
   - Previene que usuarios vean notificaciones de sesiones anteriores

4. **Optimización:**
   - La app carga solo las últimas 50 notificaciones por defecto
   - Usa `loadUnreadNotifications()` en lugar de `loadNotifications()` si solo necesitas no leídas
   - Los índices en BD optimizan las consultas

---

## 🚀 Mejoras Futuras

- [ ] Push notifications (usando Expo Notifications)
- [ ] Sonido al recibir notificación
- [ ] Vibración en notificaciones urgentes
- [ ] Categorías de notificaciones
- [ ] Preferencias de notificaciones por usuario
- [ ] Notificaciones agrupadas por comercio
- [ ] Marcar múltiples como leídas (selección)
- [ ] Archivar notificaciones antiguas

---

## 📞 Soporte

Si tienes problemas con el sistema de notificaciones:

1. Verifica que los triggers estén activos (ver Test 2)
2. Revisa los logs de Supabase para errores
3. Confirma que RLS esté configurado correctamente
4. Usa `console.log()` en el store para debugging
5. Verifica que Realtime esté habilitado en Supabase Dashboard

---

**Desarrollado para Meit App** 🎯
