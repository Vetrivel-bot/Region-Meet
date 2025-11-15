import { Link } from 'expo-router';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { Button } from '@/components/Button';

const DEFAULT_SECRET = 'simple-demo-key';

function toUtf8Bytes(str) {
  const utf8 = unescape(encodeURIComponent(str));
  const bytes = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i++) bytes[i] = utf8.charCodeAt(i);
  return bytes;
}

function fromUtf8Bytes(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return decodeURIComponent(escape(s));
}

function bytesToHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, '0');
    out += h;
  }
  return out;
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

function xorEncrypt(plainText, secret) {
  const p = toUtf8Bytes(plainText);
  const k = toUtf8Bytes(secret);
  const out = new Uint8Array(p.length);
  for (let i = 0; i < p.length; i++) out[i] = p[i] ^ k[i % k.length];
  return bytesToHex(out);
}

export default function RegisterScreen() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [generatedData, setGeneratedData] = useState(null);

  const handleRegister = () => {
    if (!fullname.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', "Passwords don't match");
      return;
    }
    const key = (secret || DEFAULT_SECRET).trim();
    if (key.length < 4) {
      Alert.alert('Error', 'Secret key must be at least 4 characters');
      return;
    }

    const details = { fullname: fullname.trim(), email: email.trim(), password: password };
    const payload = JSON.stringify(details);
    const ciphertext = xorEncrypt(payload, key);

    setGeneratedData({ details, ciphertext });
  };

  const handleReset = () => {
    setFullname('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSecret('');
    setGeneratedData(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center p-8">
          {!generatedData && (
            <>
              <Text className="mb-8 text-3xl font-bold text-gray-100">Create Account</Text>

              <TextInput
                value={fullname}
                onChangeText={setFullname}
                placeholder="Full name"
                className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-4"
                placeholderTextColor={'white'}
                autoCapitalize="words"
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-4"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={'white'}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-4"
                secureTextEntry
                placeholderTextColor={'white'}
              />

              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-4"
                secureTextEntry
                placeholderTextColor={'white'}
              />

              {/* <TextInput
                value={secret}
                onChangeText={setSecret}
                placeholder="Secret key (optional)"
                className="mb-6 h-12 w-full rounded-lg border border-gray-300 px-4"
                secureTextEntry
                placeholderTextColor={'white'}
              /> */}

              <Button title="Generate QR" onPress={handleRegister} className="mb-4 w-full" />

              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text className="text-center text-white">
                    Already have an account? <Text className="font-bold">Log In</Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            </>
          )}

          {generatedData && (
            <View className="w-full items-center">
              <Text className="mb-6 text-2xl font-bold text-gray-100">
                Ask a Organiser for registration
              </Text>
              <View className="mb-6 items-center justify-center rounded-lg p-4">
                <QRCode value={generatedData.ciphertext} size={220} />
              </View>
              <View className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-4">
                <Text className="mb-2 text-gray-200">Full name</Text>
                <Text className="mb-4 font-medium text-white">
                  {generatedData.details.fullname}
                </Text>
                <Text className="mb-2 text-gray-200">Email</Text>
                <Text className="mb-4 font-medium text-white">{generatedData.details.email}</Text>
                <Text className="mb-2 text-gray-200">Payload (hex)</Text>
                <Text className="font-mono text-xs text-gray-300" numberOfLines={3}>
                  {generatedData.ciphertext}
                </Text>
              </View>
              <Button title="Done / Reset" onPress={handleReset} className="w-full" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
