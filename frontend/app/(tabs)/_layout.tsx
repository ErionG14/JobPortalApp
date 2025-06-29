// app/(tabs)/_layout.tsx
// This file configures the tab navigation for your app,
// using a custom tab bar component (CustomTabBar.tsx).

import { Tabs } from "expo-router";
import React from "react";
// Import your custom tab bar component
import CustomTabBar from "../../components/CustomTabBar"; // Adjust path if needed

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hide the default header for all tab screens
        // IMPORTANT: Use the 'tabBar' prop to render your custom component
        // This will override the default tab bar provided by Expo Router.
        tabBar: (props) => <CustomTabBar {...props} />,
        // You can remove all other tabBar* styles here (tabBarActiveTintColor, tabBarStyle etc.)
        // as your CustomTabBar will handle its own styling.
      }}
    >
      {/* Define all your Tabs.Screen entries here.
          The 'name' property should match the file name in the app/(tabs) directory
          (e.g., 'index.tsx' for 'index', 'people.tsx' for 'people').
          You don't need 'tabBarIcon' or 'title' here, as CustomTabBar handles icons/labels. */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />{" "}
      {/* Corresponds to app/(tabs)/index.tsx */}
      <Tabs.Screen name="people" options={{ title: "People" }} />{" "}
      {/* Corresponds to app/(tabs)/people.tsx */}
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />{" "}
      {/* Corresponds to app/(tabs)/calendar.tsx */}
      <Tabs.Screen name="add" options={{ title: "Add" }} />{" "}
      {/* Corresponds to app/(tabs)/add.tsx */}
      <Tabs.Screen
        name="notifications"
        options={{ title: "Notifications" }}
      />{" "}
      {/* Corresponds to app/(tabs)/notifications.tsx */}
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />{" "}
      {/* Corresponds to app/(tabs)/settings.tsx */}
      {/* The 'explore' screen you had previously. You can keep it if needed
          and create app/(tabs)/explore.tsx, or remove it if not used. */}
      {/* <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
