// CustomTabBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { usePathname, useRouter } from "expo-router";

import {
  Home,
  Search,
  Plus,
  Bell,
  User,
} from "lucide-react-native";

type CustomTabBarProps = BottomTabBarProps;

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  navigation,
  descriptors,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "index", Icon: Home, isSpecial: false },
    { name: "search", Icon: Search, isSpecial: false },
    { name: "create-post", Icon: Plus, isSpecial: true },
    { name: "notifications", Icon: Bell, isSpecial: false },
    { name: "profile", Icon: User, isSpecial: false }, // <--- Confirm name is "profile" and Icon is User
  ];

  const getIconColor = (tabName: string) => {
    const route = state.routes.find((r) => r.name === tabName);
    const isFocused = state.index === state.routes.indexOf(route as any);
    return isFocused ? "#9CA3AF" : "#9CA3AF";
  };

  const getAddButtonColor = (tabName: string) => {
    const route = state.routes.find((r) => r.name === tabName);
    const isFocused = state.index === state.routes.indexOf(route as any);
    return isFocused ? "bg-blue-600" : "bg-blue-500";
  };

  return (
    <SafeAreaView className="bg-white">
      <View className="flex-row justify-around items-center py-2 bg-white border-t border-gray-200 shadow-lg">
        {tabs.map((tab) => {
          const route = state.routes.find((r) => r.name === tab.name);
          const descriptor = descriptors[route?.key || ""];
          const options = descriptor?.options || {};
          const isFocused = state.index === state.routes.indexOf(route as any);

          const onPress = () => {
            if (tab.isSpecial) {
              navigation.navigate(tab.name as any);
              return;
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route?.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              const routePath =
                tab.name === "index" ? "/" : `/(tabs)/${tab.name}`;
              router.push(routePath as any);
            }
          };

          const TabIcon = tab.Icon;

          return (
            <TouchableOpacity
              key={tab.name}
              className="flex-1 items-center py-1"
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={
                options.tabBarAccessibilityLabel ||
                options.title ||
                `Navigate to ${tab.name}`
              }
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              {tab.isSpecial ? (
                <View
                  className={`rounded-full p-3 aspect-square flex items-center justify-center ${getAddButtonColor(
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
                  <TabIcon size={28} color="white" strokeWidth={3} />
                </View>
              ) : (
                <TabIcon size={24} color={getIconColor(tab.name)} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default CustomTabBar;