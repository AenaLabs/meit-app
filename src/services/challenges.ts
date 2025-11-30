import { supabase } from './supabase';

// ==================== TIPOS ====================

export interface ChallengeFromDB {
    id: string;
    name: string;
    description?: string | null;
    points: number;
    challenge_type: string;
    target_value?: number | null;
    is_repeatable: boolean;
    max_completions_per_day?: number | null;
    max_completions_total?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    is_active: boolean;
    business_id: number;
    created_at: string;
    updated_at: string;
}

export interface ChallengeWithBusiness {
    id: string;
    businessSettingsId: number;
    brandName: string;
    category: string;
    title: string;
    description: string;
    rewardPoints: number;
    challengeType: string;
    targetValue: number;
    isRepeatable: boolean;
    maxCompletionsPerDay?: number | null;
    maxCompletionsTotal?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    isActive: boolean;
}

// ==================== FUNCIONES ====================

/**
 * Obtiene los challenges de los negocios donde está registrado el customer
 */
export async function getChallengesForCustomer(customerId: string): Promise<ChallengeWithBusiness[]> {
    // Primero obtenemos los business_settings_id donde está registrado el customer
    const { data: customerBusinesses, error: cbError } = await supabase
        .from('customer_businesses')
        .select('business_settings_id')
        .eq('customer_id', customerId)
        .eq('is_active', true);

    if (cbError) throw cbError;

    if (!customerBusinesses || customerBusinesses.length === 0) {
        return [];
    }

    const businessSettingsIds = customerBusinesses.map(cb => cb.business_settings_id);

    // Luego obtenemos los challenges haciendo JOIN con businesses y business_settings
    const { data, error } = await supabase
        .from('challenges')
        .select(`
            *,
            businesses:business_id (
                id,
                business_settings_id,
                business_settings:business_settings_id (
                    id,
                    name,
                    type,
                    business_type:type (
                        id,
                        name
                    )
                )
            )
        `)
        .eq('is_active', true)
        .in('businesses.business_settings_id', businessSettingsIds);

    if (error) throw error;

    // Filtramos los que tienen business_settings válido
    const validChallenges = (data || []).filter(
        (ch: any) => ch.businesses?.business_settings_id &&
                     businessSettingsIds.includes(ch.businesses.business_settings_id)
    );

    return validChallenges.map((ch: any) => ({
        id: ch.id,
        businessSettingsId: ch.businesses?.business_settings_id,
        brandName: ch.businesses?.business_settings?.name || 'Sin nombre',
        category: ch.businesses?.business_settings?.business_type?.name || 'General',
        title: ch.name,
        description: ch.description || '',
        rewardPoints: ch.points,
        challengeType: ch.challenge_type,
        targetValue: ch.target_value || 0,
        isRepeatable: ch.is_repeatable,
        maxCompletionsPerDay: ch.max_completions_per_day,
        maxCompletionsTotal: ch.max_completions_total,
        startDate: ch.start_date,
        endDate: ch.end_date,
        isActive: ch.is_active,
    }));
}

/**
 * Obtiene un challenge específico por ID
 */
export async function getChallengeById(challengeId: string): Promise<ChallengeWithBusiness | null> {
    const { data, error } = await supabase
        .from('challenges')
        .select(`
            *,
            businesses:business_id (
                id,
                business_settings_id,
                business_settings:business_settings_id (
                    id,
                    name,
                    type,
                    business_type:type (
                        id,
                        name
                    )
                )
            )
        `)
        .eq('id', challengeId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return {
        id: data.id,
        businessSettingsId: data.businesses?.business_settings_id,
        brandName: data.businesses?.business_settings?.name || 'Sin nombre',
        category: data.businesses?.business_settings?.business_type?.name || 'General',
        title: data.name,
        description: data.description || '',
        rewardPoints: data.points,
        challengeType: data.challenge_type,
        targetValue: data.target_value || 0,
        isRepeatable: data.is_repeatable,
        maxCompletionsPerDay: data.max_completions_per_day,
        maxCompletionsTotal: data.max_completions_total,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
    };
}

/**
 * Obtiene los challenges de un negocio específico (por business_settings_id)
 */
export async function getChallengesByBusinessSettings(
    businessSettingsId: number
): Promise<ChallengeWithBusiness[]> {
    const { data, error } = await supabase
        .from('challenges')
        .select(`
            *,
            businesses:business_id (
                id,
                business_settings_id,
                business_settings:business_settings_id (
                    id,
                    name,
                    type,
                    business_type:type (
                        id,
                        name
                    )
                )
            )
        `)
        .eq('is_active', true)
        .eq('businesses.business_settings_id', businessSettingsId);

    if (error) throw error;

    // Filtramos los que tienen el business_settings_id correcto
    const validChallenges = (data || []).filter(
        (ch: any) => ch.businesses?.business_settings_id === businessSettingsId
    );

    return validChallenges.map((ch: any) => ({
        id: ch.id,
        businessSettingsId: ch.businesses?.business_settings_id,
        brandName: ch.businesses?.business_settings?.name || 'Sin nombre',
        category: ch.businesses?.business_settings?.business_type?.name || 'General',
        title: ch.name,
        description: ch.description || '',
        rewardPoints: ch.points,
        challengeType: ch.challenge_type,
        targetValue: ch.target_value || 0,
        isRepeatable: ch.is_repeatable,
        maxCompletionsPerDay: ch.max_completions_per_day,
        maxCompletionsTotal: ch.max_completions_total,
        startDate: ch.start_date,
        endDate: ch.end_date,
        isActive: ch.is_active,
    }));
}
