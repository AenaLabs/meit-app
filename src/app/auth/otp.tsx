import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function OTPScreen() {
    const { phone } = useLocalSearchParams<{ phone: string }>();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const setSession = useAuthStore((state) => state.setSession);

    const handleVerify = async () => {
        // TODO: Implementar autenticación real con Supabase
        // Por ahora, redirigir directamente a la app
        router.replace("/(tabs)");

        // Código original comentado para cuando se implemente la autenticación:
        // if (!otp || otp.length !== 6) {
        //     Alert.alert("Error", "El código debe tener 6 dígitos");
        //     return;
        // }
        //
        // setLoading(true);
        // const { data, error } = await supabase.auth.verifyOtp({
        //     phone: phone.startsWith("+") ? phone : `+58${phone}`,
        //     token: otp,
        //     type: "sms",
        // });
        //
        // setLoading(false);
        //
        // if (error) {
        //     Alert.alert("Error", error.message);
        // } else {
        //     if (data.session) {
        //         setSession(data.session);
        //         router.replace("/(tabs)");
        //     }
        // }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center">
            <View className="mb-10">
                <Text className="text-3xl font-header text-primary mb-2">Verificación</Text>
                <Text className="text-neutral font-body">Ingresa el código enviado a {phone}</Text>
            </View>

            <Input
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                className="text-center tracking-widest"
            />

            <Button
                title="Verificar"
                onPress={handleVerify}
                loading={loading}
            />
        </SafeAreaView>
    );
}
