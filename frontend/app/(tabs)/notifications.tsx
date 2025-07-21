// frontend/app/(tabs)/notifications.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Bell, Mail, MailOpen, Briefcase, Check } from "lucide-react-native";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130";
interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  jobId: number | null;
  jobTitle: string | null;
}

const NotificationsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getTimeAgo = (dateString: string) => {
    const notificationDate = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor(
      (now.getTime() - notificationDate.getTime()) / 1000
    );

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

  const fetchNotifications = useCallback(async () => {
    if (!user || !user.token) {
      setError("You must be logged in to view notifications.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Notification/GetMyNotifications`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "API Response not OK for GetMyNotifications:",
          response.status,
          errorText
        );
        let errorMessage = "Failed to fetch notifications.";
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

      const data: Notification[] = await response.json();
      setNotifications(data);
      console.log("Fetched notifications:", data);
    } catch (err: any) {
      console.error("Error fetching notifications (catch block):", err);
      setError(
        err.message ||
          "An unexpected error occurred while loading notifications."
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

  const markAsRead = useCallback(
    async (notificationId: number) => {
      if (!user || !user.token) {
        Alert.alert(
          "Authentication Required",
          "Please log in to mark notifications as read."
        );
        return;
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Notification/MarkAsRead/${notificationId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "API Response not OK for MarkAsRead:",
            response.status,
            errorText
          );
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, isRead: false } : n
            )
          );
          let errorMessage = "Failed to mark notification as read.";
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
        console.log(
          `Notification ${notificationId} marked as read successfully.`
        );
      } catch (err: any) {
        console.error("Error marking notification as read:", err);
        Alert.alert(
          "Error",
          err.message || "Failed to mark notification as read."
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
        }
      }
    },
    [user, signOut]
  );

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setLoading(false);
      setError("Please log in to view notifications.");
    }
  }, [user, fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (user) {
      fetchNotifications();
    } else {
      setRefreshing(false);
    }
  }, [user, fetchNotifications]);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading notifications...</Text>
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
          onPress={fetchNotifications}
          className="bg-blue-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-base font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Bell size={48} color="#9CA3AF" />
        <Text className="mt-4 text-gray-600 text-lg">
          No new notifications.
        </Text>
      </View>
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
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            onPress={() => !notification.isRead && markAsRead(notification.id)}
            className={`flex-row items-center p-4 mb-3 rounded-lg shadow-sm border ${
              notification.isRead
                ? "bg-gray-100 border-gray-200"
                : "bg-white border-blue-100"
            }`}
          >
            {/* Icon for notification status */}
            {notification.isRead ? (
              <MailOpen size={24} color="#6B7280" style={{ marginRight: 12 }} />
            ) : (
              <Mail size={24} color="#2563EB" style={{ marginRight: 12 }} />
            )}
            <View className="flex-1">
              <Text
                className={`text-base font-semibold ${
                  notification.isRead ? "text-gray-600" : "text-gray-900"
                }`}
              >
                {notification.message}
              </Text>
              {notification.jobTitle && (
                <View className="flex-row items-center mt-1">
                  <Briefcase
                    size={14}
                    color="#6B7280"
                    style={{ marginRight: 5 }}
                  />
                  <Text className="text-xs text-gray-500">
                    Job: {notification.jobTitle}
                  </Text>
                </View>
              )}
              <Text className="text-xs text-gray-400 mt-1">
                {getTimeAgo(notification.createdAt)}
              </Text>
            </View>
            {!notification.isRead && (
              <TouchableOpacity
                onPress={() => markAsRead(notification.id)}
                className="ml-4 p-2 bg-blue-500 rounded-full flex items-center justify-center aspect-square"
              >
                <Check size={20} color="white" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;