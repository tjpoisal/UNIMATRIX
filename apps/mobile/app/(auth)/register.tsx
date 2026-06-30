import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/lib/api';
import { handleGoogleOAuth, handleGitHubOAuth } from '@/lib/oauth';
import { OAuthButton } from '@/components/OAuthButton';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.register(email, password, name);
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userId', response.user.id);
      router.replace('/(auth)/onboarding');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await handleGoogleOAuth();
      if (result.success) {
        router.replace('/(auth)/onboarding');
      } else {
        Alert.alert('OAuth Failed', result.error || 'Failed to sign in with Google');
      }
    } catch (error: any) {
      Alert.alert('OAuth Failed', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    try {
      const result = await handleGitHubOAuth();
      if (result.success) {
        router.replace('/(auth)/onboarding');
      } else {
        Alert.alert('OAuth Failed', result.error || 'Failed to sign in with GitHub');
      }
    } catch (error: any) {
      Alert.alert('OAuth Failed', error.message || 'Failed to sign in with GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0F1C] justify-center px-6">
      <Text className="text-3xl font-bold text-white mb-2 text-center">Create Account</Text>
      <Text className="text-gray-400 text-center mb-8">Join Unimatrix</Text>

      <View className="mb-6">
        <Text className="text-gray-300 mb-2">Full Name</Text>
        <TextInput
          placeholder="John Doe"
          placeholderTextColor="#6B7280"
          value={name}
          onChangeText={setName}
          className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-300 mb-2">Email</Text>
        <TextInput
          placeholder="you@example.com"
          placeholderTextColor="#6B7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-300 mb-2">Password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#6B7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
        />
        <Text className="text-gray-500 text-xs mt-1">Minimum 8 characters</Text>
      </View>

      <View className="mb-8">
        <Text className="text-gray-300 mb-2">Confirm Password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#6B7280"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
        />
      </View>

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        className="bg-[#00F5FF] rounded-lg py-3 mb-4"
      >
        {loading ? (
          <ActivityIndicator color="#0A0F1C" />
        ) : (
          <Text className="text-[#0A0F1C] font-semibold text-center text-lg">Sign Up</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row items-center mb-4">
        <View className="flex-1 h-px bg-gray-600" />
        <Text className="mx-4 text-gray-500 text-sm">or continue with</Text>
        <View className="flex-1 h-px bg-gray-600" />
      </View>

      <OAuthButton
        provider="google"
        onPress={handleGoogleSignIn}
        loading={loading}
      />

      <View className="h-3" />

      <OAuthButton
        provider="github"
        onPress={handleGitHubSignIn}
        loading={loading}
      />

      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-gray-400 text-center mt-4">
          Already have an account? <Text className="text-[#00F5FF] font-semibold">Sign in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
