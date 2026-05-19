import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/lib/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.login(email, password);
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userId', response.user.id);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0F1C] justify-center px-6">
      <Text className="text-3xl font-bold text-white mb-8 text-center">Unimatrix</Text>
      
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

      <View className="mb-2">
        <Text className="text-gray-300 mb-2">Password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#6B7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
        />
      </View>

      <TouchableOpacity onPress={() => router.push('/forgot-password')} className="self-end mb-6">
        <Text className="text-[#00F5FF] text-sm">Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="bg-[#00F5FF] rounded-lg py-3 mb-4"
      >
        {loading ? (
          <ActivityIndicator color="#0A0F1C" />
        ) : (
          <Text className="text-[#0A0F1C] font-semibold text-center text-lg">Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text className="text-gray-400 text-center">
          Don't have an account? <Text className="text-[#00F5FF] font-semibold">Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}