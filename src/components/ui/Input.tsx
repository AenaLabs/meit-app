import { TextInput, View, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <View className="mb-4">
            {label && <Text className="text-sm text-neutral mb-2 font-body">{label}</Text>}
            <TextInput
                className={`bg-gray-100 p-4 rounded-xl font-body text-lg ${error ? "border border-red-500" : ""} ${className}`}
                placeholderTextColor="#999"
                {...props}
            />
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
    );
}
