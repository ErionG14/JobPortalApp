import React from "react";
import { View } from "react-native";
import FeedScreen from "../../components/FeedScreen";

export default function HomeScreen() {
  return (
    <View className="flex-1">
      <FeedScreen />
    </View>
  );
}