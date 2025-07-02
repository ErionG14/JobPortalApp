import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addPost } from "../../lib/PostStore";

const CreatePostScreen = () => {
  const router = useRouter();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

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
          setImageUri(result.assets[0].uri);
        }
      },
    },
    {
      text: "Gallery",
      onPress: async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Gallery permission denied");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        });

        if (!result.canceled) {
          setImageUri(result.assets[0].uri);
        }
      },
    },
    {
      text: "Cancel",
      style: "cancel",
    },
  ]);
};



  const handleSubmit = () => {
    if (text.trim() === "") return;

    const newPost = {
      id: Date.now().toString(),
      name: "You",
      position: "Poster",
      timeAgo: "Just now",
      text,
      hasImage: !!imageUri,
      imageUri: imageUri || null,
    };

    addPost(newPost);
    setText("");
    setImageUri(null);
    router.replace("/");
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="bg-white rounded-2xl shadow-md p-6">
        <Text className="text-2xl font-semibold text-gray-800 mb-2">
          Share your thoughts
        </Text>

        <TextInput
          multiline
          placeholder="What's on your mind?"
          placeholderTextColor="#9CA3AF"
          value={text}
          onChangeText={setText}
          style={{
            minHeight: 140,
            borderColor: "#E5E7EB",
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            fontSize: 16,
            color: "#1F2937",
            textAlignVertical: "top",
            backgroundColor: "#F9FAFB",
            marginBottom: 16,
          }}
        />

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: "100%",
              height: 180,
              borderRadius: 12,
              marginBottom: 16,
            }}
            resizeMode="cover"
          />
        )}

        <TouchableOpacity
          onPress={handleImagePick}
          className="bg-gray-200 py-3 rounded-xl mb-4"
        >
          <Text className="text-center text-gray-800 font-medium">
            {imageUri ? "Change Image" : "Add Image"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.9}
          style={{
            backgroundColor: "#2563EB",
            paddingVertical: 14,
            borderRadius: 12,
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Text className="text-center text-white text-base font-semibold">
            Publish Post
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreatePostScreen;
