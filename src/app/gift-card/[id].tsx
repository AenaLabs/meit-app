import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Share2, Copy, Clock, CheckCircle2, XCircle, AlertCircle, QrCode, X } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { useGiftCardsStore } from '@/store/giftCardsStore';
import { Colors } from '@/constants/Colors';

export default function GiftCardDetailScreen() {
    const { id } = useLocalSearchParams();
    const { getGiftCardById } = useGiftCardsStore();
    const giftCard = getGiftCardById(id as string);
    const [showQRCode, setShowQRCode] = useState(false);

    if (!giftCard) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <Text className="text-gray-500" style={{ fontFamily: 'Lato-Regular' }}>
                    Gift card no encontrada
                </Text>
            </SafeAreaView>
        );
    }

    const handleCopyCode = async () => {
        await Clipboard.setStringAsync(giftCard.code);
        Alert.alert('Copiado', 'El código ha sido copiado al portapapeles');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Gift Card de ${giftCard.merchantName}\nCódigo: ${giftCard.code}\nValor: $${giftCard.currentValue}`,
                title: 'Compartir Gift Card',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const getDaysUntilExpiration = () => {
        const now = new Date();
        const expDate = new Date(giftCard.expirationDate);
        const diffTime = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysLeft = getDaysUntilExpiration();
    const isExpiringSoon = daysLeft <= 7 && giftCard.status === 'active';
    const isExpired = giftCard.status === 'expired';
    const isUsed = giftCard.status === 'used';

    const getStatusIcon = () => {
        if (isExpired) return <XCircle size={24} color="#EF4444" />;
        if (isUsed) return <CheckCircle2 size={24} color="#6B7280" />;
        if (isExpiringSoon) return <AlertCircle size={24} color="#F59E0B" />;
        return <CheckCircle2 size={24} color={Colors.secondary} />;
    };

    const getStatusText = () => {
        if (isExpired) return 'Expirada';
        if (isUsed) return 'Usada';
        if (isExpiringSoon) return `Expira en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`;
        return 'Activa';
    };

    const getStatusColor = () => {
        if (isExpired) return '#EF4444';
        if (isUsed) return '#6B7280';
        if (isExpiringSoon) return '#F59E0B';
        return Colors.secondary;
    };

    return (
        <View className="flex-1 bg-gray-50">
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="px-6 pt-4 pb-6 bg-white flex-row justify-between items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                    >
                        <ChevronLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Lato-Bold' }}>
                        Gift Card
                    </Text>
                    <TouchableOpacity
                        onPress={handleShare}
                        className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                        disabled={giftCard.status !== 'active'}
                    >
                        <Share2 size={20} color={giftCard.status === 'active' ? Colors.primary : '#D1D5DB'} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Gift Card Display */}
                    <View className="px-6 mt-6 mb-8">
                        <LinearGradient
                            colors={
                                giftCard.status === 'active'
                                    ? [Colors.primary, Colors.secondary]
                                    : ['#9CA3AF', '#6B7280']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                borderRadius: 16,
                                padding: 24,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 16,
                                elevation: 10,
                            }}
                        >
                            {/* QR Button - Top Right */}
                            {giftCard.status === 'active' && (
                                <View className="absolute top-4 right-4" style={{ zIndex: 10 }}>
                                    <TouchableOpacity
                                        onPress={() => setShowQRCode(!showQRCode)}
                                        className="bg-white/20 backdrop-blur-sm rounded-full p-3"
                                        activeOpacity={0.7}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                        }}
                                    >
                                        <QrCode size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Merchant Info */}
                            <View className="flex-row items-center mb-6">
                                <Text className="mr-3" style={{ fontSize: 48 }}>{giftCard.merchantLogo}</Text>
                                <View className="flex-1" style={{ marginRight: 8 }}>
                                    <Text
                                        className="text-white font-bold"
                                        style={{ fontFamily: 'Lato-Bold', fontSize: 20 }}
                                        numberOfLines={2}
                                    >
                                        {giftCard.merchantName}
                                    </Text>
                                    <Text
                                        className="text-white/70"
                                        style={{ fontFamily: 'Lato-Regular', fontSize: 14, marginTop: 4 }}
                                    >
                                        Gift Card
                                    </Text>
                                </View>
                            </View>

                            {/* Value Display */}
                            <View className="mb-6">
                                <Text className="text-white/70 text-sm mb-2" style={{ fontFamily: 'Lato-Regular' }}>
                                    Saldo disponible
                                </Text>
                                <Text className="text-white text-5xl font-bold" style={{ fontFamily: 'Lato-Bold' }}>
                                    ${giftCard.currentValue}
                                </Text>
                                {giftCard.currentValue < giftCard.value && (
                                    <Text className="text-white/60 text-base mt-1" style={{ fontFamily: 'Lato-Regular' }}>
                                        de ${giftCard.value} originales
                                    </Text>
                                )}
                            </View>

                            {/* Code Display */}
                            <View
                                className="bg-white/10 backdrop-blur-sm border border-white/20 flex-row items-center justify-between"
                                style={{
                                    borderRadius: 12,
                                    padding: 16,
                                }}
                            >
                                <View className="flex-1" style={{ marginRight: 12 }}>
                                    <Text
                                        className="text-white/70 mb-1"
                                        style={{ fontFamily: 'Lato-Regular', fontSize: 12 }}
                                    >
                                        Código
                                    </Text>
                                    <Text
                                        className="text-white font-bold"
                                        style={{
                                            fontFamily: 'Lato-Bold',
                                            fontSize: 18,
                                            letterSpacing: 1.5,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {giftCard.code}
                                    </Text>
                                </View>
                                {giftCard.status === 'active' && (
                                    <TouchableOpacity
                                        onPress={handleCopyCode}
                                        className="p-2"
                                        activeOpacity={0.7}
                                    >
                                        <Copy size={24} color="white" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </LinearGradient>
                    </View>


                    {/* Status Banner */}
                    <View className="px-6 mb-6">
                        <View
                            className="bg-white flex-row items-center"
                            style={{
                                borderRadius: 12,
                                padding: 16,
                                borderLeftWidth: 4,
                                borderLeftColor: getStatusColor(),
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            {getStatusIcon()}
                            <View className="ml-3 flex-1" style={{ marginRight: 8 }}>
                                <Text
                                    className="text-gray-900 font-bold"
                                    style={{ fontFamily: 'Lato-Bold', fontSize: 16 }}
                                    numberOfLines={1}
                                >
                                    {getStatusText()}
                                </Text>
                                <Text
                                    className="text-gray-600"
                                    style={{ fontFamily: 'Lato-Regular', fontSize: 14, marginTop: 2 }}
                                    numberOfLines={2}
                                >
                                    {isExpired
                                        ? 'Esta gift card ya no es válida'
                                        : isUsed
                                        ? 'Ya has usado todo el saldo'
                                        : `Válido hasta ${new Date(giftCard.expirationDate).toLocaleDateString('es-ES')}`}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Details Section */}
                    <View className="px-6">
                        <View
                            className="bg-white"
                            style={{
                                borderRadius: 16,
                                padding: 20,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <Text
                                className="text-gray-900 font-bold mb-4"
                                style={{ fontFamily: 'Lato-Bold', fontSize: 18 }}
                            >
                                Detalles
                            </Text>

                            <View className="space-y-3">
                                <View className="flex-row justify-between py-3 border-b border-gray-100">
                                    <Text
                                        className="text-gray-600 flex-1"
                                        style={{ fontFamily: 'Lato-Regular', fontSize: 14, marginRight: 8 }}
                                    >
                                        Fecha de emisión
                                    </Text>
                                    <Text
                                        className="text-gray-900 font-bold"
                                        style={{ fontFamily: 'Lato-Bold', fontSize: 14 }}
                                    >
                                        {new Date(giftCard.issuedDate).toLocaleDateString('es-ES')}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between py-3 border-b border-gray-100">
                                    <Text
                                        className="text-gray-600 flex-1"
                                        style={{ fontFamily: 'Lato-Regular', fontSize: 14, marginRight: 8 }}
                                    >
                                        Fecha de expiración
                                    </Text>
                                    <Text
                                        className="text-gray-900 font-bold"
                                        style={{ fontFamily: 'Lato-Bold', fontSize: 14 }}
                                    >
                                        {new Date(giftCard.expirationDate).toLocaleDateString('es-ES')}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between py-3 border-b border-gray-100">
                                    <Text
                                        className="text-gray-600 flex-1"
                                        style={{ fontFamily: 'Lato-Regular', fontSize: 14, marginRight: 8 }}
                                    >
                                        Valor original
                                    </Text>
                                    <Text
                                        className="text-gray-900 font-bold"
                                        style={{ fontFamily: 'Lato-Bold', fontSize: 14 }}
                                    >
                                        ${giftCard.value}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between py-3">
                                    <Text
                                        className="text-gray-600 flex-1"
                                        style={{ fontFamily: 'Lato-Regular', fontSize: 14, marginRight: 8 }}
                                    >
                                        Saldo restante
                                    </Text>
                                    <Text
                                        className="font-bold"
                                        style={{ fontFamily: 'Lato-Bold', color: Colors.secondary, fontSize: 14 }}
                                    >
                                        ${giftCard.currentValue}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Terms & Conditions */}
                    {giftCard.terms && (
                        <View className="px-6 mt-6">
                            <View
                                className="bg-gray-100"
                                style={{
                                    borderRadius: 12,
                                    padding: 16,
                                }}
                            >
                                <Text
                                    className="text-gray-900 font-bold mb-2"
                                    style={{ fontFamily: 'Lato-Bold', fontSize: 14 }}
                                >
                                    Términos y condiciones
                                </Text>
                                <Text
                                    className="text-gray-600"
                                    style={{ fontFamily: 'Lato-Regular', fontSize: 12, lineHeight: 18 }}
                                >
                                    {giftCard.terms}
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* QR Code Modal */}
            <Modal
                visible={showQRCode}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowQRCode(false)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center items-center"
                    style={{ padding: 20 }}
                    onPress={() => setShowQRCode(false)}
                >
                    <Pressable
                        className="bg-white items-center"
                        style={{
                            borderRadius: 20,
                            padding: 32,
                            maxWidth: 400,
                            width: '100%',
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => setShowQRCode(false)}
                            className="absolute top-4 right-4 bg-gray-100 rounded-full p-2"
                            activeOpacity={0.7}
                        >
                            <X size={20} color="#374151" />
                        </TouchableOpacity>

                        {/* Modal Content */}
                        <Text
                            className="text-gray-900 font-bold mb-2"
                            style={{ fontFamily: 'Lato-Bold', fontSize: 24 }}
                        >
                            {giftCard.merchantName}
                        </Text>

                        <Text
                            className="text-gray-600 mb-6"
                            style={{ fontFamily: 'Lato-Regular', fontSize: 14 }}
                        >
                            Escanea para usar
                        </Text>

                        <View
                            className="bg-white items-center justify-center mb-6"
                            style={{
                                padding: 20,
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor: '#F3F4F6',
                            }}
                        >
                            <QRCode
                                value={giftCard.code}
                                size={240}
                                backgroundColor="white"
                                color={Colors.primary}
                            />
                        </View>

                        <View className="bg-gray-50 rounded-xl p-4 w-full mb-4">
                            <Text
                                className="text-gray-600 text-center mb-1"
                                style={{ fontFamily: 'Lato-Regular', fontSize: 12 }}
                            >
                                Código
                            </Text>
                            <Text
                                className="text-gray-900 font-bold text-center"
                                style={{
                                    fontFamily: 'Lato-Bold',
                                    fontSize: 16,
                                    letterSpacing: 2,
                                }}
                            >
                                {giftCard.code}
                            </Text>
                        </View>

                        <Text
                            className="text-gray-500 text-center"
                            style={{ fontFamily: 'Lato-Regular', fontSize: 13, lineHeight: 20 }}
                        >
                            Muestra este código QR en el comercio para canjear tu gift card
                        </Text>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
