// frontend/app/apply-job.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { FileText, Link, Send } from "lucide-react-native";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130";

interface ApplyFormData {
  coverLetter: string;
  resumeUrl: string;
}

const ApplyJobScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { jobId: jobIdParam, jobTitle: jobTitleParam } = useLocalSearchParams();

  const jobId =
    typeof jobIdParam === "string" ? parseInt(jobIdParam, 10) : null;
  const jobTitle =
    typeof jobTitleParam === "string" ? jobTitleParam : "Unknown Job";

  const [formData, setFormData] = useState<ApplyFormData>({
    coverLetter: "",
    resumeUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId === null || isNaN(jobId)) {
      setInitialLoadError(
        "Invalid Job ID provided. Please go back and try again."
      );
    } else if (!user || !user.token) {
      setInitialLoadError("User not authenticated. Please log in.");
    } else if (user.role !== "User") {
      setInitialLoadError(
        "Access Denied: Only regular users can apply for jobs."
      );
    }
  }, [jobId, user]);

  const handleChange = (name: keyof ApplyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Check for initial load errors before attempting submission
    if (initialLoadError) {
      Alert.alert("Error", initialLoadError);
      return;
    }

    if (!jobId || !user || !user.token) {
      Alert.alert(
        "Error",
        "Application failed: Missing job ID or user authentication."
      );
      return;
    }

    if (user.role !== "User") {
      Alert.alert("Access Denied", "Only regular users can apply for jobs.");
      return;
    }

    // Basic client-side validation for resume URL if provided
    if (formData.resumeUrl && !/^https?:\/\/.+\..+/.test(formData.resumeUrl)) {
      Alert.alert(
        "Invalid URL",
        "Please enter a valid URL for your resume (e.g., https://example.com/resume.pdf)."
      );
      return;
    }

    setSubmitting(true);
    try {
      // --- CORRECT API CALL FOR SUBMISSION ---
      const response = await fetch(
        `${API_BASE_URL}/api/JobApplication/Apply/${jobId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "API Response not OK for ApplyForJob:",
          response.status,
          errorText
        );
        let errorMessage = "Failed to submit application.";
        if (response.status === 409) {
          errorMessage = "You have already applied for this job.";
        } else {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage =
              errorData.Message ||
              errorData.title ||
              (errorData.errors &&
                Object.values(errorData.errors).flat().join("\n")) ||
              errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${
              response.status
            }. Details: ${errorText.substring(0, 150)}...`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      Alert.alert(
        "Application Submitted!",
        result.Message ||
          `Your application for '${jobTitle}' has been successfully submitted.`
      );
      console.log("Job application successful:", result);
      router.back();
    } catch (err: any) {
      console.error("Error submitting application:", err);
      Alert.alert(
        "Application Failed",
        err.message ||
          "An unexpected error occurred during application submission."
      );
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("401") ||
        err.message.includes("403") ||
        (err.message.includes("Session Expired") && err.message.includes("401"))
      ) {
        Alert.alert("Session Expired", "Please log in again to apply.", [
          { text: "OK", onPress: signOut },
        ]);
        router.replace("/login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoadError) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg text-center mb-4">
          Error: {initialLoadError}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (jobId === null || isNaN(jobId)) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">
          Preparing application form...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-800 text-center mb-6 mt-1">
          Apply for Job
        </Text>

        {/* Job Summary (using jobTitle from params) */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200 mt-2">
          <Text className="text-xl font-bold text-gray-900 mb-1">
            {jobTitle}
          </Text>
          <Text className="text-base text-gray-700 mb-2">Job ID: {jobId}</Text>
        </View>

        {/* Cover Letter */}
        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1 mt-2">
            Cover Letter (Optional)
          </Text>
          <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <TextInput
              className="text-base text-gray-800 h-32"
              placeholder="Write your cover letter here..."
              value={formData.coverLetter}
              onChangeText={(text) => handleChange("coverLetter", text)}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
          </View>
        </View>

        {/* Resume URL */}
        <View className="mb-6">
          <Text className="text-base text-gray-700 mb-1">
            Resume URL (Optional)
          </Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <Link size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="e.g., https://yourwebsite.com/resume.pdf"
              keyboardType="url"
              autoCapitalize="none"
              value={formData.resumeUrl}
              onChangeText={(text) => handleChange("resumeUrl", text)}
              maxLength={500}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="w-full bg-blue-600 py-4 rounded-lg flex-row items-center justify-center shadow-xl active:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={20} color="#fff" className="mr-2" />
              <Text className="text-white text-lg font-semibold">
                Submit Application
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplyJobScreen;