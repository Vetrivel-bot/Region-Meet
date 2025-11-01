import { Link, router } from 'expo-router';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/Button';
export default function LoginScreen() {
  const handleLogin = () => {
    // 1. Add your authentication logic here (e.g., call your API)
    // 2. On success, navigate to the main app

    // We use 'replace' to prevent the user from going "back" to the login screen
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <View className="flex-1 items-center justify-center bg-transparent p-8">
        <Text className="mb-12 text-4xl font-bold text-gray-100">Log In</Text>

        <TextInput
          placeholder="Email"
          className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-4"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={'white'}
        />
        <TextInput
          placeholder="Password"
          className="mb-6 h-12 w-full rounded-lg border border-gray-300 px-4"
          secureTextEntry
          placeholderTextColor={'white'}
        />

        <Button
          title="Login"
          onPress={handleLogin}
          // The className prop now ONLY passes LAYOUT styles
          // All design styles (bg, text, height) are gone
          className="mb-6 w-full"
        />

        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text className="text-center text-white">
              Don't have an account? <Text className="font-bold">Register</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
