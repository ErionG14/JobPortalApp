// frontend/app/admin/add-user.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Cake,
  Shield,
  Lock,
  Save,
  ArrowLeft,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130";

interface AddUserByAdminDto {
  username: string;
  email: string;
  password: string;
  name: string | null;
  surname: string | null;
  address: string | null;
  birthdate: string | null;
  gender: string | null;
  phoneNumber: string | null;
  role: string;
}

const ALL_ROLES = ["User", "Manager", "Admin"];
const ALL_GENDERS = ["Male", "Female", "Other", "Prefer Not To Say"];

const AdminAddUserScreen: React.FC = () => {
  const { user: currentUser, signOut } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<AddUserByAdminDto>({
    username: "",
    email: "",
    password: "",
    name: "",
    surname: "",
    address: "",
    birthdate: "",
    gender: "",
    phoneNumber: "",
    role: "User",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      Alert.alert(
        "Access Denied",
        "You must be logged in to access this page."
      );
      router.replace("/login");
      return;
    }
    if (currentUser.role !== "Admin") {
      Alert.alert("Access Denied", "You do not have permission to add users.");
      router.replace("/");
      return;
    }
  }, [currentUser, router, signOut]);

  const handleChange = (name: keyof AddUserByAdminDto, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        birthdate: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  const handleSubmit = async () => {
    if (loadError) {
      Alert.alert("Error", loadError);
      return;
    }

    if (!currentUser || !currentUser.token) {
      Alert.alert("Error", "Authentication token missing.");
      return;
    }

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      Alert.alert(
        "Validation Error",
        "Username, Email, Password, and Role are required."
      );
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 6 characters long."
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }

    if (!ALL_ROLES.includes(formData.role)) {
      Alert.alert(
        "Validation Error",
        `Invalid role: ${formData.role}. Allowed roles are ${ALL_ROLES.join(
          ", "
        )}.`
      );
      return;
    }

    if (formData.gender && !ALL_GENDERS.includes(formData.gender)) {
      Alert.alert(
        "Validation Error",
        `Invalid gender: ${
          formData.gender
        }. Allowed genders are ${ALL_GENDERS.join(", ")}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/User/AddUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "API Response not OK for AddUser:",
          response.status,
          errorText
        );
        let errorMessage = "Failed to add user.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.Message ||
            errorData.title ||
            (errorData.errors &&
              Object.values(errorData.errors).flat().join("\n")) ||
            errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${
            response.status
          }. Details: ${errorText.substring(0, 150)}...`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      Alert.alert(
        "Success",
        result.Message || `User '${formData.username}' added successfully!`
      );
      router.back();
    } catch (err: any) {
      console.error("Error adding user:", err);
      Alert.alert(
        "Add User Failed",
        err.message || "An unexpected error occurred during user creation."
      );
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("401") ||
        err.message.includes("403") ||
        (err.message.includes("Session Expired") && err.message.includes("401"))
      ) {
        Alert.alert("Session Expired", "Please log in again.", [
          { text: "OK", onPress: signOut },
        ]);
        router.replace("/login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg text-center mb-4">
          Error: {loadError}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!currentUser || currentUser.role !== "Admin") {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Checking permissions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Add New User</Text>
        <View className="w-8" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-800 text-center mb-6">
          Create New User Account
        </Text>

        {/* Form Fields */}
        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">Username</Text>
          <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white flex-row items-center">
            <User size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Username"
              value={formData.username}
              onChangeText={(text) => handleChange("username", text)}
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">Email</Text>
          <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white flex-row items-center">
            <Mail size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">Password</Text>
          <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white flex-row items-center">
            <Lock size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              secureTextEntry
            />
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            Minimum 6 characters.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">
            First Name (Optional)
          </Text>
          <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white flex-row items-center">
            <User size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="First Name"
              value={formData.name || ""}
              onChangeText={(text) => handleChange("name", text)}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">
            Last Name (Optional)
          </Text>
          <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white flex-row items-center">
            <User size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Last Name"
              value={formData.surname || ""}
              onChangeText={(text) => handleChange("surname", text)}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">
            Address (Optional)
          </Text>
          <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white flex-row items-center">
            <MapPin size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Address"
              value={formData.address || ""}
              onChangeText={(text) => handleChange("address", text)}
            />
          </View>
        </View>

        {/* --- Birthdate (Calendar Picker) --- */}
        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">
            Birthdate (Optional)
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white flex-row items-center"
          >
            <Cake size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Select Birthdate"
              value={formData.birthdate || ""}
              editable={false}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={
                formData.birthdate ? new Date(formData.birthdate) : new Date()
              }
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* --- Gender (Dropdown Picker) --- */}
        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">
            Gender (Optional)
          </Text>
          <View className="border border-gray-300 rounded-lg bg-white flex-row items-center pr-3">
            <User size={20} color="#6B7280" className="ml-3 mr-2" />
            <Picker
              selectedValue={formData.gender ?? undefined}
              onValueChange={(itemValue: string) =>
                handleChange("gender", itemValue)
              }
              style={{ flex: 1, height: 50 }}
              itemStyle={{ fontSize: 16, color: "#4B5563" }}
            >
              <Picker.Item
                label="Select Gender"
                value=""
                style={{ color: "#9CA3AF" }}
              />
              {ALL_GENDERS.map((gender) => (
                <Picker.Item key={gender} label={gender} value={gender} />
              ))}
            </Picker>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            Accepted: {ALL_GENDERS.join(", ")} (case-sensitive)
          </Text>
        </View>

        {/* --- Role (Dropdown Picker) --- */}
        <View className="mb-6">
          <Text className="text-base text-gray-700 mb-1">Role</Text>
          <View className="border border-gray-300 rounded-lg bg-white flex-row items-center pr-3">
            <Shield size={20} color="#6B7280" className="ml-3 mr-2" />
            <Picker
              selectedValue={formData.role}
              onValueChange={(itemValue: string) =>
                handleChange("role", itemValue)
              }
              style={{ flex: 1, height: 50 }}
              itemStyle={{ fontSize: 16, color: "#4B5563" }}
            >
              <Picker.Item
                label="Select Role"
                value=""
                enabled={false}
                style={{ color: "#9CA3AF" }}
              />
              {ALL_ROLES.map((role) => (
                <Picker.Item key={role} label={role} value={role} />
              ))}
            </Picker>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            Accepted: {ALL_ROLES.join(", ")} (case-sensitive)
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="w-full bg-blue-600 py-4 rounded-lg flex-row items-center justify-center shadow-xl active:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save size={20} color="#fff" className="mr-2" />
              <Text className="text-white text-lg font-semibold">Add User</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminAddUserScreen;