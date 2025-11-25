import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from "react-native";


interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: "primary" | "secondary" | "outline";
    loading?: boolean;
}

export function Button({ title, variant = "primary", loading, className, ...props }: ButtonProps) {
    const baseStyle = "p-4 rounded-xl items-center justify-center";
    const variants = {
        primary: "bg-primary",
        secondary: "bg-secondary",
        outline: "bg-transparent border-2 border-primary",
    };

    const textStyles = {
        primary: "text-white font-bold text-lg",
        secondary: "text-primary font-bold text-lg",
        outline: "text-primary font-bold text-lg",
    };

    return (
        <TouchableOpacity
            className={`${baseStyle} ${variants[variant]} ${loading ? "opacity-70" : ""} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === "outline" ? "#812797" : "white"} />
            ) : (
                <Text className={textStyles[variant]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
