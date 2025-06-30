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

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processLogin = async (token: string) => {
    try {
      const decodedToken: any = jwtDecode(token);

      const newUser: User = {
        id: decodedToken.nameid || "unknown",
        email: decodedToken.email,
        name:
          decodedToken.name || decodedToken.unique_name || decodedToken.email,
        token: token,
      };
      setUser(newUser);

      if (Platform.OS === "ios" || Platform.OS === "android") {
        await SecureStore.setItemAsync("userToken", token);
        console.log("User logged in and token stored securely.");
      } else {
        console.log("User logged in (token not stored securely on web).");
        // localStorage.setItem('userToken', token); // Optional: for web dev persistence
      }
    } catch (error) {
      console.error("Error decoding token or processing login:", error);
      setUser(null);
      if (Platform.OS === "ios" || Platform.OS === "android") {
        await SecureStore.deleteItemAsync("userToken");
        console.log("Invalid token cleared from secure store.");
      } else {
        // localStorage.removeItem('userToken'); // Optional: for web dev persistence
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
            await processLogin(storedToken);
          }
        } else {
          console.log("Skipping secure store check on web.");
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const login = async (token: string) => {
    await processLogin(token);
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
