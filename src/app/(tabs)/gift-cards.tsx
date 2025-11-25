import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, AlertCircle, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGiftCardsStore, GiftCard } from '@/store/giftCardsStore';
import { Colors } from '@/constants/Colors';

export default function GiftCardsScreen() {
    const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
    const [expandedMerchants, setExpandedMerchants] = useState<Record<string, boolean>>({});
    const { giftCards } = useGiftCardsStore();

    const toggleMerchant = (merchantId: string) => {
        setExpandedMerchants(prev => ({
            ...prev,
            [merchantId]: !prev[merchantId]
        }));
    };

    const filteredCards = giftCards.filter((card) => {
        if (filter === 'all') return true;
        return card.status === filter;
    });

    const groupedByMerchant = filteredCards.reduce((acc, card) => {
        if (!acc[card.merchantId]) {
            acc[card.merchantId] = {
                merchantName: card.merchantName,
                merchantLogo: card.merchantLogo,
                cards: [],
            };
        }
        acc[card.merchantId].cards.push(card);
        return acc;
    }, {} as Record<string, { merchantName: string; merchantLogo: string; cards: GiftCard[] }>);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return Colors.secondary;
            case 'used':
                return Colors.neutral;
            case 'expired':
                return '#EF4444';
            default:
                return Colors.neutral;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Activa';
            case 'used':
                return 'Usada';
            case 'expired':
                return 'Expirada';
            default:
                return status;
        }
    };

    const getDaysUntilExpiration = (expirationDate: string) => {
        const now = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const renderGiftCard = (card: GiftCard) => {
        const daysLeft = getDaysUntilExpiration(card.expirationDate);
        const isExpiringSoon = daysLeft <= 7 && card.status === 'active';

        return (
            <Pressable
                key={card.id}
                onPress={() => router.push(`/gift-card/${card.id}`)}
                className="mb-4 active:scale-98"
            >
                <LinearGradient
                    colors={
                        card.status === 'active'
                            ? [Colors.primary, Colors.secondary]
                            : ['#9CA3AF', '#6B7280']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius: 16,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1" style={{ marginRight: 12 }}>
                            <Text
                                className="text-white font-bold mb-1"
                                style={{ fontFamily: 'Lato-Bold', fontSize: 18 }}
                                numberOfLines={2}
                            >
                                {card.merchantName}
                            </Text>
                            <Text
                                className="text-white/80"
                                style={{ fontFamily: 'Lato-Regular', fontSize: 12 }}
                                numberOfLines={1}
                            >
                                {card.code}
                            </Text>
                        </View>
                        <View
                            className="rounded-full"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                            }}
                        >
                            <Text
                                className="text-white font-bold"
                                style={{ fontFamily: 'Lato-Bold', fontSize: 11 }}
                            >
                                {getStatusText(card.status)}
                            </Text>
                        </View>
                    </View>

                    {/* Value */}
                    <View className="mb-4">
                        <Text
                            className="text-white/70 text-sm mb-1"
                            style={{ fontFamily: 'Lato-Regular' }}
                        >
                            Saldo disponible
                        </Text>
                        <Text
                            className="text-white text-4xl font-bold"
                            style={{ fontFamily: 'Lato-Bold' }}
                        >
                            ${card.currentValue}
                        </Text>
                        {card.currentValue < card.value && (
                            <Text
                                className="text-white/60 text-sm mt-1"
                                style={{ fontFamily: 'Lato-Regular' }}
                            >
                                de ${card.value}
                            </Text>
                        )}
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-between items-center pt-4 border-t border-white/20">
                        <View className="flex-row items-center flex-1" style={{ marginRight: 8 }}>
                            {isExpiringSoon ? (
                                <>
                                    <AlertCircle size={16} color="white" />
                                    <Text
                                        className="text-white ml-2"
                                        style={{ fontFamily: 'Lato-Regular', fontSize: 12 }}
                                        numberOfLines={1}
                                    >
                                        Expira en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Clock size={16} color="white" />
                                    <Text
                                        className="text-white ml-2"
                                        style={{ fontFamily: 'Lato-Regular', fontSize: 12 }}
                                        numberOfLines={1}
                                    >
                                        Válido hasta{' '}
                                        {new Date(card.expirationDate).toLocaleDateString('es-ES')}
                                    </Text>
                                </>
                            )}
                        </View>
                        <ChevronRight size={20} color="white" style={{ flexShrink: 0 }} />
                    </View>
                </LinearGradient>
            </Pressable>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-white">
                <Text className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Lato-Bold' }}>
                    Gift Cards
                </Text>

                {/* Filter Tabs */}
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full ${
                            filter === 'all' ? 'bg-purple-600' : 'bg-gray-100'
                        }`}
                        activeOpacity={0.7}
                    >
                        <Text
                            className={`font-bold ${filter === 'all' ? 'text-white' : 'text-gray-600'}`}
                            style={{ fontFamily: 'Lato-Bold', fontSize: 14 }}
                        >
                            Todas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('active')}
                        className={`px-4 py-2 rounded-full ${
                            filter === 'active' ? 'bg-purple-600' : 'bg-gray-100'
                        }`}
                        activeOpacity={0.7}
                    >
                        <Text
                            className={`font-bold ${filter === 'active' ? 'text-white' : 'text-gray-600'}`}
                            style={{ fontFamily: 'Lato-Bold', fontSize: 14 }}
                        >
                            Activas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('used')}
                        className={`px-4 py-2 rounded-full ${
                            filter === 'used' ? 'bg-purple-600' : 'bg-gray-100'
                        }`}
                        activeOpacity={0.7}
                    >
                        <Text
                            className={`font-bold ${filter === 'used' ? 'text-white' : 'text-gray-600'}`}
                            style={{ fontFamily: 'Lato-Bold', fontSize: 14 }}
                        >
                            Usadas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('expired')}
                        className={`px-4 py-2 rounded-full ${
                            filter === 'expired' ? 'bg-purple-600' : 'bg-gray-100'
                        }`}
                        activeOpacity={0.7}
                    >
                        <Text
                            className={`font-bold ${filter === 'expired' ? 'text-white' : 'text-gray-600'}`}
                            style={{ fontFamily: 'Lato-Bold', fontSize: 14 }}
                        >
                            Expiradas
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Gift Cards List */}
            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
            >
                {Object.entries(groupedByMerchant).map(([merchantId, data]) => (
                    <View key={merchantId} className="mb-6">
                        {/* Merchant Header - Now clickable */}
                        <TouchableOpacity
                            onPress={() => toggleMerchant(merchantId)}
                            className="flex-row items-center mb-4 bg-white p-4 rounded-2xl"
                            activeOpacity={0.7}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                            }}
                        >
                            <Text className="text-3xl mr-3">{data.merchantLogo}</Text>
                            <View className="flex-1">
                                <Text
                                    className="text-xl font-bold text-gray-900"
                                    style={{ fontFamily: 'Lato-Bold' }}
                                >
                                    {data.merchantName}
                                </Text>
                                <Text
                                    className="text-xs text-gray-500 mt-1"
                                    style={{ fontFamily: 'Lato-Regular' }}
                                >
                                    {data.cards.length} {data.cards.length === 1 ? 'tarjeta' : 'tarjetas'}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <View
                                    className="px-2 py-1 rounded-full mr-2"
                                    style={{ backgroundColor: Colors.primary + '20' }}
                                >
                                    <Text
                                        className="text-xs font-bold"
                                        style={{ fontFamily: 'Lato-Bold', color: Colors.primary }}
                                    >
                                        {data.cards.length}
                                    </Text>
                                </View>
                                {expandedMerchants[merchantId] ? (
                                    <ChevronDown size={24} color={Colors.primary} />
                                ) : (
                                    <ChevronRight size={24} color={Colors.neutral} />
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Cards - Only show when expanded */}
                        {expandedMerchants[merchantId] && (
                            <View className="mt-2">
                                {data.cards.map(renderGiftCard)}
                            </View>
                        )}
                    </View>
                ))}

                {filteredCards.length === 0 && (
                    <View className="items-center justify-center py-20">
                        <Text
                            className="text-gray-400 text-center"
                            style={{ fontFamily: 'Lato-Regular', fontSize: 16 }}
                        >
                            No tienes gift cards {filter !== 'all' ? getStatusText(filter).toLowerCase() + 's' : ''}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
