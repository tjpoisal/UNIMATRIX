/**
 * Search Tab — Semantic Recall
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mcpClient } from '@/lib/mcp-client';
import type { Memory } from '@/lib/types';

export default function RecallScreen() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const recall = useCallback(async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    try {
      const r = await mcpClient.recall(query.trim());
      setResults(r.memories);
    } catch (e: any) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Recall</Text>
        <Text style={styles.subtitle}>Search across all LLMs and devices</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything you've discussed…"
          placeholderTextColor="#475569"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={recall}
          returnKeyType="search"
          selectionColor="#00F5FF"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={recall} disabled={loading}>
          {loading
            ? <ActivityIndicator size="small" color="#00F5FF" />
            : <Text style={styles.searchBtnText}>Go</Text>
          }
        </TouchableOpacity>
      </View>

      {!searched ? (
        <View style={styles.prompt}>
          <Text style={styles.promptIcon}>🔍</Text>
          <Text style={styles.promptText}>Type a topic, question, or keyword to search your memory</Text>
        </View>
      ) : results.length === 0 && !loading ? (
        <View style={styles.prompt}>
          <Text style={styles.promptIcon}>🤷</Text>
          <Text style={styles.promptText}>No memories found for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.resultCard}>
              <Text style={styles.resultSource}>{item.source} · {item.semanticCat ?? 'general'}</Text>
              <Text style={styles.resultText}>{item.hint ?? item.summary ?? 'Encrypted memory'}</Text>
              {item.tags.length > 0 && (
                <Text style={styles.resultTags}>{item.tags.slice(0,5).map(t => '#' + t).join('  ')}</Text>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#0A0F1C' },
  header:       { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:        { fontSize: 24, fontWeight: '700', color: '#F1F5F9' },
  subtitle:     { fontSize: 13, color: '#64748B', marginTop: 4 },
  searchRow:    { flexDirection: 'row', marginHorizontal: 16, marginVertical: 12, gap: 8 },
  input:        { flex: 1, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#F1F5F9', fontSize: 15 },
  searchBtn:    { backgroundColor: '#00F5FF22', borderWidth: 1, borderColor: '#00F5FF55', borderRadius: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  searchBtnText:{ color: '#00F5FF', fontWeight: '700', fontSize: 14 },
  list:         { paddingHorizontal: 16, paddingBottom: 32 },
  resultCard:   { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 10 },
  resultSource: { color: '#A855F7', fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  resultText:   { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
  resultTags:   { color: '#475569', fontSize: 12, marginTop: 8 },
  prompt:       { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  promptIcon:   { fontSize: 40, marginBottom: 16 },
  promptText:   { color: '#64748B', fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
