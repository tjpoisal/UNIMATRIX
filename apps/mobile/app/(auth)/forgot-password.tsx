import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await apiClient.forgotPassword(email.trim().toLowerCase());
    } catch {
      // Intentionally swallow errors to avoid email enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0F1C] justify-center px-6">
      <Text className="text-3xl font-bold text-white mb-2 text-center">Unimatrix</Text>
      <Text className="text-white text-xl font-semibold text-center mb-2">Reset Password</Text>
      <Text className="text-gray-400 text-center mb-8 text-sm">
        Enter your email and we&apos;ll send you a link to reset your password.
      </Text>

      {submitted ? (
        <View className="bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-lg p-5 mb-6">
          <Text className="text-[#00F5FF] font-semibold text-center mb-1">Check your inbox</Text>
          <Text className="text-gray-400 text-center text-sm">
            If an account exists for {email}, you&apos;ll receive a reset link shortly.
          </Text>
        </View>
      ) : (
        <>
          <View className="mb-6">
            <Text className="text-gray-300 mb-2">Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-[#00F5FF] rounded-lg py-3 mb-4"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#0A0F1C" />
            ) : (
              <Text className="text-[#0A0F1C] font-semibold text-center text-lg">Send reset link</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.back()} className="mt-2">
        <Text className="text-[#00F5FF] text-center text-sm">← Back to sign in</Text>
      </TouchableOpacity>
    </View>
  );
}
