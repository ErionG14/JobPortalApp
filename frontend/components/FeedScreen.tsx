import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Appearance,
} from "react-native";
import { ThumbsUp, MessageSquare, Share } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { deletePost, getPosts, updatePost } from "../lib/PostStore"; // adjust path if needed

const defaultPosts = [
  {
    id: "1",
    name: "Name Surname",
    position: "Position",
    timeAgo: "Posted 1m ago",
    text: "This is a default post.",
    hasImage: true,
    imageUri: "https://via.placeholder.com/300",
  },
];

type Post = {
  id: string;
  name: string;
  position: string;
  timeAgo: string;
  text: string;
  hasImage: boolean;
  imageUri?: string;
};

const FeedScreen: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<Post[]>([...getPosts(), ...defaultPosts]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);
   const colorScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

 
  const bgColor = isDarkMode ? "#121212" : "#f9fafb";
  const textColor = isDarkMode ? "#eee" : "#222";

  useFocusEffect(
    useCallback(() => {
      const allPosts = [...getPosts(), ...defaultPosts];
      setPosts(allPosts);
      setFilteredPosts(allPosts);
    }, [])
  );

  // Filter posts when searchText changes
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredPosts(posts);
    } else {
      const lowerSearch = searchText.toLowerCase();
      const filtered = posts.filter(
        (post) =>
          post.text.toLowerCase().includes(lowerSearch) ||
          post.name.toLowerCase().includes(lowerSearch)
      );
      setFilteredPosts(filtered);
    }
  }, [searchText, posts]);

  // Delete post handler
  const handleDelete = (id: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deletePost(id);
          const updatedPosts = [...getPosts(), ...defaultPosts];
          setPosts(updatedPosts);
          setFilteredPosts(updatedPosts);
        },
      },
    ]);
  };

  // Edit post handler with prompt
  const handleEdit = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    Alert.prompt(
      "Edit Post",
      "Update your post content:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (newText) => {
            if (newText) {
              updatePost(id, newText);
              const updatedPosts = [...getPosts(), ...defaultPosts];
              setPosts(updatedPosts);
              setFilteredPosts(updatedPosts);
            }
          },
        },
      ],
      "plain-text",
      post.text
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="p-4 bg-white border-b border-gray-200">
        <TextInput
          placeholder="Search posts..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800"
        />
      </View>

      {/* Posts List */}
      <ScrollView
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
      >
        {filteredPosts.length === 0 ? (
          <Text className="text-center text-gray-500 mt-6">No posts found.</Text>
        ) : (
          filteredPosts.map((post) => (
            
            <View
              key={post.id}
              className="bg-white rounded-lg p-4 mb-2 shadow"
            >
              {/* Header */}
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-gray-200 mr-2" />
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-800">
                    {post.name}
                  </Text>
                  <Text className="text-sm text-gray-600">{post.position}</Text>
                </View>
                <Text className="text-xs text-gray-500">{post.timeAgo}</Text>
              </View>

              {/* Body */}
              <View className="mb-2">
                <Text className="text-sm leading-5 text-gray-800">{post.text}</Text>
                {post.hasImage && post.imageUri && (
                  <Image
                    source={{ uri: post.imageUri }}
                    className="w-full h-48 rounded-md mt-2"
                    resizeMode="cover"
                  />

                )}
                 {/* Dark Mode Toggle Button */}
      <TouchableOpacity
        onPress={toggleDarkMode}
        style={{
          padding: 12,
          backgroundColor: isDarkMode ? "#333" : "#ddd",
          alignSelf: "center",
          marginVertical: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: textColor, fontWeight: "bold" }}>
          Switch to {isDarkMode ? "Light" : "Dark"} Mode
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: textColor, fontSize: 20, marginBottom: 12 }}>
          Welcome to the Feed!
        </Text>
      
      </ScrollView>
              </View>

              {/* Actions */}
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

                {/* Edit Button */}
                <TouchableOpacity
                  className="p-2 rounded flex-row items-center"
                  onPress={() => handleEdit(post.id)}
                >
                  <Text className="text-xs text-blue-600">Edit</Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  className="p-2 rounded flex-row items-center"
                  onPress={() => handleDelete(post.id)}
                >
                  <Text className="text-xs text-red-500">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default FeedScreen;
