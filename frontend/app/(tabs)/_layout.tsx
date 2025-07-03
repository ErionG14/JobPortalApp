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
      <Tabs.Screen name="index" options={{ title: "Home" }} />{" "}
      <Tabs.Screen name="people" options={{ title: "People" }} />{" "}
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />{" "}
      <Tabs.Screen
        name="create-post"
        options={{
          title: "Create Post",
        }}
      />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />{" "}
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />{" "}
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />{" "}
    </Tabs>
  );
}
