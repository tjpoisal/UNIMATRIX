import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userId');
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#0A0F1C] px-4 py-4">
      <View className="bg-[#1A1F35] border border-[#00F5FF]/10 rounded-lg p-4 mb-4">
        <Text className="text-gray-400 text-sm">Version</Text>
        <Text className="text-white text-lg font-semibold">1.0.0</Text>
      </View>

      <View className="bg-[#1A1F35] border border-[#00F5FF]/10 rounded-lg p-4 mb-6">
        <Text className="text-gray-400 text-sm mb-4">Account</Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-lg py-3"
        >
          <Text className="text-[#EF4444] font-semibold text-center">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-[#1A1F35] border border-[#00F5FF]/10 rounded-lg p-4">
        <Text className="text-gray-400 text-sm">Sync Status</Text>
        <View className="flex-row items-center gap-2 mt-3">
          <View className="w-3 h-3 rounded-full bg-[#10B981]" />
          <Text className="text-white">All synced</Text>
        </View>
      </View>
    </View>
  );
}