import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// Using imported theme from '@/theme/theme' for the theme object,
// as 'useTheme' from 'styled-components/native' was in the prompt but not imported/defined.
// Assuming 'theme' is defined globally or imported correctly elsewhere.
import { theme } from '@/theme/theme';
import { useRouter, useFocusEffect, useSegments } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';

// --- Data for the filter chips ---
const filters = ['Upcoming', 'Past', 'Conferences', 'All', 'Workshops'];

// Define your Root Tabs here based on the folder structure
const ROOT_TABS = ['(tabs)/home', '(tabs)/search', '(tabs)/profile', '(tabs)/agenda'];

export default function MyTotallyCustomHeaderBar() {
  const [activeFilter, setActiveFilter] = useState('Upcoming');

  // --- Back Button Logic ---
  const router = useRouter();
  const segments = useSegments();

  // Create the full path string from segments (e.g., ['(tabs)', 'home'] -> '(tabs)/home')
  const segPath = segments.join('/');

  // 💥 CORE LOGIC: Show back button only if router can go back AND the current path is NOT a root path.
  // We use router.canGoBack() for initial state and segPath check for root tab exclusion.
  const isRootTab = ROOT_TABS.includes(segPath);
  const showBack = router.canGoBack() && !isRootTab;

  const arrowAnim = useRef(new Animated.Value(showBack ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(arrowAnim, {
      toValue: showBack ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showBack, arrowAnim]); // Depend on showBack

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

  // --- Location Permission Logic (Restored from first prompt) ---
  const queryClient = useQueryClient();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const isGranted = permissionStatus === 'granted';

  useFocusEffect(
    useCallback(() => {
      const checkPermission = async () => {
        const { status } = await Location.getForegroundPermissionsAsync();
        setPermissionStatus(status);
      };
      checkPermission();
    }, [])
  );

  const handleLocationPress = async () => {
    let { status } = await Location.getForegroundPermissionsAsync();

    if (status === 'granted') {
      const currentRoute = segments[segments.length - 1];

      if (currentRoute !== 'location') {
        router.push('/location');
      }
      return;
    }

    if (status === 'denied') {
      Alert.alert(
        'Permission Denied',
        'To use this feature, you need to enable location permissions in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    if (status === 'undetermined') {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(newStatus);

      if (newStatus === 'granted') {
        console.log('Location permission granted. Refetching user profile...');
        await queryClient.refetchQueries({ queryKey: ['me'] });
      }
    }
  };
  // --- End Location Logic ---

  const handleNotificationPress = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'To receive notifications, you need to enable them in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    // If granted, you can proceed with notification-related logic
    // For example, navigate to a notifications screen or show a list
    // Alert.alert('Notifications', 'You have the latest updates!');
    router.push('/notifications'); // Example navigation
  };

  const renderFilterChip = ({ item }) => {
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
              // Make tappable only when showBack is true
              pointerEvents={showBack ? 'auto' : 'none'}>
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
          {/* === End Wrapper View === */}
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
          {/* --- LOCATION BUTTON --- */}
          <TouchableOpacity style={styles.iconButton} onPress={handleLocationPress}>
            <View>
              {isGranted ? (
                <Ionicons name="location" size={22} color={theme.colors.textPrimary} />
              ) : (
                <MaterialIcons name="location-off" size={22} color={theme.colors.textPrimary} />
              )}
            </View>
          </TouchableOpacity>
          {/* --- END LOCATION BUTTON --- */}

          <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
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

// --- Styles (Unchanged) ---
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
