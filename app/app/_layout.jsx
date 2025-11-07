// app/_layout.tsx
import React, { useEffect, useRef } from 'react';
import { Stack, Tabs, router, ErrorBoundary } from 'expo-router';
import { TouchableOpacity, StatusBar } from 'react-native'; // Added StatusBar
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../global.css'; // global styles
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// --- HERE ARE THE FIXES ---
// 1. Import the Safe Area Provider
import { SafeAreaProvider } from 'react-native-safe-area-context';
// 2. Import the Query Provider
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';
// --- END FIXES ---

import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '@/theme/theme';
import { registerForPushNotificationsAsync } from '@/services/pushNotifications';
import * as NavigationBar from 'expo-navigation-bar';

export { ErrorBoundary }; // keeps the expo-router error boundary
import AnimatedGlassBackground from '@/components/AnimatedGlassBackground';

const TOKEN_STORAGE_KEY = 'expo-push-token';

export default function RootLayout() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // This code runs when the app starts
    const setupNavigationBar = async () => {
      try {
        // 1. Hide the navigation bar
        await NavigationBar.setVisibilityAsync('hidden');

        // 2. Set the behavior: "inset-swipe" means the user must swipe
        // from the edge to see the bar temporarily.
        await NavigationBar.setBehaviorAsync('inset-swipe');

        console.log('Android navigation bar hidden successfully');
      } catch (e) {
        console.error('Failed to hide navigation bar', e);
      }
    };

    setupNavigationBar();
  }, []);

  // --- Updated Notification Logic ---
  useEffect(() => {
    const setupNotifications = async () => {
      const currentToken = await registerForPushNotificationsAsync();
      if (!currentToken) {
        console.log('Could not get push token.');
        return;
      }
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken !== currentToken) {
        console.log('New or changed push token identified:', currentToken);
        // TODO: Send token to your backend (MongoDB)
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, currentToken);
        console.log('New token saved to local storage.');
      } else {
        console.log('Push token is already stored and up-to-date.');
      }
      console.log('Native (FCM) Token for testing:', currentToken);
    };
    setupNotifications();

    // --- Listeners ---
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification Received (Foreground):', notification);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification Tapped:', response);
    });
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
  // --- End of Notification Logic ---

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: 'transparent' }}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <ThemeProvider theme={theme}>
              {/* translucent StatusBar so background shows through on Android */}
              <StatusBar hidden />
              {/* BACKGROUND: must be mounted BEFORE navigators so it's behind everything */}
              {/* Root Stack: switches between (auth) group and (tabs) group.
              Auth group won't have the tab bar because Tabs live in (tabs)/_layout.js */}
              <AnimatedGlassBackground />

              <Stack
                screenOptions={{
                  headerShown: false,
                  // IMPORTANT: make navigator content transparent so bg shows through
                  contentStyle: { backgroundColor: 'transparent' },
                }}>
                {' '}
                {/* Main app with tabs */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                {/* Auth group (login/signup) */}
                <Stack.Screen name="(utils)" options={{ headerShown: false }} />
                {/* Keep not-found/page fallback */}
                <Stack.Screen name="+not-found" options={{ headerShown: true }} />
              </Stack>
            </ThemeProvider>
          </AppProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
