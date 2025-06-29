/**
 * Main React Native App Entry Point
 * This file will load the Header, FeedScreen, and Footer components
 * to display the main application home page.
 */

import React from 'react';
import { StatusBar, View } from 'react-native';
// Import SafeAreaProvider as it should wrap the entire app for safe area handling
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import your custom components
// Adjust paths based on where you've placed these files:
// If they are in 'frontend/components/' and 'frontend/screens/' as discussed:
import Header from './android/app/src/components/Header'; // Your custom Header component
import FeedScreen from './android/app/src/components/FeedScreen'; // Your custom FeedScreen component
import Footer from './android/app/src/components/Footer'; // Your custom Footer component

// Define a simple color palette for StatusBar or other fixed colors
// This can be the same as the one used in your components, or imported from a common file
const colors = {
  background: '#F8F9FA', // Light Gray background
};

function App(): React.JSX.Element {
  // Using React.JSX.Element for TypeScript
  // We no longer need useColorScheme here as we're defining specific colors
  // and using Tailwind for most styling.

  return (
    // SafeAreaProvider must wrap the entire application content to provide
    // context for SafeAreaView components used in Header and Footer.
    <SafeAreaProvider className="flex-1 bg-gray-50">
      {' '}
      {/* Use flex-1 to fill screen, bg-gray-50 for background */}
      {/* StatusBar for overall app status bar appearance */}
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Header Component */}
      <Header title="Feed" showHamburger={true} />
      {/* Main Content Area - FeedScreen will take available vertical space */}
      <View className="flex-1">
        {' '}
        {/* flex-1 ensures it expands to fill space between Header and Footer */}
        <FeedScreen />
      </View>
      {/* Footer Component */}
      <Footer />
    </SafeAreaProvider>
  );
}

// Remove the StyleSheet.create block from App.tsx as we are now using Tailwind CSS
// and handling layout with flex properties and SafeAreaProvider/View components.
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

export default App;
