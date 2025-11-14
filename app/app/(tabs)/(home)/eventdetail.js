import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme/theme'; // Assuming your theme is accessible here
import { Ionicons } from '@expo/vector-icons';

export default function EventDetailScreen() {
  // 1. Get all the event data passed as params
  const event = useLocalSearchParams();

  // Handle potential array values from speakers
  const speakers = Array.isArray(event.speakers) ? event.speakers.join(', ') : event.speakers;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.date}>
          {new Date(event.startTime || event.date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <Text style={styles.sectionContent}>
          {event.location?.name ?? event.location?.address ?? 'Unknown location'}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>About this event</Text>
        </View>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      {speakers && speakers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="mic-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Speakers</Text>
          </View>
          <Text style={styles.sectionContent}>{speakers}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// Add some basic styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: theme.spacing.large,
  },
  header: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  date: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small,
  },
  section: {
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    marginTop: theme.spacing.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.small,
  },
  sectionContent: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
});
