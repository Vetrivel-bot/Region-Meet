// components/HeaderBar.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useTheme } from 'styled-components/native';

export default function MyTotallyCustomHeaderBar() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();

  // === MANUAL ROOTS: put EXACT segment strings here you want to treat as "root" ===
  // Examples: "(tabs)/(home)/index" or "(tabs)/search" or "profile"
  // Inspect runtime with console.log(segments.join('/')) if unsure, then add that string here.
  const rootPaths = [
    '(tabs)/(home)',
    '(tabs)/search',
    '(tabs)/profile',
    '(tabs)/agenda',
    // add more exact strings as needed
  ];

  // join current segments into a single string to compare against rootPaths
  const segPath = segments.join('/'); // e.g. "(tabs)/(home)/index"
  // show back arrow only when current path is NOT one of the declared rootPaths
  const canGoBack = segPath.length > 0 && !rootPaths.includes(segPath);

  // Animated appearance for arrow (fade + slide)
  const arrowAnim = useRef(new Animated.Value(canGoBack ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(arrowAnim, {
      toValue: canGoBack ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [canGoBack, arrowAnim]);

  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  const arrowOpacity = arrowAnim;

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.headerBackground || theme.colors.background },
      ]}>
      <View style={styles.container}>
        {/* Left: Animated Back Arrow */}
        <View style={styles.left}>
          <Animated.View
            style={{
              opacity: arrowOpacity,
              transform: [{ translateX: arrowTranslate }],
            }}>
            {canGoBack && (
              <TouchableOpacity
                onPress={() => {
                  // always use router.back(); it will do nothing only if no history exists
                  // but we keep canGoBack false on rootPaths so user won't see it there.
                  router.back();
                }}
                style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                <Text style={[styles.backText, { color: theme.colors.primary }]}>Back</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
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
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
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
  logo: { width: 120, height: 36 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, marginLeft: 4 },
  iconButton: { marginLeft: 10 },
  profileButton: { marginLeft: 10 },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '600' },
});
