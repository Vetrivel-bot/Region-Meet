import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // IMPORTANT: make navigator content transparent so bg shows through
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen
        name="login"
        options={{
          // --- Add this ---
          animation: 'fade',
          // or 'none' for instant, but 'fade' is nicer
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          // --- Add this ---
          animation: 'fade',
          // or 'none' for instant, but 'fade' is nicer
        }}
      />
    </Stack>
  );
}
