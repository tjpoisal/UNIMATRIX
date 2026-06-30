/**
 * React hook for real-time memory sync using Ably
 * 
 * Usage:
 * const { isConnected, memories, palaces } = useRealtimeSync(userId);
 * 
 * This hook subscribes to the user's personal channels:
 * - user:{userId}:memories - memory updates
 * - user:{userId}:palaces - palace/workspace updates
 * 
 * It automatically handles connection, reconnection, and cleanup.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

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

interface UseRealtimeSyncResult {
  isConnected: boolean;
  lastUpdate: string | null;
  memoryUpdates: MemoryUpdate[];
  palaceUpdates: PalaceUpdate[];
  error: string | null;
}

export function useRealtimeSync(userId: string | null): UseRealtimeSyncResult {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [memoryUpdates, setMemoryUpdates] = useState<MemoryUpdate[]>([]);
  const [palaceUpdates, setPalaceUpdates] = useState<PalaceUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const ablyRef = useRef<any>(null);
  const memoryChannelRef = useRef<any>(null);
  const palaceChannelRef = useRef<any>(null);

  const connect = useCallback(async () => {
    if (!userId || !process.env.ABLY_API_KEY) {
      console.warn('[realtime] Cannot connect: missing userId or ABLY_API_KEY');
      return;
    }

    try {
      // Dynamically import Ably Realtime (only when needed)
      const Ably = (await import('ably')).default;
      
      if (!ablyRef.current) {
        ablyRef.current = new Ably.Realtime({
          key: process.env.ABLY_API_KEY,
          clientId: `web-${userId}-${Date.now()}`,
        });

        ablyRef.current.connection.on('connected', () => {
          console.log('[realtime] Connected to Ably');
          setIsConnected(true);
          setError(null);
        });

        ablyRef.current.connection.on('disconnected', () => {
          console.log('[realtime] Disconnected from Ably');
          setIsConnected(false);
        });

        ablyRef.current.connection.on('failed', (err: Error) => {
          console.error('[realtime] Connection failed:', err);
          setError(err.message);
          setIsConnected(false);
        });

        // Subscribe to memory updates
        memoryChannelRef.current = ablyRef.current.channels.get(`user:${userId}:memories`);
        memoryChannelRef.current.subscribe('memory.created', (message: any) => {
          console.log('[realtime] Memory created:', message.data);
          setMemoryUpdates(prev => [message.data, ...prev].slice(0, 50));
          setLastUpdate(new Date().toISOString());
          
          // Trigger a page refresh or event for the UI to update
          window.dispatchEvent(new CustomEvent('memory-updated', { detail: message.data }));
        });

        memoryChannelRef.current.subscribe('memory.updated', (message: any) => {
          console.log('[realtime] Memory updated:', message.data);
          setMemoryUpdates(prev => {
            const index = prev.findIndex(m => m.memoryId === message.data.memoryId);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = message.data;
              return updated;
            }
            return [message.data, ...prev].slice(0, 50);
          });
          setLastUpdate(new Date().toISOString());
          
          window.dispatchEvent(new CustomEvent('memory-updated', { detail: message.data }));
        });

        memoryChannelRef.current.subscribe('memory.deleted', (message: any) => {
          console.log('[realtime] Memory deleted:', message.data);
          setMemoryUpdates(prev => prev.filter(m => m.memoryId !== message.data.memoryId));
          setLastUpdate(new Date().toISOString());
          
          window.dispatchEvent(new CustomEvent('memory-deleted', { detail: message.data }));
        });

        // Subscribe to palace updates
        palaceChannelRef.current = ablyRef.current.channels.get(`user:${userId}:palaces`);
        palaceChannelRef.current.subscribe('palace.created', (message: any) => {
          console.log('[realtime] Palace created:', message.data);
          setPalaceUpdates(prev => [message.data, ...prev].slice(0, 50));
          setLastUpdate(new Date().toISOString());
          
          window.dispatchEvent(new CustomEvent('palace-updated', { detail: message.data }));
        });

        palaceChannelRef.current.subscribe('palace.updated', (message: any) => {
          console.log('[realtime] Palace updated:', message.data);
          setPalaceUpdates(prev => {
            const index = prev.findIndex(p => p.palaceId === message.data.palaceId);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = message.data;
              return updated;
            }
            return [message.data, ...prev].slice(0, 50);
          });
          setLastUpdate(new Date().toISOString());
          
          window.dispatchEvent(new CustomEvent('palace-updated', { detail: message.data }));
        });

        palaceChannelRef.current.subscribe('palace.deleted', (message: any) => {
          console.log('[realtime] Palace deleted:', message.data);
          setPalaceUpdates(prev => prev.filter(p => p.palaceId !== message.data.palaceId));
          setLastUpdate(new Date().toISOString());
          
          window.dispatchEvent(new CustomEvent('palace-deleted', { detail: message.data }));
        });

        // Activate the connection
        await ablyRef.current.connection.connect();
      }
    } catch (err) {
      console.error('[realtime] Connection error:', err);
      setError((err as Error).message);
      setIsConnected(false);
    }
  }, [userId]);

  const disconnect = useCallback(() => {
    if (ablyRef.current) {
      memoryChannelRef.current?.unsubscribe();
      palaceChannelRef.current?.unsubscribe();
      ablyRef.current.connection.close();
      ablyRef.current = null;
      memoryChannelRef.current = null;
      palaceChannelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    isConnected,
    lastUpdate,
    memoryUpdates,
    palaceUpdates,
    error,
  };
}
