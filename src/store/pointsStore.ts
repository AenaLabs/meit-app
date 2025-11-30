import { create } from 'zustand';
import {
    getCustomerGlobalPoints,
    getCustomerPointsByBusiness,
    getPointsHistory,
    type PointTransaction as PointTransactionFromService,
    type BusinessPoints as BusinessPointsFromService,
} from '@/services/points';

// Mapeo de categorías a emojis para placeholder de logo
const categoryEmojis: Record<string, string> = {
    'Cafetería': '☕',
    'Gimnasio': '💪',
    'Restaurante': '🍽️',
    'Librería': '📚',
    'Tienda': '🛍️',
    'General': '🏪',
};

export interface PointTransaction {
    id: string;
    merchantId: string;
    merchantName: string;
    amount: number;
    type: 'earned' | 'redeemed';
    description: string;
    date: string;
}

export interface MerchantPoints {
    merchantId: string;          // business_settings_id como string
    merchantName: string;
    points: number;              // total_points (puntos actuales disponibles)
    lifetimePoints: number;      // lifetime_points (puntos acumulados históricos)
    logo: string;
}

interface PointsState {
    generalPoints: number;
    lifetimePoints: number;
    merchantPoints: MerchantPoints[];
    transactions: PointTransaction[];
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    loadPoints: (customerId: string) => Promise<void>;
    loadTransactions: (customerId: string) => Promise<void>;
    refreshPoints: (customerId: string) => Promise<void>;
    getPointsByMerchant: (merchantId: string) => number;
    getTotalPoints: () => number;
    reset: () => void;
}

export const usePointsStore = create<PointsState>((set, get) => ({
    generalPoints: 0,
    lifetimePoints: 0,
    merchantPoints: [],
    transactions: [],
    isLoading: false,
    error: null,
    isInitialized: false,

    loadPoints: async (customerId: string) => {
        console.log('💰 PointsStore: loadPoints called for customer:', customerId);
        set({ isLoading: true, error: null });
        try {
            const [globalPoints, businessPoints] = await Promise.all([
                getCustomerGlobalPoints(customerId),
                getCustomerPointsByBusiness(customerId),
            ]);

            console.log('💰 PointsStore: Data received:', {
                generalPoints: globalPoints.generalPoints,
                lifetimePoints: globalPoints.lifetimePoints,
                businessPointsCount: businessPoints.length,
                businessPoints: businessPoints.map(bp => ({
                    name: bp.brandName,
                    points: bp.points,
                    lifetime: bp.lifetimePoints
                }))
            });

            set({
                generalPoints: globalPoints.generalPoints,
                lifetimePoints: globalPoints.lifetimePoints,
                merchantPoints: businessPoints.map((bp: BusinessPointsFromService) => ({
                    merchantId: bp.businessSettingsId.toString(),
                    merchantName: bp.brandName,
                    points: bp.points,
                    lifetimePoints: bp.lifetimePoints,
                    logo: categoryEmojis['General'], // Se actualizará cuando se cargue el merchant
                })),
                isLoading: false,
                isInitialized: true,
            });
        } catch (error: any) {
            console.error('❌ PointsStore: Error loading points:', error);
            set({ error: error.message || 'Error al cargar puntos', isLoading: false });
        }
    },

    loadTransactions: async (customerId: string) => {
        try {
            const history = await getPointsHistory(customerId);

            set({
                transactions: history.map((t: PointTransactionFromService) => ({
                    id: t.id,
                    merchantId: t.businessId.toString(),
                    merchantName: t.businessName || 'Desconocido',
                    amount: Math.abs(t.pointsAssigned),
                    type: t.pointsAssigned >= 0 ? 'earned' : 'redeemed',
                    description: t.notes || 'Transacción de puntos',
                    date: t.createdAt,
                })),
            });
        } catch (error: any) {
            console.error('Error loading transactions:', error);
        }
    },

    refreshPoints: async (customerId: string) => {
        await Promise.all([
            get().loadPoints(customerId),
            get().loadTransactions(customerId),
        ]);
    },

    getPointsByMerchant: (merchantId: string) => {
        const merchantPoint = get().merchantPoints.find((mp) => mp.merchantId === merchantId);
        return merchantPoint?.points || 0;
    },

    getTotalPoints: () => get().generalPoints,

    reset: () => set({
        generalPoints: 0,
        lifetimePoints: 0,
        merchantPoints: [],
        transactions: [],
        isLoading: false,
        error: null,
        isInitialized: false,
    }),
}));
