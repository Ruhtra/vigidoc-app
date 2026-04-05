import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="request-access" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="pending-access" options={{ animation: 'fade' }} />
      <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
