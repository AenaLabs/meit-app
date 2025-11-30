import { supabase } from './supabase';

// ==================== TIPOS ====================

export interface RegisterData {
    email: string;
    password: string;
}

export interface ProfileData {
    name: string;
    birth_date?: string | null;
    gender?: 'M' | 'F' | 'O' | null;
    opt_in_marketing?: boolean;
}

export interface CustomerProfile {
    id: string;
    auth_id: string;
    email: string;
    name: string;
    phone?: string | null;
    birth_date?: string | null;
    gender?: string | null;
    total_points: number;
    lifetime_points: number;
    visits_count: number;
    first_visit_at?: string | null;
    last_visit_at?: string | null;
    engagement_score: number;
    opt_in_marketing: boolean;
    is_active: boolean;
    blocked_reason?: string | null;
    created_at: string;
    updated_at: string;
}

// ==================== FUNCIONES ====================

/**
 * Registrar usuario con email y contraseña
 * Requiere verificación por OTP antes de poder iniciar sesión
 */
export async function signUpWithEmail(data: RegisterData) {
    const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
    });

    if (error) throw error;
    return authData;
}

/**
 * Verificar código OTP de registro
 */
export async function verifySignUpOTP(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
    });

    if (error) throw error;
    return data;
}

/**
 * Iniciar sesión con email y contraseña
 */
export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * Crear perfil de customer y actualizar display_name en auth
 */
export async function createCustomerProfile(
    authUserId: string,
    email: string,
    profileData: ProfileData
): Promise<CustomerProfile> {
    // 1. Actualizar display_name en auth.users
    const { error: updateError } = await supabase.auth.updateUser({
        data: {
            display_name: profileData.name,
        },
    });

    if (updateError) {
        console.error('Error updating display_name:', updateError);
        // No lanzamos error, continuamos con la creación del customer
    }

    // 2. Crear registro en tabla customers
    const { data, error } = await supabase
        .from('customers')
        .insert({
            auth_id: authUserId,
            email: email,
            name: profileData.name,
            birth_date: profileData.birth_date || null,
            gender: profileData.gender || null,
            phone: null,
            total_points: 0,
            lifetime_points: 0,
            visits_count: 0,
            engagement_score: 0,
            opt_in_marketing: profileData.opt_in_marketing || false,
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        // Si ya existe (código 23505 = unique violation), obtener el existente
        if (error.code === '23505') {
            const existing = await getCustomerByAuthId(authUserId);
            if (existing) return existing;
        }
        throw error;
    }

    return data as CustomerProfile;
}

/**
 * Obtener customer por auth_id
 */
export async function getCustomerByAuthId(authUserId: string): Promise<CustomerProfile | null> {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('auth_id', authUserId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No encontrado
        throw error;
    }
    return data as CustomerProfile;
}

/**
 * Obtener customer por email
 */
export async function getCustomerByEmail(email: string): Promise<CustomerProfile | null> {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No encontrado
        throw error;
    }
    return data as CustomerProfile;
}

/**
 * Reenviar OTP de registro
 */
export async function resendSignUpOTP(email: string) {
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
    });

    if (error) throw error;
}

/**
 * Actualizar perfil de customer
 */
export async function updateCustomerProfile(
    customerId: string,
    updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'birth_date' | 'gender' | 'opt_in_marketing'>>
): Promise<CustomerProfile> {
    const { data, error } = await supabase
        .from('customers')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', customerId)
        .select()
        .single();

    if (error) throw error;
    return data as CustomerProfile;
}
