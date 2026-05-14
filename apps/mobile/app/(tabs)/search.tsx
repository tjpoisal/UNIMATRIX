import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { apiClient } from '@/lib/api';

interface SearchResult {
  id: string;
  content: string;
  locationName: string;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.search(query);
      setResults(data);
    } catch (error) {
      Alert.alert('Error', 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0F1C] px-4 py-4">
      <View className="flex-row gap-2 mb-6">
        <TextInput
          placeholder="Search memories..."
          placeholderTextColor="#6B7280"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          className="flex-1 bg-[#1A1F35] border border-[#00F5FF]/20 rounded-lg px-4 py-3 text-white"
        />
        <TouchableOpacity
          onPress={handleSearch}
          className="bg-[#00F5FF] rounded-lg px-4 py-3 justify-center"
        >
          <Text className="text-[#0A0F1C] font-semibold">Go</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00F5FF" />
      ) : results.length === 0 && query ? (
        <Text className="text-gray-400 text-center">No results found</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-[#1A1F35] border border-[#00F5FF]/10 rounded-lg p-4 mb-3">
              <Text className="text-[#00F5FF] text-xs mb-1">{item.locationName}</Text>
              <Text className="text-white text-sm">{item.content.substring(0, 100)}...</Text>
            </View>
          )}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}