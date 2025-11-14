import React, { useState, useMemo, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { EventAPI } from '@/services/api';
import { theme } from '@/theme/theme';
import { Feather, Ionicons } from '@expo/vector-icons';

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
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState('date_asc');
  // 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'registered_first' | 'unregistered_first'

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
      // EventAPI.getAllEvents returns array (or wrapper); make sure we return array of events
      return Array.isArray(res) ? res : (res?.events ?? []);
    },
  });

  // Filter + search + sorting + ensure registered boolean exists
  const events = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    let list = (eventsRaw || []).map((e) => ({
      ...e,
      registered: !!e.registered, // normalize
    }));

    if (q.length > 0) {
      list = list.filter((e) => {
        const name = (e.name || '').toLowerCase();
        const desc = (e.description || '').toLowerCase();
        const loc = ((e.location && (e.location.name || e.location.address)) || '').toLowerCase();
        const speakers = (Array.isArray(e.speakers) ? e.speakers.join(' ') : '').toLowerCase();
        return name.includes(q) || desc.includes(q) || loc.includes(q) || speakers.includes(q);
      });
    }

    switch (sortMode) {
      case 'date_asc':
        list.sort((a, b) => new Date(a.startTime || a.date) - new Date(b.startTime || b.date));
        break;
      case 'date_desc':
        list.sort((a, b) => new Date(b.startTime || b.date) - new Date(a.startTime || a.date));
        break;
      case 'name_asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'registered_first':
        list.sort((a, b) => Number(b.registered) - Number(a.registered));
        // tie-breaker by date
        list.sort(
          (a, b) =>
            Number(b.registered) - Number(a.registered) ||
            new Date(a.startTime || a.date) - new Date(b.startTime || b.date)
        );
        break;
      case 'unregistered_first':
        list.sort((a, b) => Number(a.registered) - Number(b.registered));
        list.sort(
          (a, b) =>
            Number(a.registered) - Number(b.registered) ||
            new Date(a.startTime || a.date) - new Date(b.startTime || b.date)
        );
        break;
      default:
        break;
    }

    return list;
  }, [eventsRaw, query, sortMode]);

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
      {/* Search + sort header */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search events...."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortMode === 'date_asc' || sortMode === 'date_desc' ? styles.sortBtnActive : null,
            ]}
            onPress={() => setSortMode((s) => (s === 'date_asc' ? 'date_desc' : 'date_asc'))}>
            <Text
              style={[styles.sortText, sortMode.startsWith('date') ? styles.sortTextActive : null]}>
              Date
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortMode === 'name_asc' || sortMode === 'name_desc' ? styles.sortBtnActive : null,
            ]}
            onPress={() => setSortMode((s) => (s === 'name_asc' ? 'name_desc' : 'name_asc'))}>
            <Text
              style={[styles.sortText, sortMode.startsWith('name') ? styles.sortTextActive : null]}>
              Name
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortMode === 'registered_first' || sortMode === 'unregistered_first'
                ? styles.sortBtnActive
                : null,
            ]}
            onPress={() =>
              setSortMode((s) =>
                s === 'registered_first' ? 'unregistered_first' : 'registered_first'
              )
            }>
            <Text
              style={[
                styles.sortText,
                sortMode.includes('registered') ? styles.sortTextActive : null,
              ]}>
              Reg
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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

  // search + sort
  searchRow: {
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
    paddingBottom: theme.spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    color: theme.colors.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  sortRow: {
    marginLeft: 8,
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  sortText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  sortTextActive: {
    color: '#fff',
  },

  // List
  listContent: {
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },

  // Card
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

  // Empty State
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
