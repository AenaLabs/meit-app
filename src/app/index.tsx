import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
    const { session, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#812797" />
            </View>
        );
    }

    // Redirigir basado en el estado de autenticación
    if (session) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/auth/login" />;
}
