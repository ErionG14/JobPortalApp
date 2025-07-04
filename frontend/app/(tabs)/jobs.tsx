// frontend/app/(tabs)/jobs.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Briefcase, // Icon for job
  MapPin, // Icon for location
  DollarSign, // Icon for salary
  Calendar, // Icon for deadline
  UserCircle, // Placeholder for manager image
  Building, // Icon for company
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130";

// Interface for Job data (matching the anonymous type from GetAllJobs)
interface JobListing {
  id: number;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  companyName: string;
  postedDate: string; // ISO string
  applicationDeadline: string; // ISO string
  managerId: string;
  managerUserName: string;
  managerFirstName: string;
  managerLastName: string;
  managerImage: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

const JobsScreen: React.FC = () => {
  const { user } = useAuth(); // Access the user object which contains the token
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to format time ago (similar to posts)
  const getTimeAgo = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
  };

  const fetchJobs = useCallback(async () => {
    // Check if user and token exist before making an authorized request
    if (!user || !user.token) {
      setError("You must be logged in to view jobs.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Job/GetAllJobs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`, // <--- ADDED: Authorization header
        },
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get raw text for better debugging
        console.error("API Response not OK:", response.status, errorText);
        let errorMessage = "Failed to fetch jobs.";
        try {
          const errorData = JSON.parse(errorText); // Try parsing as JSON
          errorMessage =
            errorData.Message ||
            errorData.title ||
            (errorData.errors &&
              Object.values(errorData.errors).flat().join("\n")) ||
            errorMessage;
        } catch (e) {
          // If not JSON, use the raw text
          errorMessage = `Server error: ${
            response.status
          } ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }

      const data: JobListing[] = await response.json();
      setJobs(data);
      console.log("Fetched jobs:", data);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || "An unexpected error occurred.");
      Alert.alert("Error", err.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]); // <--- ADDED 'user' to useCallback dependencies

  useEffect(() => {
    // Only fetch jobs if user is available (i.e., authenticated)
    if (user) {
      fetchJobs();
    } else {
      setLoading(false); // If no user, stop loading and show message
      setError("Please log in to view job listings.");
    }
  }, [user, fetchJobs]); // <--- ADDED 'user' to useEffect dependencies

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (user) {
      // Only refresh if user is logged in
      fetchJobs();
    } else {
      setRefreshing(false); // Stop refreshing if not logged in
    }
  }, [user, fetchJobs]);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg text-center mb-4">
          Error: {error}
        </Text>
        <TouchableOpacity
          onPress={fetchJobs} // This will now include the token
          className="bg-blue-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Briefcase size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-600 text-lg">
          No job listings available yet.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {jobs.map((job) => (
        <View
          key={job.id}
          className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
        >
          {/* Job Header: Manager Info */}
          <View className="flex-row items-center mb-3">
            {job.managerImage ? (
              <Image
                source={{ uri: job.managerImage }}
                className="w-10 h-10 rounded-full mr-2"
                resizeMode="cover"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-gray-200 mr-2 flex justify-center items-center">
                <UserCircle size={28} color="#6B7280" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-800">
                {job.managerFirstName} {job.managerLastName}
              </Text>
              <Text className="text-sm text-gray-600">
                @{job.managerUserName || "Manager"}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              Posted {getTimeAgo(job.postedDate)}
            </Text>
          </View>

          {/* Job Details */}
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {job.title}
          </Text>
          <Text className="text-base text-gray-700 mb-3">
            {job.description}
          </Text>

          <View className="flex-row items-center mb-2">
            <Building size={18} color="#6B7280" className="mr-2" />
            <Text className="text-sm text-gray-600">{job.companyName}</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <MapPin size={18} color="#6B7280" className="mr-2" />
            <Text className="text-sm text-gray-600">{job.location}</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Briefcase size={18} color="#6B7280" className="mr-2" />
            <Text className="text-sm text-gray-600">{job.employmentType}</Text>
          </View>

          {job.salaryMin !== null && job.salaryMax !== null && (
            <View className="flex-row items-center mb-2">
              <DollarSign size={18} color="#6B7280" className="mr-2" />
              <Text className="text-sm text-gray-600">
                ${job.salaryMin.toLocaleString()} - $
                {job.salaryMax.toLocaleString()}
              </Text>
            </View>
          )}
          {job.salaryMin !== null && job.salaryMax === null && (
            <View className="flex-row items-center mb-2">
              <DollarSign size={18} color="#6B7280" className="mr-2" />
              <Text className="text-sm text-gray-600">
                From ${job.salaryMin.toLocaleString()}
              </Text>
            </View>
          )}
          {job.salaryMax !== null && job.salaryMin === null && (
            <View className="flex-row items-center mb-2">
              <DollarSign size={18} color="#6B7280" className="mr-2" />
              <Text className="text-sm text-gray-600">
                Up to ${job.salaryMax.toLocaleString()}
              </Text>
            </View>
          )}

          <View className="flex-row items-center mt-2 border-t border-gray-100 pt-3">
            <Calendar size={18} color="#6B7280" className="mr-2" />
            <Text className="text-sm text-gray-600">
              Apply by: {new Date(job.applicationDeadline).toLocaleDateString()}
            </Text>
          </View>

          {/* Call to Action: Apply Button (Future feature) */}
          <TouchableOpacity
            onPress={() => Alert.alert("Apply", `Applying for: ${job.title}`)}
            className="bg-blue-600 py-3 rounded-lg mt-4 shadow-md"
          >
            <Text className="text-white text-center text-base font-semibold">
              Apply Now
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default JobsScreen;
