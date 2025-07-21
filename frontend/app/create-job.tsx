// frontend/app/create-job.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Save,
} from "lucide-react-native";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130";

interface JobFormData {
  title: string;
  description: string;
  location: string;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  companyName: string;
  applicationDeadline: string;
}

const CreateJobScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    location: "",
    employmentType: "",
    salaryMin: null,
    salaryMax: null,
    companyName: "",
    applicationDeadline: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};
    if (!formData.title) newErrors.title = "Job title is required.";
    else if (formData.title.length > 100)
      newErrors.title = "Title cannot exceed 100 characters.";

    if (!formData.description)
      newErrors.description = "Job description is required.";
    else if (formData.description.length > 500)
      newErrors.description = "Description cannot exceed 500 characters.";

    if (!formData.location) newErrors.location = "Location is required.";
    else if (formData.location.length > 100)
      newErrors.location = "Location cannot exceed 100 characters.";

    if (!formData.employmentType)
      newErrors.employmentType = "Employment type is required.";
    else if (formData.employmentType.length > 50)
      newErrors.employmentType = "Employment type cannot exceed 50 characters.";

    if (!formData.companyName)
      newErrors.companyName = "Company name is required.";
    else if (formData.companyName.length > 255)
      newErrors.companyName = "Company name cannot exceed 255 characters.";

    if (
      formData.salaryMin !== null &&
      (formData.salaryMin < 0 || formData.salaryMin > 1000000)
    ) {
      newErrors.salaryMin = "Minimum salary must be between 0 and 1,000,000.";
    }
    if (
      formData.salaryMax !== null &&
      (formData.salaryMax < 0 || formData.salaryMax > 1000000)
    ) {
      newErrors.salaryMax = "Maximum salary must be between 0 and 1,000,000.";
    }
    if (
      formData.salaryMin !== null &&
      formData.salaryMax !== null &&
      formData.salaryMin > formData.salaryMax
    ) {
      newErrors.salaryMax =
        "Maximum salary cannot be less than minimum salary.";
    }

    if (!formData.applicationDeadline)
      newErrors.applicationDeadline = "Application deadline is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    name: keyof JobFormData,
    value: string | number | Date | null
  ) => {
    if (name === "salaryMin" || name === "salaryMax") {
      setFormData({
        ...formData,
        [name]: value === "" ? null : Number(value),
      });
    } else if (name === "applicationDeadline") {
      setFormData({
        ...formData,
        [name]: (value as Date).toISOString().split("T")[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleChange("applicationDeadline", selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please correct the errors in the form.");
      return;
    }

    if (!user || !user.token || user.role !== "Manager") {
      Alert.alert(
        "Access Denied",
        "Only managers can post jobs. Please log in as a manager."
      );
      router.replace("/login");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/Job/CreateJob`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "API Response not OK for CreateJob:",
          response.status,
          errorText
        );
        let errorMessage = "Failed to create job.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage =
            errorData.Message ||
            errorData.title ||
            (errorData.errors &&
              Object.values(errorData.errors)
                .flat()
                .map((e: any) => e.errorMessage || e.description || e)
                .join("\n")) ||
            errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${
            response.status
          }. Details: ${errorText.substring(0, 150)}...`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      Alert.alert("Success", result.Message || "Job posted successfully!");
      console.log("Job created successfully:", result);
      router.back();
    } catch (err: any) {
      console.error("Error creating job:", err);
      setError(
        err.message || "An unexpected error occurred while posting the job."
      );
      Alert.alert("Error", err.message || "Failed to post job.");
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("401") ||
        err.message.includes("403")
      ) {
        Alert.alert("Session Expired", "Please log in again.", [
          { text: "OK", onPress: signOut },
        ]);
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "Manager") {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg text-center">
          Access Denied: Only Managers can post new jobs.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          className="bg-blue-500 py-3 px-6 rounded-lg mt-4"
        >
          <Text className="text-white text-base font-semibold">Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-800 text-center mb-6">
          Post a New Job
        </Text>

        {/* Title */}
        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">Job Title</Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <Briefcase size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="e.g., Senior Software Engineer"
              value={formData.title}
              onChangeText={(text) => handleChange("title", text)}
              maxLength={100}
            />
          </View>
          {errors.title && (
            <Text className="text-red-500 text-sm mt-1">{errors.title}</Text>
          )}
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">Job Description</Text>
          <View className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <TextInput
              className="text-base text-gray-800 h-32"
              placeholder="Detailed description of the role..."
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
          {errors.description && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.description}
            </Text>
          )}
        </View>

        {/* Company Name */}
        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">Company Name</Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <Building size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="e.g., Tech Innovations Inc."
              value={formData.companyName}
              onChangeText={(text) => handleChange("companyName", text)}
              maxLength={255}
            />
          </View>
          {errors.companyName && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.companyName}
            </Text>
          )}
        </View>

        {/* Location */}
        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">Location</Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <MapPin size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="e.g., New York, NY"
              value={formData.location}
              onChangeText={(text) => handleChange("location", text)}
              maxLength={100}
            />
          </View>
          {errors.location && (
            <Text className="text-red-500 text-sm mt-1">{errors.location}</Text>
          )}
        </View>

        {/* Employment Type */}
        <View className="mb-4">
          <Text className="text-base text-gray-700 mb-1">Employment Type</Text>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <Briefcase size={20} color="#6B7280" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="e.g., Full-time, Remote, Contract"
              value={formData.employmentType}
              onChangeText={(text) => handleChange("employmentType", text)}
              maxLength={50}
            />
          </View>
          {errors.employmentType && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.employmentType}
            </Text>
          )}
        </View>

        {/* Salary Min/Max */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-base text-gray-700 mb-1">
              Min Salary (USD)
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <DollarSign size={20} color="#6B7280" className="mr-2" />
              <TextInput
                className="flex-1 text-base text-gray-800"
                placeholder="e.g., 50000"
                keyboardType="numeric"
                value={
                  formData.salaryMin === null ? "" : String(formData.salaryMin)
                }
                onChangeText={(text) => handleChange("salaryMin", text)}
              />
            </View>
            {errors.salaryMin && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.salaryMin}
              </Text>
            )}
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-base text-gray-700 mb-1">
              Max Salary (USD)
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <DollarSign size={20} color="#6B7280" className="mr-2" />
              <TextInput
                className="flex-1 text-base text-gray-800"
                placeholder="e.g., 80000"
                keyboardType="numeric"
                value={
                  formData.salaryMax === null ? "" : String(formData.salaryMax)
                }
                onChangeText={(text) => handleChange("salaryMax", text)}
              />
            </View>
            {errors.salaryMax && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.salaryMax}
              </Text>
            )}
          </View>
        </View>

        {/* Application Deadline */}
        <View className="mb-6">
          <Text className="text-base text-gray-700 mb-1">
            Application Deadline
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-white"
          >
            <Calendar size={20} color="#6B7280" className="mr-2" />
            <Text className="flex-1 text-base text-gray-800">
              {new Date(formData.applicationDeadline).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {errors.applicationDeadline && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.applicationDeadline}
            </Text>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.applicationDeadline)}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-600 py-4 rounded-lg flex-row items-center justify-center shadow-md"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save size={20} color="#fff" className="mr-2" />
              <Text className="text-white text-lg font-semibold">Post Job</Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <Text className="text-red-600 text-center mt-4 text-base">
            {error}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateJobScreen;