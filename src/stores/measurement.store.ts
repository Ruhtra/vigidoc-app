import { create } from 'zustand';

export interface MeasurementData {
  pa?: { sistolica: number; diastolica: number; time: string };
  fc?: { value: number; time: string };
  temp?: { value: number; time: string };
  spo2?: { value: number; time: string };
  peso?: { value: number; time: string };
  dor?: { value: number; time: string };
}

type MeasurementType = keyof MeasurementData;

interface MeasurementState {
  status: 'idle' | 'measuring' | 'waiting';
  startTime: number | null; // Timestamp quando o timer de 10 minutos inicia
  waitCooldownEnd: number | null; // Timestamp quando o cooldown de 10 minutos termina
  measurements: MeasurementData;
  startMeasuring: () => void;
  addMeasurement: (type: MeasurementType, data: any) => void;
  finalizeMeasurement: () => void;
  resetWait: () => void;
  getMeasurementCount: () => number;
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  status: 'idle',
  startTime: null,
  waitCooldownEnd: null,
  measurements: {},

  startMeasuring: () => set({ status: 'measuring' }),

  addMeasurement: (type, data) => set((state) => {
    // Se for o primeiro registro, inicia o timer de 10 minutos
    const isFirst = Object.keys(state.measurements).length === 0;
    const update = {
      measurements: { ...state.measurements, [type]: data }
    };
    
    if (isFirst && state.startTime === null) {
      return { ...update, startTime: Date.now(), status: 'measuring' as const };
    }
    
    return update;
  }),

  finalizeMeasurement: () => set((state) => {
    // Ao finalizar, entra em 'waiting' por 10 minutos
    return {
      status: 'waiting',
      startTime: null,
      waitCooldownEnd: Date.now() + 10 * 60 * 1000,
      measurements: {}, // clear for next time
    };
  }),

  resetWait: () => set({ status: 'idle', waitCooldownEnd: null }),

  getMeasurementCount: () => {
    return Object.keys(get().measurements).length;
  }
}));
