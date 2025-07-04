// frontend/app/edit-profile.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Image as ImageIcon,
} from "lucide-react-native";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL AND CLOUDINARY SETTINGS HERE ---
const API_BASE_URL = "http://192.168.178.34:5130"; // <--- ENSURE THIS IS YOUR CORRECT BACKEND URL
const CLOUDINARY_CLOUD_NAME = "digigigcr"; // <--- REPLACE WITH YOUR CLOUD NAME
const CLOUDINARY_UPLOAD_PRESET = "job_portal_uploads"; // <--- REPLACE WITH YOUR UNSIGNED UPLOAD PRESET NAME
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

interface UserProfile {
  id: string;
  userName: string;
  email: string;
  name: string;
  surname: string;
  address: string | null;
  birthdate: string | null;
  gender: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  image: string | null;
}

const EditProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, updateAuthUser } = useAuth();
  const params = useLocalSearchParams();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    surname: "",
    address: "",
    birthdate: "",
    gender: "",
    phoneNumber: "",
  });
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (params.profileData) {
      try {
        const initialProfile: UserProfile = JSON.parse(
          params.profileData as string
        );
        setFormData({
          username: initialProfile.userName || "",
          email: initialProfile.email || "",
          name: initialProfile.name || "",
          surname: initialProfile.surname || "",
          address: initialProfile.address || "",
          birthdate: initialProfile.birthdate
            ? new Date(initialProfile.birthdate).toISOString().split("T")[0]
            : "",
          gender: initialProfile.gender || "",
          phoneNumber: initialProfile.phoneNumber || "",
        });
        setProfileImageUri(initialProfile.image);
      } catch (e) {
        console.error("Failed to parse profileData param:", e);
        Alert.alert("Error", "Failed to load profile data for editing.");
        router.back();
      }
    } else if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        name: user.name || "",
        surname: user.surname || "",
        address: "",
        birthdate: "",
        gender: "",
        phoneNumber: "",
      });
    } else {
      Alert.alert(
        "Error",
        "No profile data available for editing. Please log in."
      );
      router.replace("/login");
    }
  }, [params.profileData, user, router]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        birthdate: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleImagePick = () => {
    Alert.alert("Select Image", "Choose image source", [
      {
        text: "Camera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Camera permission denied");
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            allowsEditing: true,
          });

          if (!result.canceled) {
            setProfileImageUri(result.assets[0].uri);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Gallery permission denied");
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });

          if (!result.canceled) {
            setProfileImageUri(result.assets[0].uri);
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const uploadImageToCloudinary = async (
    uri: string
  ): Promise<string | null> => {
    if (!uri) return null;

    try {
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const formData = new FormData();
      formData.append("file", `data:image/jpeg;base64,${base64Image}`);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary Upload Error:", errorData);
        throw new Error(
          errorData.error?.message || "Cloudinary upload failed."
        );
      }

      const data = await response.json();
      console.log("Cloudinary Upload Success:", data);
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      Alert.alert(
        "Image Upload Failed",
        "Could not upload image to cloud storage."
      );
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user || !user.token) {
      Alert.alert(
        "Authentication Error",
        "You must be logged in to update your profile."
      );
      router.replace("/login");
      return;
    }

    setLoading(true);
    let finalImageUrl: string | null = profileImageUri;
    if (profileImageUri && !profileImageUri.startsWith("http")) {
      finalImageUrl = await uploadImageToCloudinary(profileImageUri);
      if (!finalImageUrl) {
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        email: formData.email,
        username: formData.username,
        name: formData.name,
        surname: formData.surname,
        address: formData.address,
        birthdate: formData.birthdate
          ? new Date(formData.birthdate).toISOString()
          : null,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        image: finalImageUrl,
      };

      const response = await fetch(`${API_BASE_URL}/api/User/UpdateMyProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.Message || "Profile updated successfully!");
        updateAuthUser({
          ...user,
          username: formData.username,
          email: formData.email,
          name: formData.name,
          surname: formData.surname,
          image: finalImageUrl,
          address: formData.address,
          birthdate: formData.birthdate,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        });
        router.back();
      } else {
        const errorMessage =
          data.Message ||
          data.title ||
          (data.errors && Object.values(data.errors).flat().join("\n")) ||
          "Failed to update profile.";
        Alert.alert("Error", errorMessage);
        console.error("API Error:", data);
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Could not connect to the server. Please check your connection."
      );
      console.error("Network or parsing error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="bg-white rounded-lg shadow-md p-6">
        <Text className="text-2xl font-semibold text-gray-800 mb-6 mt-2 text-center">
          Edit Your Profile
        </Text>

        <View className="items-center mb-6">
          {profileImageUri ? (
            <Image
              source={{ uri: profileImageUri }}
              className="w-32 h-32 rounded-full border-2 border-gray-300"
              resizeMode="cover"
            />
          ) : (
            <View className="w-32 h-32 rounded-full bg-gray-200 justify-center items-center border-2 border-gray-300 mt-2">
              <UserCircle size={60} color="#6B7280" />
            </View>
          )}
          {/* Image picker button - centered below the image with margin-top */}
          <TouchableOpacity
            onPress={handleImagePick}
            className="bg-blue-500 p-3 rounded-full shadow-md mt-4 mb-2"
            disabled={loading}
          >
            <ImageIcon size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <Text className="text-lg font-semibold text-gray-800 mb-2 text-center">
          Personal Information
        </Text>
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-3 text-gray-800"
          placeholder="Username"
          placeholderTextColor="#9CA3AF"
          value={formData.username}
          onChangeText={(text) => handleInputChange("username", text)}
          editable={!loading}
        />
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-3 text-gray-800"
          placeholder="First Name"
          placeholderTextColor="#9CA3AF"
          value={formData.name}
          onChangeText={(text) => handleInputChange("name", text)}
          editable={!loading}
        />
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-3 text-gray-800"
          placeholder="Last Name"
          placeholderTextColor="#9CA3AF"
          value={formData.surname}
          onChangeText={(text) => handleInputChange("surname", text)}
          editable={!loading}
        />
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-3 text-gray-800"
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={formData.email}
          onChangeText={(text) => handleInputChange("email", text)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-3 text-gray-800"
          placeholder="Phone Number"
          placeholderTextColor="#9CA3AF"
          value={formData.phoneNumber}
          onChangeText={(text) => handleInputChange("phoneNumber", text)}
          keyboardType="phone-pad"
          editable={!loading}
        />
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-3 text-gray-800"
          placeholder="Address"
          placeholderTextColor="#9CA3AF"
          value={formData.address}
          onChangeText={(text) => handleInputChange("address", text)}
          editable={!loading}
        />

        {/* Birthdate Picker */}
        <TouchableOpacity
          onPress={showDatepicker}
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-3 justify-center"
          disabled={loading}
        >
          <Text
            className={`text-base ${
              formData.birthdate ? "text-gray-800" : "text-gray-400"
            }`}
          >
            {formData.birthdate ? formData.birthdate : "Birthdate (YYYY-MM-DD)"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={
              formData.birthdate ? new Date(formData.birthdate) : new Date()
            }
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Gender Dropdown */}
        <View className="bg-gray-50 border border-gray-300 rounded-lg mb-6 overflow-hidden">
          <Picker
            selectedValue={formData.gender}
            onValueChange={(itemValue) =>
              handleInputChange("gender", itemValue)
            }
            style={{ height: 50, width: "100%", color: "#4B5563" }}
            itemStyle={{ color: "#4B5563" }}
            enabled={!loading}
          >
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.9}
          style={{
            backgroundColor: "#1D4ED8",
            paddingVertical: 14,
            borderRadius: 12,
            shadowColor: "#1D4ED8",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-center text-white text-base font-semibold">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-300 py-3 rounded-lg mt-4 shadow"
          disabled={loading}
        >
          <Text className="text-gray-800 text-center text-base font-semibold">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;
