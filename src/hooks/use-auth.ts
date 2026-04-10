import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AuthService } from '@lib/services/auth.service';
import { useAuthStore } from '@stores/auth.store';

type UseAuthType = {
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

export function useAuth(): UseAuthType {
  const router = useRouter();
  const { setSession, clearSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      setIsLoading(true);
      setError(null);

      const { data, error: authError } = await AuthService.signInEmail(
        email,
        password,
        remember
      );

      setIsLoading(false);

      if (authError || !data) {
        setError(authError?.message ?? 'Erro ao fazer login. Tente novamente.');
        return;
      }

      setSession(data);

      // Usuário pendente: redireciona para tela de acesso pendente
      if (data?.user?.status === 'PENDING') {
        router.replace('/(auth)/pending-access');
        return;
      }

      // Navega para a raiz protegida da aplicação
      router.replace('/(tabs)');
    },
    [setSession, router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    await AuthService.signOut();
    clearSession();
    setIsLoading(false);
    router.replace('/(auth)/login');
  }, [clearSession, router]);

  return { isLoading, error, login, logout };
}
