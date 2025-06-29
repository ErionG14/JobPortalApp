// FeedScreen.tsx
// This component displays the main feed content with repeatable post cards,
// now entirely using Tailwind CSS classes via NativeWind.

import React from "react";
import {
  View,
  Text,
  // StyleSheet, // No longer needed as all styles are Tailwind
  ScrollView,
  Image,
  TouchableOpacity,
  // Platform, // No longer strictly needed for this component's direct styles
} from "react-native";

// Define props interface for TypeScript
interface FeedScreenProps {} // Currently no props, but good practice to have

// --- Dummy Data for Posts ---
// In a real application, this data would come from an API.
const posts = [
  {
    id: "1",
    name: "Name Surname",
    position: "Position",
    timeAgo: "Posted 1m ago",
    text: "A paragraph of text with an unassigned link. A second row of text with a web link. An icon 📄 inline with text.",
    hasImage: true,
  },
  {
    id: "2",
    name: "Name Surname",
    position: "Position",
    timeAgo: "Posted just now",
    text: "A paragraph of text with an unassigned link. A second row of text with a web link. An icon 📄 inline with text.",
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
    // ScrollView as the main container for the feed content.
    // flex-1: Allows it to expand and fill available space.
    // bg-gray-50: Sets a light gray background color for the feed area.
    <ScrollView
      className="flex-1 bg-gray-50"
      // contentContainerStyle is still used here for padding, as className on ScrollView
      // applies to the scrollable container itself, not its content padding directly.
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
    >
      {posts.map((post) => (
        // Individual Post Card Container.
        // bg-white: White background.
        // rounded-lg: Large rounded corners.
        // p-4: Padding on all sides.
        // mb-2: Margin-bottom for spacing between posts.
        // shadow: Applies a default shadow.
        <View key={post.id} className="bg-white rounded-lg p-4 mb-2 shadow">
          {/* Post Header Section (Profile info and time ago) */}
          {/* flex-row: Horizontal layout.
              items-center: Vertically centers items.
              mb-2: Margin-bottom for spacing. */}
          <View className="flex-row items-center mb-2">
            {/* Profile Circle Placeholder */}
            {/* w-10 h-10: Fixed width and height (40px).
                rounded-full: Makes it a perfect circle.
                bg-gray-200: Light gray background for the placeholder.
                mr-2: Margin-right for spacing from text. */}
            <View className="w-10 h-10 rounded-full bg-gray-200 mr-2" />
            {/* Profile Name and Position Container */}
            {/* flex-1: Allows this view to take up remaining horizontal space. */}
            <View className="flex-1">
              {/* Name Text */}
              {/* text-base: Base font size.
                  font-bold: Bold font weight.
                  text-gray-800: Dark gray text color. */}
              <Text className="text-base font-bold text-gray-800">
                {post.name}
              </Text>
              {/* Position Text */}
              {/* text-sm: Small font size.
                  text-gray-600: Medium gray text color. */}
              <Text className="text-sm text-gray-600">{post.position}</Text>
            </View>
            {/* Time Ago Text */}
            {/* text-xs: Extra small font size.
                text-gray-500: Lighter gray text color. */}
            <Text className="text-xs text-gray-500">{post.timeAgo}</Text>
          </View>

          {/* Post Body Section (Text content and optional image) */}
          {/* mb-2: Margin-bottom for spacing. */}
          <View className="mb-2">
            {/* Post Text - First line */}
            {/* text-sm: Small font size.
                leading-5: Line height (20px).
                text-gray-800: Dark gray text color. */}
            <Text className="text-sm leading-5 text-gray-800">
              A paragraph of text with an {/* Link within text */}
              <Text className="text-blue-600 underline">unassigned link</Text>.
            </Text>
            {/* Post Text - Second line */}
            <Text className="text-sm leading-5 text-gray-800">
              A second row of text with a {/* Link within text */}
              <Text className="text-blue-600 underline">web link</Text>.
            </Text>
            {/* Post Text - Line with inline icon */}
            <Text className="text-sm leading-5 text-gray-800">
              An icon <Text className="text-base">📄</Text> inline with text.
            </Text>
            {/* Optional Image */}
            {post.hasImage && (
              <Image
                source={{
                  uri: "https://placehold.co/200x150/E0E0E0/333333?text=Image",
                }} // Placeholder image URL
                // w-full: Full width of parent.
                // h-48: Fixed height (192px).
                // rounded-md: Medium rounded corners.
                // mt-2: Margin-top for spacing from text.
                className="w-full h-48 rounded-md mt-2"
                resizeMode="cover" // Ensures image covers the area, cropping if necessary
              />
            )}
          </View>

          {/* Post Actions Section (Like, Comment, Share buttons) */}
          {/* flex-row: Horizontal layout.
              justify-around: Distributes items evenly with space around them.
              border-t: Top border.
              border-gray-200: Light gray border color.
              pt-3: Top padding.
              mt-1: Top margin. */}
          <View className="flex-row justify-around border-t border-gray-200 pt-3 mt-1">
            {/* Action Buttons */}
            {/* p-2: Padding.
                rounded: Slightly rounded corners. */}
            <TouchableOpacity className="p-2 rounded">
              <Text className="text-xl text-gray-600">👍</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded">
              <Text className="text-xl text-gray-600">💬</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded">
              <Text className="text-xl text-gray-600">↪️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};


export default FeedScreen;
