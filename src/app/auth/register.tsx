import { useState } from "react";
import { View, Text, Alert, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signUpWithEmail, getCustomerByEmail } from "@/services/auth";

export default function RegisterScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        // Validaciones
        if (!email || !validateEmail(email)) {
            Alert.alert("Error", "Por favor ingresa un email válido");
            return;
        }

        if (!password || password.length < 6) {
            Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Las contraseñas no coinciden");
            return;
        }

        setLoading(true);

        try {
            // Verificar si el email ya está registrado en customers
            const existingCustomer = await getCustomerByEmail(email);

            if (existingCustomer) {
                Alert.alert(
                    "Email ya registrado",
                    "¿Quieres iniciar sesión?",
                    [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Iniciar sesión", onPress: () => router.replace("/auth/login") }
                    ]
                );
                setLoading(false);
                return;
            }

            // Registrar usuario con email y contraseña
            const { user } = await signUpWithEmail({ email, password });

            if (!user) {
                throw new Error("No se pudo crear el usuario");
            }

            // Ir a verificar OTP
            router.push({ pathname: "/auth/otp", params: { email } });
        } catch (error: any) {
            // Manejar error de usuario ya existe en auth
            if (error.message?.includes('already registered')) {
                Alert.alert(
                    "Email ya registrado",
                    "Este email ya tiene una cuenta. ¿Quieres iniciar sesión?",
                    [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Iniciar sesión", onPress: () => router.replace("/auth/login") }
                    ]
                );
            } else {
                Alert.alert("Error", error.message || "No se pudo crear la cuenta");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 p-6"
                contentContainerStyle={{ justifyContent: 'center', minHeight: '100%' }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="mb-8">
                    <Text className="text-3xl font-header text-primary mb-2">
                        Crear cuenta
                    </Text>
                    <Text className="text-neutral font-body">
                        Ingresa tus datos para registrarte
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
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Input
                    label="Confirmar contraseña"
                    placeholder="Repite tu contraseña"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <Button
                    title="Crear cuenta"
                    onPress={handleRegister}
                    loading={loading}
                />

                <View className="mt-6 items-center">
                    <Text className="text-neutral font-body mb-2">¿Ya tienes cuenta?</Text>
                    <TouchableOpacity onPress={() => router.replace("/auth/login")}>
                        <Text className="text-primary font-bold text-lg">Inicia sesión aquí</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
