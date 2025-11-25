import { create } from 'zustand';

export interface GiftCard {
    id: string;
    merchantId: string;
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
    setGiftCards: (cards: GiftCard[]) => void;
    getGiftCardById: (id: string) => GiftCard | undefined;
    getGiftCardsByMerchant: (merchantId: string) => GiftCard[];
    getActiveGiftCards: () => GiftCard[];
    getExpiringSoon: () => GiftCard[];
    useGiftCard: (id: string, amount: number) => void;
}

export const useGiftCardsStore = create<GiftCardsState>((set, get) => ({
    giftCards: [
        {
            id: 'gc1',
            merchantId: '1',
            merchantName: 'Café Central',
            merchantLogo: '☕',
            code: 'CAFE-2024-001',
            value: 500,
            currentValue: 500,
            status: 'active',
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
            issuedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            terms: 'Válido para cualquier producto. No acumulable con otras promociones.',
        },
        {
            id: 'gc2',
            merchantId: '3',
            merchantName: 'Restaurante Bella Vista',
            merchantLogo: '🍽️',
            code: 'REST-2024-042',
            value: 1000,
            currentValue: 600,
            status: 'active',
            expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días (expira pronto)
            issuedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            terms: 'Válido de lunes a jueves. No incluye bebidas alcohólicas.',
        },
        {
            id: 'gc3',
            merchantId: '2',
            merchantName: 'Gym Fitness',
            merchantLogo: '💪',
            code: 'GYM-2024-099',
            value: 300,
            currentValue: 0,
            status: 'used',
            expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            issuedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            terms: 'Canjeable por clases grupales o uso de instalaciones.',
        },
        {
            id: 'gc4',
            merchantId: '4',
            merchantName: 'Librería El Saber',
            merchantLogo: '📚',
            code: 'LIBRO-2024-150',
            value: 250,
            currentValue: 250,
            status: 'active',
            expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días (expira pronto)
            issuedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            terms: 'Válido para libros, revistas y papelería.',
        },
        {
            id: 'gc5',
            merchantId: '1',
            merchantName: 'Café Central',
            merchantLogo: '☕',
            code: 'CAFE-2023-999',
            value: 200,
            currentValue: 200,
            status: 'expired',
            expirationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Expirada
            issuedDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
            terms: 'Válido para cualquier producto.',
        },
        {
            id: 'gc6',
            merchantId: '1',
            merchantName: 'Café Central',
            merchantLogo: '☕',
            code: 'CAFE-2024-155',
            value: 350,
            currentValue: 150,
            status: 'active',
            expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            issuedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            terms: 'Válido para desayunos y bebidas calientes.',
        },
    ],
    isLoading: false,
    setGiftCards: (cards) => set({ giftCards: cards }),
    getGiftCardById: (id) => get().giftCards.find((card) => card.id === id),
    getGiftCardsByMerchant: (merchantId) =>
        get().giftCards.filter((card) => card.merchantId === merchantId),
    getActiveGiftCards: () =>
        get().giftCards.filter((card) => card.status === 'active'),
    getExpiringSoon: () => {
        const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
        return get().giftCards.filter(
            (card) =>
                card.status === 'active' &&
                new Date(card.expirationDate).getTime() <= sevenDaysFromNow
        );
    },
    useGiftCard: (id, amount) =>
        set((state) => ({
            giftCards: state.giftCards.map((card) => {
                if (card.id === id) {
                    const newValue = card.currentValue - amount;
                    return {
                        ...card,
                        currentValue: newValue,
                        status: newValue <= 0 ? 'used' : 'active',
                    };
                }
                return card;
            }),
        })),
}));
