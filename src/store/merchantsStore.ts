import { create } from 'zustand';
import {
    getCustomerBusinesses,
    toggleFavoriteBusiness,
    countActiveChallenges,
    countActiveGiftCards,
    type BusinessWithDetails
} from '@/services/businesses';

// Mapeo de categorías a emojis para placeholder de logo
const categoryEmojis: Record<string, string> = {
    'Cafetería': '☕',
    'Gimnasio': '💪',
    'Restaurante': '🍽️',
    'Librería': '📚',
    'Tienda': '🛍️',
    'Salud': '💊',
    'Belleza': '💅',
    'Tecnología': '💻',
    'General': '🏪',
};

export interface Merchant {
    id: string;                    // customer_business.id
    businessSettingsId: number;    // business_settings.id
    name: string;
    logo: string;
    description: string;
    category: string;
    isFavorite: boolean;
    activeRewards: number;
    activeChallenges: number;
    location?: string;
    phone?: string;
    hours?: string;
    points: number;
    visitsCount: number;
}

interface MerchantsState {
    merchants: Merchant[];
    isLoading: boolean;
    error: string | null;
    loadMerchants: (customerId: string) => Promise<void>;
    refreshMerchants: (customerId: string) => Promise<void>;
    toggleFavorite: (customerId: string, merchantId: string) => Promise<void>;
    getMerchantById: (id: string) => Merchant | undefined;
    getMerchantByBusinessSettingsId: (businessSettingsId: number) => Merchant | undefined;
    getFavoriteMerchants: () => Merchant[];
}

export const useMerchantsStore = create<MerchantsState>((set, get) => ({
    merchants: [],
    isLoading: false,
    error: null,

    loadMerchants: async (customerId: string) => {
        set({ isLoading: true, error: null });
        try {
            const businesses = await getCustomerBusinesses(customerId);

            // Cargar contadores de challenges y gift cards para cada negocio
            const merchantsWithCounts = await Promise.all(
                businesses.map(async (business: BusinessWithDetails) => {
                    const [challengesCount, giftCardsCount] = await Promise.all([
                        countActiveChallenges(business.businessSettingsId).catch(() => 0),
                        countActiveGiftCards(customerId, business.businessSettingsId).catch(() => 0),
                    ]);

                    const emoji = categoryEmojis[business.category] || categoryEmojis['General'];

                    return {
                        id: business.id,
                        businessSettingsId: business.businessSettingsId,
                        name: business.name,
                        logo: emoji,
                        description: '', // No hay campo en BD
                        category: business.category,
                        isFavorite: business.isFavorite,
                        activeRewards: giftCardsCount,
                        activeChallenges: challengesCount,
                        location: business.address || undefined,
                        phone: business.phone || undefined,
                        hours: undefined, // No hay campo en BD
                        points: business.points,
                        visitsCount: business.visitsCount,
                    };
                })
            );

            set({ merchants: merchantsWithCounts, isLoading: false });
        } catch (error: any) {
            console.error('Error loading merchants:', error);
            set({ error: error.message || 'Error al cargar comercios', isLoading: false });
        }
    },

    refreshMerchants: async (customerId: string) => {
        await get().loadMerchants(customerId);
    },

    toggleFavorite: async (customerId: string, merchantId: string) => {
        const merchant = get().merchants.find(m => m.id === merchantId);
        if (!merchant) return;

        const newFavoriteValue = !merchant.isFavorite;

        // Optimistic update
        set((state) => ({
            merchants: state.merchants.map((m) =>
                m.id === merchantId ? { ...m, isFavorite: newFavoriteValue } : m
            ),
        }));

        try {
            await toggleFavoriteBusiness(merchantId, newFavoriteValue);
        } catch (error: any) {
            console.error('Error toggling favorite:', error);
            // Revertir en caso de error
            set((state) => ({
                merchants: state.merchants.map((m) =>
                    m.id === merchantId ? { ...m, isFavorite: !newFavoriteValue } : m
                ),
                error: error.message || 'Error al actualizar favorito',
            }));
        }
    },

    getMerchantById: (id: string) => get().merchants.find((m) => m.id === id),

    getMerchantByBusinessSettingsId: (businessSettingsId: number) =>
        get().merchants.find((m) => m.businessSettingsId === businessSettingsId),

    getFavoriteMerchants: () => get().merchants.filter((m) => m.isFavorite),
}));
