// CustomButton.tsx
import React from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  className?: string;
  style?: ViewStyle;
  textClassName?: string;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  className = "",
  style = {},
  textClassName = "",
  textStyle = {},
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      className={`w-full max-w-sm h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg ${className}`}
      style={{
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        className={`text-white text-lg font-semibold ${textClassName}`}
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
