import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginScreen() {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setSession } = useAuthStore();

    const handleLogin = async () => {
        // TODO: Implementar autenticación real con Supabase
        // Por ahora, crear una sesión simulada
        const mockSession = {
            access_token: "mock-token",
            refresh_token: "mock-refresh-token",
            expires_in: 3600,
            token_type: "bearer",
            user: {
                id: "mock-user-id",
                email: phone + "@mock.com",
                phone: phone,
                created_at: new Date().toISOString(),
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
            }
        } as any;

        setSession(mockSession);
        router.replace("/(tabs)");

        // Código original comentado para cuando se implemente la autenticación:
        // if (!phone || phone.length < 10) {
        //     Alert.alert("Error", "Por favor ingresa un número válido");
        //     return;
        // }
        //
        // setLoading(true);
        // const { error } = await supabase.auth.signInWithOtp({
        //     phone: phone.startsWith("+") ? phone : `+58${phone}`,
        // });
        //
        // setLoading(false);
        //
        // if (error) {
        //     Alert.alert("Error", error.message);
        // } else {
        //     router.push({ pathname: "/auth/otp", params: { phone } });
        // }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center">
            <View className="mb-10">
                <Text className="text-3xl font-header text-primary mb-2">Bienvenido a Meit!</Text>
                <Text className="text-neutral font-body">Ingresa tu número para continuar</Text>
            </View>

            <Input
                label="Teléfono"
                placeholder="4121234567"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />

            <Button
                title="Enviar Código"
                onPress={handleLogin}
                loading={loading}
            />
        </SafeAreaView>
    );
}
