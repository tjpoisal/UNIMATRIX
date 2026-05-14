import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { apiClient } from '@/lib/api';

interface Location {
  id: string;
  name: string;
  memories: Memory[];
  children?: Location[];
}

interface Memory {
  id: string;
  content: string;
  tags: string[];
}

export default function PalaceScreen() {
  const { id } = useLocalSearchParams();
  const [palace, setPalace] = useState<any>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPalace();
  }, [id]);

  const loadPalace = async () => {
    try {
      const data = await apiClient.getPalace(id as string);
      setPalace(data);
      setLocations(data.locations || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load palace');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const renderLocationItem = (location: Location, depth = 0) => {
    return (
      <View key={location.id}>
        <View className={`px-4 py-2 border-l-2 border-[#00F5FF]/20 ml-${depth * 4}`}>
          <Text className="text-white font-medium">{location.name}</Text>
          <Text className="text-gray-400 text-xs">{location.memories?.length || 0} memories</Text>
        </View>
        {location.memories?.map((memory) => (
          <TouchableOpacity
            key={memory.id}
            onPress={() => setSelectedMemory(memory)}
            className={`px-4 py-2 ml-${(depth + 1) * 4} bg-[#1A1F35]/50 border-l border-[#00F5FF]/10 ${
              selectedMemory?.id === memory.id ? 'border-l-[#00F5FF]' : ''
            }`}
          >
            <Text className="text-gray-300 text-sm" numberOfLines={1}>
              {memory.content.substring(0, 50)}...
            </Text>
          </TouchableOpacity>
        ))}
        {location.children?.map((child) => renderLocationItem(child, depth + 1))}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0A0F1C] justify-center items-center">
        <ActivityIndicator size="large" color="#00F5FF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0F1C] flex-row">
      {/* Left: Locations Tree */}
      <ScrollView className="flex-1 border-r border-[#00F5FF]/10 bg-[#0A0F1C]">
        {locations.map((location) => renderLocationItem(location))}
      </ScrollView>

      {/* Right: Memory Content */}
      <ScrollView className="flex-1 bg-[#0A0F1C]">
        {selectedMemory ? (
          <View className="p-4">
            <Text className="text-white text-lg font-semibold mb-4">{palace?.name}</Text>
            <View className="bg-[#1A1F35] border border-[#00F5FF]/10 rounded-lg p-4 mb-4">
              <Text className="text-white text-base leading-6">{selectedMemory.content}</Text>
            </View>
            {selectedMemory.tags?.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {selectedMemory.tags.map((tag) => (
                  <View key={tag} className="bg-[#A855F7]/20 border border-[#A855F7]/30 rounded-full px-3 py-1">
                    <Text className="text-[#A855F7] text-xs">{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-400 text-center">Select a memory to view</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}