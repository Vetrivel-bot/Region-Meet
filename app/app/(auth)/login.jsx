// 1. Change your React import (you no longer need useContext here)
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '@/components/Button';
import { UserAPI } from '@/services/api';

// 2. Change this import from AppContext to useApp
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  // 3. Change this to use the hook
  const { setUser } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      const { user } = await UserAPI.login(email.trim(), password);
      console.log('✅ Logged in as:', user.fullname);
      setUser(user);
      router.replace('/(tabs)');
    } catch (err) {
      console.warn(err);
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <View className="flex-1 items-center justify-center bg-transparent p-8">
        <Text className="mb-12 text-4xl font-bold text-gray-100">Log In</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-4 text-white"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={'white'}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          className="mb-6 h-12 w-full rounded-lg border border-gray-300 px-4 text-white"
          secureTextEntry
          placeholderTextColor={'white'}
        />

        <Button
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          className="mb-6 w-full"
          disabled={loading}
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
