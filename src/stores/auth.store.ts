import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { AuthSessionType } from '@types/auth.types';

const SESSION_KEY = 'vigidoc:session';

type AuthStoreType = {
  session: AuthSessionType;
  isLoading: boolean;
  isAuthenticated: boolean;

  setSession: (session: AuthSessionType) => void;
  clearSession: () => void;
  hydrateSession: () => Promise<void>;
};

/**
 * Auth store global (Zustand).
 *
 * A sessão é persistida via expo-secure-store (keychain/keystore nativo)
 * para consistência com o @better-auth/expo que também usa SecureStore.
 *
 * A validação real contra o servidor é feita no _layout.tsx root.
 */
export const useAuthStore = create<AuthStoreType>((set) => ({
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: (session) => {
    set({ session, isAuthenticated: !!session, isLoading: false });

    if (session) {
      SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)).catch(
        console.warn
      );
    } else {
      SecureStore.deleteItemAsync(SESSION_KEY).catch(console.warn);
    }
  },

  clearSession: () => {
    set({ session: null, isAuthenticated: false, isLoading: false });
    SecureStore.deleteItemAsync(SESSION_KEY).catch(console.warn);
  },

  hydrateSession: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (raw) {
        const session: AuthSessionType = JSON.parse(raw);
        set({ session, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
