/**
 * Home Tab — Recent Memory Feed
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  StyleSheet, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mcpClient } from '@/lib/mcp-client';
import type { Memory } from '@/lib/types';

const SOURCE_COLORS: Record<string, string> = {
  claude: '#A855F7', openai: '#22C55E', chatgpt: '#22C55E',
  gemini: '#3B82F6', groq: '#F59E0B', ollama: '#EC4899',
  mobile: '#00F5FF', desktop: '#7C3AED', api: '#94A3B8', mcp: '#00F5FF',
};

function SourceChip({ source }: { source: string }) {
  const color = SOURCE_COLORS[source?.toLowerCase()] ?? '#94A3B8';
  return (
    <View style={[styles.chip, { borderColor: color + '55', backgroundColor: color + '18' }]}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={[styles.chipText, { color }]}>{source ?? 'mcp'}</Text>
    </View>
  );
}

function MemoryCard({ memory, onPress }: { memory: Memory; onPress: () => void }) {
  const preview = memory.hint || memory.summary || '(encrypted)';
  const date = new Date(memory.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <SourceChip source={memory.source ?? 'mcp'} />
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
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await mcpClient.getRecent(20);
      setMemories(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
        <Text style={styles.headerTitle}>Memory Feed</Text>
      </View>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={memories}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MemoryCard
            memory={item}
            onPress={() => Alert.alert('Memory', item.hint ?? item.summary ?? 'Encrypted')}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00F5FF" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧠</Text>
            <Text style={styles.emptyTitle}>No memories yet</Text>
            <Text style={styles.emptyBody}>
              Start a conversation with any LLM using Unimatrix. Memories will appear here automatically.
            </Text>
          </View>
        }
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
  list:           { paddingHorizontal: 16, paddingBottom: 32 },
  card:           { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardDate:       { color: '#64748B', fontSize: 12 },
  cardPreview:    { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
  cardFooter:     { flexDirection: 'row', marginTop: 10, gap: 12 },
  importanceBadge:{ color: '#94A3B8', fontSize: 12 },
  spaceBadge:     { color: '#A855F7', fontSize: 12 },
  tagRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag:            { backgroundColor: '#1F2937', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:        { color: '#64748B', fontSize: 11 },
  chip:           { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, gap: 5 },
  chipDot:        { width: 6, height: 6, borderRadius: 3 },
  chipText:       { fontSize: 11, fontWeight: '600' },
  errorBanner:    { backgroundColor: '#EF444418', borderLeftWidth: 3, borderLeftColor: '#EF4444', marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' },
  errorText:      { color: '#FCA5A5', fontSize: 13, flex: 1 },
  retryText:      { color: '#00F5FF', fontSize: 13, fontWeight: '600', marginLeft: 8 },
  empty:          { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon:      { fontSize: 48, marginBottom: 16 },
  emptyTitle:     { color: '#F1F5F9', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  emptyBody:      { color: '#64748B', fontSize: 14, lineHeight: 22, textAlign: 'center' },
});
