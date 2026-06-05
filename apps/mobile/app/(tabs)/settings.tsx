import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LLMProvider {
  id: string;
  provider: string;
  model: string;
  label: string | null;
  keyPrefix: string;
  createdAt: string;
}

export default function SettingsScreen() {
  const [llmProviders, setLlmProviders] = useState<LLMProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

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

  const fetchProviders = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;

    setLoadingProviders(true);
    try {
      const apiBase = (process.env.EXPO_PUBLIC_API_URL || 'https://deployunimatrix.com') + '/api';
      const res = await fetch(apiBase + '/llm-providers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLlmProviders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <ScrollView className="flex-1 bg-[#0A0F1C] px-4 py-4">
      <View className="bg-[#1A1F35] border border-[#00F5FF]/10 rounded-lg p-4 mb-4">
        <Text className="text-gray-400 text-sm">Version</Text>
        <Text className="text-white text-lg font-semibold">1.0.0</Text>
      </View>

      {/* Connected LLM providers (populated from web onboarding or desktop) */}
      <View className="bg-[#1A1F35] border border-[#00F5FF]/10 rounded-lg p-4 mb-4">
        <Text className="text-gray-400 text-sm mb-3">Connected LLMs (from your account)</Text>
        {loadingProviders ? (
          <ActivityIndicator color="#00F5FF" />
        ) : llmProviders.length > 0 ? (
          llmProviders.map((p) => (
            <View key={p.id} className="mb-2 p-2 bg-[#0A0F1C] rounded">
              <Text className="text-white text-sm font-medium capitalize">{p.provider} • {p.model}</Text>
              <Text className="text-gray-500 text-xs font-mono">{p.keyPrefix}</Text>
              {p.label && <Text className="text-gray-400 text-xs">{p.label}</Text>}
            </View>
          ))
        ) : (
          <Text className="text-gray-400 text-sm">No LLM providers connected yet. Set them up in the web onboarding (or Settings → Providers on web) for full agent and smart memory features. They will appear here automatically once connected on any device.</Text>
        )}
        <Text className="text-[10px] text-gray-500 mt-2">These are account-level. Connect once on web or desktop and they work everywhere (including here on mobile for any in-app AI features).</Text>
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

      <View className="mt-6 p-3 bg-[#111827] rounded-lg">
        <Text className="text-gray-400 text-xs text-center">
          Mobile "install" is simple: install the app, then use the API Key from your web/desktop onboarding (or same email/password). All LLM logins and memories are already set up on your account.
        </Text>
      </View>
    </ScrollView>
  );
}
