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
  User as UserIcon,
  Edit,
  FileText,
  MoreVertical,
} from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130";

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
interface UserPost {
  id: number;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  name: string;
  surname: string;
  image: string | null;
}

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = useState<UserPost[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getTimeAgo = (createdAt: string) => {
    const postDate = new Date(createdAt);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
  };

  const fetchProfile = useCallback(async () => {
    if (!user || !user.token) {
      setErrorProfile("User not authenticated.");
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    setErrorProfile(null);

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
      setErrorProfile(err.message || "An unexpected error occurred.");
      Alert.alert("Error", err.message || "Failed to load profile.");
      if (err.message.includes("Unauthorized") || response?.status === 401) {
        signOut();
        router.replace("/login");
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [user, signOut, router]);

  // --- NEW: Fetch user's own posts ---
  const fetchMyPosts = useCallback(async () => {
    if (!user || !user.token) {
      setErrorPosts("User not authenticated to fetch posts.");
      setLoadingPosts(false);
      return;
    }

    setLoadingPosts(true);
    setErrorPosts(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Post/GetMyPosts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || "Failed to fetch your posts.");
      }

      const data: UserPost[] = await response.json();
      setMyPosts(data);
      console.log("Fetched My Posts:", data);
    } catch (err: any) {
      console.error("Error fetching user's posts:", err);
      setErrorPosts(
        err.message || "An unexpected error occurred while loading your posts."
      );
    } finally {
      setLoadingPosts(false);
      if (refreshing) setRefreshing(false);
    }
  }, [user, refreshing]);
  // --- END Fetch user's own posts ---

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchMyPosts();
      return () => {
        // Cleanup if necessary
      };
    }, [fetchProfile, fetchMyPosts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
    fetchMyPosts();
  }, [fetchProfile, fetchMyPosts]);

  const handleEditProfile = () => {
    if (profile) {
      router.push({
        pathname: "/edit-profile",
        params: { profileData: JSON.stringify(profile) },
      });
    } else {
      Alert.alert("Error", "Profile data not loaded yet. Please try again.");
    }
  };

  // --- Handle Post Options (Edit/Delete) ---
  const handlePostOptions = (post: UserPost) => {
    Alert.alert(
      "Post Options",
      `What would you like to do with this post?`,
      [
        {
          text: "Edit Post",
          onPress: () => handleEditPost(post),
        },
        {
          text: "Delete Post",
          onPress: () => handleDeletePost(post.id),
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditPost = (post: UserPost) => {
    Alert.alert("Edit Post", `Navigating to edit post with ID: ${post.id}`);
    router.push({
      pathname: "/edit-post",
      params: { postData: JSON.stringify(post) },
    });
  };

  const handleDeletePost = async (postId: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user || !user.token) {
              Alert.alert("Error", "You must be logged in to delete posts.");
              return;
            }
            setLoadingPosts(true);
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/Post/DeletePost${postId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                  },
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.Message || "Failed to delete post.");
              }

              Alert.alert("Success", "Post deleted successfully!");
              fetchMyPosts();
            } catch (err: any) {
              console.error("Error deleting post:", err);
              Alert.alert("Error", err.message || "Failed to delete post.");
            } finally {
              setLoadingPosts(false);
            }
          },
        },
      ]
    );
  };
  // --- END Handle Post Options ---

  if (loadingProfile && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  if (errorProfile || errorPosts) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-4">
        <Text className="text-red-600 text-lg text-center mb-4">
          Error: {errorProfile || errorPosts}
        </Text>
        <TouchableOpacity
          onPress={() => {
            fetchProfile();
            fetchMyPosts();
          }}
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
      {/* Main content card with increased horizontal padding and adjusted vertical padding */}
      <View className="bg-white rounded-lg shadow-md mx-4 mt-4 px-6 py-6">
        {/* Profile Header Section */}
        <View className="flex-row items-center mb-6 pt-4 mt-2">
          {/* Profile Picture or Placeholder */}
          {profile.image ? (
            // --- MODIFIED: Removed mr-4, added style for explicit margin ---
            <Image
              source={{ uri: profile.image }}
              className="w-20 h-20 rounded-full"
              style={{ marginRight: 16 }} // Explicit margin-right
              resizeMode="cover"
            />
          ) : (
            // --- MODIFIED: Removed mr-4, added style for explicit margin ---
            <View
              className="w-20 h-20 rounded-full bg-gray-200 justify-center items-center"
              style={{ marginRight: 16 }} // Explicit margin-right
            >
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
        <View className="border-t border-gray-200 pt-4 pb-4 mt-4">
          <Text className="text-xl font-semibold text-gray-800 mb-2 mt-1">
            Contact Info
          </Text>

          {profile.email && (
            <View className="flex-row items-center my-2 mb-2">
              <Mail size={20} color="#6B7280" style={{ marginRight: 5 }} />
              <Text className="text-base text-gray-700">{profile.email}</Text>
            </View>
          )}

          {profile.phoneNumber && (
            <View className="flex-row items-center my-2 mb-2">
              <Phone size={20} color="#6B7280" style={{ marginRight: 5 }} />
              <Text className="text-base text-gray-700">
                {profile.phoneNumber}
              </Text>
            </View>
          )}

          {profile.address && (
            <View className="flex-row items-center my-2">
              <MapPin size={20} color="#6B7280" style={{ marginRight: 5 }} />
              <Text className="text-base text-gray-700">{profile.address}</Text>
            </View>
          )}
        </View>

        {/* Personal Details Section */}
        <View className="border-t border-gray-200 pt-4 pb-4 mt-4">
          <Text className="text-xl font-semibold text-gray-800 mb-3 mt-1">
            Personal Details
          </Text>

          {profile.birthdate && (
            <View className="flex-row items-center my-2 mt-2 mb-2">
              <Calendar size={20} color="#6B7280" style={{ marginRight: 5 }} />
              <Text className="text-base text-gray-700">
                {new Date(profile.birthdate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {profile.gender && (
            <View className="flex-row items-center my-2">
              <UserIcon size={20} color="#6B7280" style={{ marginRight: 5 }} />
              <Text className="text-base text-gray-700">{profile.gender}</Text>
            </View>
          )}
        </View>
      </View>

      {/* --- My Activity / User's Posts --- */}
      <View className="bg-white rounded-lg shadow-md mx-4 mt-4 px-6 py-6">
        <Text className="text-2xl font-semibold text-gray-800 mb-4 text-center mt-2">
          My Activity
        </Text>

        {loadingPosts ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="mt-4 text-gray-600">Loading your posts...</Text>
          </View>
        ) : errorPosts ? (
          <View className="items-center py-8">
            <Text className="text-red-600 text-center mb-4">
              Error loading posts: {errorPosts}
            </Text>
            <TouchableOpacity
              onPress={() => fetchMyPosts()}
              className="bg-blue-500 py-2 px-4 rounded-lg"
            >
              <Text className="text-white">Retry Posts</Text>
            </TouchableOpacity>
          </View>
        ) : myPosts.length === 0 ? (
          <View className="items-center py-8">
            <FileText size={48} color="#9CA3AF" />
            <Text className="mt-4 text-gray-600 text-lg text-center">
              You haven&#39;t made any posts yet.
            </Text>
          </View>
        ) : (
          myPosts.map((post) => (
            <View
              key={post.id}
              className="bg-white rounded-lg p-4 mb-2 shadow-sm border border-gray-200"
            >
              <View className="flex-row items-center mb-2">
                {post.image ? (
                  <Image
                    source={{ uri: post.image }}
                    className="w-10 h-10 rounded-full mr-2"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-gray-200 mr-2 flex justify-center items-center">
                    <UserCircle size={28} color="#6B7280" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-800">
                    {post.name} {post.surname}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    @{post.userName || "User"}
                  </Text>
                </View>
                <Text className="text-xs text-gray-500 mr-2">
                  {" "}
                  {getTimeAgo(post.createdAt)}
                </Text>
                <TouchableOpacity
                  onPress={() => handlePostOptions(post)}
                  className="p-1"
                >
                  <MoreVertical size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="mb-2">
                <Text className="text-sm leading-5 text-gray-800">
                  {post.description}
                </Text>
                {post.imageUrl && (
                  <Image
                    source={{ uri: post.imageUrl }}
                    className="w-full h-48 rounded-md mt-2"
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;