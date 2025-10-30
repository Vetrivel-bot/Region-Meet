import { Link, router } from 'expo-router';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const handleLogin = () => {
    // 1. Add your authentication logic here (e.g., call your API)
    // 2. On success, navigate to the main app
    
    // We use 'replace' to prevent the user from going "back" to the login screen
    router.replace('/(app)'); 
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-8">
        <Text className="mb-12 text-4xl font-bold text-gray-800">Log In</Text>

        <TextInput
          placeholder="Email"
          className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-4"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          className="mb-6 h-12 w-full rounded-lg border border-gray-300 px-4"
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="mb-6 h-12 w-full items-center justify-center rounded-lg bg-blue-500"
        >
          <Text className="text-lg font-bold text-white">Login</Text>
        </TouchableOpacity>

        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text className="text-center text-blue-500">
              Don't have an account? <Text className="font-bold">Register</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
