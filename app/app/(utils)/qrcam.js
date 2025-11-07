import React, { useEffect, useState, useRef } from 'react';
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
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* ---------- REPLACED OVERLAY: 4 panels to dim outside, clear center ---------- */}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.focusBox} />
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>
      {/* ---------- END OVERLAY ---------- */}

      {/* Controls */}
      <View style={styles.controls} pointerEvents="box-none">
        {/* Flashlight Toggle Button - MOVED HERE */}
        <TouchableOpacity
          style={styles.torchButton}
          onPress={() => setIsTorchOn((prev) => !prev)}
          pointerEvents="auto" // Allow interaction
        >
          <Ionicons name="flashlight" size={24} color={isTorchOn ? '#FFD700' : 'white'} />
        </TouchableOpacity>

        <Text style={styles.hint}>Point the camera at a QR code</Text>

        {scanned && (
          <View style={styles.resultBox}>
            <Text numberOfLines={2} style={styles.resultText}>
              {data}
            </Text>
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setScanned(false);
                  setData(null);
                }}>
                <Ionicons name="refresh" size={20} />
                <Text style={styles.buttonText}>Scan again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  if (data) {
                    Linking.openURL(data).catch(() => {});
                  }
                }}>
                <Ionicons name="open" size={20} />
                <Text style={styles.buttonText}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
  text: { color: 'white' },

  // NEW OVERLAY: four panels (top, left, right, bottom) that dim everything except center focus box
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },

  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20%', // adjust to move the focus box vertically
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%', // adjust to taste
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  overlayMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 280, // same as focus box height
  },

  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  // center focus box (clear)
  focusBox: {
    width: 280,
    height: 280,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    zIndex: 2,
  },

  // Moved and adjusted the hint
  hint: { color: 'white', marginTop: 16, marginBottom: 16 }, // Added margin for spacing

  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    top: 0, // Allow controls to take full height for flexible positioning
    alignItems: 'center',
    justifyContent: 'flex-end', // Push controls to the bottom
    paddingBottom: 20, // Add some padding from the very bottom
    // Keep existing dimming background if present in your layout
    backgroundColor: 'rgba(0,0,0,0.0)', // set to transparent so overlay handles dimming; change if you prefer
  },

  resultBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderRadius: 8,
    width: '92%',
    marginTop: 20, // Add margin to separate from hint/torch
  },
  resultText: { color: '#111', marginBottom: 8 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 8 },
  buttonText: { marginLeft: 6 },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    left: 20,
    zIndex: 11, // Higher zIndex to be on top of the overlay
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  torchButton: {
    // Positioning now relative to the controls view
    marginBottom: 10, // Adjust as needed to be below the focus box
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11, // Higher zIndex
  },
  permissionButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
