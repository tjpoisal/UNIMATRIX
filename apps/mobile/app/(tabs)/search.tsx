/**
 * Search Tab — Semantic Recall with Context/Device Filtering
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Keyboard, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mcpClient } from '@/lib/mcp-client';
import type { Memory } from '@/lib/types';
import MemoryDetailModal from '@/app/modal';

const SOURCE_COLORS: Record<string, string> = {
  claude: '#A855F7', openai: '#22C55E', chatgpt: '#22C55E',
  gemini: '#3B82F6', groq: '#F59E0B', ollama: '#EC4899',
  mobile: '#00F5FF', desktop: '#7C3AED', api: '#94A3B8', mcp: '#00F5FF',
};

const SOURCE_LABELS: Record<string, string> = {
  claude: 'Claude', openai: 'OpenAI', chatgpt: 'ChatGPT',
  gemini: 'Gemini', groq: 'Groq', ollama: 'Ollama',
  mobile: 'Mobile', desktop: 'Desktop', api: 'API', mcp: 'MCP',
};

function SourceChip({ source, onPress, isSelected }: { source: string; onPress: () => void; isSelected: boolean }) {
  const color = SOURCE_COLORS[source?.toLowerCase()] ?? '#94A3B8';
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.filterChip, 
        { 
          borderColor: isSelected ? color : color + '55', 
          backgroundColor: isSelected ? color + '33' : color + '12' 
        }
      ]}
    >
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={[styles.chipText, { color: isSelected ? color : '#64748B' }]}>
        {SOURCE_LABELS[source?.toLowerCase()] ?? source ?? 'All'}
      </Text>
    </TouchableOpacity>
  );
}

function ResultCard({ memory, onPress }: { memory: Memory; onPress: () => void }) {
  const sourceColor = SOURCE_COLORS[memory.source?.toLowerCase()] ?? '#94A3B8';
  const sourceLabel = SOURCE_LABELS[memory.source?.toLowerCase()] ?? memory.source ?? 'MCP';
  
  return (
    <TouchableOpacity style={styles.resultCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.resultHeader}>
        <View style={[styles.sourceBadge, { backgroundColor: sourceColor + '22', borderColor: sourceColor + '44' }]}>
          <Text style={[styles.sourceText, { color: sourceColor }]}>{sourceLabel}</Text>
        </View>
        {memory.semanticCat && (
          <Text style={[styles.categoryBadge, { color: '#A855F7' }]}>{memory.semanticCat}</Text>
        )}
      </View>
      <Text style={styles.resultText}>{memory.hint ?? memory.summary ?? 'Encrypted memory'}</Text>
      {memory.tags.length > 0 && (
        <View style={styles.tagRow}>
          {memory.tags.slice(0, 5).map(t => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function RecallScreen() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<Memory[]>([]);
  const [filteredResults, setFilteredResults] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [uniqueSources, setUniqueSources] = useState<string[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const recall = useCallback(async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    try {
      const r = await mcpClient.recall(query.trim());
      setResults(r.memories);
      
      // Extract unique sources
      const sources = Array.from(new Set(r.memories.map(m => m.source || 'mcp')));
      setUniqueSources(sources);
    } catch (e: any) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Filter results by source
  useEffect(() => {
    if (selectedSource) {
      setFilteredResults(results.filter(m => 
        (m.source || 'mcp').toLowerCase() === selectedSource.toLowerCase()
      ));
    } else {
      setFilteredResults(results);
    }
  }, [selectedSource, results]);

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

      {/* Source Filter Chips - show after search */}
      {searched && uniqueSources.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <SourceChip 
            source="All" 
            onPress={() => setSelectedSource(null)} 
            isSelected={selectedSource === null} 
          />
          {uniqueSources.map((source) => (
            <SourceChip
              key={source}
              source={source}
              onPress={() => setSelectedSource(source)}
              isSelected={selectedSource === source}
            />
          ))}
        </ScrollView>
      )}

      {!searched ? (
        <View style={styles.prompt}>
          <Text style={styles.promptIcon}>🔍</Text>
          <Text style={styles.promptText}>Type a topic, question, or keyword to search your memory</Text>
        </View>
      ) : filteredResults.length === 0 && !loading ? (
        <View style={styles.prompt}>
          <Text style={styles.promptIcon}>🤷</Text>
          <Text style={styles.promptText}>
            {selectedSource 
              ? `No ${SOURCE_LABELS[selectedSource.toLowerCase()] ?? selectedSource} memories found for "${query}"`
              : `No memories found for "${query}"`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ResultCard
              memory={item}
              onPress={() => {
                setSelectedMemory(item);
                setModalVisible(true);
              }}
            />
          )}
        />
      )}
      
      <MemoryDetailModal
        visible={modalVisible}
        memory={selectedMemory}
        onClose={() => setModalVisible(false)}
      />
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
  filterScroll: { flexGrow: 0, marginBottom: 8 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  chipDot:      { width: 6, height: 6, borderRadius: 3 },
  chipText:     { fontSize: 12, fontWeight: '600' },
  list:         { paddingHorizontal: 16, paddingBottom: 32 },
  resultCard:   { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 10 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sourceBadge:  { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  sourceText:   { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  categoryBadge:{ fontSize: 11, fontWeight: '600' },
  resultText:   { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
  tagRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag:          { backgroundColor: '#1F2937', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:      { color: '#64748B', fontSize: 11 },
  prompt:       { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  promptIcon:   { fontSize: 40, marginBottom: 16 },
  promptText:   { color: '#64748B', fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
