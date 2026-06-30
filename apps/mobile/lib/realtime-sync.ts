/**
 * Real-time sync for React Native using Ably
 * 
 * This module provides functions to connect to Ably and subscribe to
 * memory and palace updates for the current user.
 * 
 * Channel pattern:
 * - user:{userId}:memories - memory updates
 * - user:{userId}:palaces - palace/workspace updates
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface MemoryUpdate {
  memoryId: string;
  content?: string;
  hint?: string;
  summary?: string;
  source?: string;
  tags?: string[];
  spaceId?: string;
  timestamp: string;
}

interface PalaceUpdate {
  palaceId: string;
  name: string;
  description?: string;
  timestamp: string;
}

type UpdateCallback = (update: MemoryUpdate | PalaceUpdate, event: string) => void;

let ablyClient: any = null;
let memoryChannel: any = null;
let palaceChannel: any = null;
let memoryCallbacks: Set<UpdateCallback> = new Set();
let palaceCallbacks: Set<UpdateCallback> = new Set();

/**
 * Initialize Ably connection
 */
export async function initRealtimeSync(userId: string): Promise<boolean> {
  try {
    const ablyKey = await AsyncStorage.getItem('unimatrix_ably_key');
    if (!ablyKey) {
      console.warn('[realtime] ABLY_API_KEY not configured');
      return false;
    }

    // Dynamically import Ably Realtime for React Native
    const Ably = (await import('ably/dist/esm/ably-reactnative.min.js')).default;
    
    if (!ablyClient) {
      ablyClient = new Ably.Realtime({
        key: ablyKey,
        clientId: `mobile-${userId}-${Date.now()}`,
        echoMessages: false,
      });

      ablyClient.connection.on('connected', () => {
        console.log('[realtime] Connected to Ably');
      });

      ablyClient.connection.on('disconnected', () => {
        console.log('[realtime] Disconnected from Ably');
      });

      ablyClient.connection.on('failed', (err: Error) => {
        console.error('[realtime] Connection failed:', err);
      });

      // Subscribe to memory updates
      memoryChannel = ablyClient.channels.get(`user:${userId}:memories`);
      memoryChannel.subscribe('memory.created', (message: any) => {
        console.log('[realtime] Memory created:', message.data);
        memoryCallbacks.forEach(cb => cb(message.data, 'memory.created'));
      });

      memoryChannel.subscribe('memory.updated', (message: any) => {
        console.log('[realtime] Memory updated:', message.data);
        memoryCallbacks.forEach(cb => cb(message.data, 'memory.updated'));
      });

      memoryChannel.subscribe('memory.deleted', (message: any) => {
        console.log('[realtime] Memory deleted:', message.data);
        memoryCallbacks.forEach(cb => cb(message.data, 'memory.deleted'));
      });

      // Subscribe to palace updates
      palaceChannel = ablyClient.channels.get(`user:${userId}:palaces`);
      palaceChannel.subscribe('palace.created', (message: any) => {
        console.log('[realtime] Palace created:', message.data);
        palaceCallbacks.forEach(cb => cb(message.data, 'palace.created'));
      });

      palaceChannel.subscribe('palace.updated', (message: any) => {
        console.log('[realtime] Palace updated:', message.data);
        palaceCallbacks.forEach(cb => cb(message.data, 'palace.updated'));
      });

      palaceChannel.subscribe('palace.deleted', (message: any) => {
        console.log('[realtime] Palace deleted:', message.data);
        palaceCallbacks.forEach(cb => cb(message.data, 'palace.deleted'));
      });

      // Activate the connection
      await ablyClient.connection.connect();
    }

    return true;
  } catch (err) {
    console.error('[realtime] Init error:', err);
    return false;
  }
}

/**
 * Disconnect from Ably
 */
export async function disconnectRealtimeSync(): Promise<void> {
  if (memoryChannel) {
    memoryChannel.unsubscribe();
    memoryChannel = null;
  }
  if (palaceChannel) {
    palaceChannel.unsubscribe();
    palaceChannel = null;
  }
  if (ablyClient) {
    ablyClient.connection.close();
    ablyClient = null;
  }
  memoryCallbacks.clear();
  palaceCallbacks.clear();
}

/**
 * Register a callback for memory updates
 */
export function onMemoryUpdate(callback: UpdateCallback): () => void {
  memoryCallbacks.add(callback);
  return () => memoryCallbacks.delete(callback);
}

/**
 * Register a callback for palace updates
 */
export function onPalaceUpdate(callback: UpdateCallback): () => void {
  palaceCallbacks.add(callback);
  return () => palaceCallbacks.delete(callback);
}

/**
 * Check if connected
 */
export function isRealtimeConnected(): boolean {
  return ablyClient?.connection.state === 'connected';
}
