import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api/client';
import { Ionicons } from '@expo/vector-icons';

const REMINDERS_STORAGE_KEY = '@vigidoc:local_reminders';

export type ReminderData = {
  id: string;
  hour: number;
  minute: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  period: 'morning' | 'afternoon' | 'night';
  enabled: boolean;
};

interface ReminderState {
  reminders: ReminderData[];
  isSyncing: boolean;
  lastSync: Date | null;
  exactAlarmStatus: 'granted' | 'denied' | 'undetermined';
  loadLocal: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  setExactAlarmStatus: (status: 'granted' | 'denied' | 'undetermined') => void;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  isSyncing: false,
  lastSync: null,
  exactAlarmStatus: 'undetermined',

  setExactAlarmStatus: (status) => set({ exactAlarmStatus: status }),

  loadLocal: async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        set({ reminders: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('[Store] Erro ao carregar cache local:', e);
    }
  },

  syncWithServer: async () => {
    if (get().isSyncing) return;
    set({ isSyncing: true });

    try {
      console.log('[Sync] Iniciando busca global de lembretes...');
      const response = await api.get('/api/reminders');
      const apiData = response.data;

      const formattedData: ReminderData[] = apiData.map((item: any) => {
        const [hour, minute] = item.time.split(':').map(Number);
        return {
          id: item.id,
          hour,
          minute,
          label: item.label,
          icon: (item.icon as keyof typeof Ionicons.glyphMap) || 'alarm-outline',
          period: (item.period?.toLowerCase() as 'morning' | 'afternoon' | 'night') || 'morning',
          enabled: item.enabled,
        };
      });

      formattedData.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));

      // Comparação inteligente para evitar re-render desnecessário
      const currentHash = JSON.stringify(formattedData.map(r => `${r.id}-${r.hour}-${r.minute}-${r.enabled}`));
      const previousHash = JSON.stringify(get().reminders.map(r => `${r.id}-${r.hour}-${r.minute}-${r.enabled}`));

      if (currentHash === previousHash) {
        set({ isSyncing: false, lastSync: new Date() });
        return;
      }

      set({ 
        reminders: formattedData, 
        lastSync: new Date(),
        isSyncing: false 
      });
      
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(formattedData));
    } catch (error) {
      console.error('[Sync] Falha na sincronização global:', error);
      set({ isSyncing: false });
    }
  },
}));
