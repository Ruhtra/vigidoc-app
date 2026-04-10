import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { vitalsService, VitalRecordPayload } from '@lib/services/vitals.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MeasurementData {
  pa?: { sistolica: number; diastolica: number; time: string };
  fc?: { value: number; time: string };
  temp?: { value: number; time: string };
  spo2?: { value: number; time: string };
  peso?: { value: number; time: string };
  dor?: { value: number; time: string };
}

/**
 * Represents a finalized measurement session that has not yet been
 * successfully submitted to the API (offline queue).
 */
export interface PendingSync {
  localId: string;          // UUID generated locally
  payload: VitalRecordPayload;
  queuedAt: string;         // ISO timestamp when queued
}

interface MeasurementState {
  // Current measurement session
  status: 'idle' | 'measuring' | 'waiting';
  startTime: number | null;       // When the 10-min timer started
  waitCooldownEnd: number | null; // When the cooldown period ends
  measurements: MeasurementData;

  // Offline sync queue
  pendingSync: PendingSync[];

  // Actions - session
  addMeasurement: (type: keyof MeasurementData, data: any) => void;
  finalizeAndSync: (submitFn: (payload: VitalRecordPayload) => Promise<any>) => Promise<void>;
  resetWait: () => void;
  getMeasurementCount: () => number;

  // Actions - sync queue
  addToPendingSync: (item: PendingSync) => void;
  removeFromPendingSync: (localId: string) => void;
  syncPendingQueue: (submitFn: (payload: VitalRecordPayload) => Promise<any>) => Promise<void>;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useMeasurementStore = create<MeasurementState>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────────────────
      status: 'idle',
      startTime: null,
      waitCooldownEnd: null,
      measurements: {},
      pendingSync: [],

      // ── Session Actions ────────────────────────────────────────────────────

      addMeasurement: (type, data) => set((state) => {
        const isFirst = Object.keys(state.measurements).length === 0;
        const updatedMeasurements = { ...state.measurements, [type]: data };

        if (isFirst && state.startTime === null) {
          return {
            measurements: updatedMeasurements,
            startTime: Date.now(),
            status: 'measuring' as const,
          };
        }

        return { measurements: updatedMeasurements };
      }),

      /**
       * Converts current measurement data into an API payload, saves it to
       * the offline queue, attempts to submit immediately, and resets the session.
       */
      finalizeAndSync: async (submitFn) => {
        const state = get();
        const m = state.measurements;

        if (Object.keys(m).length === 0) return;

        const payload: VitalRecordPayload = {
          systolic:         m.pa?.sistolica  ?? null,
          diastolic:        m.pa?.diastolica ?? null,
          heartRate:        m.fc?.value      ?? null,
          temperature:      m.temp?.value    ?? null,
          oxygenSaturation: m.spo2?.value    ?? null,
          weight:           m.peso?.value    ?? null,
          painLevel:        m.dor?.value     ?? null,
          recordedAt:       new Date().toISOString(),
        };

        const pendingItem: PendingSync = {
          localId: `local_${Date.now()}`,
          payload,
          queuedAt: new Date().toISOString(),
        };

        // Determine if this is an auto-finalize (elapsed > 10m) or manual
        let waitEnd: number | null = Date.now() + 10 * 60 * 1000;
        let newStatus: 'waiting' | 'idle' = 'waiting';

        if (state.startTime) {
          const elapsed = Date.now() - state.startTime;
          // Se já passou dos 10 minutos (10 * 60 * 1000), então foi finalizado automaticamente
          if (elapsed >= 10 * 60 * 1000) {
            // O cooldown real de 10 minutos deveria ter começado no exato momento em que os primeiros 10 minutos acabaram
            // Ou seja, o cooldown acabaria em startTime + 20 minutos
            waitEnd = state.startTime + 20 * 60 * 1000;
          }
        }

        // Se o cooldown já venceu (no caso de abrir o app mt tempo depois), pular estado de 'waiting'
        if (waitEnd && Date.now() >= waitEnd) {
          waitEnd = null;
          newStatus = 'idle';
        }

        // 1. Add to pending queue FIRST (ensures data survives even if app closes)
        set((s) => ({
          pendingSync: [...s.pendingSync, pendingItem],
          // Reset current session immediately
          status: newStatus,
          startTime: null,
          waitCooldownEnd: waitEnd,
          measurements: {},
        }));

        // 2. Try to submit right now
        try {
          await submitFn(payload);
          // On success, remove from pending queue
          get().removeFromPendingSync(pendingItem.localId);
        } catch (e) {
          // Submission failed (offline). Item stays in queue for later sync.
          console.warn('[MeasurementStore] Offline – record queued for sync:', pendingItem.localId);
        }
      },

      resetWait: () => set({ status: 'idle', waitCooldownEnd: null }),

      getMeasurementCount: () => Object.keys(get().measurements).length,

      // ── Sync Queue Actions ─────────────────────────────────────────────────

      addToPendingSync: (item) =>
        set((s) => ({ pendingSync: [...s.pendingSync, item] })),

      removeFromPendingSync: (localId) =>
        set((s) => ({ pendingSync: s.pendingSync.filter((p) => p.localId !== localId) })),

      /**
       * Iterates the offline queue and attempts to submit each item.
       * Successfully submitted items are removed from the queue.
       */
      syncPendingQueue: async (submitFn) => {
        const { pendingSync } = get();
        if (pendingSync.length === 0) return;

        console.log(`[MeasurementStore] Syncing ${pendingSync.length} pending record(s)...`);

        for (const item of pendingSync) {
          try {
            await submitFn(item.payload);
            get().removeFromPendingSync(item.localId);
            console.log('[MeasurementStore] Synced & removed:', item.localId);
          } catch (e) {
            // Still offline, stop trying (avoid hammering the server)
            console.warn('[MeasurementStore] Still offline, aborting sync loop.');
            break;
          }
        }
      },
    }),
    {
      name: 'vigidoc-measurement-store', // Key in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
