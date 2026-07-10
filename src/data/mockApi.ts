import NetInfo from '@react-native-community/netinfo';
import { TriageRecord } from '../domain/types';

let isManualMode = false;
let manualOnline = true;

export const mockApiConfig = {
  getIsManualMode(): boolean {
    return isManualMode;
  },
  setIsManualMode(val: boolean) {
    isManualMode = val;
  },
  getManualOnline(): boolean {
    return manualOnline;
  },
  setManualOnline(val: boolean) {
    manualOnline = val;
  },
  getSimulatedFailure(): boolean {
    return isManualMode && !manualOnline;
  },
  setSimulatedFailure(enabled: boolean) {
    isManualMode = true;
    manualOnline = !enabled;
  },
  async isOnline(): Promise<boolean> {
    if (isManualMode) {
      return manualOnline;
    }
    const state = await NetInfo.fetch();
    return !!(state.isConnected);
  }
};

export async function postTriage(record: TriageRecord): Promise<void> {
  const online = await mockApiConfig.isOnline();
  if (!online) {
    throw new Error('Network failure – offline mode active');
  }
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s artificial delay
}

