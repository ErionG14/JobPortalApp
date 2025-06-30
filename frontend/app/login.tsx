// frontend/app/login.tsx
// This component displays a login form with input fields, a "Don't have an account?" link,
// a login button, and a profile icon placeholder at the top, styled with Tailwind CSS.
// This file is now directly in the `app/` directory for Expo Router file-based routing.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert, // Note: For production, consider replacing Alert with a custom modal UI.
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // Import useRouter for navigation

// Import the User icon from Lucide React Native for the profile placeholder
import { User } from "lucide-react-native";

// Import your new CustomButton component
import CustomButton from "../components/CustomButton"; // Adjust path if needed

// Define props interface for TypeScript (optional for simple screens)
interface LoginScreenProps {}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Initialize router for navigation

  const handleLogin = () => {
    if (email === "" || password === "") {
      Alert.alert("Login Error", "Please enter both email and password.");
      return;
    }
    console.log("Attempting login with:", { email, password });
    Alert.alert("Login Success", "You are now logged in!");
    // In a real app, you would navigate to the main app after successful login:
    // router.replace('/(tabs)'); // Replace current screen with the tabs navigator
  };

  const navigateToSignUp = () => {
    router.push("/signup"); // Navigate to the new /signup route
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white p-6">
      {/* Profile Icon Circle (Sketch's top circle) */}
      <View
        className="
          w-24 h-24 rounded-full border-2 border-gray-400
          flex items-center justify-center mb-8
          bg-gray-100"
      >
        <User size={60} color="#6B7280" strokeWidth={1.5} />
      </View>

      {/* Email Input Field */}
      <TextInput
        className="
          w-80 h-12 px-4
          border border-gray-300 rounded-md mb-4
          text-base text-gray-800
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder="example@email.com"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input Field */}
      <TextInput
        className="
          w-80 h-12 px-4
          border border-gray-300 rounded-md mb-6 // <--- Increased mb-4 to mb-6 for more space below password
          text-base text-gray-800
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button (Using the new CustomButton component) */}
      {/* Moved this ABOVE the "Don't have an account?" link */}
      <CustomButton
        title="Log in"
        onPress={handleLogin}
        className="mb-6" // <--- Added mb-6 for space below the button and above the new link
      />

      {/* "Don't have an account? Sign in" Link */}
      {/* This replaces the "Forgot password?" link */}
      <TouchableOpacity
        onPress={navigateToSignUp} // <--- Link to new sign-up page
      >
        <Text className="text-gray-600 text-sm">
          {" "}
          {/* Changed color to gray for less prominence */}
          Don&#39;t have an account?{" "}
          <Text className="text-blue-600 font-semibold underline">
            Sign up
          </Text>{" "}
          {/* Highlight "Sign up" */}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LoginScreen;
