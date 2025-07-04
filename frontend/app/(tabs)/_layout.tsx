// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import CustomTabBar from "../../components/CustomTabBar";
import "../../global.css";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Keep headers hidden as per your current setup
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Feed" }} />{" "}
      {/* Changed title to Feed for clarity if it's your main feed */}
      {/* Existing tabs, adjust or remove as needed based on your app's final structure */}
      <Tabs.Screen name="people" options={{ title: "People" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      {/* --- NEW: Jobs Screen --- */}
      <Tabs.Screen
        name="Jobs" // This MUST match the 'name' in CustomTabBar for the Jobs tab
        options={{
          title: "Jobs", // Title for the tab (if shown, though CustomTabBar overrides)
        }}
      />
      {/* --- END NEW --- */}
      <Tabs.Screen
        name="create-post"
        options={{
          title: "Create Post",
        }}
      />
      <Tabs.Screen name="notifications" options={{ title: "Notifications" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}