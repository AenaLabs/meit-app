import { useState, useRef, useEffect } from "react";
import { View, Text, Alert, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { verifySignUpOTP, resendSignUpOTP } from "@/services/auth";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";

export default function OTPScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const router = useRouter();
    const setSession = useAuthStore((state) => state.setSession);

    const inputRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    // Timer para reenvío
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendCountdown]);

    // Focus en el primer input al montar
    useEffect(() => {
        setTimeout(() => {
            inputRefs[0].current?.focus();
        }, 100);
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        // Solo permitir números
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus al siguiente input
        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyPress = (index: number, key: string) => {
        // Ir al input anterior si se presiona backspace en un input vacío
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            Alert.alert("Error", "Por favor ingresa el código completo de 6 dígitos");
            return;
        }

        setLoading(true);

        try {
            const { session } = await verifySignUpOTP(email, otpCode);

            if (!session) {
                throw new Error("No se pudo verificar el código");
            }

            // Establecer sesión temporalmente para poder crear el perfil
            await setSession(session);

            // Ir a completar perfil
            router.replace({ pathname: "/auth/complete-profile", params: { email } });
        } catch (error: any) {
            Alert.alert("Código incorrecto", "Verifica el código e intenta nuevamente.");
            // Limpiar inputs y enfocar el primero
            setOtp(["", "", "", "", "", ""]);
            inputRefs[0].current?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await resendSignUpOTP(email);
            Alert.alert("Código reenviado", "Revisa tu email");
            setResendCountdown(60);
            setCanResend(false);
        } catch (error: any) {
            Alert.alert("Error", "No se pudo reenviar el código");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center">
            <View className="mb-10">
                <Text className="text-3xl font-header text-primary mb-2">Verificación</Text>
                <Text className="text-neutral font-body">
                    Ingresa el código enviado a{"\n"}
                    <Text className="font-bold text-text">{email}</Text>
                </Text>
            </View>

            {/* OTP Inputs */}
            <View className="flex-row justify-center mb-8">
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={inputRefs[index]}
                        className={`w-12 h-14 mx-1.5 text-center text-2xl font-bold rounded-xl border-2 ${digit ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-100'
                            }`}
                        style={{ color: Colors.primary }}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(index, value)}
                        onKeyPress={({ nativeEvent: { key } }) => handleOtpKeyPress(index, key)}
                        keyboardType="number-pad"
                        maxLength={1}
                        editable={!loading}
                        selectTextOnFocus
                    />
                ))}
            </View>

            <Button
                title="Verificar Código"
                onPress={handleVerify}
                loading={loading}
                disabled={otp.join("").length !== 6}
            />

            {/* Reenviar código */}
            <View className="mt-6 items-center">
                {canResend ? (
                    <TouchableOpacity onPress={handleResend} disabled={loading}>
                        <Text className="text-primary font-bold">
                            ¿No recibiste el código? Reenviar
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Text className="text-neutral font-body">
                        Reenviar código en{" "}
                        <Text className="text-primary font-bold">{resendCountdown}s</Text>
                    </Text>
                )}
            </View>

            {/* Cambiar email */}
            <View className="mt-4 items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-neutral font-body">
                        ¿Email incorrecto?{" "}
                        <Text className="text-primary underline">Cambiar</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
