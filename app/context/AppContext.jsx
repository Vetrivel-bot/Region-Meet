import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
// 1. Import setOnUnauthorized
import { UserAPI, loadAuthToken, setOnUnauthorized } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AppContext = createContext(null);

// --- getPushInfo and getLocation helpers are unchanged ---

// 🔥 fetch Expo push token and platform
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

// --- GET LOCATION HELPER ---
/**
 * Gets the user's exact GPS location.
 */
const getLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

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
 * This function now *only* fetches the profile.
 * It assumes the token has already been loaded.
 */
const fetchUser = async () => {
  try {
    // --- RUN HELPER FUNCTIONS IN PARALLEL ---
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
    // The interceptor in api.js will handle clearing the token
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // 2. This is our new, separate loading state
  // It's true *only* while checking AsyncStorage for the token
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  // 3. This is the 'me' query
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnReconnect: 'always',

    // 4. THE KEY FIX:
    // This query is *disabled* until two things are true:
    // a) The initial token check is finished (isTokenLoading is false)
    // b) A token was *actually found*
    enabled: !isTokenLoading && !!queryClient.getQueryData(['authToken']),
  });

  // 5. This effect runs ONCE to check AsyncStorage
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await loadAuthToken();
        // We store the token (or null) in React Query's cache
        // for the 'enabled' flag above to use.
        queryClient.setQueryData(['authToken'], token);
      } catch (e) {
        console.warn('Failed to load auth token from storage', e);
        queryClient.setQueryData(['authToken'], null);
      } finally {
        // This check is done, so we set it to false.
        setIsTokenLoading(false);
      }
    };

    checkToken();

    // 6. Tell the api.js interceptor what to do on a 401 error
    setOnUnauthorized(() => {
      // If we get a 401, clear both the user and the token
      queryClient.setQueryData(['me'], null);
      queryClient.setQueryData(['authToken'], null);
    });
  }, [queryClient]);

  // 7. This 'setUser' is for manual login/logout
  const setUser = useCallback(
    (newUserData) => {
      // Manually update the 'me' query cache
      queryClient.setQueryData(['me'], newUserData);
      // Also update the 'authToken' cache so the app state is consistent
      queryClient.setQueryData(['authToken'], newUserData ? 'loggedIn' : null);
    },
    [queryClient]
  );

  // 8. The "REAL" loading state
  // The app is "loading" if:
  // a) We are still checking for the token (isTokenLoading)
  // OR
  // b) We found a token, and we are now fetching the user (isUserLoading)
  const loading = isTokenLoading || isUserLoading;

  return <AppContext.Provider value={{ user, setUser, loading, getLocation }}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
