import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { triageRepository } from '../data/triageRepository';
import { postTriage, mockApiConfig } from '../data/mockApi';

type Notify = () => void;
let syncing = false;

export function isCurrentlySyncing() {
  return syncing;
}

/**
 * Returns true only when both the real network is connected AND
 * the simulated-offline toggle is off.
 */
async function isEffectivelyOnline(): Promise<boolean> {
  return await mockApiConfig.isOnline();
}

/**
 * Flush the pending queue ONE record at a time.
 * Will bail out immediately if we are offline (real or simulated).
 */
export async function flushQueue(onChange?: Notify) {
  if (syncing) return;

  const online = await isEffectivelyOnline();
  if (!online) return; // ← truly wait until online

  syncing = true;
  try {
    const pending = triageRepository.pending();
    for (const record of pending) {
      // Re-check connectivity before each upload so we stop the moment
      // the user goes offline mid-sync.
      const stillOnline = await isEffectivelyOnline();
      if (!stillOnline) break;

      try {
        await postTriage(record); // upload one record
        triageRepository.markSynced(record.id);
        onChange?.();
      } catch (error) {
        // Stop on failure; retry on next connectivity/lifecycle event
        break;
      }
    }
  } finally {
    syncing = false;
  }
}

export function startSyncEngine(onChange?: Notify) {
  // 1. Auto-sync the moment real connectivity returns
  const netSub = NetInfo.addEventListener(async (s) => {
    const online = await mockApiConfig.isOnline();
    if (online) {
      flushQueue(onChange);
    }
  });


  // 2. Re-check when app returns to foreground (lifecycle safety)
  const appSub = AppState.addEventListener('change', (st) => {
    if (st === 'active') {
      flushQueue(onChange);
    }
  });

  flushQueue(onChange); // initial attempt on boot

  return () => {
    netSub();
    appSub.remove();
  };
}
