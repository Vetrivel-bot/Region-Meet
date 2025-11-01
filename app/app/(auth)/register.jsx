import { Link, router } from 'expo-router';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/Button';

export default function RegisterScreen() {
  const handleRegister = () => {
    // 1. Add your registration logic
    // 2. On success, navigate to the main app or login
    router.replace('/(app)');
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <View className="flex-1 items-center justify-center p-8">
        <Text className="mb-12 text-4xl font-bold text-gray-100">Create Account</Text>

        <TextInput
          placeholder="Email"
          className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-4"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={'white'}
        />
        <TextInput
          placeholder="Password"
          className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-4"
          secureTextEntry
          placeholderTextColor={'white'}
        />
        <TextInput
          placeholder="Confirm Password"
          className="mb-6 h-12 w-full rounded-lg border border-gray-300 px-4"
          secureTextEntry
          placeholderTextColor={'white'}
        />
        {/* --- THIS IS THE CLEANED-UP USAGE --- */}
        <Button
          title="Register"
          onPress={handleRegister}
          // The className prop now ONLY passes LAYOUT styles
          // All design styles (bg, text, height) are gone
          className="mb-6 w-full"
        />

        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text className="text-center text-white">
              Already have an account? <Text className="font-bold">Log In</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
