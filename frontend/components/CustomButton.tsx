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
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  className = "",
  style = {},
  textClassName = "",
  textStyle = {},
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
        ...style,
      }}
      onPress={onPress}
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
