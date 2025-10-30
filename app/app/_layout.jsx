import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import '../global.css'; // Import your global stylesheet

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/*
        THIS IS THE FIX:
        This line tells the router to HIDE the header by default
        for all screens inside the (app) folder.
      */}
      <Stack.Screen name="(app)" options={{ headerShown: false }} />

      {/* This hides the header for all auth screens too */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* This shows a header for the 404 screen */}
      <Stack.Screen
        name="+not-found"
        options={{
          headerShown: true, // We want to see the header here
          headerTitle: 'Page Not Found',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
