import { api } from '../api/client';

export interface VitalRecordAPIResponse {
  id: string;
  recordedAt: string;
  vitals: {
    bloodPressure: string | null;
    heartRate: number | null;
    temperature: number | null;
    oxygenSaturation: number | null;
    weight: number | null;
    painLevel: number | null;
  };
  notes: string | null;
}

export interface VitalsHistoryResponse {
  period: {
    daysRequested: number;
    dateFrom: string;
  };
  data: VitalRecordAPIResponse[];
}

export interface VitalRecordPayload {
  systolic?: number | null;
  diastolic?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  oxygenSaturation?: number | null;
  painLevel?: number | null;
  weight?: number | null;
  notes?: string | null;
  recordedAt?: string;
}

export interface VitalRecordSubmitResponse {
  message: string;
  data: {
    id: string;
    severity: string;
    streak: { current: number; lastActiveAt: string };
  };
}

export interface StreakHistoryItem {
  label: string;
  date: string;
  count: number;
  status: 'done' | 'pending' | 'empty';
}

export interface StreakResponse {
  message: string;
  data: {
    currentStreak: number;
    history: StreakHistoryItem[];
  };
}

class VitalsService {
  async getHistory(days: number = 90): Promise<VitalsHistoryResponse> {
    const response = await api.get<VitalsHistoryResponse>(`/api/novo/vitals/history`, {
      params: { days },
    });
    return response.data;
  }

  async submitRecord(payload: VitalRecordPayload): Promise<VitalRecordSubmitResponse> {
    const response = await api.post<VitalRecordSubmitResponse>(`/api/novo/vitals/record`, payload);
    return response.data;
  }

  async getStreak(): Promise<StreakResponse> {
    const response = await api.get<StreakResponse>(`/api/novo/vitals/streak`);
    return response.data;
  }
}

export const vitalsService = new VitalsService();
