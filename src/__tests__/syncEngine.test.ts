import { triageRepository } from '../data/triageRepository';
import * as api from '../data/mockApi';
import { flushQueue } from '../sync/syncEngine';
import NetInfo from '@react-native-community/netinfo';

describe('syncEngine', () => {
  beforeEach(() => {
    triageRepository.clearAll();
    jest.restoreAllMocks();
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
});

