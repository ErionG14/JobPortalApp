import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { ThumbsUp, MessageSquare, Share, FileText } from "lucide-react-native";
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
    imageUri: "https://via.placeholder.com/300", // Add a sample image URI
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
  const [posts, setPosts] = useState<Post[]>([...getPosts(), ...defaultPosts]);

  useFocusEffect(
    useCallback(() => {
      const allPosts = [...getPosts(), ...defaultPosts];
      setPosts(allPosts);
    }, [])
  );
   const handleDelete = (id: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deletePost(id);
          setPosts([...getPosts(), ...defaultPosts]);
        },
      },
    ]);
  };
    const handleEdit = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    Alert.prompt(
      "Edit Post",
      "Update your post content:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save",
          onPress: (newText) => {
            if (newText) {
              updatePost(id, newText);
              setPosts([...getPosts(), ...defaultPosts]);
            }
          },
        },
      ],
      "plain-text",
      post.text
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
    >
      {posts.map((post) => (
        <View key={post.id} className="bg-white rounded-lg p-4 mb-2 shadow">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-full bg-gray-200 mr-2" />
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-800">{post.name}</Text>
              <Text className="text-sm text-gray-600">{post.position}</Text>
            </View>
            <Text className="text-xs text-gray-500">{post.timeAgo}</Text>
          </View>

          <View className="mb-2">
            <Text className="text-sm leading-5 text-gray-800">{post.text}</Text>
           {post.hasImage && post.imageUri && (
  <Image
    source={{ uri: post.imageUri }}
    className="w-full h-48 rounded-md mt-2"
    resizeMode="cover"
  />
)}

          </View>

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
      ))}
    </ScrollView>
  );
};

export default FeedScreen;
