// frontend/app/(tabs)/profile.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  User as UserIcon,
  Edit,
} from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130"; // <--- ENSURE THIS IS YOUR CORRECT BACKEND URL

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

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user || !user.token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let response: Response | undefined;

    try {
      response = await fetch(`${API_BASE_URL}/api/User/MyProfile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || "Failed to fetch profile.");
      }

      const data: UserProfile = await response.json();
      setProfile(data);
      console.log("Fetched User Profile:", data);
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "An unexpected error occurred.");
      Alert.alert("Error", err.message || "Failed to load profile.");
      if (err.message.includes("Unauthorized") || response?.status === 401) {
        signOut();
        router.replace("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, signOut, router]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, [fetchProfile]);

  const handleEditProfile = () => {
    // Navigate to a new screen for editing the profile
    // Pass the current profile data to the edit screen so it can pre-fill the form
    router.push({
      pathname: "/edit-profile",
      params: { profileData: JSON.stringify(profile) }, // Pass profile data as stringified JSON
    });
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-4">
        <Text className="text-red-600 text-lg text-center mb-4">
          Error: {error}
        </Text>
        <TouchableOpacity
          onPress={fetchProfile}
          className="bg-blue-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-gray-600 text-lg">
          No profile data available.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="bg-white rounded-lg shadow-md mx-4 mt-4 p-6">
        {/* Profile Header Section */}
        <View className="flex-row items-center mb-4">
          {/* Profile Picture or Placeholder */}
          {profile.image ? ( // <--- Conditional rendering for image
            <Image
              source={{ uri: profile.image }}
              className="w-20 h-20 rounded-full mr-4"
              resizeMode="cover"
            />
          ) : (
            // Fallback to UserCircle icon if no image
            <View className="w-20 h-20 rounded-full bg-gray-200 justify-center items-center mr-4">
              <UserCircle size={50} color="#6B7280" />
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-gray-800">
                {profile.name} {profile.surname}
              </Text>
              {/* Edit Profile Button */}
              <TouchableOpacity
                onPress={handleEditProfile}
                className="bg-blue-500 rounded-full p-2 shadow-sm"
              >
                <Edit size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-lg text-gray-600">@{profile.userName}</Text>
          </View>
        </View>

        {/* Contact Information Section */}
        <View className="border-t border-gray-200 pt-4 mt-4">
          <Text className="text-xl font-semibold text-gray-800 mb-3">
            Contact Info
          </Text>

          {profile.email && (
            <View className="flex-row items-center mb-2">
              <Mail size={20} color="#6B7280" className="mr-3" />
              <Text className="text-base text-gray-700">{profile.email}</Text>
            </View>
          )}

          {profile.phoneNumber && (
            <View className="flex-row items-center mb-2">
              <Phone size={20} color="#6B7280" className="mr-3" />
              <Text className="text-base text-gray-700">
                {profile.phoneNumber}
              </Text>
            </View>
          )}

          {profile.address && (
            <View className="flex-row items-center mb-2">
              <MapPin size={20} color="#6B7280" className="mr-3" />
              <Text className="text-base text-gray-700">{profile.address}</Text>
            </View>
          )}
        </View>

        {/* Personal Details Section */}
        <View className="border-t border-gray-200 pt-4 mt-4">
          <Text className="text-xl font-semibold text-gray-800 mb-3">
            Personal Details
          </Text>

          {profile.birthdate && (
            <View className="flex-row items-center mb-2">
              <Calendar size={20} color="#6B7280" className="mr-3" />
              <Text className="text-base text-gray-700">
                {new Date(profile.birthdate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {profile.gender && (
            <View className="flex-row items-center mb-2">
              <User size={20} color="#6B7280" className="mr-3" />
              <Text className="text-base text-gray-700">{profile.gender}</Text>
            </View>
          )}
        </View>

        {/* Other Details (e.g., Created At) */}
        <View className="border-t border-gray-200 pt-4 mt-4">
          <Text className="text-xl font-semibold text-gray-800 mb-3">
            Account Info
          </Text>
          <View className="flex-row items-center mb-2">
            <UserIcon size={20} color="#6B7280" className="mr-3" />
            <Text className="text-base text-gray-700">
              Member since: {new Date(profile.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Logout Button (Optional, but good to have on profile) */}
        <TouchableOpacity
          onPress={signOut}
          className="bg-red-500 py-3 rounded-lg mt-6 shadow"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;