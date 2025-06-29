// Header.tsx
import React from "react";
import { View, Text, Platform, StatusBar } from "react-native";
// Ensure react-native-safe-area-context is installed as it's used here
import { SafeAreaView } from "react-native-safe-area-context";


interface HeaderProps {
  title?: string;
  showHamburger?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = "Feed",
  showHamburger = true,
}) => {
  return (
    <SafeAreaView
      className="bg-white border-b border-gray-200 shadow-sm"
      style={
        Platform.OS === "android"
          ? { paddingTop: StatusBar.currentHeight || 0 }
          : {}
      }
    >
      {/* StatusBar for overall app status bar appearance. Color set directly for consistency. */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View
        className="flex-row justify-between items-center px-5 py-4" // Tailwind classes for layout and padding
      >
        {showHamburger && (
          // Tailwind classes for font size and color
          <Text className="text-2xl text-gray-800">☰</Text>
        )}{" "}
        {/* Tailwind classes for font size, weight, and color */}
        <Text className="text-xl font-bold text-gray-800">{title}</Text>{" "}
        {/* Tailwind class for width (24px) to balance layout */}
        <View className="w-6" />
      </View>
    </SafeAreaView>
  );
};

export default Header;
