import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Store, CheckCircle, Gift, MapPin, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useMerchantsStore } from '@/store/merchantsStore';
import {
    getBusinessSettingsById,
    getCustomerBusinessBySettings,
    registerCustomerAtBusiness,
    type BusinessSettings,
    type CustomerBusiness,
} from '@/services/businesses';

const categoryEmojis: Record<string, string> = {
    'Cafetería': '☕',
    'Gimnasio': '💪',
    'Restaurante': '🍽️',
    'Librería': '📚',
    'Tienda': '🛍️',
    'Salud': '💊',
    'Belleza': '💅',
    'Tecnología': '💻',
    'General': '🏪',
};

export default function RegisterBusinessScreen() {
    const { id } = useLocalSearchParams();
    const businessSettingsId = parseInt(id as string);

    const { customer } = useAuthStore();
    const { refreshMerchants } = useMerchantsStore();

    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [business, setBusiness] = useState<BusinessSettings | null>(null);
    const [existingRelation, setExistingRelation] = useState<CustomerBusiness | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBusinessInfo();
    }, [businessSettingsId, customer?.id]);

    const loadBusinessInfo = async () => {
        if (!customer?.id || isNaN(businessSettingsId)) {
            setError('Datos inválidos');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Cargar info del comercio
            const businessData = await getBusinessSettingsById(businessSettingsId);
            if (!businessData) {
                setError('Este comercio no está disponible');
                setIsLoading(false);
                return;
            }
            setBusiness(businessData);

            // Verificar si ya está registrado
            const existing = await getCustomerBusinessBySettings(customer.id, businessSettingsId);
            setExistingRelation(existing);
        } catch (err: any) {
            console.error('Error loading business:', err);
            setError('Error al cargar la información del comercio');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!customer?.id || !business) return;

        try {
            setIsRegistering(true);
            console.log('DEBUG - customer.id:', customer.id);
            console.log('DEBUG - customer.auth_id:', customer.auth_id);
            console.log('DEBUG - businessSettingsId:', businessSettingsId);
            const result = await registerCustomerAtBusiness(customer.id, businessSettingsId);

            if (result.isNew) {
                // Refrescar la lista de comercios
                await refreshMerchants(customer.id);

                Alert.alert(
                    '¡Bienvenido!',
                    `Te has registrado en ${business.name}. ¡Has ganado 10 puntos de bienvenida!`,
                    [
                        {
                            text: 'Ver comercio',
                            onPress: () => router.replace(`/store/${result.customerBusiness.id}`),
                        },
                    ]
                );
            } else {
                // Ya estaba registrado (caso raro, ya lo verificamos antes)
                router.replace(`/store/${result.customerBusiness.id}`);
            }
        } catch (err: any) {
            console.error('Error registering:', err);
            Alert.alert('Error', 'No se pudo completar el registro. Intenta de nuevo.');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleGoToStore = () => {
        if (existingRelation) {
            router.replace(`/store/${existingRelation.id}`);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-50">
                <SafeAreaView className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text className="text-gray-500 mt-4" style={{ fontFamily: 'Lato-Regular' }}>
                        Cargando información...
                    </Text>
                </SafeAreaView>
            </View>
        );
    }

    // Error state
    if (error || !business) {
        return (
            <View className="flex-1 bg-gray-50">
                <SafeAreaView className="flex-1">
                    <View className="px-6 pt-4">
                        <TouchableOpacity
                            onPress={() => router.replace('/(tabs)/scanner')}
                            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                        >
                            <ChevronLeft size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-1 items-center justify-center px-6">
                        <Store size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-center mt-4 text-lg" style={{ fontFamily: 'Lato-Regular' }}>
                            {error || 'Comercio no encontrado'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.replace('/(tabs)/scanner')}
                            className="mt-6 px-6 py-3 bg-gray-200 rounded-full"
                        >
                            <Text className="text-gray-700 font-bold" style={{ fontFamily: 'Lato-Bold' }}>
                                Volver al escáner
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    const categoryName = business.business_type?.name || 'General';
    const emoji = categoryEmojis[categoryName] || categoryEmojis['General'];
    const isAlreadyRegistered = !!existingRelation;

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.primary }}>
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header con botón de volver */}
                <View className="px-6 pt-4 pb-6">
                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)/scanner')}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Main Content Card */}
                <View
                    className="flex-1 bg-white rounded-t-[40px]"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 10,
                    }}
                >
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        {/* Business Header */}
                        <View className="items-center pt-8 pb-6 px-6">
                            {/* Logo/Emoji Container */}
                            <View className="relative mb-5">
                                <LinearGradient
                                    colors={[Colors.primary, Colors.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="w-32 h-32 rounded-[32px] items-center justify-center"
                                    style={{
                                        shadowColor: Colors.primary,
                                        shadowOffset: { width: 0, height: 8 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 16,
                                        elevation: 8,
                                    }}
                                >
                                    <Text className="text-7xl">{emoji}</Text>
                                </LinearGradient>
                                {/* Sparkle decoration */}
                                <View
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full items-center justify-center"
                                    style={{
                                        shadowColor: '#FBBF24',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.4,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                >
                                    <Sparkles size={16} color="white" />
                                </View>
                            </View>

                            {/* Business Name */}
                            <Text
                                className="text-3xl font-bold text-gray-900 text-center mb-3"
                                style={{ fontFamily: 'Lato-Bold' }}
                            >
                                {business.name}
                            </Text>

                            {/* Category Badge */}
                            <View
                                className="flex-row items-center px-5 py-2.5 rounded-full mb-4"
                                style={{ backgroundColor: `${Colors.primary}15` }}
                            >
                                <Text className="text-lg mr-2">{emoji}</Text>
                                <Text
                                    className="text-base font-semibold"
                                    style={{ fontFamily: 'Lato-Bold', color: Colors.primary }}
                                >
                                    {categoryName}
                                </Text>
                            </View>

                            {/* Address if available */}
                            {business.address && (
                                <View className="flex-row items-center">
                                    <MapPin size={16} color="#9CA3AF" />
                                    <Text
                                        className="text-gray-500 text-sm ml-1"
                                        style={{ fontFamily: 'Lato-Regular' }}
                                    >
                                        {business.address}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Divider */}
                        <View className="h-2 bg-gray-50 mx-6 rounded-full mb-6" />

                        {/* Action Content */}
                        <View className="px-6">
                            {isAlreadyRegistered ? (
                                <>
                                    {/* Already Registered */}
                                    <View className="items-center mb-6">
                                        <View
                                            className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-4"
                                            style={{
                                                shadowColor: '#22C55E',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 8,
                                                elevation: 4,
                                            }}
                                        >
                                            <CheckCircle size={40} color="#22C55E" />
                                        </View>
                                        <Text
                                            className="text-2xl font-bold text-gray-900 text-center mb-2"
                                            style={{ fontFamily: 'Lato-Bold' }}
                                        >
                                            ¡Ya eres miembro!
                                        </Text>
                                        <Text
                                            className="text-gray-500 text-center text-base"
                                            style={{ fontFamily: 'Lato-Regular' }}
                                        >
                                            Estás registrado en este comercio
                                        </Text>
                                    </View>

                                    {/* Current Points Card */}
                                    <LinearGradient
                                        colors={[Colors.primary, Colors.secondary]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="rounded-3xl p-6 mb-6"
                                        style={{
                                            shadowColor: Colors.primary,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 8,
                                            elevation: 5,
                                        }}
                                    >
                                        <Text
                                            className="text-white/80 text-sm text-center mb-1"
                                            style={{ fontFamily: 'Lato-Regular' }}
                                        >
                                            Tus puntos actuales
                                        </Text>
                                        <Text
                                            className="text-white text-5xl font-bold text-center"
                                            style={{ fontFamily: 'Lato-Bold' }}
                                        >
                                            {existingRelation.total_points}
                                        </Text>
                                    </LinearGradient>

                                    <TouchableOpacity
                                        onPress={handleGoToStore}
                                        className="py-4 rounded-2xl"
                                        style={{ backgroundColor: Colors.primary }}
                                    >
                                        <Text
                                            className="text-white text-lg font-bold text-center"
                                            style={{ fontFamily: 'Lato-Bold' }}
                                        >
                                            Ver mi comercio
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    {/* New Registration */}
                                    <View className="items-center mb-6">
                                        <View
                                            className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                            style={{ backgroundColor: `${Colors.primary}15` }}
                                        >
                                            <Gift size={40} color={Colors.primary} />
                                        </View>
                                        <Text
                                            className="text-2xl font-bold text-gray-900 text-center mb-2"
                                            style={{ fontFamily: 'Lato-Bold' }}
                                        >
                                            ¡Únete ahora!
                                        </Text>
                                        <Text
                                            className="text-gray-500 text-center text-base"
                                            style={{ fontFamily: 'Lato-Regular' }}
                                        >
                                            Regístrate y comienza a acumular puntos
                                        </Text>
                                    </View>

                                    {/* Welcome Bonus Card */}
                                    <LinearGradient
                                        colors={['#FEF3C7', '#FDE68A']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{
                                            borderRadius: 24,
                                            paddingVertical: 24,
                                            paddingHorizontal: 20,
                                            shadowColor: '#F59E0B',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 8,
                                            elevation: 4,
                                        }}
                                    >
                                        <View className="flex-row items-center justify-center">
                                            <View
                                                className="w-14 h-14 bg-white items-center justify-center mr-4"
                                                style={{ borderRadius: 16 }}
                                            >
                                                <Text className="text-3xl">🎁</Text>
                                            </View>
                                            <View>
                                                <Text
                                                    className="text-amber-800 text-sm mb-1"
                                                    style={{ fontFamily: 'Lato-Regular' }}
                                                >
                                                    Bono de bienvenida
                                                </Text>
                                                <Text
                                                    className="text-amber-900 text-3xl font-bold"
                                                    style={{ fontFamily: 'Lato-Bold' }}
                                                >
                                                    +10 puntos
                                                </Text>
                                            </View>
                                        </View>
                                    </LinearGradient>

                                    {/* Spacer */}
                                    <View className="h-6" />

                                    <TouchableOpacity
                                        onPress={handleRegister}
                                        disabled={isRegistering}
                                        className="py-5"
                                        style={{
                                            borderRadius: 16,
                                            backgroundColor: isRegistering ? '#D1D5DB' : Colors.primary,
                                            shadowColor: Colors.primary,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: isRegistering ? 0 : 0.3,
                                            shadowRadius: 8,
                                            elevation: isRegistering ? 0 : 5,
                                        }}
                                    >
                                        {isRegistering ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text
                                                className="text-white text-lg font-bold text-center"
                                                style={{ fontFamily: 'Lato-Bold' }}
                                            >
                                                Registrarme
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
}
