import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { refresh, setOnline } from '../../store/triageSlice';
import { flushQueue } from '../../sync/syncEngine';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

export function ConnectivityBanner() {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: RootState) => state.triage.isOnline);
  const pendingQueue = useSelector((state: RootState) => state.triage.queue);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const activeStatus = !!(state.isConnected && state.isInternetReachable !== false);
      dispatch(setOnline(activeStatus));
    });
    return () => unsubscribe();
  }, [dispatch]);

  const triggerForceSync = () => {
    flushQueue(() => {
      dispatch(refresh());
    });
  };

  return (
    <View style={styles.container}>
      {/* Network Status Banner */}
      <View
        style={[
          styles.statusBar,
          { backgroundColor: isOnline ? COLORS.success : COLORS.error },
        ]}
      >
        <Text style={styles.statusText}>
          {isOnline
            ? '● Connected (Online)'
            : '▲ Disconnected (Offline Mode)'}
        </Text>
        {pendingQueue.length > 0 && (
          <Pressable style={styles.syncButton} onPress={triggerForceSync}>
            <Text style={styles.syncButtonText}>Sync ({pendingQueue.length}) ↻</Text>
          </Pressable>
        )}
      </View>

      {/* Info panel when there are local pending records */}
      {pendingQueue.length > 0 && (
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>
            {pendingQueue.length} patient record{pendingQueue.length > 1 ? 's' : ''} saved locally. Will upload automatically when online.
          </Text>
        </View>
      )}
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
  infoPanel: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontStyle: 'italic',
  },
});


