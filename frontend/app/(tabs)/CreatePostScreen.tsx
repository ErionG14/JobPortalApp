// app/(tabs)/create-post.tsx

import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView } from "react-native";
import { useRouter } from "expo-router";

let globalPosts: any[] = []; // TEMP: global in-memory post storage

export const addPost = (post: any) => {
  globalPosts.unshift(post); // Add to top of feed
};

export const getPosts = () => {
  return globalPosts;
};

const CreatePostScreen = () => {
  const router = useRouter();
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim() === "") return;

    const newPost = {
      id: Date.now().toString(),
      name: "You",
      position: "Poster",
      timeAgo: "Just now",
      text,
      hasImage: false,
    };

    addPost(newPost);
    router.replace("/"); // Go back to feed
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Create a Post</Text>
      <TextInput
        placeholder="Write something..."
        multiline
        value={text}
        onChangeText={setText}
        style={{
          height: 120,
          borderColor: "#ccc",
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          marginBottom: 20,
        }}
      />
      <Button title="Publish Post" onPress={handleSubmit} />
    </ScrollView>
  );
};

export default CreatePostScreen;
