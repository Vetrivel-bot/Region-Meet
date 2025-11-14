// app/(tabs)/_layout.js
import React from 'react';
import { Tabs } from 'expo-router';
import PersistentHeader from '@/components/PersistentHeader';
import CustomTabBar from '@/components/CustomTabBar';

export default function TabsLayout() {
  return (
    <>
      <PersistentHeader />
      <Tabs
        // ensure navigator's scene container is transparent too
        sceneContainerStyle={{ backgroundColor: 'black' }}
        screenOptions={{
          headerShown: false,
          // ensures individual screens render transparent by default
          contentStyle: { backgroundColor: 'black' },
        }}
        tabBar={(props) => <CustomTabBar {...props} />}>
        <Tabs.Screen name="(home)" options={{ title: 'Home' }} />
        <Tabs.Screen name="search" options={{ title: 'Search', tabBarBadge: null }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarBadge: null }} />
        <Tabs.Screen name="(schedule)" options={{ title: 'schedule', tabBarBadge: null }} />
      </Tabs>
    </>
  );
}
