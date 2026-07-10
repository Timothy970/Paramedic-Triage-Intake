# Paramedic Triage Intake Application

An offline-first, high-performance mobile application engineered to guarantee no patient triage data is lost, even in areas with unstable or non-existent cellular coverage. Designed specifically for field paramedics operating under high stress.

Built with **React Native (TypeScript)** and **Expo**, utilizing **Redux Toolkit** for state management, **MMKV** for persistent local storage, and **Jest** for unit testing.

---

## Key Features

1. **Thumb-Optimized UI**: Simple, single-screen layout with large touch targets (>= 56px heights), 18px+ typography, and inline input validations.
2. **Glanceable Hazard Coding**: Intuitive colored priority rows (P1 deep red, P2 orange, P3 amber, P4/P5 green) to quickly see the severity of cases. Unselected fields are dimmed to maintain visual focus on active selections.
3. **Robust Offline Sync Queue**: Submitting a patient form writes directly to local MMKV storage first (which never fails).
4. **Auto Sync Engine**: Actively listens to network connectivity (`@react-native-community/netinfo`) and App lifecycle events (`AppState`) to flush pending items automatically in the background once online.
5. **Security & Local Data Encryption**: 
   - **Native Encryption**: On Android and iOS, local data is encrypted at the storage engine level with AES-128 using a 16-character secure key configured during MMKV instantiation.
   - **Web Obfuscation**: In browser/Web environments, local patient data is encrypted and stored in Base64 format (`btoa`/`atob`) rather than plain text.
6. **Dual-Control Network Override**: Easily switch between **Automatic Detection Mode** (uses real device network state) and **Manual Override Mode** (allows manually simulating online/offline states to test sync behavior).

---

## Architecture Flow

```
┌──────────────┐   dispatch    ┌──────────────────┐
│   UI Layer   │──────────────▶│   State Layer    │
│ (Screens,    │◀──────────────│ (Redux Toolkit / │
│  components) │   selectors   │  triageSlice)    │
└──────────────┘               └────────┬─────────┘
                                         │ calls (no UI knowledge)
                              ┌──────────▼──────────┐
                              │  TriageRepository   │
                              └─────┬────────┬──────┘
                        persists    │        │  syncs
                         ┌──────────▼──┐  ┌──▼────────────┐
                         │ Local Store │  │ Mock API repo │
                         │ (MMKV)      │  │ (2s delay +   │
                         └─────────────┘  │ simulated fail)
                                   ▲      └───────────────┘
                         ┌─────────┴──────────┐
                         │  SyncEngine        │
                         │ (NetInfo listener +│
                         │  AppState listener)│
                         └────────────────────┘
```

---

## Directory Structure

```
paramedic-triage-app/
├── App.tsx                     # App entry point, Redux Provider, SyncEngine lifecycle mount
├── jest-setup.ts               # Jest mocks for MMKV, NetInfo, and globals
├── package.json
└── src/
    ├── domain/
    │   └── types.ts            # TriageRecord, Priority, Status type declarations
    ├── data/
    │   ├── triageRepository.ts # Persistent local operations using MMKV
    │   └── mockApi.ts          # Simulated POST with 2s latency and config options
    ├── sync/
    │   └── syncEngine.ts       # Network and AppState listeners for background upload
    ├── store/
    │   ├── store.ts            # Redux store configuration
    │   └── triageSlice.ts      # Redux Toolkit slice, actions, and thunks
    ├── ui/
    │   ├── theme.ts            # Centralized hazard colors, spacings, typography
    │   └── components/
    │       ├── ConnectivityBanner.tsx # Online status banner, queue count, override toggles
    │       ├── PrioritySelector.tsx   # Color-coded thumb-friendly priority buttons
    │       └── TriageForm.tsx         # Patient details input, validations, and local log list
    └── __tests__/
        ├── triageRepository.test.ts   # Local CRUD tests
        ├── syncEngine.test.ts         # Network status/sync flow tests
        ├── triageSlice.test.ts        # Redux action/reducer tests
        └── PrioritySelector.test.tsx  # UI rendering and selection action tests
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go App on your mobile device (or Android/iOS Simulator)

### Install Dependencies
Run from the root of the project:
```bash
npm install
```

### Run the Application
Start the Expo development server:
```bash
npm start
```
Scan the QR code printed in the terminal using your phone camera (iOS) or the Expo Go app (Android).

---

## Running Tests

We have implemented comprehensive unit and component tests using Jest and React Native Testing Library. To execute the test suite, run:

```bash
npm test
```

Expected output:
```
PASS  src/__tests__/PrioritySelector.test.tsx
PASS  src/__tests__/triageSlice.test.ts
PASS  src/__tests__/triageRepository.test.ts
PASS  src/__tests__/syncEngine.test.ts

Test Suites: 4 passed, 4 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        35.32 s
```

---

## Offline Simulation Demo Steps

To verify the offline synchronization capability:
1. Open the application. By default, it operates in **Automatic Detection Mode** (using `@react-native-community/netinfo` to automatically trace the device network state).
2. To simulate an offline environment:
   - Toggle the **"Manual Network Override"** switch to ON.
   - Toggle the **"Simulate Status"** switch to OFF (Offline).
   - Alternatively, you can disable your device's Wi-Fi / Cellular data, and the app will automatically indicate `"Disconnected (Offline Mode)"`.
3. Submit a new triage record. 
4. Notice that:
   - The form clears instantly (Optimistic UI).
   - The record appears in the **Local Triage Log** at the bottom with a **"Pending ↻"** badge.
   - The header pill shows **"Sync (1) ↻"**.
5. Submit 2 more records. The sync pill counter increases to 3.
6. To trigger the upload:
   - Toggle the **"Simulate Status"** switch to ON (Online) (or re-enable your device's Wi-Fi/Cellular data).
7. The app instantly detects the connection restoration, triggers the background queue processing, and streams each record to the API with a 2-second simulated network latency.
8. As each record is successfully saved in the backend, the badges on the list dynamically transition from **"Pending ↻"** to **"Synced ✓"** without freezing the UI.

