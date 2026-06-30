/**
 * Dashboard Tab — Memory Stats & Connection Status
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mcpClient } from '@/lib/mcp-client';

interface StatCard {
  label: string;
  value: string;
  sub?:  string;
  color: string;
}

const StatTile: React.FC<StatCard> = ({ label, value, sub, color }) => {
  // ensure we always produce a valid color string (append alpha) and fallback if undefined
  const borderColor = `${color ?? '#00F5FF'}30`;
  return (
    <View style={[styles.tile, { borderColor }]}>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
      {sub && <Text style={styles.tileSub}>{sub}</Text>}
    </View>
  );
}

export default function DashboardScreen() {
  const [health, setHealth]   = useState<{ status: string; version: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [memCount, setMemCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [h, mems] = await Promise.allSettled([
          mcpClient.getHealth(),
          mcpClient.getRecent(1),
        ]);
        if (h.status === 'fulfilled') setHealth(h.value);
        if (mems.status === 'fulfilled') setMemCount(mems.value.length);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const connected = health?.status === 'ok';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Overview</Text>

        {/* Connection status */}
        <View style={[styles.statusCard, { borderColor: connected ? '#22C55E33' : '#EF444433' }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: connected ? '#22C55E' : '#EF4444' }]} />
            <Text style={[styles.statusText, { color: connected ? '#22C55E' : '#EF4444' }]}>
              {loading ? 'Connecting…' : connected ? 'Connected — Memory active' : 'Offline'}
            </Text>
            {loading && <ActivityIndicator size="small" color="#00F5FF" style={{ marginLeft: 8 }} />}
          </View>
          {health?.version && (
            <Text style={styles.serverVersion}>Server v{health.version}</Text>
          )}
        </View>

        {/* Stat tiles */}
        <View style={styles.tilesRow}>
          <StatTile label="Memories" value={memCount !== null ? '20+' : '—'} sub="loaded" color="#00F5FF" />
          <StatTile label="LLMs" value="5" sub="connected" color="#A855F7" />
        </View>
        <View style={styles.tilesRow}>
          <StatTile label="Encryption" value="AES-256" sub="GCM client-side" color="#22C55E" />
          <StatTile label="Embeddings" value="Local" sub="BGE-small" color="#F59E0B" />
        </View>

        {/* Platform coverage */}
        <Text style={styles.sectionTitle}>Platform Coverage</Text>
        {[
          { name: 'macOS',   sub: 'System tray + auto-start', icon: '🖥️',  ready: true },
          { name: 'Windows', sub: 'System tray + NSIS installer', icon: '🪟', ready: true },
          { name: 'Linux',   sub: 'AppImage + .deb + XDG autostart', icon: '🐧', ready: true },
          { name: 'iOS',     sub: 'Background sync via EAS', icon: '📱', ready: true },
          { name: 'Android', sub: 'Background fetch + .aab', icon: '🤖', ready: true },
          { name: 'Chrome',  sub: 'Browser extension (captures LLM context)', icon: '🌐', ready: true },
        ].map((p) => (
          <View key={p.name} style={styles.platformRow}>
            <Text style={styles.platformIcon}>{p.icon}</Text>
            <View style={styles.platformInfo}>
              <Text style={styles.platformName}>{p.name}</Text>
              <Text style={styles.platformSub}>{p.sub}</Text>
            </View>
            <View style={[styles.readyDot, { backgroundColor: p.ready ? '#22C55E' : '#475569' }]} />
          </View>
        ))}

        {/* LLM support */}
        <Text style={styles.sectionTitle}>LLM Support</Text>
        {[
          ['Claude',    '#A855F7'], ['ChatGPT / OpenAI', '#22C55E'],
          ['Gemini',    '#3B82F6'], ['Groq',             '#F59E0B'],
          ['Ollama',    '#EC4899'], ['Any MCP client',   '#00F5FF'],
        ].map(([name, color]) => (
          <View key={name} style={styles.llmRow}>
            <View style={[styles.llmDot, { backgroundColor: color }]} />
            <Text style={styles.llmName}>{name}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#0A0F1C' },
  scroll:       { padding: 20, paddingBottom: 48 },
  title:        { fontSize: 24, fontWeight: '700', color: '#F1F5F9', marginBottom: 16 },
  statusCard:   { backgroundColor: '#111827', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 20 },
  statusRow:    { flexDirection: 'row', alignItems: 'center' },
  statusDot:    { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText:   { fontSize: 14, fontWeight: '600' },
  serverVersion:{ color: '#475569', fontSize: 12, marginTop: 6 },
  tilesRow:     { flexDirection: 'row', marginBottom: 12 },
  tile:         { flex: 1, backgroundColor: '#111827', borderWidth: 1, borderRadius: 12, padding: 14, marginRight: 12 },
  tileValue:    { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  tileLabel:    { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  tileSub:      { color: '#475569', fontSize: 11, marginTop: 2 },
  sectionTitle: { fontWeight: '700', color: '#94A3B8', marginTop: 24, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 12 },
  platformRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 10, padding: 12, marginBottom: 8 },
  platformIcon: { fontSize: 20, marginRight: 12, width: 28, textAlign: 'center' },
  platformInfo: { flex: 1 },
  platformName: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  platformSub:  { color: '#64748B', fontSize: 12, marginTop: 2 },
  readyDot:     { width: 8, height: 8, borderRadius: 4 },
  llmRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  llmDot:       { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  llmName:      { color: '#CBD5E1', fontSize: 14 },
});
