import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { Home, Gift, User, Store, ScanLine } from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: "#9CA3AF",
                tabBarStyle: {
                    backgroundColor: "white",
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    height: 65 + (insets.bottom * 0.6),
                    paddingBottom: Math.max(insets.bottom * 0.6, 8),
                    paddingTop: 8,
                    paddingLeft: Math.max(insets.left, 0),
                    paddingRight: Math.max(insets.right, 0),
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    position: "absolute",
                },
                tabBarLabelStyle: {
                    fontFamily: "Lato-Bold",
                    fontSize: 11,
                    marginTop: 4,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, focused }) => (
                        <View
                            className={`p-2 rounded-2xl ${focused ? 'bg-purple-50' : ''}`}
                            style={{ minWidth: 56, alignItems: 'center' }}
                        >
                            <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="stores"
                options={{
                    title: "Comercios",
                    tabBarIcon: ({ color, focused }) => (
                        <View
                            className={`p-2 rounded-2xl ${focused ? 'bg-purple-50' : ''}`}
                            style={{ minWidth: 56, alignItems: 'center' }}
                        >
                            <Store size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="scanner"
                options={{
                    title: "Escanear",
                    tabBarIcon: ({ color, focused }) => (
                        <View
                            className="absolute -top-7 items-center justify-center"
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: focused ? Colors.primary : Colors.primary,
                                shadowColor: Colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8,
                            }}
                        >
                            <ScanLine size={28} color="white" strokeWidth={2.5} />
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tabs.Screen
                name="gift-cards"
                options={{
                    title: "Gift Cards",
                    tabBarIcon: ({ color, focused }) => (
                        <View
                            className={`p-2 rounded-2xl ${focused ? 'bg-purple-50' : ''}`}
                            style={{ minWidth: 56, alignItems: 'center' }}
                        >
                            <Gift size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color, focused }) => (
                        <View
                            className={`p-2 rounded-2xl ${focused ? 'bg-purple-50' : ''}`}
                            style={{ minWidth: 56, alignItems: 'center' }}
                        >
                            <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
