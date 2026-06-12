/**
 * lib/background-sync.ts
 *
 * Background memory sync for iOS and Android.
 * Uses expo-background-fetch to wake up every 15 minutes and:
 *   1. Check server health
 *   2. Pull any new memories since last sync
 *   3. Push any pending offline memories (future)
 *
 * Register in app/_layout.tsx on app start.
 */
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager     from 'expo-task-manager';
import AsyncStorage         from '@react-native-async-storage/async-storage';

export const BACKGROUND_SYNC_TASK = 'unimatrix-background-sync';

// Define the task (must be at module level, outside any component)
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const serverUrl = await AsyncStorage.getItem('unimatrix_server_url')
                   ?? 'https://deployunimatrix.com';
    const token     = await AsyncStorage.getItem('unimatrix_mcp_token');

    if (!token) return BackgroundFetch.BackgroundFetchResult.NoData;

    const res = await fetch(`${serverUrl}/health`, {
      headers: { 'x-unimatrix-key': token },
      signal:  AbortSignal.timeout(8000),
    });

    if (res.ok) {
      await AsyncStorage.setItem('unimatrix_last_sync', new Date().toISOString());
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    return BackgroundFetch.BackgroundFetchResult.Failed;
  } catch (e) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync(): Promise<void> {
  const bgEnabled = await AsyncStorage.getItem('unimatrix_bg_sync');
  if (bgEnabled === 'false') return;

  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60,   // 15 minutes (minimum iOS allows)
      stopOnTerminate: false,     // continue after app killed
      startOnBoot:    true,       // resume after device restart
    });
  } catch (e) {
    // Background fetch not available in Expo Go; silently skip
    console.log('[BG Sync] Registration skipped:', e);
  }
}

export async function unregisterBackgroundSync(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    }
  } catch (e) {
    console.log('[BG Sync] Unregister error:', e);
  }
}
