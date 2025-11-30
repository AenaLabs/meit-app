-- ============================================================================
-- VERIFICACIÓN DE POLÍTICAS PARA CUSTOMERS
-- Ejecutar DESPUÉS de aplicar add-customer-notifications-policies.sql
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR QUE TODAS LAS POLÍTICAS EXISTAN
-- ============================================================================

SELECT
    policyname,
    cmd AS operation,
    CASE
        WHEN policyname LIKE '%Customers%' THEN '📱 App Móvil (Customers)'
        WHEN policyname LIKE '%Users%' AND policyname NOT LIKE '%Customers%' THEN '💻 Web App (Business)'
        ELSE '🔧 Sistema'
    END AS target
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notifications'
ORDER BY target, operation, policyname;

-- Resultado esperado:
-- Deberías ver 7 políticas:
-- - 3 para Customers (SELECT, UPDATE, DELETE)
-- - 3 para Users/Business (SELECT, UPDATE, DELETE)
-- - 1 para service_role (INSERT)

-- ============================================================================
-- 2. CONTAR POLÍTICAS POR TIPO
-- ============================================================================

SELECT
    CASE
        WHEN policyname LIKE '%Customers%' THEN 'App Móvil'
        WHEN policyname LIKE '%Users%' THEN 'Web App'
        WHEN policyname LIKE '%Service%' THEN 'Sistema'
        ELSE 'Otro'
    END AS type,
    COUNT(*) AS total_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notifications'
GROUP BY type
ORDER BY type;

-- Resultado esperado:
-- App Móvil: 3
-- Web App: 3
-- Sistema: 1

-- ============================================================================
-- 3. VERIFICAR NOTIFICACIONES EXISTENTES PARA CUSTOMERS
-- ============================================================================

-- Ver cuántas notificaciones hay para customers vs business
SELECT
    CASE
        WHEN customer_id IS NULL THEN '💻 Business (web)'
        ELSE '📱 Customer (app)'
    END AS target,
    COUNT(*) AS total,
    COUNT(CASE WHEN is_read = false THEN 1 END) AS unread,
    COUNT(CASE WHEN is_read = true THEN 1 END) AS read
FROM public.notifications
GROUP BY CASE WHEN customer_id IS NULL THEN '💻 Business (web)' ELSE '📱 Customer (app)' END;

-- ============================================================================
-- 4. VER NOTIFICACIONES DE CUSTOMERS POR TIPO
-- ============================================================================

SELECT
    type,
    COUNT(*) AS total,
    COUNT(CASE WHEN is_read = false THEN 1 END) AS unread
FROM public.notifications
WHERE customer_id IS NOT NULL
GROUP BY type
ORDER BY total DESC;

-- ============================================================================
-- 5. VER ÚLTIMAS NOTIFICACIONES DE CUSTOMERS
-- ============================================================================

SELECT
    c.name AS customer_name,
    c.email AS customer_email,
    n.type,
    n.title,
    LEFT(n.message, 60) AS message_preview,
    n.is_read,
    n.created_at
FROM public.notifications n
JOIN public.customers c ON n.customer_id = c.id
WHERE n.customer_id IS NOT NULL
ORDER BY n.created_at DESC
LIMIT 10;

-- ============================================================================
-- 6. TESTING SIMULADO (Como customer)
-- ============================================================================

-- Para simular lo que verá un customer específico
-- Reemplaza 'CUSTOMER_UUID_AQUI' con un UUID real de la tabla customers

-- Ver notificaciones de un customer específico:
-- SELECT
--     id,
--     type,
--     title,
--     message,
--     is_read,
--     created_at
-- FROM public.notifications
-- WHERE customer_id = 'CUSTOMER_UUID_AQUI'
-- ORDER BY created_at DESC;

-- Ver solo las no leídas:
-- SELECT COUNT(*) as unread_count
-- FROM public.notifications
-- WHERE customer_id = 'CUSTOMER_UUID_AQUI'
--   AND is_read = false;

-- ============================================================================
-- 7. VERIFICAR QUE LOS CUSTOMERS PUEDEN ACCEDER
-- ============================================================================

-- Esta query debería funcionar cuando la app móvil la ejecute:
-- (Supabase automáticamente reemplaza auth.uid() con el UUID del usuario)

-- SELECT * FROM notifications
-- WHERE customer_id = auth.uid()
-- ORDER BY created_at DESC;

-- ============================================================================
-- 8. LISTAR TODOS LOS CUSTOMERS CON NOTIFICACIONES
-- ============================================================================

SELECT
    c.id AS customer_id,
    c.name AS customer_name,
    c.email,
    COUNT(n.id) AS total_notifications,
    COUNT(CASE WHEN n.is_read = false THEN 1 END) AS unread_count,
    MAX(n.created_at) AS last_notification_at
FROM public.customers c
LEFT JOIN public.notifications n ON c.id = n.customer_id
GROUP BY c.id, c.name, c.email
HAVING COUNT(n.id) > 0
ORDER BY unread_count DESC, last_notification_at DESC;

-- ============================================================================
-- 9. VERIFICAR QUE NO HAY CONFLICTOS
-- ============================================================================

-- Verificar que las políticas de business NO afectan a customers
-- Esta query debe retornar 0 (ningún customer debe tener business_settings.owner)
SELECT COUNT(*) AS potential_conflicts
FROM public.customers c
WHERE EXISTS (
    SELECT 1 FROM public.business_settings bs
    WHERE bs.owner = c.id
);

-- Resultado esperado: 0
-- Si es > 0, significa que algunos customers son también business owners
-- (esto está bien, solo significa que tienen acceso a ambos tipos de notificaciones)

-- ============================================================================
-- 10. RESUMEN EJECUTIVO
-- ============================================================================

SELECT
    'Total Políticas' AS metric,
    COUNT(*)::TEXT AS value
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'notifications'

UNION ALL

SELECT
    'Políticas para Customers',
    COUNT(*)::TEXT
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notifications'
  AND policyname LIKE '%Customers%'

UNION ALL

SELECT
    'Políticas para Business',
    COUNT(*)::TEXT
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notifications'
  AND policyname LIKE '%Users%'

UNION ALL

SELECT
    'Total Notificaciones',
    COUNT(*)::TEXT
FROM public.notifications

UNION ALL

SELECT
    'Notificaciones de Customers',
    COUNT(*)::TEXT
FROM public.notifications
WHERE customer_id IS NOT NULL

UNION ALL

SELECT
    'Notificaciones No Leídas (Customers)',
    COUNT(*)::TEXT
FROM public.notifications
WHERE customer_id IS NOT NULL AND is_read = false;

-- ============================================================================
-- FIN DE VERIFICACIÓN
-- ============================================================================

-- Si todas las queries funcionan correctamente, el sistema está listo para:
-- ✅ La web app sigue viendo notificaciones de negocios
-- ✅ La app móvil puede ver notificaciones de customers
-- ✅ No hay conflictos entre ambos sistemas
-- ✅ Las políticas RLS protegen correctamente los datos
