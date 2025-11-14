import React, { useState, useMemo, memo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { EventAPI } from '@/services/api';
import { theme } from '@/theme/theme';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

// Event card (memoized) — now shows registered status badge
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
        <View style={styles.titleRow}>
          <Text style={styles.eventName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.registered ? (
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>Registered</Text>
            </View>
          ) : (
            <View style={styles.notRegisteredBadge}>
              <Text style={styles.notRegisteredText}>Not registered</Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.eventLocation}>
            {item.location?.name ?? item.location?.address ?? 'Unknown location'}
          </Text>
        </View>

        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.speakers?.slice(0, 2).join(', ')}</Text>
          <Text style={styles.metaText}>
            • {new Date(item.startTime || item.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default function AllEventsScreen() {
  const params = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (params.search) {
      setQuery(params.search);
    }
    if (params.filter) {
      setActiveFilter(params.filter);
    }
  }, [params]);

  const {
    data: eventsRaw = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['allEvents'],
    queryFn: EventAPI.getAllEvents,
    staleTime: 5 * 60 * 1000,
    select: (res) => {
      return Array.isArray(res) ? res : (res?.events ?? []);
    },
  });

  const events = useMemo(() => {
    let list = (eventsRaw || []).map((e) => ({
      ...e,
      registered: !!e.registered,
    }));

    if (activeFilter !== 'All') {
      const now = new Date();
      list = list.filter((e) => {
        const eventDate = new Date(e.startTime || e.date);
        switch (activeFilter) {
          case 'Upcoming':
            return eventDate > now;
          case 'Registered':
            return e.registered;
          case 'Conferences':
            return e.type === 'Conference';
          case 'Workshops':
            return e.type === 'Workshop';
          default:
            return true;
        }
      });
    }

    const q = (query || '').trim().toLowerCase();
    if (q.length > 0) {
      list = list.filter((e) => {
        const name = (e.name || '').toLowerCase();
        const desc = (e.description || '').toLowerCase();
        const loc = ((e.location && (e.location.name || e.location.address)) || '').toLowerCase();
        const speakers = (Array.isArray(e.speakers) ? e.speakers.join(' ') : '').toLowerCase();
        return name.includes(q) || desc.includes(q) || loc.includes(q) || speakers.includes(q);
      });
    }

    list.sort((a, b) => new Date(a.startTime || a.date) - new Date(b.startTime || b.date));

    return list;
  }, [eventsRaw, query, activeFilter]);

  const renderItem = ({ item }) => <EventCard item={item} />;

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
        <Text style={styles.errorText}>
          Error fetching events: {error.message || String(error)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.center, styles.emptyContainer]}>
            <Feather name="calendar" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No events found.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
}

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
  listContent: {
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventName: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontSize: 18,
    marginBottom: theme.spacing.small,
    flex: 1,
  },
  registeredBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  registeredText: {
    color: '#838383ff',
    fontWeight: '700',
    fontSize: 12,
  },
  notRegisteredBadge: {
    backgroundColor: '#e6e6e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  notRegisteredText: {
    color: '#838383ff',
    fontWeight: '700',
    fontSize: 12,
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.small,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
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