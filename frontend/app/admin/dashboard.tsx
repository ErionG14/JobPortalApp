// frontend/app/admin/dashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import {
  Users,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Cake,
  User,
  Shield,
  Edit,
  Trash2,
  Plus,
} from "lucide-react-native";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130";

interface UserData {
  id: string;
  email: string;
  userName: string;
  name: string | null;
  surname: string | null;
  address: string | null;
  birthdate: string | null;
  gender: string | null;
  phoneNumber: string | null;
  image: string | null;
  role: string;
}

const AdminDashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      Alert.alert(
        "Access Denied",
        "You must be logged in to access the Admin Dashboard."
      );
      router.replace("/login");
      return;
    }
    if (user.role !== "Admin") {
      Alert.alert(
        "Access Denied",
        "You do not have permission to view the Admin Dashboard."
      );
      router.replace("/");
      return;
    }
  }, [user, router, signOut]);

  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== "Admin") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/User/GetAllUsers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "API Response not OK for GetAllUsers:",
          response.status,
          errorText
        );
        let errorMessage = "Failed to fetch users.";
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

      const data: UserData[] = await response.json();
      setUsers(data);
      console.log("Fetched users for Admin Dashboard:", data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(
        err.message || "An unexpected error occurred while loading users."
      );
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("401") ||
        err.message.includes("403") ||
        (err.message.includes("Session Expired") && err.message.includes("401"))
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

  useEffect(() => {
    if (user && user.role === "Admin") {
      fetchUsers();
    } else if (user && user.role !== "Admin") {
      setLoading(false);
    }
  }, [user, fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = useCallback(
    async (userId: string, userName: string) => {
      if (!user || user.role !== "Admin" || !user.token) {
        Alert.alert(
          "Permission Denied",
          "You are not authorized to delete users."
        );
        return;
      }

      Alert.alert(
        "Confirm Deletion",
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setDeletingUserId(userId);
              try {
                const response = await fetch(
                  `${API_BASE_URL}/api/User/DeleteUser${userId}`,
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${user.token}`,
                    },
                  }
                );

                if (!response.ok) {
                  const errorText = await response.text();
                  console.error(
                    "API Response not OK for DeleteUser:",
                    response.status,
                    errorText
                  );
                  let errorMessage = "Failed to delete user.";
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

                const result = await response.json();
                Alert.alert(
                  "Success",
                  result.Message || `User "${userName}" deleted successfully.`
                );
                fetchUsers();
              } catch (err: any) {
                console.error("Error deleting user:", err);
                Alert.alert(
                  "Deletion Failed",
                  err.message || "An unexpected error occurred during deletion."
                );
                if (
                  err.message.includes("Unauthorized") ||
                  err.message.includes("401") ||
                  err.message.includes("403") ||
                  (err.message.includes("Session Expired") &&
                    err.message.includes("401"))
                ) {
                  Alert.alert("Session Expired", "Please log in again.", [
                    { text: "OK", onPress: signOut },
                  ]);
                  router.replace("/login");
                }
              } finally {
                setDeletingUserId(null);
              }
            },
          },
        ]
      );
    },
    [user, signOut, router, fetchUsers]
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading users...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg text-center mb-4">
          Error: {error}
        </Text>
        <TouchableOpacity
          onPress={fetchUsers}
          className="bg-blue-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!user || user.role !== "Admin") {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg text-center mb-4">
          Access Denied. You must be an Admin to view this page.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          className="bg-blue-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">Go Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (users.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Users size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-600 text-lg">
          No users found in the system.
        </Text>
        <TouchableOpacity
          onPress={fetchUsers}
          className="bg-blue-500 py-3 px-6 rounded-lg mt-4"
        >
          <Text className="text-white text-base font-semibold">Refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-3xl font-bold text-gray-800 text-center my-4">
          Admin Dashboard
        </Text>
        <Text className="text-lg text-gray-600 text-center mb-6">
          Manage all users in the system.
        </Text>

        {users.map((userData) => (
          <View
            key={userData.id}
            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
          >
            <View className="flex-row items-center mb-3">
              {userData.image ? (
                <Image
                  source={{ uri: userData.image }}
                  className="w-12 h-12 rounded-full"
                  style={{ marginRight: 16 }}
                  resizeMode="cover"
                  onError={(e) =>
                    console.log(
                      "Image Load Error:",
                      e.nativeEvent.error,
                      "URL:",
                      userData.image
                    )
                  }
                />
              ) : (
                <View
                  className="w-12 h-12 rounded-full bg-gray-200 flex justify-center items-center"
                  style={{ marginRight: 16 }}
                >
                  <UserCircle size={32} color="#6B7280" />
                </View>
              )}
              <View className="flex-1 ml-3">
                <Text className="text-lg font-bold text-gray-900">
                  {userData.name || "N/A"} {userData.surname || ""}
                </Text>
                <Text className="text-sm text-gray-600">
                  @{userData.userName}
                </Text>
              </View>
              <View className="flex-row items-center bg-blue-100 rounded-full px-3 py-1">
                <Shield size={14} color="#2563EB" className="mr-1" />
                <Text className="text-xs font-semibold text-blue-700">
                  {userData.role}
                </Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-3 mt-3">
              <View className="flex-row items-center mb-1">
                <Mail size={16} color="#6B7280" style={{ marginRight: 5 }} />
                <Text className="text-sm text-gray-700">{userData.email}</Text>
              </View>
              {userData.phoneNumber && (
                <View className="flex-row items-center mb-1">
                  <Phone size={16} color="#6B7280" style={{ marginRight: 5 }} />
                  <Text className="text-sm text-gray-700">
                    {userData.phoneNumber}
                  </Text>
                </View>
              )}
              {userData.address && (
                <View className="flex-row items-center mb-1">
                  <MapPin
                    size={16}
                    color="#6B7280"
                    style={{ marginRight: 5 }}
                  />
                  <Text className="text-sm text-gray-700">
                    {userData.address}
                  </Text>
                </View>
              )}
              {userData.birthdate && (
                <View className="flex-row items-center mb-1">
                  <Cake size={16} color="#6B7280" style={{ marginRight: 5 }} />
                  <Text className="text-sm text-gray-700">
                    {new Date(userData.birthdate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {userData.gender && (
                <View className="flex-row items-center mb-1">
                  <User size={16} color="#6B7280" style={{ marginRight: 5 }} />
                  <Text className="text-sm text-gray-700">
                    {userData.gender}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons (Edit/Delete Icons) */}
            <View className="flex-row justify-end mt-4 border-t border-gray-100 pt-3">
              <TouchableOpacity
                className="p-2 rounded-full bg-yellow-100 mr-2 flex items-center justify-center"
                onPress={() =>
                  router.push({
                    pathname: "/admin/edit-user",
                    params: { user: JSON.stringify(userData) },
                  })
                }
              >
                <Edit size={20} color="#D97706" />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2 rounded-full bg-red-100 flex items-center justify-center"
                onPress={() => handleDeleteUser(userData.id, userData.userName)}
                disabled={deletingUserId === userData.id}
              >
                {deletingUserId === userData.id ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Trash2 size={20} color="#DC2626" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button (FAB) for Add User */}
      <TouchableOpacity
        className="absolute bottom-6 bg-blue-600 p-4 rounded-full shadow-lg"
        style={styles.fabCentered}
        onPress={() => router.push("/admin/add-user")}
      >
        <Plus size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fabShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  fabCentered: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
      },
      android: {
        elevation: 12,
      },
    }),
    alignSelf: "center",
  },
});

export default AdminDashboardScreen;