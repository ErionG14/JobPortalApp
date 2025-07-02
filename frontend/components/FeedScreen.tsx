// frontend/components/FeedScreen.tsx
// This component displays the main feed content with repeatable post cards,
// fetching real data from your backend API.

import React, { useState, useEffect } from "react"; // Import useState and useEffect
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native"; // Import ActivityIndicator and Alert

// Import Lucide icons
import {
  ThumbsUp,
  MessageSquare,
  Share,
  FileText,
  UserCircle,
} from "lucide-react-native"; // Add UserCircle for default profile image

// Import useAuth to potentially get the token (though GetAllPosts is AllowAnonymous)
// and for consistent API_BASE_URL
import { useAuth } from "../context/AuthContext";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130"; // <--- ENSURE THIS IS YOUR CORRECT BACKEND URL

interface FeedScreenProps {}

const FeedScreen: React.FC<FeedScreenProps> = () => {
  const { user } = useAuth(); // Get user context (even if not used for auth, useful for API_BASE_URL consistency)
  const [posts, setPosts] = useState<any[]>([]); // State to store fetched posts
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for error messages

  // Helper function to calculate time ago (simple version)
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

  const fetchPosts = async () => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await fetch(`${API_BASE_URL}/api/Post/GetAllPosts`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || "Failed to fetch posts.");
      }

      const data = await response.json();
      setPosts(data); // Set the fetched posts to state
      console.log("Fetched posts:", data);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message || "An unexpected error occurred.");
      Alert.alert("Error", err.message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();
  }, []); // Empty dependency array means this runs once on mount

  // --- Render Loading, Error, or Posts ---
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg text-center mb-4">
          Error: {error}
        </Text>
        <TouchableOpacity
          onPress={fetchPosts}
          className="bg-blue-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <FileText size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-600 text-lg">
          No posts yet. Be the first to create one!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
    >
      {posts.map((post) => (
        <View key={post.id} className="bg-white rounded-lg p-4 mb-2 shadow-sm">
          {/* Post Header Section (Profile info and time) */}
          <View className="flex-row items-center mb-2">
            {/* Placeholder for Profile Image/Icon */}
            <View className="w-10 h-10 rounded-full bg-gray-200 mr-2 flex justify-center items-center">
              <UserCircle size={28} color="#6B7280" /> {/* Generic user icon */}
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-800">
                {post.userFirstName} {post.userLastName} {/* Use actual name */}
              </Text>
              <Text className="text-sm text-gray-600">
                {post.userName || "User"} {/* Use UserName or fallback */}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              {getTimeAgo(post.createdAt)}
            </Text>{" "}
            {/* Calculate time ago */}
          </View>

          {/* Post Body Section (Text content and optional image) */}
          <View className="mb-2">
            <Text className="text-sm leading-5 text-gray-800">
              {post.description} {/* Use actual description */}
            </Text>
            {/* Optional Image */}
            {post.imageUrl && ( // Check if imageUrl exists
              <Image
                source={{
                  uri: post.imageUrl, // Use actual image URL from backend
                }}
                className="w-full h-48 rounded-md mt-2"
                resizeMode="cover"
              />
            )}
          </View>

          {/* Post Actions Section (Like, Comment, Share buttons) */}
          <View className="flex-row justify-around border-t border-gray-200 pt-3 mt-1">
            <TouchableOpacity className="p-2 rounded flex-row items-center">
              <ThumbsUp size={20} color="#666666" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded flex-row items-center">
              <MessageSquare size={20} color="#666666" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded flex-row items-center">
              <Share size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default FeedScreen;
