import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LocationAPI } from '@/services/api'; // Adjust path to your api.js file
import { Ionicons } from '@expo/vector-icons'; // Assuming you use Expo icons
import { useFocusEffect, router } from 'expo-router'; // 1. Import router

// 1. Import the theme
import { theme } from '@/theme/theme';

/**
 * Formats an ISO date string into two parts for the UI.
 * (function unchanged)
 */
const formatEventDate = (isoString) => {
  if (!isoString) return { day: '?', month: '???' };
  const date = new Date(isoString);
  return {
    day: date.toLocaleDateString(undefined, { day: '2-digit' }),
    month: date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    year: date.toLocaleDateString(undefined, { year: 'numeric' }),
  };
};

// --- Single Schedule Item Component ---
const ScheduleItem = ({ item }) => {
  // 2. Destructure properties
  const { eventLocation, eventDate, status, _id } = item;
  const { day, month } = formatEventDate(eventDate);

  // Extract location details
  const locationId = eventLocation?._id; // This is the location ID
  const locationName = eventLocation?.name || 'No Active Location';
  const locationAddress = eventLocation?.address || 'Date registered, location pending.';

  // Pass theme colors to the styles
  const styles = getThemedStyles();

  // 3. Create the press handler
  const handlePress = () => {
    // Make sure we have the data we need
    if (!locationId || !eventDate) {
      console.warn('Missing locationId or eventDate for this item', item);
      return; // Don't navigate if data is missing
    }

    // Navigate to the event detail screen:
    // - pathname uses the eventLocation._id
    // - params passes the eventDate as a query parameter
    router.push({
      pathname: `events/${locationId}`,
      params: { eventDate: eventDate },
    });
  };

  return (
    // 4. Wrap the item in a TouchableOpacity and add the onPress handler
    <TouchableOpacity style={styles.itemContainer} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateDay}>{day}</Text>
        <Text style={styles.dateMonth}>{month}</Text>
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.infoName} numberOfLines={1}>
          {locationName}
        </Text>
        <Text style={styles.infoAddress} numberOfLines={2}>
          {locationAddress}
        </Text>
        {/* <View style={styles.statusBadge}>
         <Text style={styles.statusText}>{status}</Text>
       </View> */}
      </View>
    </TouchableOpacity>
  );
};

// --- Main Schedule Screen ---
export default function ScheduleScreen() {
  const queryClient = useQueryClient();
  const styles = getThemedStyles();

  const {
    data: schedule,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['registeredLocations'],
    queryFn: LocationAPI.getRegisteredLocations,

    // Selector to sort the data
    select: (fetchedData) => {
      if (!fetchedData) return []; // Handle empty/undefined data
      // Create a copy and sort by eventDate in ascending order
      return [...fetchedData].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    },

    // Data is considered "fresh" for 10 minutes
    staleTime: 10 * 60 * 1000,

    // Refetch on window focus after staleTime
    refetchOnWindowFocus: true,
  });

  // Removed useFocusEffect as react-query handles it

  console.log(schedule);

  // --- Loading State ---
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Your Schedule...</Text>
      </View>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Failed to load schedule</Text>
        <Text style={styles.errorText}>{error?.message || 'An unknown error occurred'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- Empty State ---
  if (!schedule || schedule.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>Your schedule is empty.</Text>
        <Text style={styles.emptySubText}>Register for an event location to see it here.</Text>
      </SafeAreaView>
    );
  }

  // --- Data State ---
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={schedule} // This data is now sorted
        renderItem={({ item }) => <ScheduleItem item={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.headerTitle}>Event Schedule</Text>}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary} // Tint for iOS
            colors={[theme.colors.primary]} // Colors for Android
          />
        }
      />
    </SafeAreaView>
  );
}

// (styles function is unchanged)
const getThemedStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: -20,
      backgroundColor: theme.colors.background, // Updated
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.background, // Updated
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.colors.textSecondary, // Updated
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.textPrimary, // Updated
      marginTop: 16,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.textSecondary, // Updated
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: theme.colors.primary, // Updated
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 25,
    },
    retryText: {
      color: theme.colors.text, // Updated
      fontSize: 16,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary, // Updated
      marginTop: 16,
    },
    emptySubText: {
      fontSize: 14,
      color: theme.colors.textSecondary, // Updated
      marginTop: 8,
      textAlign: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.textPrimary, // Updated
      paddingBottom: 16,
      paddingHorizontal: 8,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    // itemContainer is now the TouchableOpacity, styles remain the same
    itemContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface, // Updated
      borderRadius: theme.borderRadius.medium, // Updated
      marginVertical: 8,
      // Shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2, // Increased opacity for dark bg
      shadowRadius: 5,
      elevation: 3,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.glassBorder, // Added border
    },
    dateBlock: {
      backgroundColor: theme.colors.chipInactive, // Updated
      paddingHorizontal: 16,
      paddingVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopLeftRadius: theme.borderRadius.medium, // Updated
      borderBottomLeftRadius: theme.borderRadius.medium, // Updated
      minWidth: 70,
    },
    dateDay: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary, // Updated
    },
    dateMonth: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary, // Updated
      marginTop: 2,
    },
    infoBlock: {
      flex: 1,
      padding: 16,
      justifyContent: 'center',
    },
    infoName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary, // Updated
    },
    infoAddress: {
      fontSize: 14,
      color: theme.colors.textSecondary, // Updated
      marginTop: 4,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.chipInactive, // Updated
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      marginTop: 10,
    },
    statusText: {
      color: theme.colors.primary, // Updated
      fontSize: 12,
      fontWeight: '600',
    },
  });
