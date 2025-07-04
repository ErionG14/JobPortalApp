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
          <Drawer.Screen
            name="(tabs)"
            options={{
              headerShown: true,
              header: ({ navigation }) => {
                const state = navigation.getState();
                const tabsRoute = state.routes.find(
                  (route) => route.name === "(tabs)"
                );

                let currentTabTitle = "Feed";

                if (tabsRoute && tabsRoute.state) {
                  const activeTabIndex = tabsRoute.state.index;
                  let activeTabRouteName: string | undefined = undefined;
                  if (
                    typeof activeTabIndex === "number" &&
                    tabsRoute.state.routes[activeTabIndex]
                  ) {
                    activeTabRouteName =
                      tabsRoute.state.routes[activeTabIndex].name;
                  }

                  if (activeTabRouteName === "index") {
                    currentTabTitle = "Feed";
                  } else if (activeTabRouteName === "create-post") {
                    currentTabTitle = "Create Post";
                  } else if (activeTabRouteName === "people") {
                    currentTabTitle = "People";
                  } else if (activeTabRouteName === "calendar") {
                    currentTabTitle = "Calendar";
                  } else if (activeTabRouteName === "notifications") {
                    currentTabTitle = "Notifications";
                  } else if (activeTabRouteName === "settings") {
                    currentTabTitle = "Settings";
                  } else if (activeTabRouteName === "profile") {
                    currentTabTitle = "My Profile";
                  } else if (activeTabRouteName === "jobs") {
                    // Add this for the jobs tab
                    currentTabTitle = "Jobs";
                  } else {
                    currentTabTitle = activeTabRouteName ?? "Feed";
                  }
                }

                return <Header title={currentTabTitle} showHamburger={true} />;
              },
              drawerLabel: "Home",
              drawerIcon: ({ focused, color, size }) => (
                <Home size={size} color={focused ? "#22C55E" : color} />
              ),
            }}
          />

          {/* Login screen */}
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

          {/* Signup screen */}
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

          {/* --- ADDED/UPDATED SCREENS BELOW --- */}

          {/* My Posted Jobs screen */}
          <Drawer.Screen
            name="my-posted-jobs"
            options={{
              drawerLabel: "My Posted Jobs",
              title: "My Posted Jobs",
              headerShown: true,
            }}
          />

          {/* Create Job screen */}
          <Drawer.Screen
            name="create-job"
            options={{
              headerShown: true,
              title: "Post New Job",
              drawerLabel: () => null,
              swipeEnabled: false,
            }}
          />

          {/* Edit Job screen */}
          <Drawer.Screen
            name="edit-job"
            options={{
              headerShown: true,
              title: "Edit Job",
              drawerLabel: () => null,
              swipeEnabled: false,
            }}
          />

          {/* Apply Job Screen (now a single file, takes query params) */}
          <Drawer.Screen
            name="apply-job"
            options={{
              headerShown: true,
              title: "Apply for Job",
              drawerLabel: () => null,
              swipeEnabled: false,
            }}
          />

          {/* Edit Profile Screen (hidden from drawer) */}
          <Drawer.Screen
            name="edit-profile"
            options={{
              headerShown: false,
              drawerItemStyle: { height: 0, overflow: "hidden" },
              drawerLabel: () => null,
            }}
          />

          {/* Not-found screen (hidden from drawer) */}
          <Drawer.Screen
            name="+not-found"
            options={{
              headerShown: false,
              drawerItemStyle: { height: 0, overflow: "hidden" },
              drawerLabel: () => null,
            }}
          />
        </Drawer>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}