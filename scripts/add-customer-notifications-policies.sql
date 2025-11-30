-- ============================================================================
-- AGREGAR POLÍTICAS RLS PARA CUSTOMERS EN NOTIFICACIONES
-- Este script SOLO agrega políticas nuevas, NO modifica las existentes
-- ============================================================================

-- IMPORTANTE: Las políticas existentes para business owners NO se tocan
-- Solo agregamos políticas paralelas para que los customers puedan ver
-- sus notificaciones en la app móvil

-- ============================================================================
-- 1. POLÍTICA PARA QUE CUSTOMERS VEAN SUS NOTIFICACIONES
-- ============================================================================

-- Esta política permite que un customer autenticado vea solo las notificaciones
-- donde customer_id = su propio auth.uid()

CREATE POLICY "Customers can view their own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

-- ============================================================================
-- 2. POLÍTICA PARA QUE CUSTOMERS ACTUALICEN SUS NOTIFICACIONES
-- ============================================================================

-- Permite que un customer marque como leídas sus propias notificaciones

CREATE POLICY "Customers can update their own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

-- ============================================================================
-- 3. POLÍTICA PARA QUE CUSTOMERS ELIMINEN SUS NOTIFICACIONES
-- ============================================================================

-- Permite que un customer elimine sus propias notificaciones

CREATE POLICY "Customers can delete their own notifications"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (customer_id = auth.uid());

-- ============================================================================
-- VERIFICACIÓN: Ver todas las políticas después de la creación
-- ============================================================================

SELECT
    policyname,
    cmd AS operation,
    CASE
        WHEN policyname LIKE '%Customers%' THEN 'NUEVA - Para app móvil'
        WHEN policyname LIKE '%Users%' THEN 'EXISTENTE - Para web app'
        ELSE 'OTRA'
    END AS target,
    qual AS condition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notifications'
ORDER BY target, policyname;

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================

-- 1. Las políticas existentes para business owners (web app) NO se modifican
--    - "Users can view their own notifications" sigue funcionando
--    - "Users can update their own notifications" sigue funcionando
--    - "Users can delete their own notifications" sigue funcionando

-- 2. Las nuevas políticas para customers (app móvil) se agregan en paralelo
--    - "Customers can view their own notifications" - nueva
--    - "Customers can update their own notifications" - nueva
--    - "Customers can delete their own notifications" - nueva

-- 3. PostgreSQL RLS usa lógica OR entre políticas del mismo tipo (SELECT, UPDATE, DELETE)
--    Entonces:
--    - Un business owner puede ver notificaciones donde es dueño del negocio
--    - Un customer puede ver notificaciones donde customer_id = su id
--    - Ambos funcionan independientemente SIN conflicto

-- 4. ¿Por qué funciona sin conflicto?
--    - Business owners: customer_id = NULL en sus notificaciones
--    - Customers: customer_id = su UUID en sus notificaciones
--    - Son conjuntos de datos completamente separados

-- 5. La autenticación en Supabase:
--    - auth.uid() retorna el UUID del usuario autenticado
--    - En la web app: auth.uid() = business_settings.owner
--    - En la app móvil: auth.uid() = customers.id
--    - Supabase los maneja automáticamente según el contexto

-- ============================================================================
-- TESTING:
-- ============================================================================

-- Para probar que las políticas funcionan correctamente:

-- 1. Autentícate como un customer en la app móvil
-- 2. Ejecuta esta query (Supabase JS lo hará automáticamente):
--    SELECT * FROM notifications WHERE customer_id = auth.uid();
-- 3. Deberías ver solo TUS notificaciones

-- 4. Para verificar manualmente (como admin):
--    SELECT * FROM notifications WHERE customer_id = 'UUID_DEL_CUSTOMER';
