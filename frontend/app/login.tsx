// frontend/app/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User } from "lucide-react-native";

import CustomButton from "../components/CustomButton";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://192.168.178.34:5130"; // or 5130, depending on your .NET backend port


interface LoginScreenProps {}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  // Optional: If user is already logged in, navigate away (e.g., after initial load)
  // useEffect(() => {
  //   if (user) {
  //     router.replace('/(tabs)');
  //   }
  // }, [user]);

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Login Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Login Success", "You are now logged in!");
        console.log("Login successful! Token:", data.token);

        await login(data.token);
        router.replace("/(tabs)");
      } else {
        const errorMessage =
          data.Message || data.title || "An unknown error occurred.";
        Alert.alert("Login Failed", errorMessage);
        console.error("Login error:", data);
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Could not connect to the server. Please try again."
      );
      console.error("Network or parsing error:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white p-6">
      <View
        className="
          w-24 h-24 rounded-full border-2 border-gray-400
          flex items-center justify-center mb-8
          bg-gray-100"
      >
        <User size={60} color="#6B7280" strokeWidth={1.5} />
      </View>

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
        editable={!loading}
      />

      <TextInput
        className="
          w-80 h-12 px-4
          border border-gray-300 rounded-md mb-6
          text-base text-gray-800
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <CustomButton
        title={loading ? "Logging in..." : "Log in"}
        onPress={handleLogin}
        className="mb-6"
        disabled={loading}
      />

      <TouchableOpacity onPress={navigateToSignUp} disabled={loading}>
        <Text className="text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
          <Text className="text-blue-600 font-semibold underline">Sign up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LoginScreen;
