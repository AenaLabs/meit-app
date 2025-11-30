-- Script para verificar y configurar el sistema de notificaciones
-- Este script debe ejecutarse en la base de datos de Supabase

-- ============================================================================
-- 1. VERIFICAR TABLA DE NOTIFICACIONES
-- ============================================================================

-- La tabla ya existe, solo verificamos su estructura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. CREAR/VERIFICAR TRIGGERS PARA GIFT CARDS
-- ============================================================================

-- Trigger para cuando se GENERA una gift card
-- Este trigger crea una notificación tanto para el comercio como para el usuario

CREATE OR REPLACE FUNCTION notify_gift_card_generated()
RETURNS TRIGGER AS $$
DECLARE
    business_settings_id_val INTEGER;
BEGIN
    -- Obtener el business_settings_id de la gift card
    business_settings_id_val := NEW.business_settings_id;

    -- Crear notificación para el USUARIO (customer)
    INSERT INTO public.notifications (
        business_settings_id,
        customer_id,
        type,
        title,
        message,
        metadata,
        data,
        priority,
        is_read
    ) VALUES (
        business_settings_id_val,
        NEW.customer_id,
        'gift_card_generated',
        '¡Gift Card Generada!',
        'Has generado una nueva gift card por $' || NEW.value || ' puntos. Código: ' || NEW.code,
        jsonb_build_object(
            'gift_card_id', NEW.id,
            'code', NEW.code,
            'value', NEW.value,
            'points_used', NEW.points_used,
            'expires_at', NEW.expires_at
        ),
        jsonb_build_object(
            'action', 'view_gift_card',
            'gift_card_id', NEW.id
        ),
        'normal',
        false
    );

    -- Crear notificación para el COMERCIO (business)
    -- (Esta probablemente ya existe en tu sistema actual)
    INSERT INTO public.notifications (
        business_settings_id,
        customer_id,
        type,
        title,
        message,
        metadata,
        data,
        priority,
        is_read
    ) VALUES (
        business_settings_id_val,
        NULL, -- NULL para notificaciones del negocio
        'gift_card_generated',
        'Nueva Gift Card Generada',
        'Un cliente ha generado una gift card por $' || NEW.value,
        jsonb_build_object(
            'gift_card_id', NEW.id,
            'customer_id', NEW.customer_id,
            'value', NEW.value,
            'points_used', NEW.points_used
        ),
        jsonb_build_object(
            'action', 'view_customer',
            'customer_id', NEW.customer_id
        ),
        'normal',
        false
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger (si no existe)
DROP TRIGGER IF EXISTS trigger_gift_card_generated ON public.gift_cards;
CREATE TRIGGER trigger_gift_card_generated
    AFTER INSERT ON public.gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION notify_gift_card_generated();

-- ============================================================================
-- Trigger para cuando se REDIME una gift card
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_gift_card_redeemed()
RETURNS TRIGGER AS $$
DECLARE
    business_settings_id_val INTEGER;
BEGIN
    -- Solo ejecutar si el status cambió a 'redeemed'
    IF OLD.status <> 'redeemed' AND NEW.status = 'redeemed' THEN
        business_settings_id_val := NEW.business_settings_id;

        -- Crear notificación para el USUARIO (customer)
        INSERT INTO public.notifications (
            business_settings_id,
            customer_id,
            type,
            title,
            message,
            metadata,
            data,
            priority,
            is_read
        ) VALUES (
            business_settings_id_val,
            NEW.customer_id,
            'gift_card_redeemed',
            '¡Gift Card Redimida!',
            'Has redimido tu gift card de $' || NEW.value || '. Código: ' || NEW.code,
            jsonb_build_object(
                'gift_card_id', NEW.id,
                'code', NEW.code,
                'value', NEW.value,
                'redeemed_at', NEW.redeemed_at
            ),
            jsonb_build_object(
                'action', 'view_gift_card',
                'gift_card_id', NEW.id
            ),
            'normal',
            false
        );

        -- Crear notificación para el COMERCIO (business)
        INSERT INTO public.notifications (
            business_settings_id,
            customer_id,
            type,
            title,
            message,
            metadata,
            data,
            priority,
            is_read
        ) VALUES (
            business_settings_id_val,
            NULL,
            'gift_card_redeemed',
            'Gift Card Redimida',
            'Un cliente ha redimido una gift card por $' || NEW.value,
            jsonb_build_object(
                'gift_card_id', NEW.id,
                'customer_id', NEW.customer_id,
                'value', NEW.value,
                'redeemed_at', NEW.redeemed_at
            ),
            jsonb_build_object(
                'action', 'view_customer',
                'customer_id', NEW.customer_id
            ),
            'normal',
            false
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger (si no existe)
DROP TRIGGER IF EXISTS trigger_gift_card_redeemed ON public.gift_cards;
CREATE TRIGGER trigger_gift_card_redeemed
    AFTER UPDATE ON public.gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION notify_gift_card_redeemed();

-- ============================================================================
-- 3. VERIFICAR QUE LOS TRIGGERS ESTÉN ACTIVOS
-- ============================================================================

SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'gift_cards'
  AND trigger_name LIKE '%gift_card%';

-- ============================================================================
-- 4. CONSULTAS ÚTILES PARA TESTING
-- ============================================================================

-- Ver todas las notificaciones de un usuario específico
-- SELECT * FROM public.notifications
-- WHERE customer_id = 'UUID_DEL_USUARIO'
-- ORDER BY created_at DESC;

-- Ver notificaciones no leídas de un usuario
-- SELECT * FROM public.notifications
-- WHERE customer_id = 'UUID_DEL_USUARIO'
--   AND is_read = false
-- ORDER BY created_at DESC;

-- Contar notificaciones por tipo
-- SELECT type, COUNT(*) as total
-- FROM public.notifications
-- WHERE customer_id = 'UUID_DEL_USUARIO'
-- GROUP BY type
-- ORDER BY total DESC;

-- Ver últimas gift cards generadas con sus notificaciones
-- SELECT
--     gc.id as gift_card_id,
--     gc.code,
--     gc.value,
--     gc.customer_id,
--     gc.created_at as gift_card_created,
--     n.id as notification_id,
--     n.title,
--     n.is_read,
--     n.created_at as notification_created
-- FROM public.gift_cards gc
-- LEFT JOIN public.notifications n ON n.metadata->>'gift_card_id' = gc.id::text
-- WHERE gc.customer_id = 'UUID_DEL_USUARIO'
-- ORDER BY gc.created_at DESC
-- LIMIT 10;

-- ============================================================================
-- 5. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ============================================================================

-- Habilitar RLS en la tabla de notificaciones (si no está habilitado)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propias notificaciones
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    USING (
        customer_id = auth.uid()
    );

-- Política para que los usuarios puedan actualizar (marcar como leídas) sus propias notificaciones
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

-- Política para que los usuarios puedan eliminar sus propias notificaciones
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
    ON public.notifications
    FOR DELETE
    USING (customer_id = auth.uid());

-- Los comercios verán notificaciones donde customer_id IS NULL
-- (esto debe configurarse según tu lógica de autenticación de comercios)

-- ============================================================================
-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Ya existen estos índices (del schema que compartiste):
-- - idx_notifications_customer_id
-- - idx_notifications_business_settings
-- - idx_notifications_type
-- - idx_notifications_is_read
-- - idx_notifications_created_at
-- - idx_notifications_unread_by_business
-- - idx_notifications_customer_business

-- Verificar índices existentes:
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'notifications'
ORDER BY indexname;

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================

-- 1. Asegúrate de que la columna customer_id en la tabla gift_cards
--    hace referencia a la tabla correcta (probablemente auth.users o customers)

-- 2. Los triggers crearán 2 notificaciones por cada gift card:
--    - Una para el usuario (customer_id = id del usuario)
--    - Una para el comercio (customer_id = NULL)

-- 3. La app móvil filtrará automáticamente por customer_id del usuario autenticado
--    gracias a las políticas RLS

-- 4. Para testing, puedes insertar una gift card manualmente:
--    INSERT INTO public.gift_cards (
--        customer_id,
--        business_settings_id,
--        code,
--        value,
--        points_used,
--        status,
--        expires_at
--    ) VALUES (
--        'UUID_DEL_USUARIO',
--        1,
--        'TEST-' || floor(random() * 10000)::text,
--        100,
--        50,
--        'active',
--        NOW() + INTERVAL '30 days'
--    );
