// frontend/app/index.tsx
// This is the content for the "Home" tab.

import React from "react";
import { View } from "react-native";
import FeedScreen from "../../components/FeedScreen"; // Adjust path if needed

export default function HomeScreen() {
  // Renamed from AppIndex as it's now a single screen
  return (
    <View className="flex-1">
      {" "}
      {/* Flex-1 to fill the space within the tab */}
      <FeedScreen />
    </View>
  );
}
