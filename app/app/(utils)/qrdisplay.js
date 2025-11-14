import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator, // Import ActivityIndicator for loading
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/theme/theme'; // Import your theme
import { useApp } from '@/context/AppContext';

export default function QrDisplay({ value = 'https://example.com/hardcoded-qr' }) {
  // Get user and loading state from the context
  const { user, loading } = useApp();

  // This useEffect will run whenever the 'user' object changes (for logging)
  useEffect(() => {
    if (user) {
      console.log('--- User Data available in QrDisplay ---');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('--- QrDisplay: User data is null or still loading ---');
    }
  }, [user]); // The effect depends on the 'user' object

  // Determine the value for the QR code
  // Use the user's _id if available, otherwise fall back to the default prop
  const qrCodeValue = user ? user._id : value;

  // Show a loading indicator while the user is being fetched
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary || '#007aff'} />
        <Text style={styles.loadingText}>Loading Your Info...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBarWrap}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Your QR Code</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/qrcam')}
            accessible
            accessibilityLabel="Open scanner">
            <Ionicons name="scan-circle" size={26} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* --- NEW: Display User Info --- */}
        {user ? (
          <View style={styles.userInfoContainer}>
            <Text style={styles.fullname}>{user.fullname}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        ) : (
          <View style={styles.userInfoContainer}>
            {/* Show a placeholder if there's no user but we aren't loading */}
            <Text style={styles.email}>Default QR Code</Text>
          </View>
        )}
        {/* --- End of User Info --- */}

        {/* QR Code Container */}
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={qrCodeValue} // Use the new qrCodeValue (user._id)
            size={200}
            color={theme.colors.background}
            backgroundColor={theme.colors.text}
          />
        </View>

        {/* Payload Text (now shows the user ID or fallback) */}
        <Text numberOfLines={2} style={styles.payload}>
          {qrCodeValue}
        </Text>

        {/* Open Scanner Button */}
        <TouchableOpacity style={styles.openBtn} onPress={() => router.push('/qrcam')}>
          <Ionicons name="camera" size={18} color={theme.colors.text} />
          <Text style={styles.openBtnText}>Open Scanner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Themed background
    paddingTop: Platform.OS === 'android' ? 18 : 48,
  },
  // NEW style for loading state
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // Make sure centered container takes full screen
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  topBarWrap: {
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: theme.borderRadius.large, // Themed
    backgroundColor: theme.colors.surface, // Themed
    borderWidth: 1,
    borderColor: theme.colors.glassBorder, // Themed
  },
  title: {
    color: theme.colors.textPrimary, // Themed
    fontSize: 18,
    fontWeight: '700',
  },
  iconBtn: {
    marginLeft: 'auto',
    backgroundColor: theme.colors.chipInactive, // Themed
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.medium, // Themed
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: 18,
    backgroundColor: theme.colors.surface, // Themed
    borderRadius: theme.borderRadius.large, // Themed
    paddingVertical: theme.spacing.large, // Themed
    paddingHorizontal: theme.spacing.medium, // Themed
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder, // Themed
  },
  // --- NEW styles for user info ---
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    paddingHorizontal: theme.spacing.small,
  },
  fullname: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  // --- End of new styles ---
  qrCodeContainer: {
    backgroundColor: theme.colors.text, // White background
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
  },
  payload: {
    color: theme.colors.textSecondary, // Themed
    fontSize: 13,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
    paddingHorizontal: theme.spacing.small,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary, // Themed
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium, // Themed
  },
  openBtnText: {
    marginLeft: theme.spacing.small,
    color: theme.colors.text, // Themed
    fontWeight: '600',
    fontSize: 16,
  },
});
