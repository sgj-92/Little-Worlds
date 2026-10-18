/** Minimal observable store compatible with React's useSyncExternalStore. */
export interface Store<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(listener: () => void): () => void;
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function memoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

/** localStorage when available (private browsing can throw), otherwise in-memory. */
export function browserStorage(): KeyValueStorage {
  try {
    const probe = '__lw_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage();
  }
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function createPersistentStore<T>(
  storage: KeyValueStorage,
  key: string,
  fallback: () => T,
  revive: (raw: unknown) => T = (raw) => raw as T,
): Store<T> {
  let initial: T;
  try {
    const raw = storage.getItem(key);
    initial = raw ? revive(JSON.parse(raw)) : fallback();
  } catch {
    initial = fallback();
  }
  const store = createStore(initial);
  store.subscribe(() => {
    try {
      storage.setItem(key, JSON.stringify(store.get()));
    } catch {
      // Storage full or unavailable: keep working in memory.
    }
  });
  return store;
}

export function createId(prefix: string): string {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}_${rand}`;
}
