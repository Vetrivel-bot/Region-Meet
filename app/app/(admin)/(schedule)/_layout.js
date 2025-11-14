import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar, View } from 'react-native';
import { theme } from '../../../theme/theme';

export default function ScheduleStackLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          // IMPORTANT: make navigator content transparent so bg shows through
          contentStyle: { backgroundColor: theme.colors.background, borderRadius: 888 },
        }}>
        {/* translucent StatusBar so background shows through on Android */}
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        {/* BACKGROUND: must be mounted BEFORE navigators so it's behind everything */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="events/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
