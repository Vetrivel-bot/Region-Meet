import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from 'styled-components/native';
import AnimatedHamburger from 'react-native-animated-hamburger';

export default function MyTotallyCustomHeaderBar({ navigation, options }) {
  const theme = useTheme();
  const canGoBack = navigation?.canGoBack?.();

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.headerBackground || theme.colors.background },
      ]}>
      <View style={styles.container}>
        {/* Left: Hamburger or Back Button */}
        <View style={styles.left}>
          {canGoBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
              <Text style={[styles.backText, { color: theme.colors.primary }]}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.menuButton}>
              <AnimatedHamburger
                active={false} // The drawer handles the active state
                type="spinCross"
                color={theme.colors.primary}
                onPress={() => navigation.openDrawer()}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
                style={styles.hamburger}
              />
            </View>
          )}
        </View>

        {/* Center: Logo */}
        <View style={styles.center}>
          <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.8}>
            <Image
              style={styles.logo}
              source={require('@/assets/favicon.png')}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Right: Icons */}
        <View style={styles.right}>
          <TouchableOpacity onPress={() => {}} style={styles.iconButton}>
            <Ionicons name="search" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={styles.profileButton}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>VS</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {},
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  center: {
    flex: 1.5,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 15,
  },
  logo: {
    width: 120,
    height: 36,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  menuButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburger: {
    width: 40,
    height: 40,
  },
  iconButton: {
    marginLeft: 10,
  },
  profileButton: {
    marginLeft: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
