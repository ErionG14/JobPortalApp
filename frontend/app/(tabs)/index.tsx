import React from "react";
import { View } from "react-native";
import FeedScreen from "../../components/FeedScreen";
import Header from "@/components/Header";

export default function HomeScreen() {
  return (
    <View className="flex-1">
      {" "}
      <Header />
      <FeedScreen />
    </View>
  );
}
