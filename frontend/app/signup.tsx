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
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import CustomButton from "../components/CustomButton";

interface SignUpScreenProps {}

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

  const router = useRouter();

  const handleSignUp = () => {
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

    console.log("Attempting sign up with:", {
      username,
      name,
      surname,
      email,
      password,
      address,
      birthdate: birthdate.toISOString().split("T")[0],
      gender,
      phoneNumber,
    });
    Alert.alert("Sign Up Success", "Account created successfully!");
    // router.replace('/login');
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
          />
        </View>

        {/* Birthdate Input (Now with Date Picker) */}
        <TouchableOpacity
          onPress={showDatepicker}
          className={inputWrapperClassName}
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
          />
        </View>

        {/* Sign Up Button */}
        <CustomButton
          title="Sign Up"
          onPress={handleSignUp}
          className="mt-4 mb-6"
        />
        <TouchableOpacity onPress={navigateToLogin}>
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