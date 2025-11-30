import { supabase } from './supabase';

// ==================== TIPOS ====================

export type GiftCardStatus = 'active' | 'redeemed' | 'expired' | 'cancelled';

export interface GiftCardFromDB {
    id: string;
    customer_id: string;
    business_settings_id: number;
    code: string;
    value: number;
    points_used: number;
    status: GiftCardStatus;
    expires_at: string;
    redeemed_at?: string | null;
    notification_sent: boolean;
    created_at: string;
    updated_at: string;
    business_settings?: {
        id: number;
        name: string;
    };
}

export interface GiftCardWithBusiness {
    id: string;
    code: string;
    value: number;
    currentValue: number;  // Mismo que value (no hay tracking de uso parcial)
    pointsUsed: number;
    status: GiftCardStatus;
    expiresAt: string;
    redeemedAt?: string | null;
    createdAt: string;
    businessSettingsId: number;
    brandName: string;
}

// ==================== FUNCIONES ====================

/**
 * Obtiene todas las gift cards de un customer
 */
export async function getCustomerGiftCards(customerId: string): Promise<GiftCardWithBusiness[]> {
    const { data, error } = await supabase
        .from('gift_cards')
        .select(`
            *,
            business_settings (
                id,
                name
            )
        `)
        .eq('customer_id', customerId)
        .order('status', { ascending: true })
        .order('expires_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((gc: any) => ({
        id: gc.id,
        code: gc.code,
        value: gc.value,
        currentValue: gc.value,  // No hay tracking de uso parcial
        pointsUsed: gc.points_used,
        status: gc.status as GiftCardStatus,
        expiresAt: gc.expires_at,
        redeemedAt: gc.redeemed_at,
        createdAt: gc.created_at,
        businessSettingsId: gc.business_settings_id,
        brandName: gc.business_settings?.name || 'Sin nombre',
    }));
}

/**
 * Obtiene una gift card específica por ID
 */
export async function getGiftCardById(giftCardId: string): Promise<GiftCardWithBusiness | null> {
    const { data, error } = await supabase
        .from('gift_cards')
        .select(`
            *,
            business_settings (
                id,
                name
            )
        `)
        .eq('id', giftCardId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    return {
        id: data.id,
        code: data.code,
        value: data.value,
        currentValue: data.value,
        pointsUsed: data.points_used,
        status: data.status as GiftCardStatus,
        expiresAt: data.expires_at,
        redeemedAt: data.redeemed_at,
        createdAt: data.created_at,
        businessSettingsId: data.business_settings_id,
        brandName: data.business_settings?.name || 'Sin nombre',
    };
}

/**
 * Obtiene las gift cards de un customer filtradas por negocio
 */
export async function getGiftCardsByBusiness(
    customerId: string,
    businessSettingsId: number
): Promise<GiftCardWithBusiness[]> {
    const { data, error } = await supabase
        .from('gift_cards')
        .select(`
            *,
            business_settings (
                id,
                name
            )
        `)
        .eq('customer_id', customerId)
        .eq('business_settings_id', businessSettingsId)
        .order('status', { ascending: true })
        .order('expires_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((gc: any) => ({
        id: gc.id,
        code: gc.code,
        value: gc.value,
        currentValue: gc.value,
        pointsUsed: gc.points_used,
        status: gc.status as GiftCardStatus,
        expiresAt: gc.expires_at,
        redeemedAt: gc.redeemed_at,
        createdAt: gc.created_at,
        businessSettingsId: gc.business_settings_id,
        brandName: gc.business_settings?.name || 'Sin nombre',
    }));
}

/**
 * Obtiene las gift cards que expiran pronto
 */
export async function getExpiringSoonGiftCards(
    customerId: string,
    daysThreshold: number = 7
): Promise<GiftCardWithBusiness[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysThreshold);

    const { data, error } = await supabase
        .from('gift_cards')
        .select(`
            *,
            business_settings (
                id,
                name
            )
        `)
        .eq('customer_id', customerId)
        .eq('status', 'active')
        .lte('expires_at', targetDate.toISOString())
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((gc: any) => ({
        id: gc.id,
        code: gc.code,
        value: gc.value,
        currentValue: gc.value,
        pointsUsed: gc.points_used,
        status: gc.status as GiftCardStatus,
        expiresAt: gc.expires_at,
        redeemedAt: gc.redeemed_at,
        createdAt: gc.created_at,
        businessSettingsId: gc.business_settings_id,
        brandName: gc.business_settings?.name || 'Sin nombre',
    }));
}
