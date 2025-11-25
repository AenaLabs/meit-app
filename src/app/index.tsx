import { View, Text } from "react-native";

export default function Home() {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-2xl font-bold text-primary">Welcome to Meit!</Text>
            <Text className="text-neutral mt-2">Mobile App</Text>
        </View>
    );
}
