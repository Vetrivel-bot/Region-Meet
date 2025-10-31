import React, { useEffect, useRef } from 'react';
import { Stack, router, ErrorBoundary } from 'expo-router';
import { TouchableOpacity, StatusBar } from 'react-native'; // Added StatusBar
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../global.css'; // global styles

// --- HERE ARE THE FIXES ---
// 1. Import the Safe Area Provider
import { SafeAreaProvider } from 'react-native-safe-area-context';
// 2. Import the Query Provider
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from "@/services/queryClient";
// --- END FIXES ---

import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '@/theme/theme';
import { registerForPushNotificationsAsync } from '@/services/pushNotifications';

export { ErrorBoundary }; // keeps the expo-router error boundary

const TOKEN_STORAGE_KEY = 'expo-push-token';

export default function RootLayout() {
  const notificationListener = useRef();
  const responseListener = useRef();

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
    // 3. Add the SafeAreaProvider as the OUTERMOST wrapper
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ThemeProvider theme={theme}>
            {/* Set the status bar text to light. 
              This is good practice since your content will now go to the top.
            */}
            <StatusBar barStyle="light-content" />
            <Stack>
              {/* Hide header for all screens in (app) group */}
              <Stack.Screen name="(app)" options={{ headerShown: false }} />

              {/* Hide header for all screens in (auth) group */}
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />

              {/* Show header for not-found page */}
              <Stack.Screen
                name="+not-found"
                options={{
                  headerShown: true,
                  headerTitle: 'Page Not Found',
                  headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                      <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                  ),
                }}
              />
            </Stack>
          </ThemeProvider>
        </AppProvider>
      </QueryClientProvider>
    </SafeAreaProvider> // 4. Close the provider
  );
}

