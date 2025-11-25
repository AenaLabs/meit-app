import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
    variant?: "default" | "elevated";
}

export function Card({ children, variant = "default", className, ...props }: CardProps) {
    const baseStyle = "bg-white rounded-xl p-4";
    const variants = {
        default: "border border-gray-100",
        elevated: "shadow-sm",
    };

    return (
        <View className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </View>
    );
}
