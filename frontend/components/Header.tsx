// Header.tsx
import React from "react";
import {
  View,
  Text,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Menu } from "lucide-react-native";

interface HeaderProps {
  title?: string;
  showHamburger?: boolean;
}
type RootDrawerParamList = Record<string, object | undefined>;

const Header: React.FC<HeaderProps> = ({
  title = "Feed",
  showHamburger = true,
}) => {
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView
      className="bg-white border-b border-gray-200 shadow-sm"
      style={
        Platform.OS === "android"
          ? { paddingTop: StatusBar.currentHeight || 0 }
          : {}
      }
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View className="flex-row justify-between items-center px-5 py-4">
        {showHamburger && (
          <TouchableOpacity onPress={openDrawer} className="p-1">
            {" "}
            <Menu size={24} color="#333333" /> {/* Lucide Menu icon */}
          </TouchableOpacity>
        )}{" "}
        <Text className="text-xl font-bold text-gray-800">{title}</Text>{" "}
        <View className="w-6" />
      </View>
    </SafeAreaView>
  );
};

export default Header;