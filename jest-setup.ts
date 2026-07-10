import { Priority, Status, TriageRecord } from './src/domain/types';

// Mock react-native-mmkv
const mockStorage = new Map<string, string>();
jest.mock('react-native-mmkv', () => {
  const createMockMMKV = () => ({
    set: jest.fn((key: string, value: string) => {
      mockStorage.set(key, value);
    }),
    getString: jest.fn((key: string) => {
      return mockStorage.get(key) || null;
    }),
    remove: jest.fn((key: string) => {
      return mockStorage.delete(key);
    }),
    clearAll: jest.fn(() => {
      mockStorage.clear();
    }),
  });

  return {
    createMMKV: jest.fn().mockImplementation(createMockMMKV),
  };
});

// Mock @react-native-community/netinfo
let mockIsConnected = true;
const mockListeners = new Set<(state: any) => void>();

jest.mock('@react-native-community/netinfo', () => {
  return {
    fetch: jest.fn().mockImplementation(() =>
      Promise.resolve({
        isConnected: mockIsConnected,
        isInternetReachable: mockIsConnected,
      })
    ),
    addEventListener: jest.fn().mockImplementation((listener) => {
      mockListeners.add(listener);
      listener({ isConnected: mockIsConnected, isInternetReachable: mockIsConnected });
      return () => mockListeners.delete(listener);
    }),
    // Helper to toggle connection status in tests
    __setConnected: (status: boolean) => {
      mockIsConnected = status;
      mockListeners.forEach((listener) =>
        listener({ isConnected: status, isInternetReachable: status })
      );
    },
  };
});

// Clean up MMKV storage mock between runs
beforeEach(() => {
  mockStorage.clear();
  mockIsConnected = true;
  mockListeners.clear();
});
