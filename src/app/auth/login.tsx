import { useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signInWithEmail } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const setSession = useAuthStore((state) => state.setSession);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        if (!email || !validateEmail(email)) {
            Alert.alert("Error", "Por favor ingresa un email válido");
            return;
        }

        if (!password) {
            Alert.alert("Error", "Por favor ingresa tu contraseña");
            return;
        }

        setLoading(true);

        try {
            const { session } = await signInWithEmail(email, password);

            if (!session) {
                throw new Error("No se pudo iniciar sesión");
            }

            // Establecer sesión (cargará customer automáticamente)
            await setSession(session);

            // Navegar a la app
            router.replace("/(tabs)");
        } catch (error: any) {
            // Manejar errores comunes
            if (error.message?.includes('Invalid login credentials')) {
                Alert.alert("Error", "Email o contraseña incorrectos");
            } else if (error.message?.includes('Email not confirmed')) {
                Alert.alert(
                    "Email no verificado",
                    "Por favor verifica tu email antes de iniciar sesión",
                    [
                        { text: "OK" }
                    ]
                );
            } else {
                Alert.alert("Error", error.message || "No se pudo iniciar sesión");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-header text-primary mb-2">
                    Bienvenido de nuevo!
                </Text>
                <Text className="text-neutral font-body">
                    Ingresa tus datos para continuar
                </Text>
            </View>

            <Input
                label="Email"
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <Input
                label="Contraseña"
                placeholder="Tu contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button
                title="Iniciar sesión"
                onPress={handleLogin}
                loading={loading}
            />

            <View className="mt-6 items-center">
                <Text className="text-neutral font-body mb-2">¿No tienes cuenta?</Text>
                <TouchableOpacity onPress={() => router.push("/auth/register")}>
                    <Text className="text-primary font-bold text-lg">Regístrate aquí</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
