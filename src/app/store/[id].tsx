import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, MapPin, Phone, Clock, Heart, Trophy, Gift, Coins, Info } from 'lucide-react-native';
import { useMerchantsStore } from '@/store/merchantsStore';
import { usePointsStore } from '@/store/pointsStore';
import { useGiftCardsStore } from '@/store/giftCardsStore';
import { useChallengesStore } from '@/store/challengesStore';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';

type Tab = 'challenges' | 'giftcards';

export default function StoreDetailScreen() {
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<Tab>('challenges');
    const [showInfo, setShowInfo] = useState(false);

    const { customer } = useAuthStore();
    const { getMerchantById, toggleFavorite } = useMerchantsStore();
    const { getPointsByMerchant, transactions } = usePointsStore();
    const { getGiftCardsByMerchant } = useGiftCardsStore();
    const { getChallengesByMerchant } = useChallengesStore();

    const merchant = getMerchantById(id as string);

    // Usar business_settings_id para obtener puntos, challenges y gift cards
    const businessSettingsId = merchant?.businessSettingsId.toString();
    const points = businessSettingsId ? getPointsByMerchant(businessSettingsId) : 0;
    const giftCards = businessSettingsId ? getGiftCardsByMerchant(businessSettingsId) : [];
    const challenges = businessSettingsId ? getChallengesByMerchant(businessSettingsId).filter(c => c.status === 'active') : [];
    const merchantTransactions = businessSettingsId ? transactions.filter(t => t.merchantId === businessSettingsId) : [];

    if (!merchant) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <Text className="text-gray-500" style={{ fontFamily: 'Lato-Regular' }}>
                    Comercio no encontrado
                </Text>
            </SafeAreaView>
        );
    }

    const renderChallenges = () => (
        <View className="px-6 pt-4">
            {challenges.map((challenge) => {
                const percentage = (challenge.currentProgress / challenge.targetProgress) * 100;
                return (
                    <Pressable
                        key={challenge.id}
                        onPress={() => router.push(`/challenge/${challenge.id}`)}
                        className="mb-4 bg-white rounded-3xl p-5 active:scale-98"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                    >
                        <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Lato-Bold' }}>
                                    {challenge.title}
                                </Text>
                                <Text className="text-sm text-gray-600" style={{ fontFamily: 'Lato-Regular' }}>
                                    {challenge.description}
                                </Text>
                            </View>
                            <View className="bg-purple-100 px-3 py-2 rounded-full ml-3">
                                <Text className="text-sm font-bold" style={{ fontFamily: 'Lato-Bold', color: Colors.primary }}>
                                    {challenge.currentProgress}/{challenge.targetProgress}
                                </Text>
                            </View>
                        </View>

                        {/* Progress Bar */}
                        <View className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                            <LinearGradient
                                colors={[Colors.primary, Colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ width: `${percentage}%`, height: '100%', borderRadius: 999 }}
                            />
                        </View>

                        {/* Reward */}
                        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                            <Text className="text-sm text-gray-600" style={{ fontFamily: 'Lato-Regular' }}>
                                Recompensa:
                            </Text>
                            <Text className="text-sm font-bold" style={{ fontFamily: 'Lato-Bold', color: Colors.secondary }}>
                                {challenge.reward}
                            </Text>
                        </View>
                    </Pressable>
                );
            })}

            {challenges.length === 0 && (
                <View className="py-20 items-center">
                    <Trophy size={48} color="#D1D5DB" />
                    <Text className="text-gray-400 text-center mt-4" style={{ fontFamily: 'Lato-Regular' }}>
                        No hay retos activos en este momento
                    </Text>
                </View>
            )}
        </View>
    );

    const renderGiftCards = () => (
        <View className="px-6 pt-4">
            {giftCards.map((card) => (
                <Pressable
                    key={card.id}
                    onPress={() => router.push(`/gift-card/${card.id}`)}
                    className="mb-4 active:scale-98"
                >
                    <LinearGradient
                        colors={card.status === 'active' ? [Colors.primary, Colors.secondary] : ['#9CA3AF', '#6B7280']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            borderRadius: 24,
                            padding: 20,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 5,
                        }}
                    >
                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <Text className="text-white/70 text-sm mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                    Saldo disponible
                                </Text>
                                <Text className="text-white text-4xl font-bold" style={{ fontFamily: 'Lato-Bold' }}>
                                    ${card.currentValue}
                                </Text>
                                {card.currentValue < card.value && (
                                    <Text className="text-white/60 text-sm mt-1" style={{ fontFamily: 'Lato-Regular' }}>
                                        de ${card.value}
                                    </Text>
                                )}
                            </View>
                            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                <Text className="text-white text-xs font-bold" style={{ fontFamily: 'Lato-Bold' }}>
                                    {card.status === 'active' ? 'Activa' : card.status === 'used' ? 'Usada' : 'Expirada'}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-white/80 text-xs mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                            Código: {card.code}
                        </Text>
                        <Text className="text-white/80 text-xs" style={{ fontFamily: 'Lato-Regular' }}>
                            Válido hasta {new Date(card.expirationDate).toLocaleDateString('es-ES')}
                        </Text>
                    </LinearGradient>
                </Pressable>
            ))}

            {giftCards.length === 0 && (
                <View className="py-20 items-center">
                    <Gift size={48} color="#D1D5DB" />
                    <Text className="text-gray-400 text-center mt-4" style={{ fontFamily: 'Lato-Regular' }}>
                        No tienes gift cards de este comercio
                    </Text>
                </View>
            )}
        </View>
    );

    const renderPoints = () => (
        <View className="px-6 pt-4">
            {/* Points Summary */}
            <View className="bg-white rounded-3xl p-6 mb-6" style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
            }}>
                <Text className="text-gray-600 text-sm mb-2" style={{ fontFamily: 'Lato-Regular' }}>
                    Puntos acumulados
                </Text>
                <Text className="text-6xl font-bold mb-2" style={{ fontFamily: 'Lato-Bold', color: Colors.primary }}>
                    {points}
                </Text>
                <Text className="text-gray-500 text-sm" style={{ fontFamily: 'Lato-Regular' }}>
                    En {merchant.name}
                </Text>
            </View>

            {/* Transaction History */}
            <Text className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Lato-Bold' }}>
                Historial de transacciones
            </Text>

            {merchantTransactions.map((transaction) => (
                <View
                    key={transaction.id}
                    className="bg-white rounded-2xl p-4 mb-3 flex-row justify-between items-center"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    <View className="flex-1">
                        <Text className="text-sm font-bold text-gray-900 mb-1" style={{ fontFamily: 'Lato-Bold' }}>
                            {transaction.description}
                        </Text>
                        <Text className="text-xs text-gray-500" style={{ fontFamily: 'Lato-Regular' }}>
                            {new Date(transaction.date).toLocaleDateString('es-ES')}
                        </Text>
                    </View>
                    <Text
                        className="text-lg font-bold"
                        style={{
                            fontFamily: 'Lato-Bold',
                            color: transaction.type === 'earned' ? Colors.secondary : Colors.primary,
                        }}
                    >
                        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                    </Text>
                </View>
            ))}

            {merchantTransactions.length === 0 && (
                <View className="py-20 items-center">
                    <Coins size={48} color="#D1D5DB" />
                    <Text className="text-gray-400 text-center mt-4" style={{ fontFamily: 'Lato-Regular' }}>
                        No hay transacciones registradas
                    </Text>
                </View>
            )}
        </View>
    );

    const renderInfo = () => (
        <View className="px-6 pt-4">
            <View className="bg-white rounded-3xl p-6 mb-4" style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
            }}>
                <Text className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Lato-Bold' }}>
                    Información del comercio
                </Text>

                <View className="space-y-4">
                    {/* Location */}
                    {merchant.location && (
                        <View className="flex-row items-start mb-4">
                            <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                                <MapPin size={20} color={Colors.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                    Ubicación
                                </Text>
                                <Text className="text-base text-gray-900" style={{ fontFamily: 'Lato-Bold' }}>
                                    {merchant.location}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Phone */}
                    {merchant.phone && (
                        <View className="flex-row items-start mb-4">
                            <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                                <Phone size={20} color={Colors.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                    Teléfono
                                </Text>
                                <Text className="text-base text-gray-900" style={{ fontFamily: 'Lato-Bold' }}>
                                    {merchant.phone}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Hours */}
                    {merchant.hours && (
                        <View className="flex-row items-start mb-4">
                            <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                                <Clock size={20} color={Colors.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                    Horario
                                </Text>
                                <Text className="text-base text-gray-900" style={{ fontFamily: 'Lato-Bold' }}>
                                    {merchant.hours}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    <View className="flex-row items-start">
                        <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                            <Info size={20} color={Colors.primary} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                Descripción
                            </Text>
                            <Text className="text-base text-gray-900" style={{ fontFamily: 'Lato-Bold' }}>
                                {merchant.description}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header with Image */}
                <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="pb-6"
                >
                    {/* Navigation */}
                    <View className="flex-row justify-between items-center px-6 pt-4 mb-6">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        >
                            <ChevronLeft size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setShowInfo(!showInfo)}
                                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            >
                                <Info size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => customer?.id && toggleFavorite(customer.id, merchant.id)}
                                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            >
                                <Heart
                                    size={24}
                                    color="white"
                                    fill={merchant.isFavorite ? 'white' : 'transparent'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Merchant Info or Details */}
                    {!showInfo ? (
                        <View className="px-6 items-center">
                            <View
                                className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                                <Text className="text-6xl">{merchant.logo}</Text>
                            </View>
                            <Text className="text-white text-3xl font-bold mb-1" style={{ fontFamily: 'Lato-Bold' }}>
                                {merchant.name}
                            </Text>
                            <Text className="text-white/80 text-base mb-6" style={{ fontFamily: 'Lato-Regular' }}>
                                {merchant.category}
                            </Text>

                            {/* Points Display */}
                            <View className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 mb-2">
                                <Text className="text-white/80 text-sm text-center mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                    Tus puntos
                                </Text>
                                <Text className="text-white text-4xl font-bold text-center" style={{ fontFamily: 'Lato-Bold' }}>
                                    {points}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View className="px-6">
                            <Text className="text-white text-2xl font-bold mb-6 text-center" style={{ fontFamily: 'Lato-Bold' }}>
                                Información del comercio
                            </Text>

                            {/* Location */}
                            {merchant.location && (
                                <View className="flex-row items-center mb-4 bg-white/10 rounded-2xl p-4">
                                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                                        <MapPin size={20} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white/70 text-xs mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                            Ubicación
                                        </Text>
                                        <Text className="text-white text-sm" style={{ fontFamily: 'Lato-Bold' }}>
                                            {merchant.location}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Phone */}
                            {merchant.phone && (
                                <View className="flex-row items-center mb-4 bg-white/10 rounded-2xl p-4">
                                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                                        <Phone size={20} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white/70 text-xs mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                            Teléfono
                                        </Text>
                                        <Text className="text-white text-sm" style={{ fontFamily: 'Lato-Bold' }}>
                                            {merchant.phone}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Hours */}
                            {merchant.hours && (
                                <View className="flex-row items-center mb-4 bg-white/10 rounded-2xl p-4">
                                    <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                                        <Clock size={20} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white/70 text-xs mb-1" style={{ fontFamily: 'Lato-Regular' }}>
                                            Horario
                                        </Text>
                                        <Text className="text-white text-sm" style={{ fontFamily: 'Lato-Bold' }}>
                                            {merchant.hours}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </LinearGradient>

                {/* Tabs */}
                <View className="px-6 pt-4 pb-2 bg-white">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => setActiveTab('challenges')}
                            className={`flex-1 px-4 py-3 rounded-2xl ${activeTab === 'challenges' ? 'bg-purple-600' : 'bg-gray-100'}`}
                            style={{
                                shadowColor: activeTab === 'challenges' ? Colors.primary : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: activeTab === 'challenges' ? 3 : 0,
                            }}
                        >
                            <Text
                                className={`font-bold text-center ${activeTab === 'challenges' ? 'text-white' : 'text-gray-600'}`}
                                style={{ fontFamily: 'Lato-Bold', fontSize: 15 }}
                            >
                                Retos
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('giftcards')}
                            className={`flex-1 px-4 py-3 rounded-2xl ${activeTab === 'giftcards' ? 'bg-purple-600' : 'bg-gray-100'}`}
                            style={{
                                shadowColor: activeTab === 'giftcards' ? Colors.primary : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: activeTab === 'giftcards' ? 3 : 0,
                            }}
                        >
                            <Text
                                className={`font-bold text-center ${activeTab === 'giftcards' ? 'text-white' : 'text-gray-600'}`}
                                style={{ fontFamily: 'Lato-Bold', fontSize: 15 }}
                            >
                                Gift Cards
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    className="flex-1 bg-gray-50"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {activeTab === 'challenges' && renderChallenges()}
                    {activeTab === 'giftcards' && renderGiftCards()}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
