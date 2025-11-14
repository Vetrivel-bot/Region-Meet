import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import React, { memo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LocationAPI } from '../../../../services/api';
import { theme } from '@/theme/theme';
import { Feather, Ionicons } from '@expo/vector-icons';

// --- EventCard Component (Unchanged) ---
const EventCard = memo(({ item }) => {
  const eventDate = new Date(item.startTime || item.date);
  const timeString = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const [time, ampm] = timeString.split(' ');

  return (
    <View style={styles.card}>
      <View style={styles.dateBox}>
        <Text style={styles.dateBoxTime}>{time}</Text>
        <Text style={styles.dateBoxAmPm}>{ampm}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.eventName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.eventLocation}>{item.location.name}</Text>
        </View>
        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </View>
  );
});

const Events = () => {
  const { id: locationId } = useLocalSearchParams();

  // Query: Fetch Registered Events
  const {
    data: events,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['registeredEvents', locationId],
    queryFn: LocationAPI.getRegisteredEvents,
    staleTime: 10 * 60 * 1000,
    select: (response) => {
      const data = response?.data ? response.data : response;
      return data
        ?.filter((event) => event.location._id === locationId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    enabled: !!locationId,
  });

  // Get Header Data
  const locationDetails = events && events.length > 0 ? events[0].location : null;
  const firstEventDate = events && events.length > 0 ? new Date(events[0].date) : null;
  const formattedHeaderDate = firstEventDate
    ? firstEventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error fetching events: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <EventCard item={item} />}
        // --- UPDATED: Header Component ---
        ListHeaderComponent={
          locationDetails ? (
            <View style={styles.headerContainer}>
              <Text style={styles.headerSubtitle}>{formattedHeaderDate}</Text>
              <Text style={styles.headerTitle}>{locationDetails.name}</Text>

              {/* --- UPDATED: Container for icon + address --- */}
              <View style={styles.addressContainer}>
                <Ionicons
                  name="location-sharp"
                  size={16}
                  color={'#FFF'} // --- UPDATED: Light color for icon
                />
                <Text style={styles.headerAddress}>
                  {locationDetails.address}, {locationDetails.city}, {locationDetails.state}
                </Text>
              </View>
            </View>
          ) : null
        }
        // --- End Header ---

        ListEmptyComponent={
          <View style={[styles.center, styles.emptyContainer]}>
            <Feather name="calendar" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No upcoming events found for this location.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
};

// --- UPDATED: Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    padding: theme.spacing.medium,
  },

  // --- UPDATED: Header Styles ---
  headerContainer: {
    backgroundColor: theme.colors.primary, // Use theme color
    borderRadius: 12, // Match card radius
    padding: theme.spacing.medium, // Internal padding
    marginBottom: theme.spacing.large, // Space before list starts
    // Shadow to make it "pop"
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF', // Light text
    fontWeight: '500',
    opacity: 0.8, // Slightly less emphasis
    marginBottom: theme.spacing.small,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF', // Light text
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.small,
    opacity: 0.8, // Apply opacity to icon and text together
  },
  headerAddress: {
    fontSize: 14,
    color: '#FFF', // Light text
    marginLeft: theme.spacing.small,
    flex: 1,
    lineHeight: 20,
  },
  // --- End Header Styles ---

  // List
  listContent: {
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.medium, // Add padding at the top of the list
    paddingBottom: theme.spacing.large,
  },
  // Card (Unchanged)
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginBottom: theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateBox: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.small,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  dateBoxTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  dateBoxAmPm: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.background,
    marginTop: 2,
  },
  infoBox: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  eventName: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontSize: 18,
    marginBottom: theme.spacing.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  eventLocation: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginLeft: theme.spacing.small,
    flexShrink: 1,
  },
  eventDescription: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  // Empty State (Unchanged)
  emptyContainer: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.medium,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
});

export default Events;
