import "../../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, LogBox } from "react-native";
import { useEffect, useCallback } from "react";

LogBox.ignoreLogs([
    "SafeAreaView has been deprecated",
]);

import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/authStore";
import { useMerchantsStore } from "@/store/merchantsStore";
import { usePointsStore } from "@/store/pointsStore";
import { useGiftCardsStore } from "@/store/giftCardsStore";
import { useChallengesStore } from "@/store/challengesStore";
import { useNotificationsStore } from "@/store/notificationsStore";

export default function RootLayout() {
    const { session, customer, isLoading, setSession } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    // Función para cargar todos los stores
    const loadAllStores = useCallback(async (customerId: string) => {
        console.log('Loading all stores for customer:', customerId);
        try {
            await Promise.all([
                useMerchantsStore.getState().loadMerchants(customerId),
                usePointsStore.getState().loadPoints(customerId),
                usePointsStore.getState().loadTransactions(customerId),
                useGiftCardsStore.getState().loadGiftCards(customerId),
                useChallengesStore.getState().loadChallenges(customerId),
                useNotificationsStore.getState().loadNotifications(customerId),
            ]);
            console.log('All stores loaded successfully');
        } catch (error) {
            console.error('Error loading stores:', error);
        }
    }, []);

    // Limpiar stores cuando se cierra sesión
    useEffect(() => {
        if (!session) {
            useNotificationsStore.getState().clearNotifications();
        }
    }, [session]);

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Cargar stores cuando el customer esté disponible
    useEffect(() => {
        if (customer?.id) {
            loadAllStores(customer.id);
        }
    }, [customer?.id, loadAllStores]);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === "auth";
        const currentScreen = (segments as string[])[1] ?? null;

        // Pantallas de auth que no deben redirigir automáticamente aunque haya sesión
        const allowedWithSession = ["complete-profile", "otp"];
        const shouldStayInAuth = currentScreen ? allowedWithSession.includes(currentScreen) : false;

        if (!session && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace("/auth/login");
        } else if (session && inAuthGroup && !shouldStayInAuth) {
            // Redirect to home if authenticated (except during registration flow)
            router.replace("/(tabs)");
        }
    }, [session, isLoading, segments]);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#812797" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth" />
            </Stack>
            <StatusBar style="dark" />
        </View>
    );
}
