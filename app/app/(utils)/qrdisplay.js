import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/theme/theme'; // Import your theme

export default function QrDisplay({ value = 'https://example.com/hardcoded-qr' }) {
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
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={value}
            size={200}
            // Themed QR Code for high contrast
            color={theme.colors.background}
            backgroundColor={theme.colors.text}
          />
        </View>

        <Text numberOfLines={2} style={styles.payload}>
          {value}
        </Text>

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
  // Wrapper for the QR code to give it a white background
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
