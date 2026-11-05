import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { dbGet, dbSet, requestPersistence } from './db';
import type { CollectionName, Collections, State } from './types';
import { sampleState } from './sample';

const STATE_KEY = 'state';
const LEGACY_LOCALSTORAGE_KEY = 'mira:v1';

export const emptyState = (): State => ({
  version: 1,
  activeChildId: null,
  briefExcluded: {},
  lastBackupAt: null,
  children: [],
  entries: [],
  appointments: [],
  allergies: [],
  medications: [],
  conditions: [],
  vaccines: [],
  questions: [],
});

/** Fill in fields added in later builds so older saved data and backups keep working. */
export function normalize(raw: unknown): State | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<State>;
  if (s.version !== 1 || !Array.isArray(s.children)) return null;
  return { ...emptyState(), ...s } as State;
}

async function load(): Promise<State> {
  const saved = normalize(await dbGet<State>(STATE_KEY));
  if (saved) return saved;
  // One-time move from the first build, which kept everything in localStorage.
  try {
    const legacy = normalize(JSON.parse(localStorage.getItem(LEGACY_LOCALSTORAGE_KEY) ?? 'null'));
    if (legacy) {
      await dbSet(STATE_KEY, legacy);
      localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
      return legacy;
    }
  } catch {
    // Ignore unreadable legacy data.
  }
  // First visit: show a filled-in example family so parents see what Mira looks like over time.
  return sampleState();
}

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

interface Store {
  state: State;
  add: <K extends CollectionName>(name: K, item: Omit<Collections[K], 'id'> & { id?: string }) => string;
  update: <K extends CollectionName>(name: K, id: string, patch: Partial<Collections[K]>) => void;
  remove: (name: CollectionName, id: string) => void;
  setActiveChild: (id: string) => void;
  toggleBriefEntry: (appointmentId: string, entryId: string) => void;
  markBackedUp: () => void;
  replaceAll: (next: State) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State | null>(null);
  // True when the current state came from another tab, so we don't echo it back.
  const fromRemote = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let alive = true;
    load().then((s) => alive && setState(s));
    if (typeof BroadcastChannel !== 'undefined') {
      channel.current = new BroadcastChannel('mira');
      channel.current.onmessage = () => {
        load().then((s) => {
          if (!alive) return;
          fromRemote.current = true;
          setState(s);
        });
      };
    }
    return () => {
      alive = false;
      channel.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    if (fromRemote.current) {
      fromRemote.current = false;
      return;
    }
    dbSet(STATE_KEY, state).then(() => channel.current?.postMessage('changed'));
    if (state.children.length && !state.example) requestPersistence();
  }, [state]);

  const mutate = useCallback((fn: (s: State) => State) => setState((s) => (s ? fn(s) : s)), []);

  const add = useCallback<Store['add']>((name, item) => {
    const id = item.id ?? newId();
    mutate((cur) => {
      // Adding a real child replaces the example family, so example data never mixes with real records.
      const s = cur.example && name === 'children' ? emptyState() : cur;
      const next = { ...s, [name]: [...s[name], { ...item, id }] } as State;
      if (name === 'children' && !s.activeChildId) next.activeChildId = id;
      return next;
    });
    return id;
  }, [mutate]);

  const update = useCallback<Store['update']>((name, id, patch) => {
    mutate((s) => ({ ...s, [name]: (s[name] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, [mutate]);

  const remove = useCallback<Store['remove']>((name, id) => {
    mutate((s) => {
      const next = { ...s, [name]: (s[name] as { id: string }[]).filter((x) => x.id !== id) } as State;
      if (name === 'children') {
        // Drop everything that belonged to the child.
        const owned = ['entries', 'appointments', 'allergies', 'medications', 'conditions', 'vaccines'] as const;
        for (const c of owned) next[c] = (next[c] as { childId: string }[]).filter((x) => x.childId !== id) as never;
        const appts = new Set(next.appointments.map((a) => a.id));
        next.questions = next.questions.filter((q) => appts.has(q.appointmentId));
        if (s.activeChildId === id) next.activeChildId = next.children[0]?.id ?? null;
      }
      if (name === 'appointments') next.questions = next.questions.filter((q) => q.appointmentId !== id);
      return next;
    });
  }, [mutate]);

  const setActiveChild = useCallback((id: string) => mutate((s) => ({ ...s, activeChildId: id })), [mutate]);

  const toggleBriefEntry = useCallback((appointmentId: string, entryId: string) => {
    mutate((s) => {
      const cur = new Set(s.briefExcluded[appointmentId] ?? []);
      if (cur.has(entryId)) cur.delete(entryId);
      else cur.add(entryId);
      return { ...s, briefExcluded: { ...s.briefExcluded, [appointmentId]: [...cur] } };
    });
  }, [mutate]);

  const markBackedUp = useCallback(() => mutate((s) => ({ ...s, lastBackupAt: new Date().toISOString() })), [mutate]);

  const replaceAll = useCallback((next: State) => setState(next), []);

  const value = useMemo(
    () => (state ? { state, add, update, remove, setActiveChild, toggleBriefEntry, markBackedUp, replaceAll } : null),
    [state, add, update, remove, setActiveChild, toggleBriefEntry, markBackedUp, replaceAll],
  );

  // IndexedDB loads in a few milliseconds; render nothing until it does.
  if (!value) return null;
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
