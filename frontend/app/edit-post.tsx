// frontend/app/edit-post.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Image as ImageIcon, XCircle } from "lucide-react-native"; // XCircle for removing image

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL AND CLOUDINARY SETTINGS HERE ---
const API_BASE_URL = "http://192.168.178.34:5130"; // <--- ENSURE THIS IS YOUR CORRECT BACKEND URL
const CLOUDINARY_CLOUD_NAME = "digigigcr"; // <--- REPLACE WITH YOUR CLOUD NAME
const CLOUDINARY_UPLOAD_PRESET = "job_portal_uploads"; // <--- REPLACE WITH YOUR UNSIGNED UPLOAD PRESET NAME
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

interface PostToEdit {
  id: number;
  description: string;
  imageUrl: string | null;
}

const EditPostScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const [postId, setPostId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.postData) {
      try {
        const initialPost: PostToEdit = JSON.parse(params.postData as string);
        setPostId(initialPost.id);
        setDescription(initialPost.description || "");
        setPostImageUrl(initialPost.imageUrl);
      } catch (e) {
        console.error("Failed to parse postData param:", e);
        Alert.alert("Error", "Failed to load post data for editing.");
        router.back();
      }
    } else {
      Alert.alert("Error", "No post data available for editing.");
      router.back();
    }
  }, [params.postData, router]);

  const handleImagePick = () => {
    Alert.alert("Add/Change Image", "Choose image source", [
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
            setPostImageUrl(result.assets[0].uri);
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
            allowsEditing: true,
          });

          if (!result.canceled) {
            setPostImageUrl(result.assets[0].uri);
          }
        },
      },
      {
        text: "Remove Image",
        onPress: () => setPostImageUrl(null),
        style: "destructive",
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
        headers: {},
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
    if (!user || !user.token) {
      Alert.alert(
        "Authentication Error",
        "You must be logged in to update posts."
      );
      router.replace("/login");
      return;
    }

    if (!postId) {
      Alert.alert("Error", "Post ID is missing. Cannot update.");
      return;
    }

    setLoading(true);
    let finalImageUrl: string | null = postImageUrl;

    if (postImageUrl && !postImageUrl.startsWith("http")) {
      finalImageUrl = await uploadImageToCloudinary(postImageUrl);
      if (!finalImageUrl) {
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        description: description,
        imageUrl: finalImageUrl,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/Post/UpdatePost${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.Message || "Post updated successfully!");
        router.back();
      } else {
        const errorMessage =
          data.Message ||
          data.title ||
          (data.errors && Object.values(data.errors).flat().join("\n")) ||
          "Failed to update post.";
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
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="bg-white rounded-lg shadow-md p-6">
        <Text className="text-2xl font-semibold text-gray-800 mb-6 text-center mt-2">
          Edit Post
        </Text>

        <Text className="text-lg font-semibold text-gray-800 mb-2 ml-4">
          {" "}
          Edit your thoughts
        </Text>
        <TextInput
          className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-4 text-gray-800 h-32 text-top"
          placeholder="What's on your mind?"
          placeholderTextColor="#9CA3AF"
          multiline={true}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
          editable={!loading}
        />

        {/* Image Preview and Add/Change Button */}
        {postImageUrl ? (
          <View className="mb-4 relative">
            <Image
              source={{ uri: postImageUrl }}
              className="w-full h-48 rounded-lg mb-2"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setPostImageUrl(null)} // Option to remove image
              className="absolute top-2 right-2 bg-red-500 p-1 rounded-full z-10"
              disabled={loading}
            >
              <XCircle size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleImagePick}
              className="bg-blue-500 py-3 rounded-lg flex-row items-center justify-center shadow-md"
              disabled={loading}
            >
              <ImageIcon size={20} color="white" className="mr-2" />
              <Text className="text-white text-base font-semibold">
                Change Image
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleImagePick}
            className="bg-gray-200 py-4 rounded-lg flex-row items-center justify-center mb-4 border border-gray-300"
            disabled={loading}
          >
            <ImageIcon size={20} color="#4B5563" className="mr-2" />
            <Text className="text-gray-700 text-base font-semibold">
              Add Image
            </Text>
          </TouchableOpacity>
        )}

        {/* Save Changes Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.9}
          style={{
            backgroundColor: "#1D4ED8",
            paddingVertical: 14,
            borderRadius: 12,
            shadowColor: "#1D4ED8",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-center text-white text-base font-semibold">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-300 py-3 rounded-lg mt-4 shadow"
          disabled={loading}
        >
          <Text className="text-gray-800 text-center text-base font-semibold">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditPostScreen;