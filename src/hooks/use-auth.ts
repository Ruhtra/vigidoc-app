import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@lib/services/auth.service';
import { useAuthStore } from '@stores/auth.store';
import { LoginFormSchemaType } from '@lib/schemas/auth.schema';

export function useAuth() {
  const { setSession, clearSession } = useAuthStore();
  const queryClient = useQueryClient();

  // Mutation para Login
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, remember }: LoginFormSchemaType) => {
      const { data, error } = await AuthService.signInEmail(email, password, remember ?? false);
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
    resetLogin: loginMutation.reset,
    isLoggingIn: loginMutation.isPending,
    loginError: (loginMutation.error as Error)?.message || null,
    
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
