// Tiny key-value wrapper over IndexedDB, with localStorage as a fallback
// for browsers that block IndexedDB (some private modes).

const DB_NAME = 'mira';
const STORE = 'kv';

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => { dbPromise = null; });
  }
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) => new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result as T);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    }),
  );
}

export async function dbGet<T>(key: string): Promise<T | undefined> {
  try {
    return await run<T | undefined>('readonly', (s) => s.get(key));
  } catch {
    try {
      const raw = localStorage.getItem(`mira:${key}`);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } catch {
      return undefined;
    }
  }
}

export async function dbSet<T>(key: string, value: T): Promise<void> {
  try {
    await run('readwrite', (s) => s.put(value, key));
  } catch {
    try {
      localStorage.setItem(`mira:${key}`, JSON.stringify(value));
    } catch {
      // Storage is blocked or full. The app keeps working in memory for this session.
    }
  }
}

/** Ask the browser not to evict our data under storage pressure. Safe to call repeatedly. */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
