import { supabase } from './supabase';

// ==================== TIPOS ====================

export interface BusinessType {
    id: number;
    name: string;
}

export interface BusinessSettings {
    id: number;
    name: string;
    phone_number?: string | null;
    phone_code?: string | null;
    address?: string | null;
    type?: number | null;
    business_type?: BusinessType | null;
}

export interface CustomerBusiness {
    id: string;
    customer_id: string;
    business_id: number;
    business_settings_id: number;
    total_points: number;
    lifetime_points: number;
    visits_count: number;
    first_visit_at?: string | null;
    last_visit_at?: string | null;
    is_active: boolean;
    is_favorite: boolean;
    notes?: string | null;
    tags?: string[] | null;
    created_at: string;
    updated_at: string;
    business_settings?: BusinessSettings;
}

export interface BusinessWithDetails {
    id: string;                      // customer_business.id
    businessSettingsId: number;      // business_settings.id
    name: string;
    category: string;
    address?: string | null;
    phone?: string | null;
    points: number;
    lifetimePoints: number;
    visitsCount: number;
    isFavorite: boolean;
    isActive: boolean;
    firstVisitAt?: string | null;
    lastVisitAt?: string | null;
}

// ==================== FUNCIONES ====================

/**
 * Obtiene todos los negocios donde está registrado un customer
 */
export async function getCustomerBusinesses(customerId: string): Promise<BusinessWithDetails[]> {
    const { data, error } = await supabase
        .from('customer_businesses')
        .select(`
            *,
            business_settings:business_settings_id (
                id,
                name,
                phone_number,
                phone_code,
                address,
                type,
                business_type:type (
                    id,
                    name
                )
            )
        `)
        .eq('customer_id', customerId)
        .eq('is_active', true);

    if (error) throw error;

    return (data || []).map((cb: CustomerBusiness) => ({
        id: cb.id,
        businessSettingsId: cb.business_settings_id,
        name: cb.business_settings?.name || 'Sin nombre',
        category: cb.business_settings?.business_type?.name || 'General',
        address: cb.business_settings?.address,
        phone: cb.business_settings?.phone_number
            ? `${cb.business_settings.phone_code || ''}${cb.business_settings.phone_number}`
            : null,
        points: cb.total_points,
        lifetimePoints: cb.lifetime_points,
        visitsCount: cb.visits_count,
        isFavorite: cb.is_favorite || false,
        isActive: cb.is_active,
        firstVisitAt: cb.first_visit_at,
        lastVisitAt: cb.last_visit_at,
    }));
}

/**
 * Obtiene un business_settings por ID
 */
export async function getBusinessSettingsById(businessSettingsId: number): Promise<BusinessSettings | null> {
    const { data, error } = await supabase
        .from('business_settings')
        .select(`
            *,
            business_type:type (
                id,
                name
            )
        `)
        .eq('id', businessSettingsId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return data as BusinessSettings;
}

/**
 * Marca o desmarca un negocio como favorito
 */
export async function toggleFavoriteBusiness(
    customerBusinessId: string,
    isFavorite: boolean
): Promise<void> {
    const { error } = await supabase
        .from('customer_businesses')
        .update({
            is_favorite: isFavorite,
            updated_at: new Date().toISOString()
        })
        .eq('id', customerBusinessId);

    if (error) throw error;
}

/**
 * Obtiene el customer_business por customer_id y business_settings_id
 */
export async function getCustomerBusinessBySettings(
    customerId: string,
    businessSettingsId: number
): Promise<CustomerBusiness | null> {
    const { data, error } = await supabase
        .from('customer_businesses')
        .select('*')
        .eq('customer_id', customerId)
        .eq('business_settings_id', businessSettingsId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return data as CustomerBusiness;
}

/**
 * Cuenta los challenges activos para un business_settings
 * Hace JOIN: challenges -> businesses -> business_settings
 */
export async function countActiveChallenges(businessSettingsId: number): Promise<number> {
    const { count, error } = await supabase
        .from('challenges')
        .select('id, businesses!inner(business_settings_id)', { count: 'exact', head: true })
        .eq('businesses.business_settings_id', businessSettingsId)
        .eq('is_active', true);

    if (error) {
        console.error('Error counting challenges:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Cuenta las gift cards activas de un customer en un business_settings
 */
export async function countActiveGiftCards(
    customerId: string,
    businessSettingsId: number
): Promise<number> {
    const { count, error } = await supabase
        .from('gift_cards')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .eq('business_settings_id', businessSettingsId)
        .eq('status', 'active');

    if (error) {
        console.error('Error counting gift cards:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Obtiene el primer business_id asociado a un business_settings_id
 */
async function getBusinessIdBySettings(businessSettingsId: number): Promise<number | null> {
    const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('business_settings_id', businessSettingsId)
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return data?.id || null;
}

/**
 * Registra un customer en un business (crea la relación customer_business)
 * Si ya existe, retorna la relación existente con isNew = false
 * Si no existe, crea una nueva con 10 puntos de bienvenida
 */
export async function registerCustomerAtBusiness(
    customerId: string,
    businessSettingsId: number
): Promise<{ customerBusiness: CustomerBusiness; isNew: boolean }> {
    // Verificar si ya existe la relación
    const existing = await getCustomerBusinessBySettings(customerId, businessSettingsId);

    if (existing) {
        return { customerBusiness: existing, isNew: false };
    }

    // Obtener el business_id asociado al business_settings_id
    const businessId = await getBusinessIdBySettings(businessSettingsId);
    if (!businessId) {
        throw new Error('No se encontró una sucursal asociada a este comercio');
    }

    // Verificar sesión de Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('DEBUG - Supabase session:', sessionData?.session?.user?.id);

    // Crear nueva relación con puntos de bienvenida
    const now = new Date().toISOString();
    console.log('DEBUG - Inserting with businessId:', businessId);

    const { data, error } = await supabase
        .from('customer_businesses')
        .insert({
            customer_id: customerId,
            business_id: businessId,
            business_settings_id: businessSettingsId,
            total_points: 10,
            lifetime_points: 10,
            visits_count: 1,
            first_visit_at: now,
            last_visit_at: now,
            is_active: true,
            is_favorite: false,
        })
        .select()
        .single();

    if (error) throw error;

    return { customerBusiness: data as CustomerBusiness, isNew: true };
}
