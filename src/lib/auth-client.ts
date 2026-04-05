import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { createAuthClient } from 'better-auth/react';

import { API_BASE_URL } from '@lib/api/client';

/**
 * Cliente Better-Auth configurado para Expo (React Native).
 *
 * Usa @better-auth/expo para:
 * - Armazenar sessão com expo-secure-store (keychain/keystore nativo)
 * - Gerenciar cookies de sessão no ambiente mobile
 * - Lidar com deep-linking (scheme: 'vigidoc')
 *
 * Espelho do auth-client.ts do VigidocMedic, adaptado para RN.
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: 'vigidocapp',
      storagePrefix: 'vigidoc',
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
