import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Trophy, Calendar, Gift, Target, CheckCircle2 } from 'lucide-react-native';
import { useChallengesStore } from '@/store/challengesStore';
import { Colors } from '@/constants/Colors';

export default function ChallengeDetailScreen() {
    const { id } = useLocalSearchParams();
    const { getChallengeById } = useChallengesStore();
    const challenge = getChallengeById(id as string);

    if (!challenge) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <Text className="text-gray-500" style={{ fontFamily: 'Lato-Regular' }}>
                    Reto no encontrado
                </Text>
            </SafeAreaView>
        );
    }

    const percentage = (challenge.currentProgress / challenge.targetProgress) * 100;
    const isCompleted = challenge.status === 'completed';
    const isExpired = challenge.status === 'expired';
    const daysUntilExpiration = Math.ceil(
        (new Date(challenge.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return (
        <View className="flex-1 bg-gray-50">
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="pb-14"
                >
                    {/* Top Bar */}
                    <View className="px-6 pt-4 flex-row justify-between items-center mb-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        >
                            <ChevronLeft size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-bold" style={{ fontFamily: 'Lato-Bold' }}>
                            Detalle del Reto
                        </Text>
                        <View className="w-10" />
                    </View>

                    {/* Content Layout: Merchant Info */}
                    <View className="px-6">
                        {/* Merchant Logo & Name */}
                        <View className="flex-row items-center mb-3">
                            <View
                                className="w-14 h-14 rounded-xl items-center justify-center mr-3"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                                <Text className="text-4xl">{challenge.merchantLogo}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-white/70 text-sm mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                    {challenge.merchantName}
                                </Text>
                                <Text className="text-white text-xl font-bold" style={{ fontFamily: 'Lato-Bold' }} numberOfLines={2}>
                                    {challenge.title}
                                </Text>
                            </View>
                        </View>

                        {/* Description */}
                        <Text className="text-white/80 text-base mb-4" style={{ fontFamily: 'Lato-Regular' }}>
                            {challenge.description}
                        </Text>
                    </View>
                </LinearGradient>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
                >
                    {/* Reward */}
                    <View className="px-6 mb-6">
                        <LinearGradient
                            colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                borderRadius: 24,
                                padding: 24,
                                overflow: 'hidden',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 12,
                                elevation: 5,
                            }}
                        >
                            {/* Decorative elements */}
                            <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                            <View className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />

                            <View className="flex-row items-center mb-4">
                                <View
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <Trophy size={24} color="white" />
                                </View>
                                <Text className="text-xl font-bold text-white" style={{ fontFamily: 'Lato-Bold' }}>
                                    Recompensa
                                </Text>
                            </View>
                            <Text className="text-3xl font-bold text-white" style={{ fontFamily: 'Lato-Bold' }}>
                                +{challenge.rewardPoints} puntos
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Details */}
                    <View className="px-6">
                        <View className="bg-white rounded-3xl p-6" style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }}>
                            <Text className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Lato-Bold' }}>
                                Detalles
                            </Text>

                            <View className="space-y-3">
                                <View className="flex-row justify-between py-3 border-b border-gray-100">
                                    <Text className="text-gray-600" style={{ fontFamily: 'Lato-Regular' }}>
                                        Fecha límite
                                    </Text>
                                    <Text className="text-gray-900 font-bold" style={{ fontFamily: 'Lato-Bold' }}>
                                        {new Date(challenge.expirationDate).toLocaleDateString('es-ES')}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between py-3">
                                    <Text className="text-gray-600" style={{ fontFamily: 'Lato-Regular' }}>
                                        Estado
                                    </Text>
                                    <Text
                                        className="font-bold"
                                        style={{
                                            fontFamily: 'Lato-Bold',
                                            color: isCompleted ? Colors.secondary : isExpired ? '#EF4444' : Colors.primary,
                                        }}
                                    >
                                        {isCompleted ? 'Completado' : isExpired ? 'Expirado' : 'Activo'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
