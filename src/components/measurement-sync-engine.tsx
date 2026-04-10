import React, { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useMeasurementStore } from '@stores/measurement.store';
import { vitalsService } from '@lib/services/vitals.service';

const TIMER_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * MeasurementSyncEngine
 *
 * Invisible component mounted at the root of the app. Responsible for:
 *  1. Auto-finalizing expired measurement sessions (10-min timer)
 *  2. Syncing the offline queue whenever network connectivity is restored
 *  3. Running these checks when the app returns to the foreground
 */
export function MeasurementSyncEngine() {
  const queryClient = useQueryClient();
  const store = useMeasurementStore();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const tickerRef = useRef<NodeJS.Timeout | null>(null);

  const submitFn = async (payload: any) => {
    await vitalsService.submitRecord(payload);
    // Invalidate cache so Home and History screens refresh
    queryClient.invalidateQueries({ queryKey: ['vitalsHistory'] });
    queryClient.invalidateQueries({ queryKey: ['healthStreak'] });
  };

  /**
   * Check if the current session has expired and auto-finalize if so.
   */
  const checkAndAutoFinalize = async () => {
    const { status, startTime, finalizeAndSync } = useMeasurementStore.getState();

    if (status === 'measuring' && startTime !== null) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= TIMER_DURATION_MS) {
        console.log('[SyncEngine] Session expired - auto-finalizing...');
        await finalizeAndSync(submitFn);
      }
    }
  };

  /**
   * Attempt to sync any queued offline records.
   */
  const syncQueue = async () => {
    const { syncPendingQueue, pendingSync } = useMeasurementStore.getState();
    if (pendingSync.length > 0) {
      await syncPendingQueue(submitFn);
    }
  };

  // ── 1-second ticker: keeps the UI timer accurate & detects expiry ────────────
  useEffect(() => {
    tickerRef.current = setInterval(() => {
      checkAndAutoFinalize();
    }, 5000); // Check every 5 seconds (not 1s to avoid excessive calls)

    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  // ── AppState: sync queue when app comes back to foreground ───────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        console.log('[SyncEngine] App foregrounded - checking timer & sync queue...');
        await checkAndAutoFinalize();
        await syncQueue();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  // ── NetInfo: sync queue when connectivity is restored ───────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('[SyncEngine] Network restored - attempting sync...');
        await syncQueue();
      }
    });

    return () => unsubscribe();
  }, []);

  // Run once on mount (handles the case where app was relaunched)
  useEffect(() => {
    const init = async () => {
      await checkAndAutoFinalize();
      await syncQueue();
    };
    // Small delay to allow the store to rehydrate from AsyncStorage
    const timeout = setTimeout(init, 1500);
    return () => clearTimeout(timeout);
  }, []);

  return null; // Invisible component
}
