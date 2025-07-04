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
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  UserCircle,
  Building,
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130";

interface JobListing {
  id: number;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  companyName: string;
  postedDate: string;
  applicationDeadline: string;
  managerId: string;
  managerUserName: string;
  managerName: string;
  managerSurname: string;
  managerImage: string | null;
}

const JobsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "API Response not OK for GetAllJobs:",
          response.status,
          errorText
        );
        let errorMessage = "Failed to fetch jobs.";
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
        throw new Error(errorMessage);
      }

      const data: JobListing[] = await response.json();
      setJobs(data);
      console.log("Fetched jobs:", data);
    } catch (err: any) {
      console.error("Error fetching jobs (catch block):", err);
      setError(
        err.message || "An unexpected error occurred while loading jobs."
      );
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("401") ||
        err.message.includes("403") ||
        (err.message.includes("Server error") &&
          (err.message.includes("401") || err.message.includes("403")))
      ) {
        Alert.alert("Session Expired", "Please log in again.", [
          { text: "OK", onPress: signOut },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, signOut]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    } else {
      setLoading(false);
      setError("Please log in to view job listings.");
    }
  }, [user, fetchJobs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (user) {
      fetchJobs();
    } else {
      setRefreshing(false);
    }
  }, [user, fetchJobs]);

  const handleNavigateToApply = useCallback(
    (jobId: number, jobTitle: string) => {
      if (!user || !user.token) {
        Alert.alert(
          "Authentication Required",
          "Please log in to apply for jobs."
        );
        return;
      }

      if (user.role !== "User") {
        Alert.alert("Access Denied", "Only regular users can apply for jobs.");
        return;
      }

      router.push({
        pathname: "/apply-job",
        params: { jobId: jobId.toString(), jobTitle: jobTitle },
      });
    },
    [user, router]
  );

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
          onPress={fetchJobs}
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
                {job.managerName} {job.managerSurname}
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

          {user && user.role === "User" && user.id !== job.managerId ? (
            <TouchableOpacity
              onPress={() => handleNavigateToApply(job.id, job.title)}
              className="bg-blue-600 py-3 rounded-lg mt-4 shadow-md"
            >
              <Text className="text-white text-center text-base font-semibold">
                Apply Now
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-gray-300 py-3 rounded-lg mt-4">
              <Text className="text-gray-600 text-center text-base font-semibold">
                {user && user.role !== "User"
                  ? "Managers/Admins cannot apply"
                  : user && user.id === job.managerId
                  ? "You posted this job"
                  : "Login to Apply"}
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default JobsScreen;
