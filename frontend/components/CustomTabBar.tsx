// CustomTabBar.tsx
// This component acts as the custom tab bar for Expo Router's Tabs navigator.
// It is based on your Footer.tsx design and integrates with router navigation.

import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Import useLocalSearchParams, usePathname, useRouter for navigation state
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";

// Props passed from Expo Router's Tabs component
interface CustomTabBarProps {
  // state: Represents the navigation state (routes, index of active route)
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string; // The 'name' of the Tabs.Screen (e.g., 'index', 'explore')
      params?: Record<string, any>;
    }>;
  };
  navigation: any; // The navigation object to navigate between tabs
  descriptors: any; // Information about each screen (options, etc.)
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  navigation,
  descriptors,
}) => {
  const router = useRouter(); // Use useRouter for programmatic navigation
  const pathname = usePathname(); // Get the current active path/route name

  // Helper function to dynamically apply Tailwind text color class based on active tab
  // This now checks if the current pathname matches the tab's route name
  const getIconColor = (tabName: string) =>
    pathname.startsWith(`/(tabs)/${tabName}`) ||
    pathname.startsWith(`/${tabName}`)
      ? "text-green-500"
      : "text-gray-600";

  // Helper function for the central "Add" button's background color
  const getAddButtonColor = (tabName: string) =>
    pathname.startsWith(`/(tabs)/${tabName}`) ||
    pathname.startsWith(`/${tabName}`)
      ? "bg-green-600"
      : "bg-green-500"; // Slightly darker when active

  const tabs = [
    { name: "index", icon: "🏠" }, // 'index' is usually the default tab for home
    { name: "people", icon: "👥" },
    { name: "calendar", icon: "📅" },
    { name: "add", icon: "➕", isSpecial: true }, // Mark 'add' as special for styling
    { name: "notifications", icon: "🔔" },
    { name: "settings", icon: "⚙️" },
  ];

  return (
    <SafeAreaView className="bg-white">
      <View className="flex-row justify-around items-center py-2 bg-white border-t border-gray-200 shadow-lg">
        {tabs.map((tab) => {
          // Find the corresponding route object from the navigation state
          const route = state.routes.find((r) => r.name === tab.name);
          // Get screen options to check if tab is focused for accessibility, etc.
          const { options } = descriptors[route?.key || ""] || {};
          const isFocused = state.index === state.routes.indexOf(route as any); // Check if this tab is the active one

          const onPress = () => {
            // Check if the tab is already focused
            const event = navigation.emit({
              type: "tabPress",
              target: route?.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Navigate to the tab if it's not already focused and event not prevented
              const routePath =
                tab.name === "index"
                  ? "/"
                  : `/(${ "tabs" })/${tab.name}`;
              router.push(routePath as any); // Cast as any to satisfy type
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              className="flex-1 items-center py-1"
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ||
                `Navigate to ${options.title || tab.name}`
              }
            >
              {tab.isSpecial ? (
                // Special styling for the 'add' button
                <View
                  className={`rounded-full p-2 aspect-square flex items-center justify-center ${getAddButtonColor(
                    tab.name
                  )}`}
                  style={{
                    shadowColor: "#4CAF50",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 6,
                  }}
                >
                  <Text className="text-3xl text-white">{tab.icon}</Text>
                </View>
              ) : (
                // Standard icon for other tabs
                <Text className={`text-2xl ${getIconColor(tab.name)}`}>
                  {tab.icon}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default CustomTabBar;
