import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store/store';
import { startSyncEngine } from './src/sync/syncEngine';
import { refresh } from './src/store/triageSlice';
import { ConnectivityBanner } from './src/ui/components/ConnectivityBanner';
import { TriageForm } from './src/ui/components/TriageForm';
import { COLORS } from './src/ui/theme';

function MainApp() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Start background sync engine on mount
    // Passes a callback to refresh Redux whenever the queue states change
    const stopSync = startSyncEngine(() => {
      dispatch(refresh());
    });

    return () => {
      stopSync();
    };
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ConnectivityBanner />
      <TriageForm />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
