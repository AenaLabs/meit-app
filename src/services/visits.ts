import { supabase } from './supabase';

// ==================== TIPOS ====================

export interface CustomerVisit {
    businessSettingsId: number;
    brandName: string;
    visitsCount: number;
    firstVisitAt: string | null;
    lastVisitAt: string | null;
}

export interface VisitStats {
    totalVisits: number;
    firstVisitAt: string | null;
    lastVisitAt: string | null;
    businessVisits: CustomerVisit[];
}

// ==================== FUNCIONES ====================

/**
 * Obtiene las estadísticas de visitas de un customer
 */
export async function getCustomerVisitStats(customerId: string): Promise<VisitStats> {
    const { data, error } = await supabase
        .from('customers')
        .select('visits_count, first_visit_at, last_visit_at')
        .eq('id', customerId)
        .single();

    if (error) throw error;

    // Obtener visitas por negocio
    const businessVisits = await getCustomerVisitsByBusiness(customerId);

    return {
        totalVisits: data?.visits_count || 0,
        firstVisitAt: data?.first_visit_at || null,
        lastVisitAt: data?.last_visit_at || null,
        businessVisits,
    };
}

/**
 * Obtiene las visitas por cada negocio donde está registrado el customer
 */
export async function getCustomerVisitsByBusiness(customerId: string): Promise<CustomerVisit[]> {
    const { data, error } = await supabase
        .from('customer_businesses')
        .select(`
            visits_count,
            first_visit_at,
            last_visit_at,
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
        visitsCount: cb.visits_count || 0,
        firstVisitAt: cb.first_visit_at,
        lastVisitAt: cb.last_visit_at,
    }));
}
