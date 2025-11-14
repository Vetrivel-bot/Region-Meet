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
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/theme/theme';
import { useRouter, useFocusEffect, useSegments, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';

const { width: screenWidth } = Dimensions.get('window');
const filters = ['All', 'Upcoming', 'Registered', 'Conferences', 'Workshops'];
const ROOT_TABS = ['(tabs)/home', '(tabs)/search', '(tabs)/profile', '(tabs)/agenda'];

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function MyTotallyCustomHeaderBar() {
  const router = useRouter();
  const segments = useSegments();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState(params.filter || 'All');
  const [searchQuery, setSearchQuery] = useState(params.search || '');
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);

  const segPath = segments.join('/');
  const isAllEventsPage = segPath.includes('allEvents');
  const isRootTab = ROOT_TABS.includes(segPath);
  const showBack = router.canGoBack() && !isRootTab;

  const previousSegments = usePrevious(segments);

  useEffect(() => {
    const previousPath = previousSegments?.join('/');
    const currentPath = segments.join('/');

    const wasOnAllEvents = previousPath?.includes('allEvents');
    const isNoLongerOnAllEvents = !currentPath.includes('allEvents');

    if (wasOnAllEvents && isNoLongerOnAllEvents) {
      setSearchQuery('');
      setActiveFilter('All');
      setIsSearchFocused(false);
    }
  }, [segments, previousSegments]);

  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
        if (isAllEventsPage) {
            router.setParams({ ...params, search: debouncedSearchQuery });
        } else if (debouncedSearchQuery) {
            router.push({
                pathname: '/(tabs)/(home)/allEvents',
                params: { search: debouncedSearchQuery },
            });
        }
    }
  }, [debouncedSearchQuery]);

  // --- MODIFIED: Removed arrowAnim, as its logic is now combined with searchFocusAnim ---
  // The 'left' section will now handle showing/hiding the back button or title

  useEffect(() => {
    Animated.timing(searchFocusAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: false, // width/maxWidth animations require this
    }).start();
  }, [isSearchFocused]);

  const handleSearchFocus = () => setIsSearchFocused(true);
  const handleSearchBlur = () => setIsSearchFocused(false);

  const handleCancelSearch = () => {
    Keyboard.dismiss();
    setSearchQuery('');
    setIsSearchFocused(false);
    if (isAllEventsPage) {
      router.setParams({ ...params, search: '' });
    }
  };

  const handleFilterPress = (filter) => {
    setActiveFilter(filter);
    if (isAllEventsPage) {
      router.setParams({ ...params, filter: filter });
    } else {
      router.push({
        pathname: '/(tabs)/(home)/allEvents',
        params: { filter: filter },
      });
    }
  };

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
    // Implementation from previous step
  };

  const handleNotificationPress = async () => {
    // Implementation from previous step
  };

  // --- NEW: Smooth Animation Interpolations ---
  // Animate opacity for side elements
  const leftRightOpacity = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  // Animate opacity for cancel button
  const cancelOpacity = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Animate MAX-WIDTH for side elements to collapse them
  const leftMaxWidth = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth * 0.3, 0], // Collapse left side
  });

  const rightMaxWidth = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth * 0.4, 0], // Collapse right side
  });

  // Animate MAX-WIDTH for cancel button to expand it
  const cancelMaxWidth = searchFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80], // Expand cancel button
  });
  // --- END: New Animations ---

  const searchInputTextAlign = isSearchFocused || searchQuery ? 'left' : 'center';

  const renderFilterChip = ({ item }) => {
    const isActive = item === activeFilter;
    return (
      <TouchableOpacity
        style={[
          styles.chipContainer,
          { backgroundColor: isActive ? theme.colors.primary : theme.colors.chipInactive },
        ]}
        onPress={() => handleFilterPress(item)}>
        <Text
          style={[
            styles.chipText,
            { color: isActive ? theme.colors.background : theme.colors.textPrimary },
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
      {/* --- REBUILT: Header Container --- */}
      <View style={styles.container}>
        {/* Left section (Back button OR Title) */}
        <Animated.View
          style={[
            styles.left,
            {
              opacity: leftRightOpacity,
              maxWidth: leftMaxWidth,
            },
          ]}>
          {showBack && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
              <Text style={[styles.backText, { color: theme.colors.textPrimary }]}>Back</Text>
            </TouchableOpacity>
          )}
          {!showBack && (
            <Text
              style={[styles.headerTitle, { color: theme.colors.textPrimary }]}
              numberOfLines={1}>
              App Name
            </Text>
          )}
        </Animated.View>

        {/* Center section (Search) - This now uses flex: 1 */}
        <View style={styles.center}>
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons
              name="search"
              size={18}
              color={theme.colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={[
                styles.searchInput,
                { color: theme.colors.textPrimary, textAlign: searchInputTextAlign },
              ]}
              placeholder="Search events..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Right section (Icons) */}
        <Animated.View
          style={[
            styles.right,
            {
              opacity: leftRightOpacity,
              maxWidth: rightMaxWidth,
            },
          ]}>
          <TouchableOpacity style={styles.iconButton} onPress={handleLocationPress}>
            <View>
              {isGranted ? (
                <Ionicons name="location" size={22} color={theme.colors.textPrimary} />
              ) : (
                <MaterialIcons name="location-off" size={22} color={theme.colors.textPrimary} />
              )}
            </View>
          </TouchableOpacity>
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
        </Animated.View>

        {/* Cancel Button (Appears on focus) */}
        <Animated.View
          style={[
            styles.cancelContainer,
            {
              opacity: cancelOpacity,
              maxWidth: cancelMaxWidth,
            },
          ]}>
          <TouchableOpacity onPress={handleCancelSearch} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      {/* --- END: Rebuilt Header --- */}

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

// --- UPDATED: Styles ---
const styles = StyleSheet.create({
  safeArea: {},
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 15,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    // No position absolute, overflow hidden for smooth collapse
    overflow: 'hidden',
  },
  center: {
    flex: 1, // This is the key change, it will grow to fill space
    marginHorizontal: 10, // Add spacing
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // No position absolute, overflow hidden for smooth collapse
    overflow: 'hidden',
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
    width: '100%',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
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
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // --- NEW: Cancel button is now in its own container
  cancelContainer: {
    overflow: 'hidden',
  },
  cancelButton: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 10, // Spacing from search bar
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
