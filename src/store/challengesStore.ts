import { create } from 'zustand';
import {
    getChallengesForCustomer,
    getChallengeById as getChallengeByIdService,
    type ChallengeWithBusiness,
} from '@/services/challenges';

// Mapeo de categorías a emojis para placeholder de logo
const categoryEmojis: Record<string, string> = {
    'Cafetería': '☕',
    'Gimnasio': '💪',
    'Restaurante': '🍽️',
    'Librería': '📚',
    'Tienda': '🛍️',
    'General': '🏪',
};

export interface Challenge {
    id: string;
    merchantId: string;          // business_settings_id como string
    merchantName: string;
    merchantLogo: string;
    title: string;
    description: string;
    reward: string;
    rewardPoints: number;
    currentProgress: number;     // Sin tracking de progreso, siempre 0
    targetProgress: number;
    progressUnit: string;
    expirationDate: string;
    status: 'active' | 'completed' | 'expired';
    challengeType: string;
    isRepeatable: boolean;
    imageUrl?: string;
}

interface ChallengesState {
    challenges: Challenge[];
    isLoading: boolean;
    error: string | null;
    loadChallenges: (customerId: string) => Promise<void>;
    refreshChallenges: (customerId: string) => Promise<void>;
    getChallengeById: (id: string) => Challenge | undefined;
    getChallengesByMerchant: (merchantId: string) => Challenge[];
    getActiveChallenges: () => Challenge[];
    getNearCompletionChallenges: (favoriteMerchantIds?: string[]) => Challenge[];
}

// Mapea el tipo de challenge a una unidad de progreso
function getChallengeUnit(challengeType: string): string {
    const typeToUnit: Record<string, string> = {
        'visits': 'visitas',
        'purchases': 'compras',
        'points': 'puntos',
        'amount': 'compras',
        'checkins': 'check-ins',
    };
    return typeToUnit[challengeType.toLowerCase()] || 'acciones';
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
    challenges: [],
    isLoading: false,
    error: null,

    loadChallenges: async (customerId: string) => {
        set({ isLoading: true, error: null });
        try {
            const challengesData = await getChallengesForCustomer(customerId);

            set({
                challenges: challengesData.map((ch: ChallengeWithBusiness) => {
                    const logo = categoryEmojis[ch.category] || categoryEmojis['General'];

                    // Determinar status basado en fechas
                    let status: 'active' | 'completed' | 'expired' = 'active';
                    if (ch.endDate && new Date(ch.endDate) < new Date()) {
                        status = 'expired';
                    }

                    return {
                        id: ch.id,
                        merchantId: ch.businessSettingsId.toString(),
                        merchantName: ch.brandName,
                        merchantLogo: logo,
                        title: ch.title,
                        description: ch.description,
                        reward: `${ch.rewardPoints} puntos`,
                        rewardPoints: ch.rewardPoints,
                        currentProgress: 0,  // Sin tracking de progreso individual
                        targetProgress: ch.targetValue,
                        progressUnit: getChallengeUnit(ch.challengeType),
                        expirationDate: ch.endDate || '',
                        status,
                        challengeType: ch.challengeType,
                        isRepeatable: ch.isRepeatable,
                    };
                }),
                isLoading: false,
            });
        } catch (error: any) {
            console.error('Error loading challenges:', error);
            set({ error: error.message || 'Error al cargar retos', isLoading: false });
        }
    },

    refreshChallenges: async (customerId: string) => {
        await get().loadChallenges(customerId);
    },

    getChallengeById: (id: string) => get().challenges.find((ch) => ch.id === id),

    getChallengesByMerchant: (merchantId: string) =>
        get().challenges.filter((ch) => ch.merchantId === merchantId),

    getActiveChallenges: () =>
        get().challenges.filter((ch) => ch.status === 'active'),

    // Sin progreso individual, esta función retornará vacío
    // Se mantiene por compatibilidad con la UI actual
    getNearCompletionChallenges: (favoriteMerchantIds?: string[]) => {
        // Como no hay tracking de progreso, retornamos los challenges activos
        // de los comercios favoritos
        let filtered = get().challenges.filter((ch) => ch.status === 'active');

        if (favoriteMerchantIds && favoriteMerchantIds.length > 0) {
            filtered = filtered.filter((ch) =>
                favoriteMerchantIds.includes(ch.merchantId)
            );
        }

        // Sin progreso, no podemos filtrar por "cerca de completar"
        // Retornamos los primeros 3 challenges activos
        return filtered.slice(0, 3);
    },
}));
