// app/_layout.tsx
import React, { useEffect, useRef } from 'react';
// 1. Import useSegments
import { Stack, router, ErrorBoundary, useSegments } from 'expo-router';
import { StatusBar, View, ActivityIndicator, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../global.css';
import { QueryClientProvider, onlineManager } from '@tanstack/react-query'; // 1. Import onlineManager
import { useNetInfo } from '@react-native-community/netinfo'; // 2. Import NetInfo hook
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/services/queryClient';
import { AppProvider, useApp } from '@/context/AppContext';
// import { ThemeProvider } from 'styled-components/native';
import { theme } from '@/theme/theme';
import { registerForPushNotificationsAsync } from '@/services/pushNotifications';
import * as NavigationBar from 'expo-navigation-bar';

export { ErrorBoundary };
import AnimatedGlassBackground from '@/components/AnimatedGlassBackground';

const TOKEN_STORAGE_KEY = 'expo-push-token';
// 3. NEW: Create a component to link NetInfo
function NetInfoManager() {
  const netInfo = useNetInfo();

  useEffect(() => {
    // This is the key part:
    // Tell query-client whether the app is online or not based on NetInfo
    if (Platform.OS !== 'web') {
      onlineManager.setOnline(
        netInfo.isConnected != null && netInfo.isConnected && Boolean(netInfo.isInternetReachable)
      );
    }
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  return null; // This component doesn't render anything
}
export default function RootLayout() {
  const notificationListener = useRef;
  const responseListener = useRef;

  useEffect(() => {
    const setupNavigationBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('inset-swipe');
      } catch (e) {
        console.error('Failed to hide navigation bar', e);
      }
    };
    setupNavigationBar();
  }, []);

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
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, currentToken);
      } else {
        console.log('Push token is already stored and up-to-date.');
      }
      console.log('Native (FCM) Token for testing:', currentToken);
    };
    setupNotifications();

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: 'transparent' }}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            {/* <ThemeProvider theme={theme}> */}
            <StatusBar hidden />
            <AnimatedGlassBackground />
            <AuthGate />
            <NetInfoManager /> {/* 4. Add the component here */}
            {/* </ThemeProvider> */}
          </AppProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * AuthGate
 *
 * - While `loading` is true: show background + spinner (no routing).
 * - If not loading and user == null: only expose `(auth)` stack (user cannot open `(tabs)`).
 * - If not loading and user exists: only expose `(tabs)` stack.
 *
 * This prevents navigation to protected screens when user is not authenticated.
 */
function AuthGate() {
  const { user, loading } = useApp();
  // 2. Get the current route segments
  const segments = useSegments();

  // --- UPDATE IS HERE ---
  // 3. Add the strict validation effect
  useEffect(() => {
    // Wait until loading is false
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // If user is NOT logged in and NOT in the (auth) group,
      // force them to the login screen.
      // Add delay to prevent crash
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 0);
    } else if (user && inAuthGroup) {
      // If user IS logged in and IS in the (auth) group,
      // force them to the main app screen.
      // Add delay to prevent crash
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 0);
    }
  }, [user, loading, segments]); // Re-run this effect when user, loading, or route changes
  // --- END OF UPDATE ---

  // show nothing but background & loader while AppContext initializes
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* keep the animated background mounted (already mounted in layout) */}
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // NOT AUTHENTICATED: only render auth screens
  if (!user) {
    console.log('Auth');

    return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* optional util / not-found for fallback */}
        <Stack.Screen name="+not-found" options={{ headerShown: true }} />
      </Stack>
    );
  }

  // AUTHENTICATED: only render main app (tabs + utils)
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(utils)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: true }} />
    </Stack>
  );
}
