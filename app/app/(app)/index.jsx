import { Link, router } from 'expo-router';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  //
  // NOTICE: There is NO <Stack.Screen> component in this file.
  // It will now correctly use the "headerShown: false" setting
  // from the _layout.tsx file.
  //
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-4 text-3xl font-bold">Welcome!</Text>
        <Text className="mb-8 text-center text-lg text-gray-600">This screen has NO header.</Text>

        <Link href="/details?id=1" asChild>
          <TouchableOpacity className="mb-4 rounded-lg bg-blue-500 px-6 py-3">
            <Text className="text-white">Go to Details (has header)</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          onPress={() => router.replace('/login')}
          className="mt-12 rounded-lg bg-gray-200 px-6 py-3">
          <Text className="font-medium text-gray-700">Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
