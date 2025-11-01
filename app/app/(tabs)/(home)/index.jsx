// app/(tabs)/index.js or your HomeScreen file
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* NOTE: style prop must be lowercase */}
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>This screen has NO header.</Text>

        <Link href="/details?id=1" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryText}>Go to Details (has header)</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', width: '100%', height: '100%' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 12, color: '#fff' },
  subtitle: { fontSize: 18, textAlign: 'center', color: '#e0e0e0', marginBottom: 32 },
  primaryButton: {
    backgroundColor: '#0033A0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondaryButton: {
    marginTop: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryText: { color: '#fff', fontWeight: '500' },

  // this should make the card span the parent's width
  // styles.card
  card: {
    width: '100%',
    maxWidth: 720, // <- max width
    padding: 18,
    borderRadius: 14,
    alignSelf: 'center', // center inside parent (use alignSelf instead of stretch)
  },
});
