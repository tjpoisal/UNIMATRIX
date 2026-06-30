/**
 * Settings Tab
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Switch, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState('https://deployunimatrix.com');
  const [mcpToken,  setMcpToken]  = useState('');
  const [bgSync,    setBgSync]    = useState(true);
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    (async () => {
      const url   = await AsyncStorage.getItem('unimatrix_server_url');
      const token = await AsyncStorage.getItem('unimatrix_mcp_token');
      const bg    = await AsyncStorage.getItem('unimatrix_bg_sync');
      if (url)   setServerUrl(url);
      if (token) setMcpToken(token);
      if (bg !== null) setBgSync(bg === 'true');
    })();
  }, []);

  const save = async () => {
    await AsyncStorage.setItem('unimatrix_server_url', serverUrl.trim());
    await AsyncStorage.setItem('unimatrix_mcp_token', mcpToken.trim());
    await AsyncStorage.setItem('unimatrix_bg_sync', String(bgSync));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearData = () => {
    Alert.alert('Clear all data?', 'This removes your local settings. Your memories on the server are not affected.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        await Promise.all([
          AsyncStorage.removeItem('unimatrix_server_url'),
          AsyncStorage.removeItem('unimatrix_mcp_token'),
          AsyncStorage.removeItem('unimatrix_bg_sync'),
        ]);
        setServerUrl('https://deployunimatrix.com');
        setMcpToken('');
        setBgSync(true);
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="https://deployunimatrix.com"
          placeholderTextColor="#475569"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          selectionColor="#00F5FF"
        />
        <Text style={styles.hint}>Use http://localhost:8765 for the desktop app&apos;s local proxy</Text>

        <Text style={styles.label}>MCP Token</Text>
        <TextInput
          style={styles.input}
          value={mcpToken}
          onChangeText={setMcpToken}
          placeholder="umx_xxxxxxxx_..."
          placeholderTextColor="#475569"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          selectionColor="#00F5FF"
        />
        <Text style={styles.hint}>Generate from the web dashboard → Settings → MCP Tokens</Text>

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Background Sync</Text>
            <Text style={styles.toggleSub}>Sync memories in background every 15 min</Text>
          </View>
          <Switch
            value={bgSync}
            onValueChange={setBgSync}
            trackColor={{ false: '#1E293B', true: '#00F5FF44' }}
            thumbColor={bgSync ? '#00F5FF' : '#475569'}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={save}
        >
          <Text style={styles.saveBtnText}>{saved ? '✓ Saved' : 'Save Settings'}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>About</Text>
        {[
          ['Version',     '1.0.0'],
          ['Encryption',  'AES-256-GCM (client-side)'],
          ['Embeddings',  'BGE-small (on-device)'],
          ['Protocol',    'MCP (Model Context Protocol)'],
        ].map(([k, v]) => (
          <View key={k} style={styles.infoRow}>
            <Text style={styles.infoKey}>{k}</Text>
            <Text style={styles.infoVal}>{v}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.dangerBtn} onPress={clearData}>
          <Text style={styles.dangerBtnText}>Clear Local Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0A0F1C' },
  scroll:      { padding: 20, paddingBottom: 60 },
  title:       { fontSize: 24, fontWeight: '700', color: '#F1F5F9', marginBottom: 24 },
  label:       { color: '#94A3B8', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 20 },
  input:       { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#F1F5F9', fontSize: 14, fontFamily: 'monospace' },
  hint:        { color: '#475569', fontSize: 12, marginTop: 6 },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111827', borderRadius: 12, padding: 16, marginTop: 20 },
  toggleLabel: { color: '#F1F5F9', fontSize: 15, fontWeight: '600' },
  toggleSub:   { color: '#64748B', fontSize: 12, marginTop: 2 },
  saveBtn:     { backgroundColor: '#00F5FF22', borderWidth: 1, borderColor: '#00F5FF55', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnDone: { backgroundColor: '#22C55E22', borderColor: '#22C55E55' },
  saveBtnText: { color: '#00F5FF', fontSize: 15, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: '#1E293B', marginVertical: 28 },
  sectionTitle:{ color: '#64748B', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  infoKey:     { color: '#94A3B8', fontSize: 14 },
  infoVal:     { color: '#F1F5F9', fontSize: 14 },
  dangerBtn:   { backgroundColor: '#EF444418', borderWidth: 1, borderColor: '#EF444433', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 28 },
  dangerBtnText:{ color: '#EF4444', fontSize: 14, fontWeight: '600' },
});
