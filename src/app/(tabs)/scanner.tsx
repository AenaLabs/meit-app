import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Flashlight, FlashlightOff } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    // Activar/desactivar cámara cuando la pantalla está enfocada/desenfocada
    useFocusEffect(
        React.useCallback(() => {
            // Cuando la pantalla se enfoca, activar la cámara
            setIsCameraActive(true);

            // Cuando la pantalla se desenfoca, desactivar la cámara
            return () => {
                setIsCameraActive(false);
                setFlashOn(false); // Apagar flash al salir
            };
        }, [])
    );

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);

        // Parse QR code data
        // Expected formats:
        // - "meit://business/ID" for business registration (NEW - from app QR)
        // - "merchant:ID" for merchant registration (legacy)
        // - "transaction:MERCHANT_ID:AMOUNT" for point transactions

        // New format: meit://business/{businessSettingsId}
        if (data.startsWith('meit://business/')) {
            const businessSettingsId = data.replace('meit://business/', '');
            // Validar que sea un número
            if (isNaN(parseInt(businessSettingsId))) {
                Alert.alert(
                    'Código QR no válido',
                    'El código escaneado no contiene un ID de comercio válido',
                    [{ text: 'OK', onPress: () => setScanned(false) }]
                );
                return;
            }
            // Navegar a pantalla de registro (replace para no apilar)
            setScanned(false);
            router.replace(`/register-business/${businessSettingsId}`);
        }
        // Legacy format: merchant:{id}
        else if (data.startsWith('merchant:')) {
            const merchantId = data.replace('merchant:', '');
            Alert.alert(
                'Comercio Detectado',
                '¿Deseas registrarte en este comercio?',
                [
                    {
                        text: 'Cancelar',
                        onPress: () => setScanned(false),
                        style: 'cancel',
                    },
                    {
                        text: 'Registrar',
                        onPress: () => {
                            // Navigate to merchant detail
                            router.push(`/store/${merchantId}`);
                            setScanned(false);
                        },
                    },
                ]
            );
        } else if (data.startsWith('transaction:')) {
            const parts = data.split(':');
            const merchantId = parts[1];
            const amount = parts[2];

            Alert.alert(
                'Transacción Detectada',
                `Se agregarán ${amount} puntos a tu cuenta`,
                [
                    {
                        text: 'Cancelar',
                        onPress: () => setScanned(false),
                        style: 'cancel',
                    },
                    {
                        text: 'Confirmar',
                        onPress: () => {
                            // Add points logic here
                            Alert.alert('¡Éxito!', `Se agregaron ${amount} puntos`, [
                                {
                                    text: 'OK',
                                    onPress: () => setScanned(false),
                                },
                            ]);
                        },
                    },
                ]
            );
        } else {
            Alert.alert(
                'Código QR no válido',
                'El código escaneado no es reconocido por la aplicación',
                [
                    {
                        text: 'OK',
                        onPress: () => setScanned(false),
                    },
                ]
            );
        }
    };

    if (!permission) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <Text className="text-white" style={{ fontFamily: 'Lato-Regular' }}>
                    Cargando cámara...
                </Text>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center px-6">
                <Text
                    className="text-white text-center text-xl mb-6"
                    style={{ fontFamily: 'Lato-Bold' }}
                >
                    Permiso de cámara requerido
                </Text>
                <Text
                    className="text-gray-400 text-center mb-8"
                    style={{ fontFamily: 'Lato-Regular' }}
                >
                    Necesitamos acceso a tu cámara para escanear códigos QR de comercios y transacciones.
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-purple-600 px-8 py-4 rounded-2xl"
                    activeOpacity={0.8}
                >
                    <Text
                        className="text-white text-center font-bold"
                        style={{ fontFamily: 'Lato-Bold' }}
                    >
                        Permitir acceso
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-gray-900">
            {isCameraActive && (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    enableTorch={flashOn}
                />
            )}

            {/* Overlay UI - positioned absolutely on top of camera */}
            <SafeAreaView style={StyleSheet.absoluteFillObject} edges={['top']} pointerEvents="box-none">
                {/* Header */}
                <View className="px-6 pt-4" pointerEvents="box-none">
                    <View className="flex-row justify-between items-center">
                        <Text
                            className="text-white text-2xl font-bold"
                            style={{ fontFamily: 'Lato-Bold' }}
                        >
                            Escanear QR
                        </Text>
                        <TouchableOpacity
                            onPress={() => setFlashOn(!flashOn)}
                            className="bg-white/20 p-3 rounded-full"
                            activeOpacity={0.7}
                        >
                            {flashOn ? (
                                <FlashlightOff size={24} color="white" />
                            ) : (
                                <Flashlight size={24} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Scanner Frame */}
                <View className="flex-1 items-center justify-center px-6" pointerEvents="none">
                    <View className="relative">
                        {/* Scanner Frame */}
                        <View
                            className="border-4 border-white rounded-3xl"
                            style={{
                                width: 280,
                                height: 280,
                            }}
                        >
                            {/* Corner Decorations */}
                            <View className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 rounded-tl-3xl" style={{ borderColor: Colors.secondary }} />
                            <View className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 rounded-tr-3xl" style={{ borderColor: Colors.secondary }} />
                            <View className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 rounded-bl-3xl" style={{ borderColor: Colors.secondary }} />
                            <View className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 rounded-br-3xl" style={{ borderColor: Colors.secondary }} />
                        </View>
                    </View>

                    <Text
                        className="text-white text-center mt-8 px-6"
                        style={{ fontFamily: 'Lato-Regular', fontSize: 16 }}
                    >
                        Apunta la cámara al código QR
                    </Text>
                    <Text
                        className="text-gray-400 text-center mt-2 px-6"
                        style={{ fontFamily: 'Lato-Regular', fontSize: 14 }}
                    >
                        Se escaneará automáticamente
                    </Text>
                </View>

                {/* Instructions */}
                <View className="px-6 pb-8" pointerEvents="none">
                    <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
                        <Text
                            className="text-white font-bold mb-3"
                            style={{ fontFamily: 'Lato-Bold', fontSize: 16 }}
                        >
                            ¿Qué puedes escanear?
                        </Text>
                        <View className="space-y-2">
                            <View className="flex-row items-start mb-2">
                                <View
                                    className="w-2 h-2 rounded-full mt-2 mr-3"
                                    style={{ backgroundColor: Colors.secondary }}
                                />
                                <Text
                                    className="text-gray-200 flex-1"
                                    style={{ fontFamily: 'Lato-Regular', fontSize: 14 }}
                                >
                                    QR de comercios para registrarte
                                </Text>
                            </View>
                            <View className="flex-row items-start">
                                <View
                                    className="w-2 h-2 rounded-full mt-2 mr-3"
                                    style={{ backgroundColor: Colors.secondary }}
                                />
                                <Text
                                    className="text-gray-200 flex-1"
                                    style={{ fontFamily: 'Lato-Regular', fontSize: 14 }}
                                >
                                    QR de transacciones para acumular puntos
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
