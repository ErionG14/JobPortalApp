// CustomDrawerContent.tsx
import React from "react";
import { View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, LogIn, Settings, Info, Home } from "lucide-react-native";

interface CustomDrawerContentProps extends DrawerContentComponentProps {}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        {/* Drawer Header/User Info Section */}
        <View className="p-5 border-b border-gray-200 mb-4 bg-blue-50">
          <View className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center mb-2">
            <User size={40} color="#3B82F6" />
          </View>
          <Text className="text-xl font-bold text-gray-800">Welcome User!</Text>
          <Text className="text-sm text-gray-600">user@example.com</Text>
        </View>

        {/* Custom Navigation Items */}
        <TouchableOpacity
          className="flex-row items-center px-5 py-3 border-b border-gray-100"
          onPress={() => navigateTo("/")}
        >
          <Home size={20} color="#6B7280" className="mr-4" />
          <Text className="text-lg text-gray-700">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center px-5 py-3 border-b border-gray-100"
          onPress={() => navigateTo("/login")}
        >
          <LogIn size={20} color="#6B7280" className="mr-4" />
          <Text className="text-lg text-gray-700">Login / Sign Up</Text>
        </TouchableOpacity>

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
      </SafeAreaView>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;