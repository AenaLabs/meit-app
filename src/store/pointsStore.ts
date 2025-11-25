import { create } from 'zustand';

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
    merchantId: string;
    merchantName: string;
    points: number;
    logo: string;
}

interface PointsState {
    generalPoints: number;
    merchantPoints: MerchantPoints[];
    transactions: PointTransaction[];
    isLoading: boolean;
    setGeneralPoints: (points: number) => void;
    addPoints: (merchantId: string, amount: number, description: string) => void;
    redeemPoints: (merchantId: string, amount: number, description: string) => void;
    getPointsByMerchant: (merchantId: string) => number;
    getTotalPoints: () => number;
}

export const usePointsStore = create<PointsState>((set, get) => ({
    generalPoints: 1250,
    merchantPoints: [
        {
            merchantId: '1',
            merchantName: 'Café Central',
            points: 450,
            logo: '☕',
        },
        {
            merchantId: '2',
            merchantName: 'Gym Fitness',
            points: 320,
            logo: '💪',
        },
        {
            merchantId: '3',
            merchantName: 'Restaurante Bella Vista',
            points: 580,
            logo: '🍽️',
        },
        {
            merchantId: '4',
            merchantName: 'Librería El Saber',
            points: 200,
            logo: '📚',
        },
    ],
    transactions: [
        {
            id: '1',
            merchantId: '1',
            merchantName: 'Café Central',
            amount: 50,
            type: 'earned',
            description: 'Compra de café americano',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '2',
            merchantId: '3',
            merchantName: 'Restaurante Bella Vista',
            amount: 100,
            type: 'earned',
            description: 'Cena para 2 personas',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '3',
            merchantId: '2',
            merchantName: 'Gym Fitness',
            amount: 200,
            type: 'redeemed',
            description: 'Canjeado por clase de yoga',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ],
    isLoading: false,
    setGeneralPoints: (points) => set({ generalPoints: points }),
    addPoints: (merchantId, amount, description) => {
        const state = get();
        const newTransaction: PointTransaction = {
            id: Date.now().toString(),
            merchantId,
            merchantName: state.merchantPoints.find((mp) => mp.merchantId === merchantId)?.merchantName || '',
            amount,
            type: 'earned',
            description,
            date: new Date().toISOString(),
        };

        set((state) => ({
            generalPoints: state.generalPoints + amount,
            merchantPoints: state.merchantPoints.map((mp) =>
                mp.merchantId === merchantId
                    ? { ...mp, points: mp.points + amount }
                    : mp
            ),
            transactions: [newTransaction, ...state.transactions],
        }));
    },
    redeemPoints: (merchantId, amount, description) => {
        const state = get();
        const newTransaction: PointTransaction = {
            id: Date.now().toString(),
            merchantId,
            merchantName: state.merchantPoints.find((mp) => mp.merchantId === merchantId)?.merchantName || '',
            amount,
            type: 'redeemed',
            description,
            date: new Date().toISOString(),
        };

        set((state) => ({
            generalPoints: state.generalPoints - amount,
            merchantPoints: state.merchantPoints.map((mp) =>
                mp.merchantId === merchantId
                    ? { ...mp, points: mp.points - amount }
                    : mp
            ),
            transactions: [newTransaction, ...state.transactions],
        }));
    },
    getPointsByMerchant: (merchantId) => {
        const merchantPoint = get().merchantPoints.find((mp) => mp.merchantId === merchantId);
        return merchantPoint?.points || 0;
    },
    getTotalPoints: () => {
        return get().generalPoints;
    },
}));
