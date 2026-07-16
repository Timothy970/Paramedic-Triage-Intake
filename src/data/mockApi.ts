import NetInfo from '@react-native-community/netinfo';
import { TriageRecord } from '../domain/types';

export const mockApiConfig = {
  async isOnline(): Promise<boolean> {
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

