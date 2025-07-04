// frontend/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { Platform } from "react-native";

// --- IMPORTANT: CONFIGURE YOUR BACKEND API BASE URL HERE ---
const API_BASE_URL = "http://192.168.178.34:5130"; // <--- ENSURE THIS IS YOUR CORRECT BACKEND URL

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
  username?: string;
  surname?: string;
  address?: string;
  birthdate?: string;
  gender?: string;
  phoneNumber?: string;
  image?: string; // This is correctly defined
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateAuthUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchFullUserProfile = async (
    token: string,
    userId: string
  ): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/User/MyProfile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(
          "Failed to fetch full user profile:",
          response.status,
          await response.text()
        );
        return null;
      }

      const profileData = await response.json();
      console.log("Fetched full profile data:", profileData);

      const decodedToken: any = jwtDecode(token);

      return {
        id: userId,
        email: profileData.email || decodedToken.email,
        name: profileData.name || decodedToken.name || decodedToken.unique_name,
        surname: profileData.surname || decodedToken.family_name,
        username:
          profileData.userName || decodedToken.unique_name || decodedToken.name,
        address: profileData.address,
        birthdate: profileData.birthdate,
        gender: profileData.gender,
        phoneNumber: profileData.phoneNumber,
        image: profileData.image,
        token: token,
      };
    } catch (error) {
      console.error("Error fetching full user profile:", error);
      return null;
    }
  };

  const processLogin = async (token: string) => {
    try {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.nameid || "unknown"; 
      const fullProfile = await fetchFullUserProfile(token, userId);

      if (fullProfile) {
        setUser(fullProfile);
        if (Platform.OS === "ios" || Platform.OS === "android") {
          await SecureStore.setItemAsync("userToken", token);
          console.log("User logged in and token stored securely.");
        } else {
          console.log("User logged in (token not stored securely on web).");
        }
      } else {
        console.error(
          "Failed to get full user profile after login. Logging out."
        );
        await logout();
      }
    } catch (error) {
      console.error("Error decoding token or processing login:", error);
      setUser(null);
      if (Platform.OS === "ios" || Platform.OS === "android") {
        await SecureStore.deleteItemAsync("userToken");
        console.log("Invalid token cleared from secure store.");
      } else {
        console.log("Invalid token not stored on web.");
      }
    }
  };

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        if (Platform.OS === "ios" || Platform.OS === "android") {
          const storedToken = await SecureStore.getItemAsync("userToken");
          if (storedToken) {
            const decodedToken: any = jwtDecode(storedToken);
            const userId = decodedToken.nameid || "unknown";

            const fullProfile = await fetchFullUserProfile(storedToken, userId);
            if (fullProfile) {
              setUser(fullProfile);
            } else {
              console.error(
                "Failed to load full user profile from storage. Logging out."
              );
              await SecureStore.deleteItemAsync("userToken");
              setUser(null);
            }
          }
        } else {
          console.log("Skipping secure store check on web.");
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
        await SecureStore.deleteItemAsync("userToken");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (token: string) => {
    setIsLoading(true);
    await processLogin(token);
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
    if (Platform.OS === "ios" || Platform.OS === "android") {
      await SecureStore.deleteItemAsync("userToken");
      console.log("User logged out and token removed securely.");
    } else {
      console.log(
        "User logged out (token not removed from secure store on web)."
      );
    }
  };

  const updateAuthUser = (updatedFields: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedFields };
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, updateAuthUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
