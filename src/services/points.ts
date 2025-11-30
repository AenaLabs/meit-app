import { supabase } from './supabase';

// ==================== TIPOS ====================

export interface CustomerPoints {
    generalPoints: number;
    lifetimePoints: number;
}

export interface BusinessPoints {
    businessSettingsId: number;
    brandName: string;
    points: number;
    lifetimePoints: number;
}

export interface PointTransaction {
    id: string;
    businessId: number;
    businessName?: string;
    pointsAssigned: number;
    challengeId?: string | null;
    notes?: string | null;
    createdAt: string;
}

// ==================== FUNCIONES ====================

/**
 * Obtiene los puntos globales de un customer
 */
export async function getCustomerGlobalPoints(customerId: string): Promise<CustomerPoints> {
    const { data, error } = await supabase
        .from('customers')
        .select('total_points, lifetime_points')
        .eq('id', customerId)
        .single();

    if (error) throw error;

    return {
        generalPoints: data?.total_points || 0,
        lifetimePoints: data?.lifetime_points || 0,
    };
}

/**
 * Obtiene los puntos por cada negocio donde está registrado el customer
 */
export async function getCustomerPointsByBusiness(customerId: string): Promise<BusinessPoints[]> {
    const { data, error } = await supabase
        .from('customer_businesses')
        .select(`
            total_points,
            lifetime_points,
            business_settings_id,
            business_settings:business_settings_id (
                id,
                name
            )
        `)
        .eq('customer_id', customerId)
        .eq('is_active', true);

    if (error) throw error;

    return (data || []).map((cb: any) => ({
        businessSettingsId: cb.business_settings_id,
        brandName: cb.business_settings?.name || 'Sin nombre',
        points: cb.total_points || 0,
        lifetimePoints: cb.lifetime_points || 0,
    }));
}

/**
 * Obtiene el historial de transacciones de puntos de un customer
 */
export async function getPointsHistory(
    customerId: string,
    limit: number = 50
): Promise<PointTransaction[]> {
    const { data, error } = await supabase
        .from('points_audit')
        .select(`
            id,
            business_id,
            points_assigned,
            challenge_id,
            notes,
            created_at,
            businesses:business_id (
                id,
                business_settings_id,
                business_settings:business_settings_id (
                    name
                )
            )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    return (data || []).map((pa: any) => ({
        id: pa.id,
        businessId: pa.business_id,
        businessName: pa.businesses?.business_settings?.name || 'Desconocido',
        pointsAssigned: pa.points_assigned,
        challengeId: pa.challenge_id,
        notes: pa.notes,
        createdAt: pa.created_at,
    }));
}

/**
 * Obtiene el historial de transacciones filtrado por negocio
 */
export async function getPointsHistoryByBusiness(
    customerId: string,
    businessId: number,
    limit: number = 50
): Promise<PointTransaction[]> {
    const { data, error } = await supabase
        .from('points_audit')
        .select(`
            id,
            business_id,
            points_assigned,
            challenge_id,
            notes,
            created_at,
            businesses:business_id (
                id,
                business_settings_id,
                business_settings:business_settings_id (
                    name
                )
            )
        `)
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    return (data || []).map((pa: any) => ({
        id: pa.id,
        businessId: pa.business_id,
        businessName: pa.businesses?.business_settings?.name || 'Desconocido',
        pointsAssigned: pa.points_assigned,
        challengeId: pa.challenge_id,
        notes: pa.notes,
        createdAt: pa.created_at,
    }));
}
