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

class VitalsService {
  async getHistory(days: number = 90): Promise<VitalsHistoryResponse> {
    const response = await api.get<VitalsHistoryResponse>(`/api/novo/vitals/history`, {
      params: { days },
    });
    return response.data;
  }
}

export const vitalsService = new VitalsService();
