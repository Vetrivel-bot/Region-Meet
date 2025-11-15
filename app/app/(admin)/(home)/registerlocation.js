import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { theme } from '@/theme/theme';
import { UserAPI, LocationAPI } from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Picker } from '@react-native-picker/picker'; // Import Picker

export default function RegisterLocationScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedUserId, setScannedUserId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null); // New state for dropdown selection
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRegisteredLocation, setCurrentRegisteredLocation] = useState(null);
  const [eventLocations, setEventLocations] = useState([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [scanMode, setScanMode] = useState('user'); // 'user' or 'selectLocation'
  const isFocused = useIsFocused();
  const [isTorchOn, setIsTorchOn] = useState(false);

  const insets = useSafeAreaInsets();
  const tabBarHeight = (useBottomTabBarHeight && useBottomTabBarHeight()) || 0;

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    const fetchEventLocations = async () => {
      try {
        const { allLocations } = await LocationAPI.getMapInfo();
        setEventLocations(allLocations);
        if (allLocations.length > 0 && !selectedLocationId) {
          // Optionally pre-select the first location if none is selected
          // setSelectedLocationId(allLocations[0]._id);
        }
      } catch (e) {
        console.error('Failed to fetch event locations:', e);
        Alert.alert('Error', 'Failed to load event locations.');
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchEventLocations();
  }, []);

  useEffect(() => {
    const fetchUserDetailsAndLocation = async () => {
      if (!scannedUserId) {
        setCurrentUser(null);
        setCurrentRegisteredLocation(null);
        setSelectedLocationId(null); // Reset selected location
        return;
      }

      setLoadingUser(true);
      setError('');
      try {
        const user = await UserAPI.getUserById(scannedUserId);
        setCurrentUser(user);

        // Find the current registered location name based on user.eventLocationId
        const currentLoc = eventLocations.find(loc => loc._id === user.eventLocationId);
        setCurrentRegisteredLocation(currentLoc || null);

        // Pre-select the user's current event location in the dropdown
        if (user.eventLocationId) {
          setSelectedLocationId(user.eventLocationId);
        } else if (eventLocations.length > 0) {
          // If user has no registered location, default to first available or null
          setSelectedLocationId(eventLocations[0]._id);
        } else {
          setSelectedLocationId(null);
        }
        setScanMode('selectLocation'); // Always switch to selectLocation mode after user scan
      } catch (e) {
        console.error('Failed to fetch user details:', e);
        setError(e.message || 'Failed to fetch user details.');
        Alert.alert('Error', e.message || 'Failed to fetch user details.');
        setCurrentUser(null);
        setCurrentRegisteredLocation(null);
        setSelectedLocationId(null);
        setScannedUserId(null); // Reset user ID on error
        setScanMode('user'); // Go back to scanning user
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserDetailsAndLocation();
  }, [scannedUserId, eventLocations]); // Re-fetch if scannedUserId or eventLocations change

  const handleBarCodeScanned = useCallback(
    (r) => {
      if (scanMode !== 'user' || scannedUserId) {
        return; // Only scan for user QR codes when in 'user' scanMode and no user is scanned yet
      }
      Vibration.vibrate(100);
      setError('');
      setScannedUserId(r?.data);
    },
    [scanMode, scannedUserId]
  );

  const onUpdateRegistration = async () => {
    if (!scannedUserId) {
      Alert.alert('Error', 'Please scan a user first.');
      return;
    }
    if (!selectedLocationId) {
      Alert.alert('Error', 'Please select a location.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await UserAPI.updateDailyRegisteredLocation(scannedUserId, selectedLocationId);
      Alert.alert('Success', 'User daily location updated successfully!');
      resetScan();
    } catch (e) {
      setError((e && e.message) || 'Failed to update daily location.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetScan = () => {
    setScannedUserId(null);
    setSelectedLocationId(null);
    setCurrentUser(null);
    setCurrentRegisteredLocation(null);
    setError('');
    setScanMode('user');
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

  const FOCUS_SIZE = 220;
  const overlayTopHeight = insets.top + 20;
  const overlayBottomHeight = insets.bottom + tabBarHeight + 56;
  const overlayMiddleHeight = FOCUS_SIZE;

  const selectedLocationName = selectedLocationId
    ? eventLocations.find(loc => loc._id === selectedLocationId)?.name || 'Unknown Location'
    : 'N/A';

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        scanning={isFocused && scanMode === 'user' && !scannedUserId}
        enableTorch={isTorchOn}
      />

      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <View pointerEvents="none" style={styles.overlay}>
        <View style={[styles.overlayTop, { height: overlayTopHeight }]} />
        <View style={[styles.overlayMiddle, { height: overlayMiddleHeight }]}>
          <View style={styles.overlaySide} />
          <View
            style={[
              styles.focusBox,
              { width: FOCUS_SIZE, height: FOCUS_SIZE, borderRadius: theme.borderRadius.medium },
            ]}
          />
          <View style={styles.overlaySide} />
        </View>
        <View style={[styles.overlayBottom, { height: overlayBottomHeight }]} />
      </View>

      <View
        style={[styles.controls, { paddingBottom: tabBarHeight + insets.bottom + 10 }]}
        pointerEvents="box-none">
        <TouchableOpacity
          style={styles.torchButton}
          onPress={() => setIsTorchOn((p) => !p)}
          pointerEvents="auto">
          <Ionicons
            name="flashlight"
            size={24}
            color={isTorchOn ? theme.colors.accent : theme.colors.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.hint}>
          {scanMode === 'user' && !scannedUserId && 'Scan User QR Code'}
          {scanMode === 'selectLocation' && scannedUserId && !loadingUser && !selectedLocationId && 'Select a location for the user'}
          {scannedUserId && selectedLocationId && `Ready to update for ${currentUser?.fullname || 'User'}`}
        </Text>

        <ScrollView style={styles.resultBox} contentContainerStyle={{ paddingBottom: theme.spacing.medium }}>
          {loadingUser && <ActivityIndicator size="large" color={theme.colors.primary} />}
          {error && <Text style={[styles.resultText, { color: theme.colors.error }]}>{error}</Text>}

          {currentUser && (
            <View style={{ marginBottom: theme.spacing.medium }}>
              <Text style={styles.label}>User:</Text>
              <Text style={styles.value}>{currentUser.fullname} ({currentUser.email})</Text>
              <Text style={styles.label}>Current Location (Today):</Text>
              <Text style={styles.value}>
                {currentRegisteredLocation ? currentRegisteredLocation.name : 'Not registered for today'}
              </Text>
            </View>
          )}

          {scannedUserId && !loadingLocations && (
            <View style={{ marginTop: theme.spacing.medium }}>
              <Text style={styles.label}>Select New Event Location</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedLocationId}
                  onValueChange={(itemValue) => setSelectedLocationId(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  enabled={!submitting && !loadingUser}>
                  {eventLocations.length === 0 && (
                    <Picker.Item label="No locations available" value={null} />
                  )}
                  {eventLocations.map((location) => (
                    <Picker.Item
                      key={location._id}
                      label={location.name}
                      value={location._id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {selectedLocationId && (
            <View style={{ marginBottom: theme.spacing.medium }}>
              <Text style={styles.label}>Selected Location:</Text>
              <Text style={styles.value}>{selectedLocationName}</Text>
            </View>
          )}

          <View style={[styles.buttonsRow, { marginTop: theme.spacing.small }]}>
            {scannedUserId && (
              <TouchableOpacity
                style={[styles.buttonBase, styles.buttonOutline]}
                onPress={resetScan}>
                <Ionicons name="qr-code-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.buttonText, styles.buttonTextOutline]}>Scan New User</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              disabled={!scannedUserId || !selectedLocationId || submitting || loadingUser}
              style={[
                styles.buttonBase,
                styles.buttonPrimary,
                { opacity: !scannedUserId || !selectedLocationId || submitting || loadingUser ? 0.6 : 1 },
              ]}
              onPress={onUpdateRegistration}>
              {submitting ? (
                <ActivityIndicator />
              ) : (
                <Ionicons name="save" size={20} color={theme.colors.text} />
              )}
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                {submitting ? 'Updating...' : 'Update Registration'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  text: { color: theme.colors.textPrimary, fontSize: 16 },

  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  focusBox: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    zIndex: 2,
  },

  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  hint: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
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
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
  },
  permissionButtonText: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },

  resultBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    width: '92%',
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    maxHeight: '50%', // Limit height to prevent overflow
  },
  resultText: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
    fontSize: 16,
    textAlign: 'center',
  },
  label: { color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 },
  value: { color: theme.colors.textPrimary, fontSize: 16, marginBottom: theme.spacing.small },

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.medium,
    marginTop: theme.spacing.medium,
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
  buttonPrimary: { backgroundColor: theme.colors.primary },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  buttonTextPrimary: { color: theme.colors.text },
  buttonTextOutline: { color: theme.colors.primary },
  pickerContainer: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden', // Ensures the picker doesn't overflow rounded corners
    marginBottom: theme.spacing.medium,
  },
  picker: {
    height: 50, // Standard height for picker
    width: '100%',
    color: theme.colors.textPrimary,
  },
  pickerItem: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
});