import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useReminderStore } from '../stores/reminder.store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function ReminderSyncEngine() {
  const { reminders, syncWithServer, loadLocal } = useReminderStore();
  const lastScheduleHash = useRef('');

  // 1. Inicialização e Polling
  useEffect(() => {
    loadLocal().then(() => {
      console.log(`[ReminderEngine] Inicializando serviço de notificações...`);
      syncWithServer();
    });

    const interval = setInterval(() => {
      syncWithServer();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // 2. Listener de AppState (Sync on Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        syncWithServer();
      }
    });
    return () => subscription.remove();
  }, [syncWithServer]);

  // 3. Registro no Hardware (OS) - Apenas se houver mudança
  useEffect(() => {
    const applyAlarms = async () => {
      if (Platform.OS === 'web') return;

      const activeReminders = reminders.filter(r => r.enabled);
      
      // Gera um hash simples dos horários para comparar se algo mudou
      const currentHash = JSON.stringify(activeReminders.map(r => `${r.id}-${r.hour}-${r.minute}`));
      
      // Se não houve mudança nos dados, não reagenda (evita disparos indesejados no Android)
      if (currentHash === lastScheduleHash.current) return;
      
      console.log(`[ReminderEngine] Mudança detectada (ou inicialização). Cancelando alarmes antigos e agendando ${activeReminders.length} novos...`);

      try {
        // No Android, é obrigatório um canal para exibir notificações
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Lembretes Vigidoc',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
          console.log(`[ReminderEngine] Canal Android configurado.`);
        }

        await Notifications.cancelAllScheduledNotificationsAsync();
        
        for (const reminder of activeReminders) {
          const timeStr = `${reminder.hour.toString().padStart(2, '0')}:${reminder.minute.toString().padStart(2, '0')}`;
          console.log(`[ReminderEngine] Tentando agendar: "${reminder.label}" exatamentes às ${timeStr} diariamente.`);
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ Lembrete: ${reminder.label}`,
              body: `Horário de ${reminder.label.toLowerCase()} (${timeStr})`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
              type: 'daily', // Obrigatório para o Expo reconhecer e não disparar agora
              hour: reminder.hour,
              minute: reminder.minute,
              channelId: 'default',
            } as any,
          });
          
          console.log(`[ReminderEngine] ✔️ SUCESSO: Alarme das ${timeStr} registrado no hardware do aparelho!`);
        }
        
        lastScheduleHash.current = currentHash;
      } catch (e) {
        console.error('[ReminderEngine] ERRO GRAVE ao agendar notificação:', e);
      }
    };

    applyAlarms();
  }, [reminders]);

  // Listener para saber quando ela REALMENTE disparou na tela
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(notification => {
      console.log(`\n======================================================`);
      console.log(`[DEVICE] 📢 ALARME DISPARADO EXATAMENTE AGORA!`);
      console.log(`[DEVICE] Título: ${notification.request.content.title}`);
      console.log(`[DEVICE] Horário local: ${new Date().toLocaleTimeString()}`);
      console.log(`======================================================\n`);
    });
    return () => sub.remove();
  }, []);

  return null;
}
