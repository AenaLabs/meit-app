import "../../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, LogBox } from "react-native";
import { useEffect } from "react";

LogBox.ignoreLogs([
    "SafeAreaView has been deprecated",
]);

import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
    const { session, isLoading, setSession } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

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

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === "auth";

        if (!session && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace("/auth/login");
        } else if (session && inAuthGroup) {
            // Redirect to home if authenticated
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
