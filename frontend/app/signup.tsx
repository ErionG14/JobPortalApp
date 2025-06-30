// frontend/app/signup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  User,
  Mail,
  Lock,
  MapPin,
  CalendarDays,
  Users,
  Phone,
} from "lucide-react-native";

// Import DatePicker (for Android/iOS)
import DateTimePicker from "@react-native-community/datetimepicker";

// Import Picker (for dropdown)
import { Picker } from "@react-native-picker/picker";

// Import your CustomButton component
import CustomButton from "../components/CustomButton";

interface SignUpScreenProps {}

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
// Use your PC's actual local IP address if testing on a physical device or iOS simulator.
// Use 'http://10.0.2.2:5130' for Android emulators.
// Use 'http://localhost:5130' only for web browser testing on the same PC.
const API_BASE_URL = "http://192.168.178.34:5130"; // <--- ENSURE THIS IS YOUR CORRECT BACKEND URL

const SignUpScreen: React.FC<SignUpScreenProps> = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignUp = async () => {
    if (
      !username ||
      !name ||
      !surname ||
      !email ||
      !password ||
      !confirmPassword ||
      !address ||
      !birthdate ||
      !gender ||
      !phoneNumber
    ) {
      Alert.alert("Sign Up Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Sign Up Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Prepare the data payload for RegisterDTO
      const registerData = {
        username: username,
        name: name,
        surname: surname,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        address: address,
        birthdate: birthdate.toISOString().split("T")[0],
        gender: gender,
        phoneNumber: phoneNumber,
      };

      console.log("Attempting sign up with:", registerData);

      const response = await fetch(`${API_BASE_URL}/api/User/register`, {
        // <--- API Call
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Registration Successful",
          data.Message || "Account created successfully!"
        );
        console.log("Registration successful!", data);
        router.replace("/login");
      } else {
        const errorMessage =
          data.Message ||
          data.title ||
          (data.errors && Object.values(data.errors).flat().join("\n")) ||
          "An unknown error occurred during registration.";
        Alert.alert("Registration Failed", errorMessage);
        console.error("Registration error:", data);
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

  const navigateToLogin = () => {
    router.push("/login");
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const inputWrapperClassName = `
    flex-row items-center w-80 mb-4 border border-gray-300 rounded-md pl-4 pr-4 h-12
  `;
  const textInputClassName = `
    flex-1 text-base text-gray-800 ml-3
  `;
  const placeholderColor = "#9CA3AF";

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}
      >
        {/* Header/Title */}
        <Text className="text-3xl font-bold text-gray-800 mb-8">
          Create Account
        </Text>

        {/* Username Input */}
        <View className={inputWrapperClassName}>
          <User size={20} color="#6B7280" />
          <TextInput
            className={textInputClassName}
            placeholder="Username"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />
        </View>

        {/* Name Input */}
        <View className={inputWrapperClassName}>
          <User size={20} color="#6B7280" />
          <TextInput
            className={textInputClassName}
            placeholder="Name"
            placeholderTextColor={placeholderColor}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        {/* Surname Input */}
        <View className={inputWrapperClassName}>
          <User size={20} color="#6B7280" />
          <TextInput
            className={textInputClassName}
            placeholder="Surname"
            placeholderTextColor={placeholderColor}
            value={surname}
            onChangeText={setSurname}
            editable={!loading}
          />
        </View>

        {/* Email Input */}
        <View className={inputWrapperClassName}>
          <Mail size={20} color="#6B7280" />
          <TextInput
            className={textInputClassName}
            placeholder="Email"
            placeholderTextColor={placeholderColor}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View className={inputWrapperClassName}>
          <Lock size={20} color="#6B7280" />
          <TextInput
            className={textInputClassName}
            placeholder="Password"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        {/* Confirm Password Input */}
        <View className={inputWrapperClassName}>
          <Lock size={20} color="#6B7280" />
          <TextInput
            className={textInputClassName}
            placeholder="Confirm Password"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />
        </View>

        {/* Address Input */}
        <View className={inputWrapperClassName}>
          <MapPin size={20} color="#6B7280" />
          <TextInput
            className={textInputClassName}
            placeholder="Address"
            placeholderTextColor={placeholderColor}
            value={address}
            onChangeText={setAddress}
            editable={!loading}
          />
        </View>

        {/* Birthdate Input (Now with Date Picker) */}
        <TouchableOpacity
          onPress={showDatepicker}
          className={inputWrapperClassName}
          disabled={loading}
        >
          <CalendarDays size={20} color="#6B7280" />
          <TextInput
            className={textInputClassName}
            placeholder="Birthdate (YYYY-MM-DD)"
            placeholderTextColor={placeholderColor}
            value={birthdate ? birthdate.toISOString().split("T")[0] : ""}
            editable={false}
          />
          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker
              value={birthdate || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </TouchableOpacity>
        {Platform.OS === "ios" && showDatePicker && (
          <DateTimePicker
            value={birthdate || new Date()}
            mode="date"
            display="spinner"
            onChange={onDateChange}
          />
        )}

        {/* Gender Dropdown (Using Picker) */}
        <View className={inputWrapperClassName}>
          <Users size={20} color="#6B7280" />
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue as string)}
            style={{ flex: 1, height: "100%", color: "#4B5563" }}
            itemStyle={{ fontSize: 16 }}
            enabled={!loading}
          >
            <Picker.Item
              label="Select Gender"
              value=""
              enabled={false}
              style={{ color: placeholderColor }}
            />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        {/* Phone Number Input */}
        <View className={inputWrapperClassName.replace("mb-4", "mb-6")}>
          <Phone size={20} color="#6B7280" />
          <TextInput
            className={textInputClassName}
            placeholder="Phone Number"
            placeholderTextColor={placeholderColor}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={!loading}
          />
        </View>

        {/* Sign Up Button */}
        <CustomButton
          title={loading ? "Registering..." : "Sign Up"}
          onPress={handleSignUp}
          className="mt-4 mb-6"
          disabled={loading}
        />
        <TouchableOpacity
          onPress={navigateToLogin}
          disabled={loading}
        >
          <Text className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Text className="text-blue-600 font-semibold underline">
              Log in
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;