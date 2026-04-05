import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { api } from '@lib/api/client';
import type { AuthSessionType } from '@app-types/auth.types';

const SESSION_KEY = 'vigidoc_session';

type AuthStoreType = {
  session: AuthSessionType | any; // Any allows for the token extraction safely
  isLoading: boolean;
  isAuthenticated: boolean;

  setSession: (session: any) => void;
  clearSession: () => void;
  hydrateSession: () => Promise<void>;
};

/**
 * Auth store global (Zustand).
 *
 * Persistência local blindada: Lê/Escreve diretamente no SecureStore.
 * Alimenta o token JWT diretamente nos headers do Axios (api) para requests.
 */
export const useAuthStore = create<AuthStoreType>((set) => ({
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: (session) => {
    set({ session, isAuthenticated: !!session, isLoading: false });

    if (session) {
      // Extrai o token do Better-Auth (no mobile, vem na raiz ou no session.token)
      const token = session.token || session?.session?.token;
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)).catch(
        console.warn
      );
    } else {
      delete api.defaults.headers.common['Authorization'];
      SecureStore.deleteItemAsync(SESSION_KEY).catch(console.warn);
    }
  },

  clearSession: () => {
    set({ session: null, isAuthenticated: false, isLoading: false });
    delete api.defaults.headers.common['Authorization'];
    SecureStore.deleteItemAsync(SESSION_KEY).catch(console.warn);
  },

  hydrateSession: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        
        // Remount in Axios
        const token = session.token || session?.session?.token;
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        set({ session, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
