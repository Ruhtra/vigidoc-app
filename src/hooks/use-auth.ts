import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@lib/services/auth.service';
import { useAuthStore } from '@stores/auth.store';

export function useAuth() {
  const { setSession, clearSession } = useAuthStore();
  const queryClient = useQueryClient();

  // Mutation para Login
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, remember }: any) => {
      const { data, error } = await AuthService.signInEmail(email, password, remember);
      if (error) throw new Error(error.message ?? 'Erro ao fazer login. Tente novamente.');
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        setSession(data);
      }
    },
  });

  // Mutation para Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AuthService.signOut();
    },
    onSuccess: () => {
      clearSession();
      queryClient.clear(); // Limpa todo o cache ao sair
    },
  });

  return {
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: (loginMutation.error as Error)?.message || null,
    
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
