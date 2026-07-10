import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { refresh, setOnline, setIsManualMode, setManualOnline } from '../../store/triageSlice';
import { flushQueue } from '../../sync/syncEngine';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

export function ConnectivityBanner() {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: RootState) => state.triage.isOnline);
  const isManualMode = useSelector((state: RootState) => state.triage.isManualMode);
  const manualOnline = useSelector((state: RootState) => state.triage.manualOnline);
  const pendingQueue = useSelector((state: RootState) => state.triage.queue);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const activeStatus = !!(state.isConnected && state.isInternetReachable !== false);
      dispatch(setOnline(activeStatus));
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handleToggleManualMode = (val: boolean) => {
    dispatch(setIsManualMode(val));
    const nextOnline = val ? manualOnline : isOnline;
    if (nextOnline) {
      // Wait a tick so the state is fully updated before syncing
      setTimeout(() => triggerForceSync(), 50);
    }
  };

  const handleToggleSimulatedConnection = (online: boolean) => {
    dispatch(setManualOnline(online));
    if (online) {
      setTimeout(() => triggerForceSync(), 50);
    }
  };

  const triggerForceSync = () => {
    flushQueue(() => {
      dispatch(refresh());
    });
  };

  const appIsOnline = isManualMode ? manualOnline : isOnline;

  return (
    <View style={styles.container}>
      {/* Network Status Banner */}
      <View
        style={[
          styles.statusBar,
          { backgroundColor: appIsOnline ? COLORS.success : COLORS.error },
        ]}
      >
        <Text style={styles.statusText}>
          {isManualMode
            ? manualOnline
              ? '● Simulated Online Mode'
              : '▲ Simulated Offline Mode'
            : isOnline
            ? '● Connected (Online)'
            : '▲ Disconnected (Offline Mode)'}
        </Text>
        {pendingQueue.length > 0 && (
          <Pressable style={styles.syncButton} onPress={triggerForceSync}>
            <Text style={styles.syncButtonText}>Sync ({pendingQueue.length}) ↻</Text>
          </Pressable>
        )}
      </View>

      {/* Simulator Control Panel */}
      <View style={styles.controlPanel}>
        <View style={styles.row}>
          <Text style={styles.controlLabel}>Manual Network Override</Text>
          <Switch
            value={isManualMode}
            onValueChange={handleToggleManualMode}
            trackColor={{ false: '#444444', true: COLORS.success }}
            thumbColor="#ffffff"
          />
        </View>
        <View style={[styles.row, { marginTop: SPACING.sm, opacity: isManualMode ? 1 : 0.5 }]}>
          <Text style={styles.controlLabel}>Simulate Status (ON = Online, OFF = Offline)</Text>
          <Switch
            value={manualOnline}
            onValueChange={handleToggleSimulatedConnection}
            disabled={!isManualMode}
            trackColor={{ false: '#444444', true: COLORS.success }}
            thumbColor="#ffffff"
          />
        </View>
        {pendingQueue.length > 0 && (
          <Text style={styles.infoText}>
            {pendingQueue.length} patient record{pendingQueue.length > 1 ? 's' : ''} saved locally. Will upload automatically.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  statusBar: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: TYPOGRAPHY.sizes.body,
  },
  syncButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: TYPOGRAPHY.sizes.caption + 1,
  },
  controlPanel: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.body - 1,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
});

