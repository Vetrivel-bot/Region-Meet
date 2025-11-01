import { Link } from 'expo-router';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-4 text-2xl font-bold">Oops!</Text>
        <Text className="mb-8 text-center text-lg text-gray-600">
          We couldn't find the page you were looking for.
        </Text>

        <Link href="(tabs)" asChild>
          <TouchableOpacity className="rounded-lg bg-blue-500 px-6 py-3">
            <Text className="text-white">Go to Home Screen</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
