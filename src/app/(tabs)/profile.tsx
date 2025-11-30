import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Settings, CreditCard, HelpCircle, LogOut, ChevronRight, Bell, Shield, FileText, Gift, Award } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { usePointsStore } from "@/store/pointsStore";
import { useGiftCardsStore } from "@/store/giftCardsStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function ProfileScreen() {
    const { customer, signOut } = useAuthStore();
    const { lifetimePoints, generalPoints, merchantPoints, isInitialized: pointsInitialized, loadPoints, refreshPoints } = usePointsStore();
    const { giftCards, isInitialized: giftCardsInitialized, loadGiftCards, refreshGiftCards } = useGiftCardsStore();
    const router = useRouter();

    // Cargar datos cuando hay un customer - SIEMPRE recargar para obtener datos frescos
    useEffect(() => {
        if (customer?.id) {
            console.log('🔄 ProfileScreen: Cargando datos del customer:', customer.id);
            console.log('📊 Customer data:', {
                total_points: customer.total_points,
                lifetime_points: customer.lifetime_points,
                visits_count: customer.visits_count
            });

            // Recargar datos en cada visita para asegurar que estén actualizados
            refreshPoints(customer.id);
            refreshGiftCards(customer.id);
        }
    }, [customer?.id]);

    const handleSignOut = async () => {
        await signOut();
        router.replace("/auth/login");
    };

    // Calcular puntos acumulados HISTÓRICOS desde customer_businesses (merchantPoints)
    // Usamos lifetimePoints porque representa todos los puntos ganados, no solo los disponibles
    const totalLifetimePointsFromBusinesses = merchantPoints.reduce((sum, mp) => sum + mp.lifetimePoints, 0);

    // Contar todas las gift cards (no solo activas)
    const totalGiftCardsCount = giftCards.length;

    // Nota: Las visitas se manejan a nivel de customers.visits_count
    // Este campo SÍ se actualiza cuando se registra una visita
    const totalVisits = customer?.visits_count || 0;

    console.log('📈 ProfileScreen render:', {
        lifetimePoints,
        generalPoints,
        totalLifetimePointsFromBusinesses,
        totalGiftCardsCount,
        giftCardsTotal: giftCards.length,
        totalVisits,
        merchantPointsCount: merchantPoints.length,
        merchantPointsDetails: merchantPoints.map(mp => ({
            name: mp.merchantName,
            points: mp.points,
            lifetime: mp.lifetimePoints
        }))
    });

    const stats = [
        { label: "Puntos acumulados", value: totalLifetimePointsFromBusinesses.toLocaleString(), icon: Award },
        { label: "Gift Cards", value: totalGiftCardsCount.toString(), icon: Gift },
        { label: "Visitas", value: totalVisits.toString(), icon: CreditCard },
    ];

    const menuSections = [
        {
            title: "Cuenta",
            items: [
                { icon: User, label: "Editar Perfil", color: "#8B5CF6", bgColor: "#F3E8FF" },
                { icon: Bell, label: "Notificaciones", color: "#F59E0B", bgColor: "#FEF3C7" },
            ]
        },
        {
            title: "Preferencias",
            items: [
                { icon: Settings, label: "Configuración", color: "#10B981", bgColor: "#D1FAE5" },
                { icon: Shield, label: "Privacidad y Seguridad", color: "#6366F1", bgColor: "#E0E7FF" },
                { icon: FileText, label: "Términos y Condiciones", color: "#8B5CF6", bgColor: "#F3E8FF" },
            ]
        },
        {
            title: "Soporte",
            items: [
                { icon: HelpCircle, label: "Ayuda y Soporte", color: "#EC4899", bgColor: "#FCE7F3" },
            ]
        }
    ];

    const userName = customer?.name || "Usuario";
    const memberSince = customer?.created_at
        ? new Date(customer.created_at).getFullYear().toString()
        : new Date().getFullYear().toString();

    return (
        <View className="flex-1 bg-gray-50">
            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Header Profile */}
                    <LinearGradient
                        colors={["#8B5CF6", "#7C3AED"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ paddingTop: 24, paddingBottom: 32, paddingHorizontal: 24 }}
                    >
                        <View className="items-center">
                            <View className="w-28 h-28 bg-white rounded-full items-center justify-center mb-4 shadow-xl">
                                <User size={48} color={Colors.primary} />
                            </View>
                            <Text className="text-white text-2xl font-header mb-1">{userName}</Text>
                            <Text className="text-white/80 text-sm font-body">Miembro desde {memberSince}</Text>
                        </View>

                        {/* Stats Cards */}
                        <View className="flex-row gap-3" style={{ marginTop: 24 }}>
                            {stats.map((stat, index) => (
                                <View
                                    key={index}
                                    className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30"
                                    style={{
                                        borderRadius: 16,
                                        padding: 16,
                                    }}
                                >
                                    <stat.icon size={20} color="white" className="mb-2" />
                                    <Text className="text-white text-2xl font-header mb-1">{stat.value}</Text>
                                    <Text className="text-white/70 text-xs font-body">{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </LinearGradient>

                    {/* Menu Sections */}
                    <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
                        {menuSections.map((section, sectionIndex) => (
                            <View key={sectionIndex} style={{ marginBottom: 24 }}>
                                <Text
                                    className="text-text font-header mb-3"
                                    style={{ fontSize: 18, fontWeight: 'bold' }}
                                >
                                    {section.title}
                                </Text>
                                <View
                                    className="bg-white overflow-hidden shadow-sm"
                                    style={{ borderRadius: 16 }}
                                >
                                    {section.items.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            className={`flex-row items-center ${index !== section.items.length - 1 ? 'border-b border-gray-50' : ''
                                                }`}
                                            style={{ padding: 16 }}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                className="items-center justify-center mr-4"
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 12,
                                                    backgroundColor: item.bgColor,
                                                }}
                                            >
                                                <item.icon size={22} color={item.color} />
                                            </View>
                                            <Text className="flex-1 text-text font-body text-base">
                                                {item.label}
                                            </Text>
                                            <ChevronRight size={20} color={Colors.neutral} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}

                        {/* Logout Button */}
                        <TouchableOpacity
                            className="flex-row items-center bg-white shadow-sm"
                            style={{
                                padding: 16,
                                borderRadius: 16,
                                marginBottom: 40,
                            }}
                            onPress={handleSignOut}
                            activeOpacity={0.7}
                        >
                            <View
                                className="bg-red-50 items-center justify-center mr-4"
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                }}
                            >
                                <LogOut size={22} color="#ef4444" />
                            </View>
                            <Text className="flex-1 text-red-500 font-bold text-base">
                                Cerrar Sesión
                            </Text>
                            <ChevronRight size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
