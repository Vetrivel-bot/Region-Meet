import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Linking,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { theme } from '@/theme/theme'; // Import your theme

export default function QrCam() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState(null);
  const isFocused = useIsFocused();
  const [isTorchOn, setIsTorchOn] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = (scanningResult) => {
    if (scanned) return;

    const scannedData = scanningResult.data;
    if (!scannedData) return;

    setScanned(true);
    setData(scannedData);

    try {
      Vibration.vibrate(100);
    } catch (e) {}

    // Auto-open logic remains
    if (
      typeof scannedData === 'string' &&
      (scannedData.startsWith('http://') || scannedData.startsWith('https://'))
    ) {
      Linking.openURL(scannedData).catch(() => {});
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No access to camera.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        scanning={isFocused}
        enableTorch={isTorchOn}
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      {/* Dimming Overlay */}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.focusBox} />
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Controls Container */}
      <View style={styles.controls} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.torchButton}
          onPress={() => setIsTorchOn((prev) => !prev)}
          pointerEvents="auto">
          <Ionicons
            name="flashlight"
            size={24}
            color={isTorchOn ? theme.colors.accent : theme.colors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.hint}>Point the camera at a QR code</Text>

        {scanned && (
          <View style={styles.resultBox}>
            <Text numberOfLines={2} style={styles.resultText}>
              {data}
            </Text>
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.buttonBase, styles.buttonOutline]}
                onPress={() => {
                  setScanned(false);
                  setData(null);
                }}>
                <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                <Text style={[styles.buttonText, styles.buttonTextOutline]}>Scan again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonBase, styles.buttonPrimary]}
                onPress={() => {
                  if (data) {
                    Linking.openURL(data).catch(() => {});
                  }
                }}>
                <Ionicons name="open" size={20} color={theme.colors.text} />
                <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  text: { color: theme.colors.textPrimary, fontSize: 16 },

  // OVERLAY
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  focusBox: {
    width: 280,
    height: 280,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary, // Themed border
    backgroundColor: 'transparent',
    zIndex: 2,
  },

  // CONTROLS
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    top: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  hint: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    left: 20,
    zIndex: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchButton: {
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
  },
  permissionButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary, // Themed button
    borderRadius: theme.borderRadius.small,
  },
  permissionButtonText: {
    color: theme.colors.text, // High contrast text
    fontSize: 16,
    fontWeight: '600',
  },

  // RESULT POPUP
  resultBox: {
    backgroundColor: theme.colors.surface, // Glass surface
    borderRadius: theme.borderRadius.medium,
    width: '92%',
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder, // Glass border
  },
  resultText: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.medium,
  },
  buttonBase: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.medium,
    gap: theme.spacing.small,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: theme.colors.text,
  },
  buttonTextOutline: {
    color: theme.colors.primary,
  },
});
