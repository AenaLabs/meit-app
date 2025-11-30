import { useState } from "react";
import { View, Text, Alert, ScrollView, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCustomerProfile } from "@/services/auth";
import { Colors } from "@/constants/Colors";

type Gender = 'M' | 'F' | 'O' | null;

export default function CompleteProfileScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [name, setName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState<Gender>(null);
    const [optInMarketing, setOptInMarketing] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { user, setCustomer } = useAuthStore();

    const genderOptions: { value: Gender; label: string }[] = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' },
        { value: 'O', label: 'Otro' },
    ];

    const validateBirthDate = (date: string): boolean => {
        if (!date) return true; // Es opcional
        // Formato esperado: DD/MM/YYYY
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = date.match(regex);
        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > new Date().getFullYear()) return false;

        return true;
    };

    const formatBirthDateForDB = (date: string): string | null => {
        if (!date) return null;
        // Convertir de DD/MM/YYYY a YYYY-MM-DD
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = date.match(regex);
        if (!match) return null;
        return `${match[3]}-${match[2]}-${match[1]}`;
    };

    const handleBirthDateChange = (text: string) => {
        // Auto-formatear mientras escribe
        let cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length >= 5) {
            cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
        }
        if (cleaned.length <= 10) {
            setBirthDate(cleaned);
        }
    };

    const handleComplete = async () => {
        // Validaciones
        if (!name.trim()) {
            Alert.alert("Error", "Por favor ingresa tu nombre");
            return;
        }

        if (birthDate && !validateBirthDate(birthDate)) {
            Alert.alert("Error", "Formato de fecha inválido. Usa DD/MM/AAAA");
            return;
        }

        if (!user) {
            Alert.alert("Error", "No se encontró la sesión. Por favor intenta de nuevo.");
            router.replace("/auth/register");
            return;
        }

        setLoading(true);

        try {
            // Crear perfil de customer (también actualiza display_name en auth)
            const customer = await createCustomerProfile(user.id, email, {
                name: name.trim(),
                birth_date: formatBirthDateForDB(birthDate),
                gender,
                opt_in_marketing: optInMarketing,
            });

            // Actualizar el customer en el store
            setCustomer(customer);

            // Mostrar mensaje de éxito y redirigir a la app
            Alert.alert(
                "¡Registro completado!",
                "Tu cuenta ha sido creada exitosamente.",
                [
                    {
                        text: "Continuar",
                        onPress: () => router.replace("/(tabs)")
                    }
                ]
            );
        } catch (error: any) {
            console.error("Error creating customer:", error);
            Alert.alert("Error", "No se pudo crear tu perfil. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 p-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="mb-8">
                    <Text className="text-3xl font-header text-primary mb-2">
                        Completa tu perfil
                    </Text>
                    <Text className="text-neutral font-body">
                        Cuéntanos un poco más sobre ti
                    </Text>
                </View>

                {/* Nombre */}
                <Input
                    label="Nombre *"
                    placeholder="Tu nombre completo"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

                {/* Fecha de nacimiento */}
                <Input
                    label="Fecha de nacimiento"
                    placeholder="DD/MM/AAAA"
                    value={birthDate}
                    onChangeText={handleBirthDateChange}
                    keyboardType="number-pad"
                    maxLength={10}
                />

                {/* Género */}
                <View className="mb-6">
                    <Text className="text-neutral font-body mb-3">Género</Text>
                    <View className="flex-row gap-3">
                        {genderOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setGender(option.value)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 ${gender === option.value
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-200 bg-gray-50'
                                    }`}
                            >
                                <Text
                                    className={`text-center font-bold ${gender === option.value ? 'text-primary' : 'text-neutral'
                                        }`}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Opt-in Marketing */}
                <View className="mb-8 flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <View className="flex-1 mr-4">
                        <Text className="text-text font-bold mb-1">
                            Recibir ofertas y promociones
                        </Text>
                        <Text className="text-neutral text-sm font-body">
                            Te enviaremos las mejores ofertas de tus comercios favoritos
                        </Text>
                    </View>
                    <Switch
                        value={optInMarketing}
                        onValueChange={setOptInMarketing}
                        trackColor={{ false: '#D1D5DB', true: Colors.primary + '60' }}
                        thumbColor={optInMarketing ? Colors.primary : '#9CA3AF'}
                    />
                </View>

                <Button
                    title="Completar registro"
                    onPress={handleComplete}
                    loading={loading}
                />

                <Text className="text-center text-neutral text-xs font-body mt-4">
                    * Campo requerido
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
