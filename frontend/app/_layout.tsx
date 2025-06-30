// frontend/app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Drawer } from "expo-router/drawer";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";
import CustomDrawerContent from "../components/CustomDrawerContent";
import { Home, LogIn, UserPlus } from "lucide-react-native";
import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        {" "}
        <Drawer
          initialRouteName="(tabs)"
          screenOptions={{
            headerShown: false,
            drawerType: "slide",
            drawerStyle: {
              backgroundColor: "#FFFFFF",
            },
          }}
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >

          {/* Main app content (tabs navigator group) */}
          <Drawer.Screen
            name="(tabs)"
            options={{
              headerShown: true,
              header: ({ navigation }) => (
                <Header title="Feed" showHamburger={true} />
              ),
              drawerLabel: "Home",
              drawerIcon: ({ focused, color, size }) => (
                <Home size={size} color={focused ? "#22C55E" : color} />
              ),
            }}
          />

          {/* Login screen, accessible as a separate item from the drawer menu */}
          <Drawer.Screen
            name="login"
            options={{
              headerShown: false,
              drawerLabel: "Login",
              drawerIcon: ({ focused, color, size }) => (
                <LogIn size={size} color={focused ? "#3B82F6" : color} />
              ),
            }}
          />

          <Drawer.Screen
            name="signup"
            options={{
              headerShown: false,
              drawerLabel: "Sign Up",
              drawerIcon: ({ focused, color, size }) => (
                <UserPlus size={size} color={focused ? "#3B82F6" : color} />
              ),
            }}
          />
          <Drawer.Screen
            name="+not-found"
            options={{
              headerShown: false,
              drawerItemStyle: { height: 0, overflow: "hidden" },
              drawerLabel: () => null,
            }}
          />
        </Drawer>
      </AuthProvider>{" "}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
