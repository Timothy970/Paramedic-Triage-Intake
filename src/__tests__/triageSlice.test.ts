import triageReducer, { refresh, submitTriage, setIsManualMode, setManualOnline } from '../store/triageSlice';
import { triageRepository } from '../data/triageRepository';
import { configureStore } from '@reduxjs/toolkit';
import { TriageRecord } from '../domain/types';

jest.mock('../data/triageRepository', () => {
  let db: TriageRecord[] = [];
  return {
    triageRepository: {
      getAll: jest.fn().mockImplementation(() => db),
      pending: jest.fn().mockImplementation(() => db.filter((r: TriageRecord) => !r.synced)),
      add: jest.fn().mockImplementation((r: TriageRecord) => {
        db.push(r);
      }),
      saveAll: jest.fn().mockImplementation((records: TriageRecord[]) => {
        db = records;
      }),
      clearAll: jest.fn().mockImplementation(() => {
        db = [];
      }),
    },
  };
});

describe('triageSlice Redux reducer', () => {
  beforeEach(() => {
    triageRepository.clearAll();
  });

  test('should return the initial state', () => {
    const state = triageReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      queue: [],
      allRecords: [],
      isOnline: true,
      isManualMode: false,
      manualOnline: true,
      simulatedFailure: false,
    });
  });

  test('should handle setIsManualMode and setManualOnline actions', () => {
    let state = triageReducer(undefined, { type: 'unknown' });
    
    state = triageReducer(state, setIsManualMode(true));
    expect(state.isManualMode).toBe(true);
    expect(state.simulatedFailure).toBe(false);
    
    state = triageReducer(state, setManualOnline(false));
    expect(state.manualOnline).toBe(false);
    expect(state.simulatedFailure).toBe(true);
  });


  test('should refresh the state from the repository', () => {
    const record: TriageRecord = {
      id: '1',
      patientName: 'Bob',
      condition: 'Burn',
      priority: 3,
      status: 'Pending',
      createdAt: Date.now(),
      synced: false,
    };
    triageRepository.add(record);

    const state = triageReducer(undefined, refresh());
    expect(state.queue).toHaveLength(1);
    expect(state.allRecords).toHaveLength(1);
    expect(state.queue[0].patientName).toBe('Bob');
  });

  test('should handle submitTriage action', async () => {
    const store = configureStore({
      reducer: { triage: triageReducer },
    });

    await store.dispatch(
      submitTriage({
        patientName: 'Alice',
        condition: 'Severe asthma',
        priority: 2,
        status: 'In-Transit',
      })
    );

    const state = store.getState().triage;
    expect(state.queue).toHaveLength(1);
    expect(state.allRecords).toHaveLength(1);
    expect(state.queue[0].patientName).toBe('Alice');
    expect(state.queue[0].priority).toBe(2);
    expect(state.queue[0].synced).toBe(false);
  });
});
