// components/HeaderBar.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  TextInput, // Import TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';
import { useRouter, useSegments } from 'expo-router';

// --- Data for the filter chips ---
const filters = ['Upcoming', 'Past', 'Conferences', 'All', 'Workshops'];

export default function MyTotallyCustomHeaderBar() {
  const theme = useTheme();
  const [activeFilter, setActiveFilter] = useState('Upcoming');

  // --- Back Button Logic ---
  const router = useRouter();
  const segments = useSegments();

  const rootPaths = ['(tabs)/(home)', '(tabs)/search', '(tabs)/profile', '(tabs)/agenda'];

  const segPath = segments.join('/');
  const canGoBack = segPath.length > 0 && !rootPaths.includes(segPath);

  const arrowAnim = useRef(new Animated.Value(canGoBack ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(arrowAnim, {
      toValue: canGoBack ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [canGoBack, arrowAnim]);

  // Animation for Back Arrow (fades in, slides from left)
  const arrowOpacity = arrowAnim;
  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  // Animation for Title (fades out, slides to left)
  const titleOpacity = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const titleTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  // --- End Back Button Logic ---

  const renderFilterChip = ({ item }) => {
    // ... (renderFilterChip function remains unchanged)
    const isActive = item === activeFilter;
    return (
      <TouchableOpacity
        style={[
          styles.chipContainer,
          {
            backgroundColor: isActive ? theme.colors.primary : theme.colors.chipInactive,
          },
        ]}
        onPress={() => setActiveFilter(item)}>
        <Text
          style={[
            styles.chipText,
            {
              color: isActive
                ? theme.colors.background // Dark text on active
                : theme.colors.textPrimary, // Light text on inactive
            },
          ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.headerBackground || theme.colors.background },
      ]}>
      {/* === Top Header Bar === */}
      <View style={styles.container}>
        {/* Left: Animated Title / Back Arrow */}
        <View style={styles.left}>
          {/* === Wrapper View to align both items === */}
          <View>
            {/* Back Arrow */}
            <Animated.View
              style={{
                opacity: arrowOpacity,
                transform: [{ translateX: arrowTranslate }],
                position: 'absolute', // Position over the title
                zIndex: 1,
              }}
              pointerEvents={canGoBack ? 'auto' : 'none'} // Make tappable only when visible
            >
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
                style={styles.backButton}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
                <Text style={[styles.backText, { color: theme.colors.textPrimary }]}>Back</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* App Title */}
            <Animated.View
              style={{
                opacity: titleOpacity,
                transform: [{ translateX: titleTranslate }],
              }}>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                App Name
              </Text>
            </Animated.View>
          </View>
          {/* === End Wrapper View =a== */}
        </View>

        {/* Center: Search Bar */}
        <View style={styles.center}>
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons
              name="search"
              size={18}
              color={theme.colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
              placeholder="Search events..."
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Right: Icons */}
        <View style={styles.right}>
          <TouchableOpacity style={styles.iconButton}>
            <View>
              <Ionicons name="map" size={22} color={theme.colors.textPrimary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View>
              <Ionicons name="notifications" size={22} color={theme.colors.textPrimary} />
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.colors.error,
                    borderColor: theme.colors.headerBackground || theme.colors.background,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View>
              <Ionicons name="person-circle" size={30} color={theme.colors.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* === Horizontal Filter List === */}
      <FlatList
        // ... (FlatList remains unchanged)
        data={filters}
        renderItem={renderFilterChip}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterListContainer}
      />
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
    flex: 1.5, // Evened with right
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Reverted to flex-start
  },
  center: {
    flex: 2, // Main space for search
    alignItems: 'stretch', // Let search bar fill the space
    paddingHorizontal: 5, // Space between left/right
  },
  right: {
    flex: 1.5, // Evened with left
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10, // Adjusted padding
  },
  headerTitle: {
    // New style for the title in the left
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 5,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },

  // --- Search Bar Styles ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20, // Pill shape
    paddingHorizontal: 12,
    paddingVertical: 8, // Use padding to control height
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0, // Remove default padding
    textAlignVertical: 'center', // Android
  },

  // --- Back Button Styles ---
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  backText: {
    fontSize: 17,
    marginLeft: 4,
    fontWeight: '500',
  },

  // --- Styles for Filter List ---
  filterListContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    paddingBottom: 20,
  },
  chipContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
