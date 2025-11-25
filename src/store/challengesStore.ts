import { create } from 'zustand';

export interface Challenge {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantLogo: string;
    title: string;
    description: string;
    reward: string;
    rewardPoints: number;
    currentProgress: number;
    targetProgress: number;
    progressUnit: string; // 'compras', 'visitas', 'puntos', etc.
    expirationDate: string;
    status: 'active' | 'completed' | 'expired';
    imageUrl?: string;
}

export interface ChallengeProgress {
    challengeId: string;
    date: string;
    progress: number;
    description: string;
}

interface ChallengesState {
    challenges: Challenge[];
    progress: ChallengeProgress[];
    isLoading: boolean;
    setChallenges: (challenges: Challenge[]) => void;
    getChallengeById: (id: string) => Challenge | undefined;
    getChallengesByMerchant: (merchantId: string) => Challenge[];
    getActiveChallenges: () => Challenge[];
    getNearCompletionChallenges: (favoriteMerchantIds?: string[]) => Challenge[];
    updateChallengeProgress: (challengeId: string, progress: number, description: string) => void;
    completeChallenge: (challengeId: string) => void;
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
    challenges: [
        {
            id: 'ch1',
            merchantId: '1',
            merchantName: 'Café Central',
            merchantLogo: '☕',
            title: 'Café Matutino',
            description: 'Compra 5 cafés antes de las 10 AM',
            reward: 'Café gratis + 100 puntos',
            rewardPoints: 100,
            currentProgress: 3,
            targetProgress: 5,
            progressUnit: 'compras',
            expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
        },
        {
            id: 'ch2',
            merchantId: '2',
            merchantName: 'Gym Fitness',
            merchantLogo: '💪',
            title: 'Guerrero del Mes',
            description: 'Asiste 20 veces al gimnasio este mes',
            reward: 'Mes gratis + 500 puntos',
            rewardPoints: 500,
            currentProgress: 16,
            targetProgress: 20,
            progressUnit: 'visitas',
            expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
        },
        {
            id: 'ch3',
            merchantId: '3',
            merchantName: 'Restaurante Bella Vista',
            merchantLogo: '🍽️',
            title: 'Gourmet Explorer',
            description: 'Prueba 10 platos diferentes del menú',
            reward: 'Postre gratis + 200 puntos',
            rewardPoints: 200,
            currentProgress: 4,
            targetProgress: 10,
            progressUnit: 'platos',
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
        },
        {
            id: 'ch4',
            merchantId: '4',
            merchantName: 'Librería El Saber',
            merchantLogo: '📚',
            title: 'Lector Empedernido',
            description: 'Compra 3 libros en el mes',
            reward: '20% descuento + 150 puntos',
            rewardPoints: 150,
            currentProgress: 2,
            targetProgress: 3,
            progressUnit: 'libros',
            expirationDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
        },
        {
            id: 'ch5',
            merchantId: '1',
            merchantName: 'Café Central',
            merchantLogo: '☕',
            title: 'Cliente Frecuente',
            description: 'Visita el café 10 veces',
            reward: 'Café premium gratis',
            rewardPoints: 80,
            currentProgress: 10,
            targetProgress: 10,
            progressUnit: 'visitas',
            expirationDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
        },
        {
            id: 'ch6',
            merchantId: '1',
            merchantName: 'Café Central',
            merchantLogo: '☕',
            title: 'Amante del Postre',
            description: 'Prueba 3 postres diferentes',
            reward: 'Postre gratis',
            rewardPoints: 50,
            currentProgress: 1,
            targetProgress: 3,
            progressUnit: 'postres',
            expirationDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
        },
    ],
    progress: [
        {
            challengeId: 'ch1',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 1,
            description: 'Café americano - 8:30 AM',
        },
        {
            challengeId: 'ch1',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 1,
            description: 'Cappuccino - 9:15 AM',
        },
        {
            challengeId: 'ch2',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 1,
            description: 'Sesión de cardio - 7:00 AM',
        },
    ],
    isLoading: false,
    setChallenges: (challenges) => set({ challenges }),
    getChallengeById: (id) => get().challenges.find((ch) => ch.id === id),
    getChallengesByMerchant: (merchantId) =>
        get().challenges.filter((ch) => ch.merchantId === merchantId),
    getActiveChallenges: () =>
        get().challenges.filter((ch) => ch.status === 'active'),
    getNearCompletionChallenges: (favoriteMerchantIds) => {
        let filtered = get().challenges.filter((ch) => ch.status === 'active');

        // Si se proporcionan IDs de comercios favoritos, filtrar solo esos
        if (favoriteMerchantIds && favoriteMerchantIds.length > 0) {
            filtered = filtered.filter((ch) => favoriteMerchantIds.includes(ch.merchantId));
        }

        return filtered
            .filter((ch) => {
                const percentage = (ch.currentProgress / ch.targetProgress) * 100;
                return percentage >= 60; // Retos con 60% o más completado
            })
            .sort((a, b) => {
                const aPercentage = (a.currentProgress / a.targetProgress) * 100;
                const bPercentage = (b.currentProgress / b.targetProgress) * 100;
                return bPercentage - aPercentage;
            });
    },
    updateChallengeProgress: (challengeId, progress, description) => {
        const newProgress: ChallengeProgress = {
            challengeId,
            date: new Date().toISOString(),
            progress,
            description,
        };

        set((state) => ({
            challenges: state.challenges.map((ch) => {
                if (ch.id === challengeId && ch.status === 'active') {
                    const newCurrentProgress = ch.currentProgress + progress;
                    const isCompleted = newCurrentProgress >= ch.targetProgress;
                    return {
                        ...ch,
                        currentProgress: newCurrentProgress,
                        status: isCompleted ? 'completed' : 'active',
                    };
                }
                return ch;
            }),
            progress: [newProgress, ...state.progress],
        }));
    },
    completeChallenge: (challengeId) =>
        set((state) => ({
            challenges: state.challenges.map((ch) =>
                ch.id === challengeId ? { ...ch, status: 'completed' } : ch
            ),
        })),
}));
