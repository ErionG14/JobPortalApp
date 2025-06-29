// Header.js
// This component encapsulates the top navigation bar (hamburger menu and "Feed" title).

import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
// Use react-native-safe-area-context for more robust safe area handling
// Make sure to install it: npm install react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Color Palette (Centralized for easy modification) ---
const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  accent: '#007bff',
  icon: '#666666',
};

const Header = ({ title = 'Feed', showHamburger = true }) => {
  return (
    // SafeAreaView is used here for better handling of notches on iOS devices
    // For Android, paddingTop is typically handled by StatusBar.currentHeight
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.cardBackground}
      />
      <View style={styles.headerContainer}>
        {showHamburger && <Text style={styles.headerIcon}>☰</Text>}{' '}
        {/* Hamburger menu icon */}
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRightPlaceholder} />{' '}
        {/* Placeholder for alignment */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.cardBackground,
    // On Android, explicitly add paddingTop if StatusBar is not translucent,
    // though SafeAreaView often handles this if used at the root.
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3, // Android shadow
  },
  headerIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerRightPlaceholder: {
    width: 24, // To balance the hamburger icon on the left
  },
});

export default Header;
