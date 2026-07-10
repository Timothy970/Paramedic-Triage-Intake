import { triageRepository } from '../data/triageRepository';
import { TriageRecord } from '../domain/types';

describe('triageRepository', () => {
  beforeEach(() => {
    triageRepository.clearAll();
  });

  test('should add and retrieve triage records', () => {
    const record: TriageRecord = {
      id: '1',
      patientName: 'John Doe',
      condition: 'Cardiac arrest',
      priority: 1,
      status: 'Pending',
      createdAt: Date.now(),
      synced: false,
    };

    triageRepository.add(record);

    const all = triageRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(record);
  });

  test('should filter pending records correctly', () => {
    const record1: TriageRecord = {
      id: '1',
      patientName: 'John Doe',
      condition: 'Cardiac arrest',
      priority: 1,
      status: 'Pending',
      createdAt: Date.now(),
      synced: false,
    };

    const record2: TriageRecord = {
      id: '2',
      patientName: 'Jane Smith',
      condition: 'Minor fracture',
      priority: 4,
      status: 'In-Transit',
      createdAt: Date.now(),
      synced: true,
    };

    triageRepository.saveAll([record1, record2]);

    const pending = triageRepository.pending();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('1');
  });

  test('should mark a record as synced', () => {
    const record: TriageRecord = {
      id: '1',
      patientName: 'John Doe',
      condition: 'Cardiac arrest',
      priority: 1,
      status: 'Pending',
      createdAt: Date.now(),
      synced: false,
    };

    triageRepository.add(record);
    triageRepository.markSynced('1');

    const all = triageRepository.getAll();
    expect(all[0].synced).toBe(true);

    const pending = triageRepository.pending();
    expect(pending).toHaveLength(0);
  });
});
