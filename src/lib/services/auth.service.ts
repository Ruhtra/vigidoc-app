import { signIn, signOut, getSession } from '@lib/auth-client';
import type { AuthSessionType } from '@types/auth.types';

export const AuthService = {
  /**
   * Faz login via e-mail e senha (Better-auth endpoint: POST /api/auth/sign-in/email)
   */
  signInEmail: async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ data: AuthSessionType; error: { message: string } | null }> => {
    const result = await signIn.email({
      email,
      password,
      rememberMe,
    });

    if (result.error) {
      return {
        data: null,
        error: { message: result.error.message ?? 'Credenciais inválidas.' },
      };
    }

    const session = result.data as AuthSessionType;
    return { data: session, error: null };
  },

  /**
   * Obtém a sessão atual do usuário (GET /api/auth/get-session)
   */
  getCurrentSession: async (): Promise<AuthSessionType> => {
    const result = await getSession();
    if (result.error || !result.data) return null;
    return result.data as AuthSessionType;
  },

  /**
   * Encerra a sessão (POST /api/auth/sign-out)
   */
  signOut: async (): Promise<void> => {
    await signOut();
  },
};
