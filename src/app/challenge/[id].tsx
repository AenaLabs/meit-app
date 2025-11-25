import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Trophy, Calendar, Gift, Target, CheckCircle2, Circle } from 'lucide-react-native';
import { useChallengesStore } from '@/store/challengesStore';
import { Colors } from '@/constants/Colors';

export default function ChallengeDetailScreen() {
    const { id } = useLocalSearchParams();
    const { getChallengeById, progress } = useChallengesStore();
    const challenge = getChallengeById(id as string);
    const challengeProgress = progress.filter(p => p.challengeId === id);

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
                    className="pb-10"
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

                    {/* Content Layout: Left (Merchant) - Right (Progress) */}
                    <View className="px-6 flex-row">
                        {/* Left Side: Merchant Info */}
                        <View className="flex-1 mr-4">
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
                            <Text className="text-white/80 text-base" style={{ fontFamily: 'Lato-Regular' }} numberOfLines={2}>
                                {challenge.description}
                            </Text>
                        </View>

                        {/* Right Side: Progress */}
                        <View className="items-center justify-start pt-1">
                            <View
                                className="items-center justify-center mb-3"
                                style={{ width: 90, height: 90 }}
                            >
                                <View
                                    className="absolute items-center justify-center rounded-full"
                                    style={{
                                        width: 90,
                                        height: 90,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    }}
                                >
                                    <View
                                        className="items-center justify-center rounded-full bg-white"
                                        style={{ width: 72, height: 72 }}
                                    >
                                        <Text
                                            className="font-bold"
                                            style={{ fontFamily: 'Lato-Bold', fontSize: 28, color: Colors.primary }}
                                        >
                                            {challenge.currentProgress}
                                        </Text>
                                        <Text
                                            className="text-gray-600"
                                            style={{ fontFamily: 'Lato-Regular', fontSize: 10 }}
                                        >
                                            de {challenge.targetProgress}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Text className="text-white text-xs font-bold" style={{ fontFamily: 'Lato-Bold' }}>
                                {percentage.toFixed(0)}%
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
                >
                    {/* Status Card */}
                    <View className="px-6 mb-6">
                        <View
                            className="bg-white rounded-3xl p-6"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                                elevation: 5,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center flex-1">
                                    <View
                                        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                                        style={{ backgroundColor: isCompleted ? Colors.secondary + '20' : isExpired ? '#FEE2E2' : Colors.primary + '20' }}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 size={24} color={Colors.secondary} />
                                        ) : (
                                            <Target size={24} color={isExpired ? '#EF4444' : Colors.primary} />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 font-bold text-base" style={{ fontFamily: 'Lato-Bold' }}>
                                            {isCompleted ? 'Completado' : isExpired ? 'Expirado' : 'En Progreso'}
                                        </Text>
                                        <Text className="text-gray-600 text-sm" style={{ fontFamily: 'Lato-Regular' }}>
                                            {isCompleted
                                                ? '¡Felicidades! Has completado este reto'
                                                : isExpired
                                                ? 'Este reto ha expirado'
                                                : `Faltan ${challenge.targetProgress - challenge.currentProgress} ${challenge.progressUnit}`}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {!isCompleted && !isExpired && (
                                <View className="flex-row items-center pt-4 border-t border-gray-100">
                                    <Calendar size={18} color={daysUntilExpiration <= 3 ? '#F59E0B' : Colors.primary} />
                                    <Text
                                        className="ml-2 text-sm"
                                        style={{
                                            fontFamily: 'Lato-Regular',
                                            color: daysUntilExpiration <= 3 ? '#F59E0B' : Colors.primary,
                                        }}
                                    >
                                        {daysUntilExpiration > 0
                                            ? `${daysUntilExpiration} ${daysUntilExpiration === 1 ? 'día' : 'días'} restantes`
                                            : 'Último día'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

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

                            <View className="flex-row items-center mb-3">
                                <View
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <Gift size={24} color="white" />
                                </View>
                                <Text className="text-xl font-bold text-white" style={{ fontFamily: 'Lato-Bold' }}>
                                    Recompensa
                                </Text>
                            </View>
                            <Text className="text-3xl font-bold mb-2 text-white" style={{ fontFamily: 'Lato-Bold' }}>
                                {challenge.reward}
                            </Text>
                            <View className="flex-row items-center">
                                <Trophy size={18} color="white" />
                                <Text className="ml-2 text-base font-bold text-white/90" style={{ fontFamily: 'Lato-Bold' }}>
                                    +{challenge.rewardPoints} puntos
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Progress History */}
                    {challengeProgress.length > 0 && (
                        <View className="px-6 mb-6">
                            <View className="bg-white rounded-3xl p-6" style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}>
                                <Text className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Lato-Bold' }}>
                                    Historial de Progreso
                                </Text>

                                {challengeProgress.map((item, index) => (
                                    <View key={index} className="flex-row items-start mb-3 last:mb-0">
                                        <View className="mr-3 mt-1">
                                            <CheckCircle2 size={20} color={Colors.secondary} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-sm mb-1" style={{ fontFamily: 'Lato-Bold' }}>
                                                {item.description}
                                            </Text>
                                            <Text className="text-gray-500 text-xs" style={{ fontFamily: 'Lato-Regular' }}>
                                                {new Date(item.date).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Text>
                                        </View>
                                        <View className="bg-purple-100 px-2 py-1 rounded-full">
                                            <Text className="text-xs font-bold" style={{ fontFamily: 'Lato-Bold', color: Colors.primary }}>
                                                +{item.progress}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

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
                                        Progreso actual
                                    </Text>
                                    <Text className="text-gray-900 font-bold" style={{ fontFamily: 'Lato-Bold' }}>
                                        {challenge.currentProgress} {challenge.progressUnit}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between py-3 border-b border-gray-100">
                                    <Text className="text-gray-600" style={{ fontFamily: 'Lato-Regular' }}>
                                        Meta
                                    </Text>
                                    <Text className="text-gray-900 font-bold" style={{ fontFamily: 'Lato-Bold' }}>
                                        {challenge.targetProgress} {challenge.progressUnit}
                                    </Text>
                                </View>

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
