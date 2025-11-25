import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, QrCode, Coffee, ShoppingBag, Book, Utensils, Trophy, ChevronRight, Sparkles, Target, AlertCircle, Gift, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { useMerchantsStore } from "@/store/merchantsStore";
import { usePointsStore } from "@/store/pointsStore";
import { useGiftCardsStore } from "@/store/giftCardsStore";
import { useChallengesStore } from "@/store/challengesStore";

export default function HomeScreen() {
    const { user } = useAuthStore();
    const { merchants } = useMerchantsStore();
    const { generalPoints, merchantPoints, getTotalPoints } = usePointsStore();
    const { getExpiringSoon } = useGiftCardsStore();
    const { getNearCompletionChallenges } = useChallengesStore();

    const userName = user?.phone ? `Usuario ${user.phone.slice(-4)}` : "Usuario";
    const favoriteMerchants = merchants.filter(m => m.isFavorite);
    const displayMerchants = favoriteMerchants.length > 0 ? favoriteMerchants.slice(0, 4) : merchants.slice(0, 4);
    const expiringSoonCards = getExpiringSoon();
    const favoriteMerchantIds = favoriteMerchants.map(m => m.id);
    const nearCompletionChallenges = getNearCompletionChallenges(favoriteMerchantIds).slice(0, 3);
    const totalPoints = getTotalPoints();

    return (
        <View className="flex-1 bg-gray-50">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 pt-4 pb-6 bg-white">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-neutral text-sm font-body mb-1">Hola,</Text>
                            <Text className="text-text text-2xl font-header">{userName}</Text>
                        </View>
                        <TouchableOpacity className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center shadow-sm">
                            <Bell size={22} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8 }}>
                    {/* Main Points Card */}
                    <View className="px-6 mb-6">
                        <LinearGradient
                            colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 24, padding: 24, overflow: 'hidden' }}
                        >
                            {/* Decorative elements */}
                            <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                            <View className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
                            <View className="absolute right-12 bottom-8 w-16 h-16 bg-white/10 rounded-full" />

                            <View className="mb-6">
                                <View className="flex-row items-center mb-2">
                                    <Sparkles size={18} color="white" />
                                    <Text className="text-white/90 text-sm font-body ml-2">Puntos Generales</Text>
                                </View>
                                <Text className="text-white text-6xl font-header leading-tight">{generalPoints}</Text>
                                <Text className="text-white/70 text-base font-body mt-1">Usables en cualquier comercio</Text>
                            </View>

                            {/* Merchant Points Carousel */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="-mx-6 px-6"
                                contentContainerStyle={{ paddingRight: 24 }}
                            >
                                {merchantPoints.sort((a, b) => b.points - a.points).map((mp) => (
                                    <TouchableOpacity
                                        key={mp.merchantId}
                                        onPress={() => router.push(`/store/${mp.merchantId}`)}
                                        className="mr-3 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                                        style={{ width: 140 }}
                                    >
                                        <Text className="text-4xl mb-2">{mp.logo}</Text>
                                        <Text className="text-white/80 text-xs font-body mb-1" numberOfLines={1}>
                                            {mp.merchantName}
                                        </Text>
                                        <Text className="text-white text-2xl font-header">{mp.points}</Text>
                                        <Text className="text-white/60 text-xs font-body">puntos</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </LinearGradient>
                    </View>

                    {/* Expiring Gift Cards Alert */}
                    {expiringSoonCards.length > 0 && (
                        <View className="px-6 mb-6">
                            <TouchableOpacity
                                onPress={() => router.push('/gift-cards')}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={['#FEF3C7', '#FDE68A']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        borderRadius: 20,
                                        padding: 16,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        shadowColor: '#F59E0B',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 12,
                                        elevation: 5,
                                    }}
                                >
                                    <View style={{
                                        width: 56,
                                        height: 56,
                                        backgroundColor: '#F59E0B',
                                        borderRadius: 16,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                    }}>
                                        <Gift size={28} color="white" strokeWidth={2.5} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            color: '#78350F',
                                            fontFamily: 'Lato-Bold',
                                            fontSize: 16,
                                            marginBottom: 2,
                                        }}>
                                            {expiringSoonCards.length} Gift Card{expiringSoonCards.length > 1 ? 's' : ''} por vencer
                                        </Text>
                                        <Text style={{
                                            color: '#92400E',
                                            fontFamily: 'Lato-Regular',
                                            fontSize: 13,
                                        }}>
                                            Úsalas antes de que expiren
                                        </Text>
                                    </View>
                                    <ChevronRight size={22} color="#78350F" strokeWidth={2.5} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* My Merchants Section */}
                    <View className="px-6 mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <Heart size={20} color={Colors.primary} />
                                <Text className="text-xl font-header text-text ml-2">Mis comercios favoritos</Text>
                            </View>
                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => router.push('/stores')}
                            >
                                <Text className="text-primary text-sm font-bold mr-1">Ver todos</Text>
                                <ChevronRight size={16} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="-mx-2"
                            contentContainerClassName="px-2"
                        >
                            {displayMerchants.map((merchant) => (
                                <TouchableOpacity
                                    key={merchant.id}
                                    className="mr-3 items-center"
                                    style={{ width: 90 }}
                                    onPress={() => router.push(`/store/${merchant.id}`)}
                                >
                                    <View
                                        className="w-20 h-20 rounded-3xl items-center justify-center shadow-md mb-3"
                                        style={{ backgroundColor: Colors.primary + '15' }}
                                    >
                                        <Text className="text-4xl">{merchant.logo}</Text>
                                    </View>
                                    <Text className="text-xs text-text font-body text-center leading-tight" numberOfLines={2}>
                                        {merchant.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Active Challenges Section */}
                    <View className="px-6 mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <Target size={20} color={Colors.primary} />
                                <Text className="text-xl font-header text-text ml-2">Retos próximos a completar</Text>
                            </View>
                        </View>

                        <View className="gap-3">
                            {nearCompletionChallenges.map((challenge) => {
                                const percentage = (challenge.currentProgress / challenge.targetProgress) * 100;
                                return (
                                    <TouchableOpacity
                                        key={challenge.id}
                                        activeOpacity={0.8}
                                        onPress={() => router.push(`/challenge/${challenge.id}`)}
                                    >
                                        <Card className="p-0 overflow-hidden border border-purple-100">
                                            <View className="flex-row items-center p-4">
                                                <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-sm" style={{ backgroundColor: Colors.secondary + '20' }}>
                                                    <Text className="text-3xl">{challenge.merchantLogo}</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <View className="flex-row justify-between items-center mb-1">
                                                        <Text className="font-header text-text text-base" numberOfLines={1} style={{ flex: 1 }}>
                                                            {challenge.title}
                                                        </Text>
                                                        <View className="bg-purple-100 px-3 py-1 rounded-full ml-2">
                                                            <Text className="text-primary font-bold text-sm">
                                                                {challenge.currentProgress}/{challenge.targetProgress}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text className="text-xs text-neutral mb-1">{challenge.merchantName}</Text>
                                                    <Text className="text-xs text-neutral mb-3" numberOfLines={1}>
                                                        {challenge.description}
                                                    </Text>
                                                    <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <LinearGradient
                                                            colors={[Colors.primary, Colors.secondary]}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={{ width: `${percentage}%`, height: "100%", borderRadius: 999 }}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        </Card>
                                    </TouchableOpacity>
                                );
                            })}

                            {nearCompletionChallenges.length === 0 && (
                                <View className="py-8 items-center">
                                    <Text className="text-gray-400 text-center" style={{ fontFamily: 'Lato-Regular' }}>
                                        No tienes retos próximos a completar
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="h-20" />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
