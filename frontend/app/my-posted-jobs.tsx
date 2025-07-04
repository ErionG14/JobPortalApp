// frontend/app/my-posted-jobs.tsx
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
  MoreVertical,
  FileText,
  Plus, // <--- Ensure Plus is imported
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useRouter, useFocusEffect } from "expo-router";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130";

// Interface for Job data (matching the JobDisplayDTO from backend)
interface ManagerPostedJob {
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
  managerName: string;
  managerSurname: string;
  managerImage: string | null;
}

const MyPostedJobsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [myJobs, setMyJobs] = useState<ManagerPostedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to format time ago
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

  const fetchMyPostedJobs = useCallback(async () => {
    console.log("fetchMyPostedJobs: Current user:", user?.email);
    console.log("fetchMyPostedJobs: Current user role:", user?.role);
    console.log(
      "fetchMyPostedJobs: Current user token present:",
      !!user?.token
    );

    if (!user || !user.token || user.role !== "Manager") {
      const authError =
        "You must be logged in as a Manager to view your posted jobs.";
      console.warn("Auth check failed for MyPostedJobsScreen:", authError);
      setError(authError);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Job/GetMyPostedJobs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "API Response not OK for GetMyPostedJobs:",
          response.status,
          errorText
        );
        let errorMessage = "Failed to fetch your posted jobs.";
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

      const data: ManagerPostedJob[] = await response.json();
      setMyJobs(data);
      console.log("Fetched My Posted Jobs:", data);
    } catch (err: any) {
      console.error("Error fetching my posted jobs (catch block):", err);
      setError(
        err.message || "An unexpected error occurred while loading your jobs."
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
        router.replace("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, signOut, router]);

  useFocusEffect(
    useCallback(() => {
      fetchMyPostedJobs();
      return () => {
        // Cleanup if needed
      };
    }, [fetchMyPostedJobs])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyPostedJobs();
  }, [fetchMyPostedJobs]);

  const handleJobOptions = (job: ManagerPostedJob) => {
    Alert.alert(
      "Job Options",
      `What would you like to do with "${job.title}"?`,
      [
        {
          text: "Edit Job",
          onPress: () => handleEditJob(job),
        },
        {
          text: "Delete Job",
          onPress: () => handleDeleteJob(job.id),
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditJob = (job: ManagerPostedJob) => {
    Alert.alert("Edit Job", `Navigating to edit job with ID: ${job.id}`);
    router.push({
      pathname: "/edit-job", // This route needs to exist and be correctly configured
      params: { jobData: JSON.stringify(job) },
    });
  };

  const handleDeleteJob = async (jobId: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this job? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user || !user.token) {
              Alert.alert("Error", "You must be logged in to delete jobs.");
              return;
            }
            setLoading(true); // Show loading while deleting
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/Job/DeleteJob${jobId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                  },
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.Message || "Failed to delete job.");
              }

              Alert.alert("Success", "Job deleted successfully!");
              fetchMyPostedJobs(); // Refresh the list of jobs after deletion
            } catch (err: any) {
              console.error("Error deleting job:", err);
              Alert.alert("Error", err.message || "Failed to delete job.");
            } finally {
              setLoading(false); // Hide loading
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading your jobs...</Text>
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
          onPress={fetchMyPostedJobs}
          className="bg-blue-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (user && user.role !== "Manager") {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg text-center">
          Access Denied: Only Managers can view this page.
        </Text>
      </View>
    );
  }

  if (myJobs.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <FileText size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-600 text-lg text-center">
          You haven&#39;t posted any jobs yet.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/create-job")}
          className="bg-blue-500 py-3 px-6 rounded-lg mt-4"
        >
          <Text className="text-white text-base font-semibold">
            Post a New Job
          </Text>
        </TouchableOpacity>
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
      {/* --- MODIFIED: "My Posted Jobs" Text title with Plus icon --- */}
      <View className="flex-row items-center justify-between my-4 px-4">
        <Text className="text-2xl font-bold text-gray-800">My Posted Jobs</Text>
        <TouchableOpacity
          onPress={() => router.push("/create-job")}
          className="p-2 rounded-full bg-blue-500 shadow-md"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>
      {/* --- END MODIFIED --- */}
      {myJobs.map((job) => (
        <View
          key={job.id}
          className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
        >
          {/* Job Header: Manager Info and 3-dot menu */}
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
            <Text className="text-xs text-gray-500 mr-2">
              Posted {getTimeAgo(job.postedDate)}
            </Text>
            <TouchableOpacity
              onPress={() => handleJobOptions(job)}
              className="p-1"
            >
              <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>
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

          {/* No "Apply Now" button here, as this is for the manager who posted it */}
        </View>
      ))}
    </ScrollView>
  );
};

export default MyPostedJobsScreen;
