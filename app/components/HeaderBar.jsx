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
import { theme } from '@/theme/theme';
import { useRouter, useSegments, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { useQueryClient } from '@tanstack/react-query';

// --- Data for the filter chips ---
const filters = ['Upcoming', 'Past', 'Conferences', 'All', 'Workshops'];

export default function MyTotallyCustomHeaderBar() {
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

  const arrowOpacity = arrowAnim;
  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });
  const titleOpacity = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const titleTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  // --- End Back Button Logic ---

  // --- Location Permission Logic ---
  const queryClient = useQueryClient();
  const [permissionStatus, setPermissionStatus] = useState(null);
  const isGranted = permissionStatus === 'granted';

  // Check permission every time the header comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkPermission = async () => {
        const { status } = await Location.getForegroundPermissionsAsync();
        setPermissionStatus(status);
      };
      checkPermission();
    }, [])
  );

  // --- UPDATED Location Press Handler ---
  const handleLocationPress = async () => {
    // Check the *current* status first
    let { status } = await Location.getForegroundPermissionsAsync();

    if (status === 'granted') {
      // 1. If already granted, navigate
      router.push('/location');
      return;
    }

    if (status === 'denied') {
      // 2. If permission was explicitly DENIED, prompt to open settings
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
      // 3. If UNDETERMINED (not yet asked), *now* we trigger the permission prompt
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(newStatus); // Update the icon

      if (newStatus === 'granted') {
        // 4. If user just accepted, re-call the 'me' API
        console.log('Location permission granted. Refetching user profile...');
        await queryClient.refetchQueries({ queryKey: ['me'] });
      }
    }
  };
  // --- End Location Logic ---

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
              color: isActive ? theme.colors.background : theme.colors.textPrimary,
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
          <View>
            <Animated.View
              style={{
                opacity: arrowOpacity,
                transform: [{ translateX: arrowTranslate }],
                position: 'absolute',
                zIndex: 1,
              }}
              pointerEvents={canGoBack ? 'auto' : 'none'}>
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
                style={styles.backButton}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
                <Text style={[styles.backText, { color: theme.colors.textPrimary }]}>Back</Text>
              </TouchableOpacity>
            </Animated.View>

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
          {/* --- LOCATION BUTTON: uses Ionicons when granted, MaterialIcons 'location-off' when not --- */}
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
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 2,
    alignItems: 'stretch',
    paddingHorizontal: 5,
  },
  right: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  headerTitle: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    textAlignVertical: 'center',
  },
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
