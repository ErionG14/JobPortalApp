// FeedScreen.tsx
import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";

// Import Lucide icons you want to use in this component
import {
  ThumbsUp,
  MessageSquare,
  Share,
  FileText,
} from "lucide-react-native";

// Define props interface for TypeScript
interface FeedScreenProps {} // Currently no props

// --- Dummy Data for Posts ---
const posts = [
  {
    id: "1",
    name: "Name Surname",
    position: "Position",
    timeAgo: "Posted 1m ago",
    text: "A paragraph of text with an unassigned link. A second row of text with a web link. An icon inline with text.",
    hasImage: true,
  },
  {
    id: "2",
    name: "Name Surname",
    position: "Position",
    timeAgo: "Posted just now",
    text: "A paragraph of text with an unassigned link. A second row of text with a web link. An icon inline with text.",
    hasImage: false,
  },
  {
    id: "3",
    name: "Jane Smith",
    position: "UI Designer",
    timeAgo: "5h ago",
    text: "Sharing some thoughts on project management best practices. This is a longer text to show how it wraps.",
    hasImage: true,
  },
];

const FeedScreen: React.FC<FeedScreenProps> = () => {
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
    >
      {posts.map((post) => (
        <View key={post.id} className="bg-white rounded-lg p-4 mb-2 shadow">
          {/* Post Header Section (Profile info and time) */}
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

          {/* Post Body Section (Text content and optional image) */}
          <View className="mb-2">
            <Text className="text-sm leading-5 text-gray-800">
              A paragraph of text with an
              <Text className="text-blue-600 underline">unassigned link</Text>.
            </Text>
            <Text className="text-sm leading-5 text-gray-800">
              A second row of text with a
              <Text className="text-blue-600 underline">web link</Text>.
            </Text>
            <Text className="text-sm leading-5 text-gray-800 flex-row items-center">
              An icon <FileText size={16} color="#666666" /> inline with text.
            </Text>
            {/* Optional Image */}
            {post.hasImage && (
              <Image
                source={{
                  uri: "https://placehold.co/200x150/E0E0E0/333333?text=Image",
                }}
                className="w-full h-48 rounded-md mt-2"
                resizeMode="cover"
              />
            )}
          </View>

          {/* Post Actions Section (Like, Comment, Share buttons - REPLACED EMOJIS WITH LUCIDE ICONS) */}
          <View className="flex-row justify-around border-t border-gray-200 pt-3 mt-1">
            {/* Like Button */}
            <TouchableOpacity className="p-2 rounded flex-row items-center">
              <ThumbsUp size={20} color="#666666" />
            </TouchableOpacity>
            {/* Comment Button */}
            <TouchableOpacity className="p-2 rounded flex-row items-center">
              <MessageSquare size={20} color="#666666" />
            </TouchableOpacity>
            {/* Share Button */}
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