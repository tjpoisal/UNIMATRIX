import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { apiClient } from '@/lib/api';

interface Palace {
  id: string;
  name: string;
  description?: string;
  locations?: any[];
}

export default function DashboardScreen() {
  const [palaces, setPalaces] = useState<Palace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPalaces();
  }, []);

  const loadPalaces = async () => {
    try {
      const data = await apiClient.getPalaces();
      setPalaces(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load palaces');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0A0F1C] justify-center items-center">
        <ActivityIndicator size="large" color="#00F5FF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0F1C] px-4 py-4">
      {palaces.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-lg mb-6">No palaces yet</Text>
          <TouchableOpacity className="bg-[#00F5FF] rounded-lg px-6 py-3">
            <Text className="text-[#0A0F1C] font-semibold">Create Your First Palace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={palaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/palace/${item.id}`)}
              className="bg-[#1A1F35] border border-[#00F5FF]/10 rounded-lg p-4 mb-4 active:border-[#00F5FF]/30"
            >
              <Text className="text-white font-semibold text-lg mb-2">{item.name}</Text>
              <Text className="text-gray-400 text-sm mb-2">
                {item.description || 'No description'}
              </Text>
              <Text className="text-[#00F5FF] text-xs">
                {item.locations?.length || 0} locations
              </Text>
            </TouchableOpacity>
          )}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}