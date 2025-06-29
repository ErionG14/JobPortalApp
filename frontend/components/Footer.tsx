// Footer.tsx
// This component implements the bottom navigation bar, now using Tailwind CSS classes.

import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
// Ensure react-native-safe-area-context is installed
import { SafeAreaView } from "react-native-safe-area-context";

// Define props interface for TypeScript
interface FooterProps {} // Currently no props, but good practice to have

const Footer: React.FC<FooterProps> = () => {
  // In a real app, you'd manage active state using React Navigation or a global state manager
  const [activeTab, setActiveTab] = React.useState("home");

  // Helper function to dynamically apply Tailwind text color class based on active tab
  const getIconColor = (tabName: string) =>
    activeTab === tabName ? "text-green-500" : "text-gray-600";

  // Helper function for the central "Add" button's background color
  const getAddButtonColor = (tabName: string) =>
    activeTab === tabName ? "bg-green-600" : "bg-green-500";

  return (
    <SafeAreaView className="bg-white">
      <View
        className="flex-row justify-around items-center py-2 bg-white border-t border-gray-200 shadow-lg"
      >
        {/* Home Icon Button */}
        <TouchableOpacity
          className="flex-1 items-center py-1"
          onPress={() => setActiveTab("home")}
        >
          {/* Dynamically apply Tailwind text color */}
          <Text className={`text-2xl ${getIconColor("home")}`}>🏠</Text>
        </TouchableOpacity>

        {/* People Icon Button */}
        <TouchableOpacity
          className="flex-1 items-center py-1"
          onPress={() => setActiveTab("people")}
        >
          <Text className={`text-2xl ${getIconColor("people")}`}>👥</Text>
        </TouchableOpacity>

        {/* Calendar Icon Button */}
        <TouchableOpacity
          className="flex-1 items-center py-1"
          onPress={() => setActiveTab("calendar")}
        >
          <Text className={`text-2xl ${getIconColor("calendar")}`}>📅</Text>
        </TouchableOpacity>

        {/* Central Add Button - styled more prominently */}
        <TouchableOpacity
          className="flex-1 items-center py-1"
          onPress={() => setActiveTab("add")}
        >
          <View
            className={`rounded-full p-2 aspect-square flex items-center justify-center ${getAddButtonColor(
              "add"
            )}`}
            style={{
              shadowColor: "#4CAF50",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <Text className="text-3xl text-white">➕</Text>
          </View>
        </TouchableOpacity>

        {/* Notifications Icon Button */}
        <TouchableOpacity
          className="flex-1 items-center py-1"
          onPress={() => setActiveTab("notifications")}
        >
          <Text className={`text-2xl ${getIconColor("notifications")}`}>
            🔔
          </Text>
        </TouchableOpacity>

        {/* Settings Icon Button */}
        <TouchableOpacity
          className="flex-1 items-center py-1"
          onPress={() => setActiveTab("settings")}
        >
          <Text className={`text-2xl ${getIconColor("settings")}`}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// The StyleSheet.create block for the Footer component is removed,
// as all styles are now applied directly via className props using Tailwind CSS.
// If this file contained other components that still used StyleSheet, their styles would remain.

export default Footer;
