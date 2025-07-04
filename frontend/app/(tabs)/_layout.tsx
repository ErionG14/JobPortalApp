// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import CustomTabBar from "../../components/CustomTabBar";
import "../../global.css";
import {
  Home,
  Users,
  CalendarDays,
  Briefcase, // For Jobs tab
  SquarePen,
  Bell, // For Notifications tab
  Settings,
  User,
} from "lucide-react-native"; // Make sure all necessary icons are imported

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Keep headers hidden as per your current setup
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, focused }) => (
            <Home size={24} color={focused ? "#2563EB" : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: "People",
          tabBarIcon: ({ color, focused }) => (
            <Users size={24} color={focused ? "#2563EB" : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => (
            <CalendarDays size={24} color={focused ? "#2563EB" : color} />
          ),
        }}
      />
      {/* --- Jobs Screen --- */}
      <Tabs.Screen
        name="jobs" // <--- MODIFIED: Changed to lowercase 'jobs' to match jobs.tsx file
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, focused }) => (
            <Briefcase size={24} color={focused ? "#2563EB" : color} />
          ),
        }}
      />
      {/* --- END Jobs Screen --- */}
      <Tabs.Screen
        name="create-post"
        options={{
          title: "Create Post",
          tabBarIcon: ({ color, focused }) => (
            <SquarePen size={24} color={focused ? "#2563EB" : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <Bell size={24} color={focused ? "#2563EB" : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Settings size={24} color={focused ? "#2563EB" : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User size={24} color={focused ? "#2563EB" : color} />
          ),
        }}
      />
    </Tabs>
  );
}