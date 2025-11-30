-- ============================================================================
-- SCRIPT DE SOLO LECTURA - NO MODIFICA NADA
-- Este script verifica el estado actual de la tabla notifications
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR POLÍTICAS RLS (Row Level Security)
-- ============================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notifications'
ORDER BY policyname;

-- ============================================================================
-- 2. VERIFICAR SI RLS ESTÁ HABILITADO
-- ============================================================================

SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'notifications';

-- ============================================================================
-- 3. LISTAR TODAS LAS FUNCIONES RELACIONADAS CON NOTIFICACIONES
-- ============================================================================

SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS arguments,
    pg_get_functiondef(p.oid) AS function_definition,
    CASE
        WHEN p.prorettype = 'trigger'::regtype THEN 'trigger'
        ELSE pg_catalog.format_type(p.prorettype, NULL)
    END AS return_type
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    p.proname LIKE '%notif%'
    OR p.proname LIKE '%gift_card%'
    OR p.proname LIKE '%notification%'
  )
ORDER BY p.proname;

-- ============================================================================
-- 4. LISTAR TODOS LOS TRIGGERS EN LA TABLA gift_cards
-- ============================================================================

SELECT
    tgname AS trigger_name,
    tgrelid::regclass AS table_name,
    CASE tgtype & 1
        WHEN 1 THEN 'ROW'
        ELSE 'STATEMENT'
    END AS trigger_level,
    CASE tgtype & 66
        WHEN 2 THEN 'BEFORE'
        WHEN 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS trigger_timing,
    CASE
        WHEN tgtype & 4 = 4 THEN 'INSERT'
        WHEN tgtype & 8 = 8 THEN 'DELETE'
        WHEN tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'UNKNOWN'
    END AS trigger_event,
    p.proname AS function_name,
    tgenabled AS enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'public.gift_cards'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- ============================================================================
-- 5. VER DEFINICIÓN COMPLETA DE TRIGGERS ESPECÍFICOS
-- ============================================================================

SELECT
    t.tgname AS trigger_name,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
WHERE tgrelid = 'public.gift_cards'::regclass
  AND NOT tgisinternal
ORDER BY t.tgname;

-- ============================================================================
-- 6. VERIFICAR ESTRUCTURA DE LA TABLA notifications
-- ============================================================================

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- ============================================================================
-- 7. VERIFICAR CONSTRAINTS Y CHECKS
-- ============================================================================

SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.notifications'::regclass
ORDER BY conname;

-- ============================================================================
-- 8. VERIFICAR ÍNDICES EN LA TABLA notifications
-- ============================================================================

SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'notifications'
ORDER BY indexname;

-- ============================================================================
-- 9. VERIFICAR FOREIGN KEYS
-- ============================================================================

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'notifications'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- 10. VERIFICAR TIPOS ENUM RELACIONADOS
-- ============================================================================

SELECT
    t.typname AS enum_type_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%notification%'
ORDER BY t.typname, e.enumsortorder;

-- ============================================================================
-- 11. CONTAR NOTIFICACIONES ACTUALES
-- ============================================================================

-- Total de notificaciones
SELECT COUNT(*) AS total_notifications
FROM public.notifications;

-- Por tipo
SELECT
    type,
    COUNT(*) AS count
FROM public.notifications
GROUP BY type
ORDER BY count DESC;

-- Por estado de lectura
SELECT
    is_read,
    COUNT(*) AS count
FROM public.notifications
GROUP BY is_read;

-- Notificaciones para usuarios vs comercios
SELECT
    CASE
        WHEN customer_id IS NULL THEN 'Business'
        ELSE 'Customer'
    END AS notification_target,
    COUNT(*) AS count
FROM public.notifications
GROUP BY CASE WHEN customer_id IS NULL THEN 'Business' ELSE 'Customer' END;

-- ============================================================================
-- 12. VER EJEMPLOS DE NOTIFICACIONES RECIENTES
-- ============================================================================

SELECT
    id,
    business_settings_id,
    customer_id,
    type,
    title,
    LEFT(message, 50) AS message_preview,
    is_read,
    priority,
    created_at
FROM public.notifications
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 13. VERIFICAR PERMISOS DE LA TABLA
-- ============================================================================

SELECT
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'notifications'
ORDER BY grantee, privilege_type;

-- ============================================================================
-- RESUMEN
-- ============================================================================

-- Este script te mostrará:
-- ✓ Todas las políticas RLS existentes
-- ✓ Todas las funciones relacionadas con notificaciones
-- ✓ Todos los triggers en gift_cards
-- ✓ Estructura completa de la tabla notifications
-- ✓ Constraints, índices y foreign keys
-- ✓ Estadísticas de notificaciones actuales
-- ✓ Ejemplos de notificaciones existentes

-- Con esta información podremos determinar si necesitamos crear nuevos
-- triggers o si ya existen y solo necesitamos ajustar las políticas RLS
