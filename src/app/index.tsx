import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const [second, setSecond] = useState('00');

  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Erro', 'As permissões de notificação não foram concedidas!');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    })();
  }, []);

  const sendImmediateNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notificação Imediata 🚀',
        body: 'Esta é a notificação que você disparou agora mesmo!',
      },
      trigger: null, // Dispara imediatamente
    });
  };

  const scheduleNotification = async () => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const s = parseInt(second, 10);

    if (isNaN(h) || isNaN(m) || isNaN(s) || h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) {
      Alert.alert('Erro', 'Por favor, insira valores válidos para hora, minuto e segundo.');
      return;
    }

    const triggerDate = new Date();
    triggerDate.setHours(h);
    triggerDate.setMinutes(m);
    triggerDate.setSeconds(s);
    triggerDate.setMilliseconds(0);

    // Se o horário especificado já passou no dia de hoje, agenda para o amanhã
    if (triggerDate <= new Date()) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Alarme: ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
        body: 'Esta é sua notificação agendada com precisão.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    Alert.alert('Sucesso', `Notificação agendada para: \n${triggerDate.toLocaleString()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Validação de Notificações</Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>1. Disparar Agora</Text>
        <Button title="Enviar Notificação Imediata" onPress={sendImmediateNotification} />
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>2. Agendar Notificação</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            maxLength={2}
            value={hour}
            onChangeText={setHour}
            placeholder="HH"
          />
          <Text style={styles.colon}>:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            maxLength={2}
            value={minute}
            onChangeText={setMinute}
            placeholder="MM"
          />
          <Text style={styles.colon}>:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            maxLength={2}
            value={second}
            onChangeText={setSecond}
            placeholder="SS"
          />
        </View>
        <Button title="Salvar Agendamento" onPress={scheduleNotification} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 18,
    width: 60,
    textAlign: 'center',
  },
  colon: {
    fontSize: 24,
    marginHorizontal: 8,
  },
});
