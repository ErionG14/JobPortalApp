// frontend/app/create-post.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import * as FileSystem from "expo-file-system"; // For reading image as Base64

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL AND CLOUDINARY SETTINGS HERE ---
const API_BASE_URL = "http://192.168.178.34:5130"; // <--- YOUR BACKEND IP AND PORT
const CLOUDINARY_CLOUD_NAME = "digigigcr"; // <--- REPLACE WITH YOUR CLOUD NAME
const CLOUDINARY_UPLOAD_PRESET = "job_portal_uploads"; // <--- REPLACE WITH YOUR UNSIGNED UPLOAD PRESET NAME
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

interface CreatePostScreenProps {}

const CreatePostScreen: React.FC<CreatePostScreenProps> = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null); // Local URI from image picker
  const [loading, setLoading] = useState(false);

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
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
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

  const uploadImageToCloudinary = async (
    uri: string
  ): Promise<string | null> => {
    if (!uri) return null;

    try {
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const formData = new FormData();
      formData.append("file", `data:image/jpeg;base64,${base64Image}`);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
        headers: {
          // Cloudinary handles Content-Type for FormData automatically
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary Upload Error:", errorData);
        throw new Error(
          errorData.error?.message || "Cloudinary upload failed."
        );
      }

      const data = await response.json();
      console.log("Cloudinary Upload Success:", data);
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      Alert.alert(
        "Image Upload Failed",
        "Could not upload image to cloud storage."
      );
      return null;
    }
  };

  const handleSubmit = async () => {
    if (description.trim() === "") {
      Alert.alert("Error", "Description cannot be empty.");
      return;
    }

    if (!user || !user.token) {
      Alert.alert(
        "Authentication Error",
        "You must be logged in to create a post."
      );
      router.replace("/login");
      return;
    }

    setLoading(true);

    let finalImageUrl: string | null = null;
    if (imageUri) {
      finalImageUrl = await uploadImageToCloudinary(imageUri);
      if (!finalImageUrl) {
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/Post/CreatePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          description: description,
          imageUrl: finalImageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.Message || "Post created successfully!");
        setDescription("");
        setImageUri(null);
        router.replace("/");
      } else {
        const errorMessage =
          data.Message ||
          data.title ||
          (data.errors && Object.values(data.errors).flat().join("\n")) ||
          "Failed to create post.";
        Alert.alert("Error", errorMessage);
        console.error("API Error:", data);
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Could not connect to the server. Please check your connection."
      );
      console.error("Network or parsing error:", error);
    } finally {
      setLoading(false);
    }
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
          value={description}
          onChangeText={setDescription}
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
          editable={!loading}
        />

        {imageUri && (
          <Image
            source={{ uri: imageUri }} // Still show local URI for preview
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
          disabled={loading}
        >
          <Text className="text-center text-gray-800 font-medium">
            {imageUri ? "Change Image" : "Add Image"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.9}
          // --- STYLING CHANGES HERE ---
          style={{
            backgroundColor: "#1D4ED8", // A slightly darker blue for the button
            paddingVertical: 14,
            borderRadius: 12,
            // More pronounced shadow for depth
            shadowColor: "#1D4ED8", // Match shadow color to button color
            shadowOffset: { width: 0, height: 6 }, // Increased height for more visible shadow
            shadowOpacity: 0.3, // Increased opacity for darker shadow
            shadowRadius: 8, // Increased radius for softer, wider shadow
            elevation: 8, // Increased elevation for Android shadow
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-center text-white text-base font-semibold">
              Publish Post
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreatePostScreen;
