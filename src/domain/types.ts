export type Status = 'Pending' | 'In-Transit';
export type Priority = 1 | 2 | 3 | 4 | 5;

export interface TriageRecord {
  id: string;
  patientName: string;
  condition: string;
  priority: Priority;
  status: Status;
  createdAt: number;
  synced: boolean;
}
