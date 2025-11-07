import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// QrDisplay - UI matched to QrCam (glassmorphic / dark)
export default function QrDisplay({ value = 'https://example.com/hardcoded-qr' }) {
  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBarWrap}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Your QR</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/qrcam')}
            accessible
            accessibilityLabel="Open scanner">
            <Ionicons name="scan-circle" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.qrWrap}>
          <View style={styles.focusBoxBorder}>
            <QRCode value={value} size={200} />
          </View>
        </View>

        <Text numberOfLines={2} style={styles.payload}>
          {value}
        </Text>

        <TouchableOpacity style={styles.openBtn} onPress={() => router.push('/qrcam')}>
          <Ionicons name="camera" size={18} color="#111" />
          <Text style={styles.openBtnText}>Open Scanner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  iconBtn: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.06)',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    marginHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  qrWrap: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderRadius: 14,
  },
  focusBoxBorder: {
    width: 220,
    height: 220,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  payload: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  openBtnText: { marginLeft: 8, color: '#111', fontWeight: '600' },
});
