import { Platform } from 'react-native';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { TriageRecord } from '../domain/types';

const KEY = 'triage_queue';
// AES-128 encryption key (must be exactly 16 bytes/characters)
const ENCRYPTION_KEY = 'paramedicSecret1';

// MMKV does not run on web. We initialize it lazily only on native.
let mmkvStore: MMKV | null = null;
const getStore = () => {
  if (Platform.OS !== 'web' && !mmkvStore) {
    mmkvStore = createMMKV({
      id: 'triage-secure-storage',
      encryptionKey: ENCRYPTION_KEY,
    });
  }
  return mmkvStore;
};

// Simple base64 helper for web client data obfuscation/encryption
const webEncrypt = (text: string): string => {
  try {
    return typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(text))) : text;
  } catch (e) {
    return text;
  }
};

const webDecrypt = (obfuscated: string): string => {
  try {
    return typeof window !== 'undefined' ? decodeURIComponent(escape(window.atob(obfuscated))) : obfuscated;
  } catch (e) {
    return obfuscated;
  }
};

export const triageRepository = {
  getAll(): TriageRecord[] {
    if (Platform.OS === 'web') {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
        if (!raw) return [];
        const decrypted = webDecrypt(raw);
        return JSON.parse(decrypted);
      } catch (e) {
        return [];
      }
    } else {
      const store = getStore();
      const raw = store ? store.getString(KEY) : null;
      return raw ? JSON.parse(raw) : [];
    }
  },
  saveAll(records: TriageRecord[]) {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') {
          const serialized = JSON.stringify(records);
          const encrypted = webEncrypt(serialized);
          window.localStorage.setItem(KEY, encrypted);
        }
      } catch (e) {}
    } else {
      const store = getStore();
      if (store) {
        store.set(KEY, JSON.stringify(records));
      }
    }
  },
  add(record: TriageRecord) {
    const all = this.getAll();
    this.saveAll([...all, record]);
  },
  markSynced(id: string) {
    const all = this.getAll();
    const updated = all.map((r) =>
      r.id === id ? { ...r, synced: true } : r
    );
    this.saveAll(updated);
  },
  pending(): TriageRecord[] {
    return this.getAll().filter((r) => !r.synced);
  },
  clearAll() {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(KEY);
        }
      } catch (e) {}
    } else {
      const store = getStore();
      if (store) {
        store.remove(KEY);
      }
    }
  }
};
