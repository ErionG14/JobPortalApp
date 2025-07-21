// frontend/components/FeedScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  ThumbsUp,
  MessageSquare,
  Share,
  FileText,
  UserCircle,
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect, useRouter } from "expo-router";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130"; // <--- ENSURE THIS IS YOUR CORRECT BACKEND URL

// --- Post Interface ---
interface Post {
  id: number;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  userFirstName: string;
  userLastName: string;
  userImage: string | null;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  commentsCount: number;
  comments: any[];
}

interface FeedScreenProps {}

const FeedScreen: React.FC<FeedScreenProps> = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Post/GetAllPosts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token && { Authorization: `Bearer ${user.token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || "Failed to fetch posts.");
      }

      const data: Post[] = await response.json();
      setPosts(data);
      console.log("Fetched posts:", data);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message || "An unexpected error occurred.");
      Alert.alert("Error", err.message || "Failed to load posts.");
      if (err.message.includes("Unauthorized") && user?.token) {
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
      fetchPosts();
      return () => {
      };
    }, [fetchPosts])
  );

  const onRefresh = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading && !refreshing) {
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

  if (posts.length === 0 && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <FileText size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-600 text-lg">
          No posts yet. Be the first to create one!
        </Text>
        <TouchableOpacity
          onPress={fetchPosts}
          className="bg-blue-500 py-3 px-6 rounded-lg mt-4"
        >
          <Text className="text-white text-base font-semibold">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {posts.map((post) => (
        <View key={post.id} className="bg-white rounded-lg p-4 mb-2 shadow-sm">
          {/* Post Header Section */}
          <View className="flex-row items-center mb-2">
            {post.userImage ? (
              <Image
                source={{ uri: post.userImage }}
                className="w-10 h-10 rounded-full mr-2"
                resizeMode="cover"
                onError={(e) =>
                  console.log(
                    "User Image Load Error:",
                    e.nativeEvent.error,
                    "URL:",
                    post.userImage
                  )
                }
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-gray-200 mr-2 flex justify-center items-center">
                <UserCircle size={28} color="#6B7280" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-800">
                {post.userFirstName} {post.userLastName}{" "}
              </Text>
              <Text className="text-sm text-gray-600">
                @{post.userName || "User"}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              {getTimeAgo(post.createdAt)}
            </Text>
          </View>

          {/* Post Body Section */}
          <View className="mb-2">
            <Text className="text-sm leading-5 text-gray-800">
              {post.description}
            </Text>
            {/* Optional Image */}
            {post.imageUrl && (
              <Image
                source={{
                  uri: post.imageUrl,
                }}
                className="w-full h-48 rounded-md mt-2"
                resizeMode="cover"
                onError={(e) =>
                  console.log(
                    "Post Image Load Error:",
                    e.nativeEvent.error,
                    "URL:",
                    post.imageUrl
                  )
                }
              />
            )}
          </View>

          {/* Post Actions Section */}
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