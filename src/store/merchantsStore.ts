import { create } from 'zustand';

export interface Merchant {
    id: string;
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
}

interface MerchantsState {
    merchants: Merchant[];
    favoriteMerchants: Merchant[];
    isLoading: boolean;
    setMerchants: (merchants: Merchant[]) => void;
    toggleFavorite: (merchantId: string) => void;
    getMerchantById: (id: string) => Merchant | undefined;
}

export const useMerchantsStore = create<MerchantsState>((set, get) => ({
    merchants: [
        // Mock data
        {
            id: '1',
            name: 'Café Central',
            logo: '☕',
            description: 'El mejor café de la ciudad',
            category: 'Cafetería',
            isFavorite: true,
            activeRewards: 3,
            activeChallenges: 2,
            location: 'Calle Principal 123',
            phone: '+1234567890',
            hours: 'Lun-Vie: 7:00 AM - 8:00 PM',
        },
        {
            id: '2',
            name: 'Gym Fitness',
            logo: '💪',
            description: 'Tu centro de entrenamiento',
            category: 'Gimnasio',
            isFavorite: false,
            activeRewards: 2,
            activeChallenges: 3,
            location: 'Av. Deportiva 456',
            phone: '+1234567891',
            hours: 'Lun-Dom: 6:00 AM - 10:00 PM',
        },
        {
            id: '3',
            name: 'Restaurante Bella Vista',
            logo: '🍽️',
            description: 'Comida italiana auténtica',
            category: 'Restaurante',
            isFavorite: true,
            activeRewards: 5,
            activeChallenges: 1,
            location: 'Plaza Mayor 789',
            phone: '+1234567892',
            hours: 'Lun-Dom: 12:00 PM - 11:00 PM',
        },
        {
            id: '4',
            name: 'Librería El Saber',
            logo: '📚',
            description: 'Libros y papelería',
            category: 'Librería',
            isFavorite: false,
            activeRewards: 4,
            activeChallenges: 2,
            location: 'Calle Cultura 321',
            phone: '+1234567893',
            hours: 'Lun-Sab: 9:00 AM - 7:00 PM',
        },
    ],
    favoriteMerchants: [],
    isLoading: false,
    setMerchants: (merchants) => set({ merchants }),
    toggleFavorite: (merchantId) =>
        set((state) => ({
            merchants: state.merchants.map((merchant) =>
                merchant.id === merchantId
                    ? { ...merchant, isFavorite: !merchant.isFavorite }
                    : merchant
            ),
        })),
    getMerchantById: (id) => get().merchants.find((m) => m.id === id),
}));
