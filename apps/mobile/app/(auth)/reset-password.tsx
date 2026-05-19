import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiClient } from '@/lib/api';

export default function ResetPasswordScreen() {
  const { token, email } = useLocalSearchParams<{ token: string; email: string }>();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!token || !email) {
      Alert.alert('Invalid Link', 'This reset link is invalid. Please request a new one.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Too Short', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.resetPassword(token, email, password);
      setSuccess(true);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Invalid or expired reset link. Please request a new one.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-[#0A0F1C] justify-center px-6">
        <View className="bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-lg p-6 mb-6 items-center">
          <Text className="text-[#00F5FF] font-semibold text-lg mb-2">Password updated!</Text>
          <Text className="text-gray-400 text-center text-sm">
            Your password has been changed. You can now sign in with your new password.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.replace('/login')}
          className="bg-[#00F5FF] rounded-lg py-3"
        >
          <Text className="text-[#0A0F1C] font-semibold text-center text-lg">Go to sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0F1C] justify-center px-6">
      <Text className="text-3xl font-bold text-white mb-2 text-center">Unimatrix</Text>
      <Text className="text-white text-xl font-semibold text-center mb-2">New Password</Text>
      {email && (
        <Text className="text-gray-400 text-center mb-8 text-sm">for {email}</Text>
      )}

      <View className="mb-4">
        <Text className="text-gray-300 mb-2">New password</Text>
        <TextInput
          placeholder="At least 8 characters"
          placeholderTextColor="#6B7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
        />
      </View>

      <View className="mb-8">
        <Text className="text-gray-300 mb-2">Confirm password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#6B7280"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
        />
      </View>

      <TouchableOpacity
        onPress={handleReset}
        disabled={loading}
        className="bg-[#00F5FF] rounded-lg py-3 mb-4"
        style={{ opacity: loading ? 0.5 : 1 }}
      >
        {loading ? (
          <ActivityIndicator color="#0A0F1C" />
        ) : (
          <Text className="text-[#0A0F1C] font-semibold text-center text-lg">Set new password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-[#00F5FF] text-center text-sm">← Back</Text>
      </TouchableOpacity>
    </View>
  );
}
