/**
 * Memory Detail Modal
 * Shows full memory details when tapped from the feed
 */
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Memory } from '@/lib/types';

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

interface MemoryDetailModalProps {
  visible: boolean;
  memory: Memory | null;
  onClose: () => void;
}

export default function MemoryDetailModal({ visible, memory, onClose }: MemoryDetailModalProps) {
  if (!memory) return null;

  const sourceColor = SOURCE_COLORS[memory.source?.toLowerCase()] ?? '#94A3B8';
  const sourceLabel = SOURCE_LABELS[memory.source?.toLowerCase()] ?? memory.source ?? 'MCP';
  const date = new Date(memory.createdAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.root} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Memory Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Source Badge */}
          <View style={[styles.sourceCard, { borderColor: sourceColor + '44', backgroundColor: sourceColor + '12' }]}>
            <View style={[styles.sourceDot, { backgroundColor: sourceColor }]} />
            <Text style={[styles.sourceLabel, { color: sourceColor }]}>{sourceLabel}</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>

          {/* Memory Content */}
          <View style={styles.contentCard}>
            <Text style={styles.contentLabel}>Content</Text>
            <Text style={styles.contentText}>
              {memory.hint || memory.summary || '(This memory is encrypted)'}
            </Text>
          </View>

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <View style={styles.tagsCard}>
              <Text style={styles.sectionLabel}>Tags</Text>
              <View style={styles.tagRow}>
                {memory.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.metaCard}>
            <Text style={styles.sectionLabel}>Metadata</Text>
            
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Status</Text>
              <Text style={[
                styles.metaValue,
                { color: memory.status === 'active' ? '#22C55E' : memory.status === 'superseded' ? '#F59E0B' : '#64748B' }
              ]}>
                {memory.status}
              </Text>
            </View>

            {memory.importance && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Importance</Text>
                <Text style={[
                  styles.metaValue,
                  { color: memory.importance === 'high' ? '#EF4444' : memory.importance === 'medium' ? '#F59E0B' : '#64748B' }
                ]}>
                  {memory.importance}
                </Text>
              </View>
            )}

            {memory.semanticCat && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={[styles.metaValue, { color: '#A855F7' }]}>{memory.semanticCat}</Text>
              </View>
            )}

            {memory.spaceId && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Space ID</Text>
                <Text style={[styles.metaValue, { color: '#64748B', fontFamily: 'monospace' }]}>{memory.spaceId.slice(0, 8)}...</Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Memory ID</Text>
              <Text style={[styles.metaValue, { color: '#64748B', fontFamily: 'monospace' }]}>{memory.id.slice(0, 8)}...</Text>
            </View>

            {memory.indexedAt && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Indexed</Text>
                <Text style={styles.metaValue}>{new Date(memory.indexedAt).toLocaleString()}</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Copy Content</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#94A3B8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sourceLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
  },
  contentCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  contentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#CBD5E1',
  },
  tagsCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  metaCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  metaLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 14,
    color: '#F1F5F9',
    fontWeight: '500',
  },
  actionsCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#00F5FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0F1C',
  },
  actionButtonTextSecondary: {
    color: '#F1F5F9',
  },
});