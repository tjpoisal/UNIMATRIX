/**
 * Local deduplication using IndexedDB.
 * Prevents the same conversation turn from being sent twice
 * (e.g. on page reload or re-navigation in a SPA).
 */

const DB_NAME    = 'unimatrix-ext';
const STORE_NAME = 'seen-keys';
const TTL_MS     = 7 * 24 * 60 * 60 * 1000; // 7 days

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function isDuplicate(key: string): Promise<boolean> {
  try {
    const db    = await openDB();
    const tx    = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const record: any = await new Promise((res, rej) => {
      const req = store.get(key);
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });
    if (!record) return false;
    return Date.now() - record.ts < TTL_MS;
  } catch {
    return false;
  }
}

export async function markSeen(key: string): Promise<void> {
  try {
    const db    = await openDB();
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, ts: Date.now() });
  } catch { /* non-fatal */ }
}
