// frontend/components/CustomDrawerContent.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Image, // <--- Import Image component
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, LogIn, Settings, Info, Home, LogOut } from "lucide-react-native";

import { useAuth } from "../context/AuthContext";

interface CustomDrawerContentProps extends DrawerContentComponentProps {}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  // --- ADD THIS CONSOLE.LOG ---
  console.log("User object in CustomDrawerContent:", user);
  // --- END CONSOLE.LOG ---

  const navigateTo = (path: string) => {
    props.navigation.closeDrawer();
    router.push(path as any);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  // Show loading indicator or handle initial state if user is still loading
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading user data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <DrawerContentScrollView {...props} className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        {/* Drawer Header/User Info Section */}
        <View className="p-5 border-b border-gray-200 mb-4 bg-blue-50">
          {/* Conditional rendering for Profile Image/Icon */}
          {user && user.image ? ( // <--- Check if user is logged in AND has an image
            <Image
              source={{ uri: user.image }}
              className="w-20 h-20 rounded-full mr-2 mb-2" // <--- Same size and styling as placeholder
              resizeMode="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center mb-2">
              <User size={40} color="#3B82F6" /> {/* Generic user icon */}
            </View>
          )}
          {user ? (
            <>
              <Text className="text-xl font-bold text-gray-800">
                Welcome {user.name}!
              </Text>
              <Text className="text-sm text-gray-600">{user.email}</Text>
            </>
          ) : (
            <>
              <Text className="text-xl font-bold text-gray-800">
                Welcome Guest!
              </Text>
              <Text className="text-sm text-gray-600">Please log in</Text>
            </>
          )}
        </View>

        {/* Custom Navigation Items */}
        <TouchableOpacity
          className="flex-row items-center px-5 py-3 border-b border-gray-100"
          onPress={() => navigateTo("/")}
        >
          <Home size={20} color="#6B7280" className="mr-4" />
          <Text className="text-lg text-gray-700">Home</Text>
        </TouchableOpacity>

        {!user && (
          <TouchableOpacity
            className="flex-row items-center px-5 py-3 border-b border-gray-100"
            onPress={() => navigateTo("/login")}
          >
            <LogIn size={20} color="#6B7280" className="mr-4" />
            <Text className="text-lg text-gray-700">Login / Sign Up</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="flex-row items-center px-5 py-3 border-b border-gray-100"
          onPress={() => Alert.alert("Settings", "Navigate to settings screen")}
        >
          <Settings size={20} color="#6B7280" className="mr-4" />
          <Text className="text-lg text-gray-700">Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center px-5 py-3 border-b border-gray-100"
          onPress={() => Alert.alert("About", "This is the Job Portal App.")}
        >
          <Info size={20} color="#6B7280" className="mr-4" />
          <Text className="text-lg text-gray-700">About</Text>
        </TouchableOpacity>

        {user && (
          <TouchableOpacity
            className="flex-row items-center px-5 py-3 border-b border-gray-100 mt-4 bg-red-50"
            onPress={handleLogout}
          >
            <LogOut size={20} color="#EF4444" className="mr-4" />
            <Text className="text-lg text-red-600 font-semibold">Log Out</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;