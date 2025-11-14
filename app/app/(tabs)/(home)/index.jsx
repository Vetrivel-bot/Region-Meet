import React, { useContext, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Calendar, Clock, MapPin, Ticket, Star, QrCode, Search } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { theme } from '@/theme/theme';
import { useApp } from '@/context/AppContext';

import { useQuery } from '@tanstack/react-query';
import { LocationAPI } from '@/services/api';

const categories = ['Conferences', 'Workshops', 'Socials', 'Webinars', 'Networking', 'Music'];
const featured = [
  // ... (featured data remains the same)
  {
    id: 'f1',
    title: 'Design Week 2025',
    image:
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900',
  },
  {
    id: 'f2',
    title: 'Pitch Night Finals',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900',
  },
  {
    id: 'f3',
    title: 'Future of AI Summit',
    image:
      'https://images.unsplash.com/photo-1620712943543-aebc69a84e23?auto=format&fit=crop&w=900',
  },
];
// --- REMOVED hard-coded 'nearby' object ---

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading, getLocation } = useApp();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const loc = await getLocation();
        setLocation(loc);
      } catch (error) {
        console.warn('Failed to get location for nearby query:', error);
      }
    };

    fetchLocation();
  }, [getLocation]);

  // --- 1. Fetch Upcoming Event ---
  const { data: upcomingEvent, isLoading: isUpcomingLoading } = useQuery({
    queryKey: ['upcomingEvent'],
    queryFn: LocationAPI.getRegisteredEvents,
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const data = response?.data ? response.data : response;
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }
      const sortedEvents = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      const now = new Date();
      const futureEvents = sortedEvents.filter((e) => new Date(e.endTime || e.date) > now);
      return futureEvents.length > 0 ? futureEvents[0] : null;
    },
  });

  // --- 2. NEW: Fetch Nearby Locations ---
  const { data: nearbyLocationsData, isLoading: isNearbyLoading } = useQuery({
    queryKey: ['nearbyLocations', location],
    queryFn: () => {
      if (!location) return Promise.resolve({ data: [] }); // Return empty data if no location
      return LocationAPI.getNearbyLocations([location.longitude, location.latitude]);
    },
    enabled: !!location, // Only run when location is available
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (response) => {
      // Assuming response is { success: true, count: X, data: [...] }
      return response.data ?? [];
    },
  });

  // --- 3. FIXED: Safe console.log ---
  console.log('Upcoming Event Location ID:', upcomingEvent?.location?._id);
  // --- 4. NEW: Log for nearby locations ---
  console.log('Nearby Locations Data:', nearbyLocationsData);

  const open = (path) => {
    if (!path) return;
    if (router && typeof router.push === 'function') router.push(path);
    else console.log('Navigate to', path);
  };

  const renderFeatured = ({ item, index }) => (
    <Animated.View
      entering={FadeInLeft.duration(480).delay(index * 120)}
      style={styles.featuredCardWrapper}>
      {/* --- ADDED: Missing onPress --- */}
      <Pressable
        onPress={() => open(`/event/${item.id}`)}
        style={styles.featuredCardPressable}
        accessibilityRole="button">
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.featuredCard}
          imageStyle={styles.featuredImageStyle}
          resizeMode="cover">
          <LinearGradient
            colors={['transparent', 'rgba(4,10,18,0.85)']}
            style={styles.featuredOverlay}>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <View style={styles.featuredMeta}>
              <Star size={12} color={theme.colors.primary} />
              <Text style={styles.featuredTag}>Featured</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Pressable>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.Text entering={FadeInLeft.duration(360)} style={styles.sectionTitle}>
          Hi {user?.fullname || 'Guest'},
        </Animated.Text>
        <Animated.Text
          entering={FadeInLeft.duration(360)}
          style={[styles.sectionTitle, { marginTop: 0 }]}>
          Upcoming Event
        </Animated.Text>

        <Animated.View entering={FadeInUp.duration(520).delay(120)} style={styles.upcomingWrapper}>
          {isUpcomingLoading ? (
            <View style={[styles.upcomingCard, styles.upcomingLoading]}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.muted}>Loading event...</Text>
            </View>
          ) : upcomingEvent ? (
            <Pressable
              onPress={() => open(`(tabs)/(schedule)/events/${upcomingEvent.location._id}`)}
              accessibilityRole="button">
              <View style={styles.upcomingCard}>
                <Text style={styles.upcomingTitle}>{upcomingEvent.name}</Text>
                <View style={styles.row}>
                  <Calendar size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.muted}>
                    {new Date(upcomingEvent.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Clock size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.muted}>
                    {new Date(upcomingEvent.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </View>
                <View style={styles.row}>
                  <MapPin size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.muted}>{upcomingEvent.location.name}</Text>
                </View>
                <View style={styles.upcomingFooter}>
                  <Text style={styles.cta}>View details</Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <View style={[styles.upcomingCard, styles.upcomingLoading]}>
              <Calendar size={20} color={theme.colors.textSecondary} />
              <Text style={styles.muted}>No upcoming events found.</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(420).delay(260)} style={styles.quickRow}>
          <Pressable
            style={styles.quick}
            onPress={() => open('/allEvents')}
            accessibilityRole="button">
            <View style={styles.quickCard}>
              <Ticket size={20} color={theme.colors.primary} />
              <Text style={styles.quickText}>My tickets</Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.quick}
            onPress={() => open('/create')}
            accessibilityRole="button">
            <View style={styles.quickCard}>
              <Star size={20} color={theme.colors.primary} />
              <Text style={styles.quickText}>Create</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* --- (Commented out sections remain unchanged) --- */}
        {/* <Animated.View entering={FadeInUp.duration(420).delay(260)} style={styles.quickRow}> ... </Animated.View> */}
        {/* <Animated.Text ...>Categories</Animated.Text> */}
        {/* <Animated.ScrollView ...> ... </Animated.ScrollView> */}

        <Animated.Text entering={FadeInLeft.duration(360).delay(420)} style={styles.sectionTitle}>
          Events in Your Location
        </Animated.Text>
        <FlatList
          data={featured}
          renderItem={renderFeatured}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        />

        <Animated.Text entering={FadeInLeft.duration(360).delay(520)} style={styles.sectionTitle}>
          Nearby
        </Animated.Text>

        {/* --- 5. UPDATED: Nearby Section --- */}
        <View style={styles.nearbyWrap}>
          {isNearbyLoading ? (
            <View style={[styles.nearbyCard, styles.nearbyLoading]}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.muted}>Finding locations near you...</Text>
            </View>
          ) : !nearbyLocationsData || nearbyLocationsData.length === 0 ? (
            <View style={[styles.nearbyCard, styles.nearbyLoading]}>
              <MapPin size={18} color={theme.colors.textSecondary} />
              <Text style={styles.muted}>No nearby locations found.</Text>
            </View>
          ) : (
            nearbyLocationsData.map((n, idx) => (
              <Animated.View
                entering={FadeInUp.duration(420).delay(idx * 100)}
                key={n._id} // Use _id from database
                style={{ marginBottom: 12 }}>
                <Pressable
                  // Use consistent navigation path
                  onPress={() => open(`(tabs)/(schedule)/events/${n._id}`)}
                  accessibilityRole="button">
                  <View style={styles.nearbyCard}>
                    <MapPin size={18} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      {/* Map dynamic data fields */}
                      <Text style={styles.nearbyTitle}>{n.name}</Text>
                      <Text style={styles.muted}>
                        {n.city}, {n.state}
                      </Text>
                    </View>
                    {/* Format distance */}
                    <Text style={styles.muted}>{n.distanceInKm.toFixed(1)} km</Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
        </View>
        {/* --- End Updated Nearby Section --- */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },

  body: { paddingHorizontal: 20, marginTop: 6 },

  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },

  upcomingWrapper: { marginBottom: 14 },
  upcomingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 18,
    overflow: 'hidden',
  },
  upcomingLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 150,
  },
  upcomingTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  muted: { color: theme.colors.textSecondary, marginLeft: 10, fontSize: 14 },
  upcomingFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    marginTop: 12,
    paddingTop: 10,
  },
  cta: { color: theme.colors.primary, fontWeight: '700' },

  quickRow: { flexDirection: 'row', gap: 12, marginVertical: 12 },
  quick: { flex: 1, borderRadius: 12 },
  quickCard: {
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  quickText: { color: theme.colors.textPrimary, fontWeight: '700', marginLeft: 8 },

  categoryScroll: { marginBottom: 6 },
  categoryCardPressable: { marginRight: 10, borderRadius: 12 },
  categoryCard: {
    backgroundColor: theme.colors.chipInactive,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  categoryText: { color: theme.colors.chipInactiveText, fontWeight: '700' },

  featuredList: { paddingVertical: 8 },
  featuredCardWrapper: { marginRight: 14 },
  featuredCardPressable: {
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  featuredCard: {
    width: Math.min(320, width * 0.75),
    height: 190,
    borderRadius: 14,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.surface,
  },
  featuredImageStyle: { borderRadius: 14 },
  featuredOverlay: { padding: 14 },
  featuredTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  featuredMeta: { flexDirection: 'row', alignItems: 'center' },
  featuredTag: { color: theme.colors.primary, marginLeft: 8, fontWeight: '700' },

  nearbyWrap: { marginTop: 6 },
  nearbyCard: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  // --- NEW: Loading state for nearby card ---
  nearbyLoading: {
    justifyContent: 'center',
    gap: 10,
  },
  nearbyTitle: { color: theme.colors.textPrimary, fontWeight: '800', marginBottom: 2 },
});
