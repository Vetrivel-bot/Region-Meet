import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { theme } from '@/theme/theme';
import { UserAPI, LocationAPI } from '@/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Picker } from '@react-native-picker/picker';

export default function UpdateUserFromQR() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedUserId, setScannedUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isFocused = useIsFocused();
  const [isTorchOn, setIsTorchOn] = useState(false);

  // Editable user fields
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('user'); // Default role
  const [selectedEventLocationId, setSelectedEventLocationId] = useState(null);
  const [eventLocations, setEventLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

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
        if (allLocations.length > 0) {
          setSelectedEventLocationId(allLocations[0]._id);
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

  const handleBarCodeScanned = useCallback(
    (r) => {
      if (scannedUserId) return; // Already scanned
      const scannedData = r?.data;
      if (!scannedData) return;

      Vibration.vibrate(100);
      setScannedUserId(scannedData); // Assume scanned data is the userId
      setError(''); // Clear previous errors
    },
    [scannedUserId]
  );

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!scannedUserId) {
        setEditingUser(null);
        setFullname('');
        setEmail('');
        setSelectedRole('user');
        // Keep selectedEventLocationId as is or reset based on preference
        return;
      }

      setLoadingUser(true);
      setError('');
      try {
        const user = await UserAPI.getUserById(scannedUserId);
        setEditingUser(user);
        setFullname(user.fullname);
        setEmail(user.email);
        setSelectedRole(user.role);
        if (user.eventLocationId) {
          setSelectedEventLocationId(user.eventLocationId);
        } else if (eventLocations.length > 0) {
          setSelectedEventLocationId(eventLocations[0]._id);
        }
      } catch (e) {
        console.error('Failed to fetch user details:', e);
        setError((e && e.message) || 'Failed to fetch user details.');
        setEditingUser(null);
        setFullname('');
        setEmail('');
        setSelectedRole('user');
        setSelectedEventLocationId(eventLocations.length > 0 ? eventLocations[0]._id : null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserDetails();
  }, [scannedUserId, eventLocations]); // Re-fetch if scannedUserId or eventLocations change

  const onUpdateUser = async () => {
    if (!scannedUserId) {
      Alert.alert('Error', 'No user ID scanned.');
      return;
    }
    if (!fullname || !email) {
      Alert.alert('Error', 'Full name and email cannot be empty.');
      return;
    }
    if (!selectedEventLocationId) {
      Alert.alert('Error', 'Please select an event location.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await UserAPI.updateUser(
        scannedUserId,
        fullname,
        email,
        selectedRole,
        selectedEventLocationId
      );
      Alert.alert('Success', 'User details updated successfully!');
      router.back();
    } catch (e) {
      setError((e && e.message) || 'Failed to update user details.');
    } finally {
      setSubmitting(false);
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

  const FOCUS_SIZE = 220;
  const overlayTopHeight = insets.top + 20;
  const overlayBottomHeight = insets.bottom + tabBarHeight + 56;
  const overlayMiddleHeight = FOCUS_SIZE;

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scannedUserId ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        scanning={isFocused}
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
          {scannedUserId ? 'User ID Scanned. Fetching details...' : 'Point the camera at a QR code'}
        </Text>

        {scannedUserId && (
          <View style={styles.resultBox}>
            {loadingUser ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : editingUser ? (
              <>
                <Text style={styles.label}>User ID</Text>
                <Text style={styles.value}>{scannedUserId}</Text>

                <Text style={[styles.label, { marginTop: theme.spacing.small }]}>Full name</Text>
                <TextInput
                  style={styles.input}
                  value={fullname}
                  onChangeText={setFullname}
                  placeholder="Full Name"
                  placeholderTextColor={theme.colors.textSecondary}
                />

                <Text style={[styles.label, { marginTop: theme.spacing.small }]}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={{ marginTop: theme.spacing.medium }}>
                  <Text style={styles.label}>Select Role</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedRole}
                      onValueChange={(itemValue) => setSelectedRole(itemValue)}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}>
                      <Picker.Item label="User" value="user" />
                      <Picker.Item label="Jury" value="jurry" />
                      <Picker.Item label="Host" value="host" />
                    </Picker>
                  </View>
                </View>

                <View style={{ marginTop: theme.spacing.medium }}>
                  <Text style={styles.label}>Select Event Location</Text>
                  <View style={styles.pickerContainer}>
                    {loadingLocations ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <Picker
                        selectedValue={selectedEventLocationId}
                        onValueChange={(itemValue) => setSelectedEventLocationId(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}>
                        {eventLocations.map((location) => (
                          <Picker.Item
                            key={location._id}
                            label={location.name}
                            value={location._id}
                          />
                        ))}
                      </Picker>
                    )}
                  </View>
                </View>
              </>
            ) : (
              <Text style={[styles.resultText, { color: theme.colors.error }]}>
                {error || 'User not found or an error occurred.'}
              </Text>
            )}

            {error && !loadingUser && (
              <Text style={[styles.resultText, { color: theme.colors.error }]}>{error}</Text>
            )}

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.buttonBase, styles.buttonOutline]}
                onPress={() => {
                  setScannedUserId(null);
                  setEditingUser(null);
                  setFullname('');
                  setEmail('');
                  setSelectedRole('user');
                  // Reset location to first available or null
                  setSelectedEventLocationId(
                    eventLocations.length > 0 ? eventLocations[0]._id : null
                  );
                  setError('');
                }}>
                <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                <Text style={[styles.buttonText, styles.buttonTextOutline]}>Scan new user</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!editingUser || submitting || loadingUser || !selectedEventLocationId}
                style={[
                  styles.buttonBase,
                  styles.buttonPrimary,
                  {
                    opacity:
                      !editingUser || submitting || loadingUser || !selectedEventLocationId
                        ? 0.6
                        : 1,
                  },
                ]}
                onPress={onUpdateUser}>
                {submitting ? (
                  <ActivityIndicator />
                ) : (
                  <Ionicons name="save" size={20} color={theme.colors.text} />
                )}
                <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                  {submitting ? 'Updating...' : 'Update user'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  },
  resultText: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
    fontSize: 16,
    textAlign: 'center',
  },
  label: { color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 },
  value: { color: theme.colors.textPrimary, fontSize: 16 },

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
  input: {
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    color: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: theme.spacing.small,
  },
  smallLink: { marginTop: theme.spacing.small, alignSelf: 'center' },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  picker: {
    color: theme.colors.textPrimary,
  },
  pickerItem: {
    color: theme.colors.textPrimary,
  },
});
