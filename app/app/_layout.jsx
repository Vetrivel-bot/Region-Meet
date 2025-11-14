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
 * - If not loading and user == null: only expose `(auth)` stack.
 * - If not loading and user exists:
 * - user.role === 'admin': only expose `(admin)` and `(utils)` stacks.
 * - user.role === 'user': only expose `(tabs)` and `(utils)` stacks.
 *
 * This prevents navigation to protected screens when user is not authenticated
 * or does not have the correct role.
 */
function AuthGate() {
  const { user, loading } = useApp();
  const segments = useSegments();

  // --- 1. UPDATED REDIRECTION LOGIC ---
  useEffect(() => {
    // Wait until loading is false
    if (loading) {
      return;
    }

    // Get the name of the top-level route group
    const inGroup = segments[0]; // e.g., '(auth)', '(admin)', '(tabs)'

    if (!user) {
      // --- NOT LOGGED IN ---
      // If user is not logged in and not in the (auth) group,
      // force them to the login screen.
      if (inGroup !== '(auth)') {
        setTimeout(() => router.replace('/(auth)/login'), 0);
      }
    } else {
      // --- LOGGED IN ---
      const isHost = user.role === 'host';
      console.log(`AuthGate: User logged in. Role: ${user.role}`);

      if (isHost) {
        // --- ADMIN USER ---
        // If admin is in (auth) or (tabs) group, redirect to admin home.
        if (inGroup === '(auth)' || inGroup === '(tabs)') {
          // Assuming your admin home is at /(admin)/(tabs)/home or similar
          // Adjust this path if your admin root is different
          setTimeout(() => router.replace('/(admin)/(tabs)'), 0);
        }
      } else {
        // --- REGULAR USER ---
        // If user is in (auth) or (admin) group, redirect to user home.
        if (inGroup === '(auth)' || inGroup === '(admin)') {
          setTimeout(() => router.replace('/(tabs)'), 0);
        }
      }
    }
  }, [user, loading, segments]); // Re-run this effect when user, loading, or route changes
  // --- END OF UPDATE ---

  // show nothing but background & loader while AppContext initializes
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // --- 2. UPDATED RENDER LOGIC ---

  // NOT AUTHENTICATED: only render auth screens
  if (!user) {
    console.log('AuthGate: Rendering (auth) stack');
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: true }} />
      </Stack>
    );
  }

  // AUTHENTICATED: Render stacks based on role
  const isHost = user.role === 'host';

  if (isHost) {
    // --- ADMIN STACKS ---
    console.log('AuthGate: Rendering (admin) + (utils) stacks');
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}>
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(utils)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: true }} />
      </Stack>
    );
  }

  // --- REGULAR USER STACKS (default) ---
  console.log('AuthGate: Rendering (tabs) + (utils) stacks');
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
