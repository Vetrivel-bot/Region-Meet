import React from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Calendar, Clock, MapPin, Ticket, Star, QrCode, Search } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { theme } from '../../../theme/theme';
import { useContext } from 'react';
import { useApp } from '@/context/AppContext'; // <-- added: useApp from your context

const upcoming = {
  id: 'evt-123',
  title: 'Global Tech Innovators Conference',
  date: 'November 15, 2025',
  time: '9:00 AM - 5:00 PM',
  location: 'Metropolitan Convention Center',
};
const categories = ['Conferences', 'Workshops', 'Socials', 'Webinars', 'Networking', 'Music'];
const featured = [
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
const nearby = [
  { id: 'n1', title: 'Local Music Fest', place: 'Downtown Park', distance: '2.5 km' },
  { id: 'n2', title: 'Food Truck Rally', place: 'City Square', distance: '4.1 km' },
  { id: 'n3', title: 'Community Hackathon', place: 'Tech Hub', distance: '5.2 km' },
];

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  // use the app context user/profile and loading flag
  const { user, loading } = useApp();

  const open = (path) => {
    if (!path) return;
    if (router && typeof router.push === 'function') router.push(path);
    else console.log('Navigate to', path);
  };

  const renderFeatured = ({ item, index }) => (
    <Animated.View
      entering={FadeInLeft.duration(480).delay(index * 120)}
      style={styles.featuredCardWrapper}>
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
          <Text style={{ color: theme.colors.textPrimary }}>Loading...</Text>
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
          <Pressable onPress={() => open(`/event/${upcoming.id}`)} accessibilityRole="button">
            <View style={styles.upcomingCard}>
              <Text style={styles.upcomingTitle}>{upcoming.title}</Text>
              <View style={styles.row}>
                <Calendar size={14} color={theme.colors.textSecondary} />
                <Text style={styles.muted}>{upcoming.date}</Text>
              </View>
              <View style={styles.row}>
                <Clock size={14} color={theme.colors.textSecondary} />
                <Text style={styles.muted}>{upcoming.time}</Text>
              </View>
              <View style={styles.row}>
                <MapPin size={14} color={theme.colors.textSecondary} />
                <Text style={styles.muted}>{upcoming.location}</Text>
              </View>
              <View style={styles.upcomingFooter}>
                <Text style={styles.cta}>View details</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(420).delay(260)} style={styles.quickRow}>
          <Pressable style={styles.quick} onPress={() => open('/login')} accessibilityRole="button">
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

        <Animated.Text entering={FadeInLeft.duration(360).delay(320)} style={styles.sectionTitle}>
          Categories
        </Animated.Text>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          entering={FadeInLeft.duration(420).delay(360)}>
          {categories.map((c) => (
            <Pressable
              key={c}
              onPress={() => open(`/category/${c}`)}
              style={styles.categoryCardPressable}
              accessibilityRole="button">
              <View style={styles.categoryCard}>
                <Text style={styles.categoryText}>{c}</Text>
              </View>
            </Pressable>
          ))}
        </Animated.ScrollView>

        <Animated.Text entering={FadeInLeft.duration(360).delay(420)} style={styles.sectionTitle}>
          Featured
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
        <View style={styles.nearbyWrap}>
          {nearby.map((n, idx) => (
            <Animated.View
              entering={FadeInUp.duration(420).delay(idx * 100)}
              key={n.id}
              style={{ marginBottom: 12 }}>
              <Pressable onPress={() => open(`/event/${n.id}`)} accessibilityRole="button">
                <View style={styles.nearbyCard}>
                  <MapPin size={18} color={theme.colors.primary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.nearbyTitle}>{n.title}</Text>
                    <Text style={styles.muted}>{n.place}</Text>
                  </View>
                  <Text style={styles.muted}>{n.distance}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
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
  nearbyTitle: { color: theme.colors.textPrimary, fontWeight: '800', marginBottom: 2 },
});
