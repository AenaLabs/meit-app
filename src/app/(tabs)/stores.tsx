import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Heart, MapPin, Trophy, Gift } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMerchantsStore } from '@/store/merchantsStore';
import { usePointsStore } from '@/store/pointsStore';
import { Colors } from '@/constants/Colors';

export default function StoresScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const { merchants, toggleFavorite } = useMerchantsStore();
    const { getPointsByMerchant } = usePointsStore();

    const filteredMerchants = merchants.filter(
        (merchant) =>
            merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            merchant.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-white">
                <Text className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Lato-Bold' }}>
                    Comercios
                </Text>

                {/* Search Bar */}
                <View className="flex-row gap-3">
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
                        <Search size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-2 text-gray-900"
                            style={{ fontFamily: 'Lato-Regular', fontSize: 16 }}
                            placeholder="Buscar comercios..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        className="bg-purple-100 rounded-2xl px-4 justify-center items-center"
                        activeOpacity={0.7}
                    >
                        <Filter size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Merchants List */}
            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
            >
                {filteredMerchants.map((merchant) => {
                    const points = getPointsByMerchant(merchant.id);
                    return (
                        <Pressable
                            key={merchant.id}
                            onPress={() => router.push(`/store/${merchant.id}`)}
                            className="mb-4 bg-white rounded-3xl overflow-hidden active:scale-98"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <View className="p-5">
                                {/* Header */}
                                <View className="flex-row items-start justify-between mb-4">
                                    <View className="flex-row items-center flex-1">
                                        {/* Logo */}
                                        <View
                                            className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                                            style={{ backgroundColor: Colors.primary + '15' }}
                                        >
                                            <Text className="text-3xl">{merchant.logo}</Text>
                                        </View>

                                        {/* Info */}
                                        <View className="flex-1">
                                            <Text
                                                className="text-lg font-bold text-gray-900 mb-1"
                                                style={{ fontFamily: 'Lato-Bold' }}
                                            >
                                                {merchant.name}
                                            </Text>
                                            <Text
                                                className="text-sm text-gray-500 mb-2"
                                                style={{ fontFamily: 'Lato-Regular' }}
                                            >
                                                {merchant.category}
                                            </Text>
                                            {merchant.location && (
                                                <View className="flex-row items-center">
                                                    <MapPin size={14} color="#9CA3AF" />
                                                    <Text
                                                        className="text-xs text-gray-500 ml-1"
                                                        style={{ fontFamily: 'Lato-Regular' }}
                                                        numberOfLines={1}
                                                    >
                                                        {merchant.location}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Favorite Button */}
                                    <TouchableOpacity
                                        onPress={() => toggleFavorite(merchant.id)}
                                        className="p-2"
                                        activeOpacity={0.7}
                                    >
                                        <Heart
                                            size={24}
                                            color={merchant.isFavorite ? '#EF4444' : '#D1D5DB'}
                                            fill={merchant.isFavorite ? '#EF4444' : 'transparent'}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Stats */}
                                <View className="flex-row justify-between pt-4 border-t border-gray-100">
                                    <View className="flex-row items-center">
                                        <View
                                            className="w-8 h-8 rounded-full items-center justify-center mr-2"
                                            style={{ backgroundColor: Colors.secondary + '20' }}
                                        >
                                            <Trophy size={16} color={Colors.secondary} />
                                        </View>
                                        <View>
                                            <Text
                                                className="text-xs text-gray-500"
                                                style={{ fontFamily: 'Lato-Regular' }}
                                            >
                                                Retos activos
                                            </Text>
                                            <Text
                                                className="text-sm font-bold text-gray-900"
                                                style={{ fontFamily: 'Lato-Bold' }}
                                            >
                                                {merchant.activeChallenges}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center">
                                        <View
                                            className="w-8 h-8 rounded-full items-center justify-center mr-2"
                                            style={{ backgroundColor: Colors.accent1 + '20' }}
                                        >
                                            <Gift size={16} color={Colors.accent1} />
                                        </View>
                                        <View>
                                            <Text
                                                className="text-xs text-gray-500"
                                                style={{ fontFamily: 'Lato-Regular' }}
                                            >
                                                Gift Cards
                                            </Text>
                                            <Text
                                                className="text-sm font-bold text-gray-900"
                                                style={{ fontFamily: 'Lato-Bold' }}
                                            >
                                                {merchant.activeRewards}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center">
                                        <View
                                            className="w-8 h-8 rounded-full items-center justify-center mr-2"
                                            style={{ backgroundColor: Colors.primary + '20' }}
                                        >
                                            <Text
                                                className="text-xs font-bold"
                                                style={{ fontFamily: 'Lato-Bold', color: Colors.primary }}
                                            >
                                                pts
                                            </Text>
                                        </View>
                                        <View>
                                            <Text
                                                className="text-xs text-gray-500"
                                                style={{ fontFamily: 'Lato-Regular' }}
                                            >
                                                Mis puntos
                                            </Text>
                                            <Text
                                                className="text-sm font-bold text-gray-900"
                                                style={{ fontFamily: 'Lato-Bold' }}
                                            >
                                                {points}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                    );
                })}

                {filteredMerchants.length === 0 && (
                    <View className="items-center justify-center py-20">
                        <Text
                            className="text-gray-400 text-center"
                            style={{ fontFamily: 'Lato-Regular', fontSize: 16 }}
                        >
                            No se encontraron comercios
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
