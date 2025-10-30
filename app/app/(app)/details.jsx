import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function DetailsScreen() {
  // Get the parameters passed from the URL
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="mb-4 text-2xl font-bold">Details Screen</Text>
        <Text className="mb-8 text-lg text-gray-600">
          You are viewing details for item: {id || 'Unknown'}
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-lg bg-blue-500 px-6 py-3">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
