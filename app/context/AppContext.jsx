import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { UserAPI, loadAuthToken } from '@/services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const initUser = async () => {
      try {
        const token = await loadAuthToken();
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // ✅ Get push token + platform
        const { expoPushToken, platform } = await getPushInfo();

        // ✅ Fetch profile & send token/platform to backend
        const profile = await UserAPI.me(expoPushToken, platform);
        setUser(profile);
      } catch (err) {
        console.warn('Failed to load user profile:', err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  return <AppContext.Provider value={{ user, setUser, loading }}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
