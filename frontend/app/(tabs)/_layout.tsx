// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import CustomTabBar from "../../components/CustomTabBar";
import "../../global.css";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* Ensure ALL these Tabs.Screen entries have an options prop */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="people" options={{ title: "People" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="add" options={{ title: "Add" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
