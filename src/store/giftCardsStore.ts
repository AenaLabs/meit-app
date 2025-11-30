import { create } from 'zustand';
import {
    getCustomerGiftCards,
    getGiftCardById as getGiftCardByIdService,
    type GiftCardWithBusiness,
    type GiftCardStatus,
} from '@/services/giftCards';

// Mapeo de categorías a emojis para placeholder de logo
const categoryEmojis: Record<string, string> = {
    'Cafetería': '☕',
    'Gimnasio': '💪',
    'Restaurante': '🍽️',
    'Librería': '📚',
    'Tienda': '🛍️',
    'General': '🏪',
};

export interface GiftCard {
    id: string;
    merchantId: string;          // business_settings_id como string
    merchantName: string;
    merchantLogo: string;
    code: string;
    value: number;
    currentValue: number;
    status: 'active' | 'used' | 'expired';
    expirationDate: string;
    issuedDate: string;
    terms?: string;
}

interface GiftCardsState {
    giftCards: GiftCard[];
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    loadGiftCards: (customerId: string) => Promise<void>;
    refreshGiftCards: (customerId: string) => Promise<void>;
    getGiftCardById: (id: string) => GiftCard | undefined;
    getGiftCardsByMerchant: (merchantId: string) => GiftCard[];
    getActiveGiftCards: () => GiftCard[];
    getExpiringSoon: () => GiftCard[];
    reset: () => void;
}

// Mapea el status de la BD al status de la UI
function mapStatus(status: GiftCardStatus): 'active' | 'used' | 'expired' {
    if (status === 'redeemed' || status === 'cancelled') return 'used';
    return status as 'active' | 'expired';
}

export const useGiftCardsStore = create<GiftCardsState>((set, get) => ({
    giftCards: [],
    isLoading: false,
    error: null,
    isInitialized: false,

    loadGiftCards: async (customerId: string) => {
        console.log('🎁 GiftCardsStore: loadGiftCards called for customer:', customerId);
        set({ isLoading: true, error: null });
        try {
            const cards = await getCustomerGiftCards(customerId);

            console.log('🎁 GiftCardsStore: Data received:', {
                totalCards: cards.length,
                cards: cards.map(c => ({ id: c.id, status: c.status, value: c.value }))
            });

            set({
                giftCards: cards.map((gc: GiftCardWithBusiness) => ({
                    id: gc.id,
                    merchantId: gc.businessSettingsId.toString(),
                    merchantName: gc.brandName,
                    merchantLogo: categoryEmojis['General'], // Se actualiza cuando se carga el merchant
                    code: gc.code,
                    value: gc.value,
                    currentValue: gc.currentValue,
                    status: mapStatus(gc.status),
                    expirationDate: gc.expiresAt,
                    issuedDate: gc.createdAt,
                    terms: undefined, // No está en gift_cards, estaría en gift_card_settings
                })),
                isLoading: false,
                isInitialized: true,
            });
        } catch (error: any) {
            console.error('❌ GiftCardsStore: Error loading gift cards:', error);
            set({ error: error.message || 'Error al cargar gift cards', isLoading: false });
        }
    },

    refreshGiftCards: async (customerId: string) => {
        await get().loadGiftCards(customerId);
    },

    getGiftCardById: (id: string) => get().giftCards.find((card) => card.id === id),

    getGiftCardsByMerchant: (merchantId: string) =>
        get().giftCards.filter((card) => card.merchantId === merchantId),

    getActiveGiftCards: () =>
        get().giftCards.filter((card) => card.status === 'active'),

    getExpiringSoon: () => {
        const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        return get().giftCards.filter(
            (card) =>
                card.status === 'active' &&
                new Date(card.expirationDate).getTime() <= sevenDaysFromNow &&
                new Date(card.expirationDate).getTime() >= now
        );
    },

    reset: () => set({
        giftCards: [],
        isLoading: false,
        error: null,
        isInitialized: false,
    }),
}));
