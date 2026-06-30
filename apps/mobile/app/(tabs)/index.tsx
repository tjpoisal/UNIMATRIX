/**
 * Home Tab — Recent Memory Feed with Context/Device Filtering and Real-time Sync
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  StyleSheet, StatusBar, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mcpClient } from '@/lib/mcp-client';
import type { Memory } from '@/lib/types';
import MemoryDetailModal from '@/app/modal';
import { initRealtimeSync, disconnectRealtimeSync, onMemoryUpdate, isRealtimeConnected } from '@/lib/realtime-sync';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

function MemoryCard({ memory, onPress }: { memory: Memory; onPress: () => void }) {
  const preview = memory.hint || memory.summary || '(encrypted)';
  const date = new Date(memory.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  const sourceColor = SOURCE_COLORS[memory.source?.toLowerCase()] ?? '#94A3B8';
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <View style={[styles.sourceBadge, { backgroundColor: sourceColor + '22', borderColor: sourceColor + '44' }]}>
          <Text style={[styles.sourceText, { color: sourceColor }]}>
            {SOURCE_LABELS[memory.source?.toLowerCase()] ?? memory.source ?? 'MCP'}
          </Text>
        </View>
        <Text style={styles.cardDate}>{date}</Text>
      </View>
      <Text style={styles.cardPreview} numberOfLines={3}>{preview}</Text>
      {memory.tags && memory.tags.length > 0 && (
        <View style={styles.tagRow}>
          {memory.tags.slice(0, 4).map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.importanceBadge}>
          {memory.importance === 'high' ? '🔥 High' : memory.importance === 'medium' ? '📌 Med' : '·'}
        </Text>
        {memory.semanticCat && (
          <Text style={styles.spaceBadge}>{memory.semanticCat}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function MemoryFeedScreen() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [uniqueSources, setUniqueSources] = useState<string[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await mcpClient.getRecent(50);
      setTimeout(() => {
        setMemories(data);
        setError(null);
        
        // Extract unique sources
        const sources = Array.from(new Set(data.map(m => m.source || 'mcp')));
        setUniqueSources(sources);
      }, 0);
    } catch (e: any) {
      setTimeout(() => {
        setError(e?.message ?? 'Failed to load');
      }, 0);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 0);
    }
  }, []);

  useEffect(() => { load(); }, []);

  // Initialize real-time sync when component mounts
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initSync = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const connected = await initRealtimeSync(userId);
        setRealtimeConnected(connected);
        
        if (connected) {
          // Subscribe to memory updates
          cleanup = onMemoryUpdate((update, event) => {
            if (event === 'memory.created') {
              // Add new memory to the list
              setMemories(prev => [{
                id: update.memoryId,
                hint: update.hint,
                summary: update.summary,
                source: update.source || 'mcp',
                status: 'active',
                importance: null,
                semanticCat: null,
                spaceId: update.spaceId,
                tags: update.tags || [],
                createdAt: update.timestamp,
                indexedAt: null,
              }, ...prev]);
            } else if (event === 'memory.updated') {
              // Update existing memory
              setMemories(prev => prev.map(m => 
                m.id === update.memoryId ? { ...m, ...update } : m
              ));
            } else if (event === 'memory.deleted') {
              // Remove deleted memory
              setMemories(prev => prev.filter(m => m.id !== update.memoryId));
            }
          });
        }
      }
    };

    initSync();

    return () => {
      disconnectRealtimeSync();
      if (cleanup) cleanup();
    };
  }, []);

  // Filter memories by source
  useEffect(() => {
    if (selectedSource) {
      setFilteredMemories(memories.filter(m => 
        (m.source || 'mcp').toLowerCase() === selectedSource.toLowerCase()
      ));
    } else {
      setFilteredMemories(memories);
    }
  }, [selectedSource, memories]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00F5FF" />
        <Text style={styles.loadingText}>Loading memories…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Memory Feed</Text>
          <Text style={styles.headerSubtitle}>
            {filteredMemories.length} {selectedSource ? SOURCE_LABELS[selectedSource.toLowerCase()] ?? selectedSource : 'total'} memories
            {realtimeConnected && ' · Live'}
          </Text>
        </View>
        <View style={[styles.statusDot, realtimeConnected ? styles.statusDotConnected : styles.statusDotDisconnected]} />
      </View>

      {/* Source Filter Chips */}
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

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={filteredMemories}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MemoryCard
            memory={item}
            onPress={() => {
              setSelectedMemory(item);
              setModalVisible(true);
            }}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00F5FF" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧠</Text>
            <Text style={styles.emptyTitle}>
              {selectedSource ? `No ${SOURCE_LABELS[selectedSource.toLowerCase()] ?? selectedSource} memories` : 'No memories yet'}
            </Text>
            <Text style={styles.emptyBody}>
              {selectedSource 
                ? `Try a different filter or start a conversation with ${SOURCE_LABELS[selectedSource.toLowerCase()] ?? selectedSource}.`
                : 'Start a conversation with any LLM using Unimatrix. Memories will appear here automatically.'
              }
            </Text>
          </View>
        }
      />
      
      <MemoryDetailModal
        visible={modalVisible}
        memory={selectedMemory}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#0A0F1C' },
  center:         { flex: 1, backgroundColor: '#0A0F1C', alignItems: 'center', justifyContent: 'center' },
  loadingText:    { color: '#94A3B8', marginTop: 12, fontSize: 14 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle:    { fontSize: 24, fontWeight: '700', color: '#F1F5F9', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusDot:      { width: 8, height: 8, borderRadius: 4 },
  statusDotConnected: { backgroundColor: '#22C55E' },
  statusDotDisconnected: { backgroundColor: '#64748B' },
  filterScroll:   { flexGrow: 0, marginBottom: 8 },
  filterContent:  { paddingHorizontal: 16, gap: 8 },
  filterChip:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  chipDot:        { width: 6, height: 6, borderRadius: 3 },
  chipText:       { fontSize: 12, fontWeight: '600' },
  list:           { paddingHorizontal: 16, paddingBottom: 32 },
  card:           { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sourceBadge:    { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  sourceText:     { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardDate:       { color: '#64748B', fontSize: 12 },
  cardPreview:    { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
  cardFooter:     { flexDirection: 'row', marginTop: 10, gap: 12 },
  importanceBadge:{ color: '#94A3B8', fontSize: 12 },
  spaceBadge:     { color: '#A855F7', fontSize: 12 },
  tagRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag:            { backgroundColor: '#1F2937', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:        { color: '#64748B', fontSize: 11 },
  errorBanner:    { backgroundColor: '#EF444418', borderLeftWidth: 3, borderLeftColor: '#EF4444', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' },
  errorText:      { color: '#FCA5A5', fontSize: 13, flex: 1 },
  retryText:      { color: '#00F5FF', fontSize: 13, fontWeight: '600', marginLeft: 8 },
  empty:          { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon:      { fontSize: 48, marginBottom: 16 },
  emptyTitle:     { color: '#F1F5F9', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  emptyBody:      { color: '#64748B', fontSize: 14, lineHeight: 22, textAlign: 'center' },
});
