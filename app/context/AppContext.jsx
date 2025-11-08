import React, { createContext, useContext, useCallback } from 'react';
import { Alert } from 'react-native'; // Import Alert
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location'; // 1. Import Location
import { UserAPI, loadAuthToken } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AppContext = createContext(null);

// 🔥 fetch Expo push token and platform (Unchanged)
const getPushInfo = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push permission not granted');
      return { expoPushToken: null, platform: Device.osName || 'Unknown' };
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;
    const platform = Device.osName || 'Unknown';
    return { expoPushToken, platform };
  } catch (err) {
    console.warn('Push token fetch failed:', err.message);
    return { expoPushToken: null, platform: Device.osName || 'Unknown' };
  }
};

// --- 2. NEW: GET LOCATION HELPER ---
/**
 * Gets the user's exact GPS location.
 */
const getLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      // Alert.alert('Permission Denied', 'Location access is required to verify your premise.');
      return null;
    }

    // Get "exact premise location" (highest accuracy)
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (err) {
    console.warn('Location fetch failed:', err.message);
    return null;
  }
};

/**
 * This is your new query function.
 * It contains the logic from your old useEffect.
 */
const fetchUser = async () => {
  try {
    const token = await loadAuthToken();
    if (!token) {
      return null; // No token, so user is null
    }

    // --- 3. RUN HELPER FUNCTIONS IN PARALLEL ---
    const [pushInfo, location] = await Promise.all([getPushInfo(), getLocation()]);

    // ✅ Fetch profile & send ALL data to backend
    const profile = await UserAPI.me(
      pushInfo.expoPushToken,
      pushInfo.platform,
      location // This will be { latitude, longitude } or null
    );

    return profile; // Return the user data
  } catch (err) {
    console.warn('Failed to load user profile:', err.message);
    // If API.me() fails (e.g., bad token), treat as logged out
    return null;
  }
};

export const AppProvider = ({ children }) => {
  // Get the query client instance to update the cache
  const queryClient = useQueryClient();

  // ✅ This one hook replaces your useState and useEffect
  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['me'], // The unique name for this data
    queryFn: fetchUser, // The function that fetches it
    staleTime: 1000 * 60 * 60, // 1 hour: Data is "fresh" for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours: Keep in cache for 1 day
    refetchOnReconnect: 'always', // Refetch when internet connection is restored
  });

  // ✅ Create a new 'setUser' function for Login/Logout
  // This function will manually update the query cache
  const setUser = useCallback(
    (newUserData) => {
      // When you call 'setUser(user)', it updates the 'me' query's data
      queryClient.setQueryData(['me'], newUserData);
    },
    [queryClient]
  );

  return <AppContext.Provider value={{ user, setUser, loading }}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
