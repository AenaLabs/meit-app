import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { CustomerProfile, getCustomerByAuthId } from '@/services/auth';
import { usePointsStore } from './pointsStore';
import { useGiftCardsStore } from './giftCardsStore';

interface AuthState {
    session: Session | null;
    user: User | null;
    customer: CustomerProfile | null;
    isLoading: boolean;
    setSession: (session: Session | null) => Promise<void>;
    setCustomer: (customer: CustomerProfile | null) => void;
    signOut: () => Promise<void>;
    refreshCustomer: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    customer: null,
    isLoading: true,

    setSession: async (session) => {
        set({ session, user: session?.user ?? null });

        // Cargar customer si hay sesión
        if (session?.user) {
            try {
                const customer = await getCustomerByAuthId(session.user.id);
                set({ customer, isLoading: false });

                // Cargar datos históricos del customer
                if (customer?.id) {
                    usePointsStore.getState().loadPoints(customer.id);
                    usePointsStore.getState().loadTransactions(customer.id);
                    useGiftCardsStore.getState().loadGiftCards(customer.id);
                }
            } catch (error) {
                console.error('Error loading customer:', error);
                set({ customer: null, isLoading: false });
            }
        } else {
            set({ customer: null, isLoading: false });
            // Resetear stores al cerrar sesión
            usePointsStore.getState().reset();
            useGiftCardsStore.getState().reset();
        }
    },

    setCustomer: (customer) => set({ customer }),

    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, customer: null });
        // Resetear stores al cerrar sesión
        usePointsStore.getState().reset();
        useGiftCardsStore.getState().reset();
    },

    refreshCustomer: async () => {
        const { user } = get();
        if (user) {
            try {
                const customer = await getCustomerByAuthId(user.id);
                set({ customer });
            } catch (error) {
                console.error('Error refreshing customer:', error);
            }
        }
    },
}));
