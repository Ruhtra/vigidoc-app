import { useState, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { api } from '../api/client';
import { Ionicons } from '@expo/vector-icons';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Helper para carregar o módulo de forma segura apenas quando necessário
const getNotifications = () => {
  if (isExpoGo && Platform.OS === 'android') {
    // No Expo Go Android (SDK 53+), retornar null ou um mock seguro para evitar crashes
    return null;
  }
  try {
    return require('expo-notifications');
  } catch (e) {
    return null;
  }
};

// Configura o comportamento apenas se não for Expo Go Android
const Notifications = getNotifications();
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true
    }),
  });
}

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

export function useReminderSync() {
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Carrega do armazenamento local primeiro (Offline First)
  const loadLocalReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Erro ao carregar alarmes locais:', e);
    }
  };

  // Re-agenda todos os locais no sistema operacional
  const applyLocalAlarms = async (newReminders: ReminderData[]) => {
    // Log de conferência (sempre acontece)
    const activeReminders = newReminders.filter(r => r.enabled);
    console.log(`[Sync] Sincronização concluída. ${activeReminders.length} lembretes ativos carregados.`);
    
    activeReminders.forEach(r => {
      const timeStr = `${r.hour.toString().padStart(2, '0')}:${r.minute.toString().padStart(2, '0')}`;
      console.log(`[Sync] Horário detectado: ${timeStr} - ${r.label}`);
    });

    if (Platform.OS === 'web' || !Notifications) {
      console.log('[Sync] NOTA: Rodando em modo de Simulação (Hardware de Notificação indisponível no Expo Go).');
      return;
    }
    
    try {
      // 1. Limpa tudo existente
      await Notifications.cancelAllScheduledNotificationsAsync();

      // 2. Agenda os novos (apenas habilitados)
      for (const reminder of activeReminders) {
        const timeStr = `${reminder.hour.toString().padStart(2, '0')}:${reminder.minute.toString().padStart(2, '0')}`;
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Lembrete: ${reminder.label}`,
            body: `Horário de ${reminder.label.toLowerCase()} (${timeStr})`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            hour: reminder.hour,
            minute: reminder.minute,
            repeats: true, // Aciona todos os dias neste horário
          },
        });
        console.log(`[Sync] Registro OK: Alarme para as ${timeStr} gravado no hardware.`);
      }
    } catch (e) {
      console.error('Erro ao agendar notificações locais:', e);
    }
  };

  // Busca do servidor e atualiza
  const syncWithServer = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
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

      setReminders(formattedData);
      setLastSync(new Date());
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(formattedData));

      await applyLocalAlarms(formattedData);
    } catch (error) {
      console.error('[Sync] Falha ao sincronizar online:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    loadLocalReminders();
    syncWithServer();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      syncWithServer();
    }, 60000);
    return () => clearInterval(interval);
  }, [syncWithServer]);

  // Hook 3: Watchdog para simular disparos no console (Útil para teste no Expo Go)
  useEffect(() => {
    let lastLoggedMinute = '';

    const watchdog = setInterval(() => {
      const now = new Date();
      const currentHHmm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Evita logar múltiplas vezes no mesmo minuto
      if (lastLoggedMinute === currentHHmm) return;

      const triggered = reminders.find(r => 
        r.enabled && 
        `${r.hour.toString().padStart(2, '0')}:${r.minute.toString().padStart(2, '0')}` === currentHHmm
      );

      if (triggered) {
        lastLoggedMinute = currentHHmm;
        console.log(`[SIMULADOR-DISPARO] 🔔 HORA DE DISPARAR: "${triggered.label}" às ${currentHHmm}`);
        console.log(`[SIMULADOR-DISPARO] Momento real do log: ${now.toLocaleTimeString()}`);
      }
    }, 10000); // Checa a cada 10 segundos

    return () => clearInterval(watchdog);
  }, [reminders]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        syncWithServer();
      }
    });
    return () => subscription.remove();
  }, [syncWithServer]);

  // Hook 4: Listener de Recebimento (Debug)
  useEffect(() => {
    if (!Notifications) return;

    const receivedSubscription = Notifications.addNotificationReceivedListener((notification: any) => {
      const { title, body } = notification.request.content;
      console.log(`[DEVICE] 📢 NOTIFICAÇÃO RECEBIDA: "${title}" - ${body}`);
      console.log(`[DEVICE] Horário do disparo no sistema: ${new Date().toLocaleTimeString()}`);
    });

    return () => {
      receivedSubscription.remove();
    };
  }, []);

  return {
    reminders,
    isSyncing,
    lastSync,
    forceSync: syncWithServer
  };
}
