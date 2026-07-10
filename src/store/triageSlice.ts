import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { triageRepository } from '../data/triageRepository';
import { flushQueue } from '../sync/syncEngine';
import { TriageRecord, Priority, Status } from '../domain/types';

import { mockApiConfig } from '../data/mockApi';

interface SubmitTriageInput {
  patientName: string;
  condition: string;
  priority: Priority;
  status: Status;
}

export const submitTriage = createAsyncThunk(
  'triage/submit',
  async (input: SubmitTriageInput, { dispatch }) => {
    const record: TriageRecord = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      synced: false,
    };
    // 1. Persist locally first (so it's safe if we are offline)
    triageRepository.add(record);
    // 2. Trigger asynchronous background sync
    flushQueue(() => {
      dispatch(refresh());
    });
    return record;
  }
);

const slice = createSlice({
  name: 'triage',
  initialState: {
    queue: triageRepository.pending(),
    allRecords: triageRepository.getAll(),
    isOnline: true,
    isManualMode: mockApiConfig.getIsManualMode(),
    manualOnline: mockApiConfig.getManualOnline(),
    simulatedFailure: mockApiConfig.getSimulatedFailure(),
  },
  reducers: {
    refresh: (state) => {
      state.queue = triageRepository.pending();
      state.allRecords = triageRepository.getAll();
    },
    setOnline: (state, action) => {
      state.isOnline = action.payload;
    },
    setIsManualMode: (state, action) => {
      state.isManualMode = action.payload;
      mockApiConfig.setIsManualMode(action.payload);
      state.simulatedFailure = action.payload && !state.manualOnline;
    },
    setManualOnline: (state, action) => {
      state.manualOnline = action.payload;
      mockApiConfig.setManualOnline(action.payload);
      state.simulatedFailure = state.isManualMode && !action.payload;
    },
    setSimulatedFailure: (state, action) => {
      state.simulatedFailure = action.payload;
      mockApiConfig.setSimulatedFailure(action.payload);
      state.isManualMode = true;
      state.manualOnline = !action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(submitTriage.fulfilled, (state) => {
      state.queue = triageRepository.pending();
      state.allRecords = triageRepository.getAll();
    });
  },
});

export const { refresh, setOnline, setIsManualMode, setManualOnline, setSimulatedFailure } = slice.actions;
export default slice.reducer;

