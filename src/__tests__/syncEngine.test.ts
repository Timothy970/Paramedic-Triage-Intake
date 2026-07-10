import { triageRepository } from '../data/triageRepository';
import * as api from '../data/mockApi';
import { flushQueue } from '../sync/syncEngine';
import NetInfo from '@react-native-community/netinfo';

describe('syncEngine', () => {
  beforeEach(() => {
    triageRepository.clearAll();
    jest.restoreAllMocks();
    api.mockApiConfig.setIsManualMode(false);
    api.mockApiConfig.setManualOnline(true);
  });

  test('successful upload marks record as synced', async () => {
    const postSpy = jest.spyOn(api, 'postTriage').mockResolvedValue();
    
    triageRepository.saveAll([
      {
        id: '1',
        patientName: 'John',
        condition: 'Critical',
        priority: 1,
        status: 'Pending',
        createdAt: Date.now(),
        synced: false,
      },
    ]);

    // Force NetInfo mock to online
    (NetInfo as any).__setConnected(true);

    await flushQueue();

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(triageRepository.pending()).toHaveLength(0);
    expect(triageRepository.getAll()[0].synced).toBe(true);
  });

  test('failed upload keeps record in pending state for retry', async () => {
    const postSpy = jest
      .spyOn(api, 'postTriage')
      .mockRejectedValue(new Error('Network error'));

    triageRepository.saveAll([
      {
        id: '2',
        patientName: 'Jane',
        condition: 'Routine',
        priority: 5,
        status: 'In-Transit',
        createdAt: Date.now(),
        synced: false,
      },
    ]);

    // Force NetInfo mock to online
    (NetInfo as any).__setConnected(true);

    await flushQueue();

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(triageRepository.pending()).toHaveLength(1);
    expect(triageRepository.getAll()[0].synced).toBe(false);
  });

  test('does not sync if offline', async () => {
    const postSpy = jest.spyOn(api, 'postTriage');
    
    triageRepository.saveAll([
      {
        id: '3',
        patientName: 'Offline Test',
        condition: 'Bleeding',
        priority: 2,
        status: 'Pending',
        createdAt: Date.now(),
        synced: false,
      },
    ]);

    // Force NetInfo mock to offline
    (NetInfo as any).__setConnected(false);

    await flushQueue();

    expect(postSpy).not.toHaveBeenCalled();
    expect(triageRepository.pending()).toHaveLength(1);
  });

  test('syncs or blocks based on manual override status regardless of real network state', async () => {
    const postSpy = jest.spyOn(api, 'postTriage').mockResolvedValue();
    
    triageRepository.saveAll([
      {
        id: '4',
        patientName: 'Manual Mode Test',
        condition: 'Fracture',
        priority: 4,
        status: 'Pending',
        createdAt: Date.now(),
        synced: false,
      },
    ]);

    // Case 1: Real network is connected, but manual mode is enabled and simulated online is false (offline)
    (NetInfo as any).__setConnected(true);
    api.mockApiConfig.setIsManualMode(true);
    api.mockApiConfig.setManualOnline(false);

    await flushQueue();
    expect(postSpy).not.toHaveBeenCalled();

    // Case 2: Real network is offline, but manual mode is enabled and simulated online is true
    (NetInfo as any).__setConnected(false);
    api.mockApiConfig.setManualOnline(true);

    await flushQueue();
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(triageRepository.pending()).toHaveLength(0);

    // Reset manual mode back to false for other tests
    api.mockApiConfig.setIsManualMode(false);
  });
});

