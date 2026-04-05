import { signIn, signOut, signUp, getSession } from '@lib/auth-client';
import type { AuthSessionType } from '@app-types/auth.types';

export type RegisterPayloadType = {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  phone: string;
  cpf: string;
};

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

    const session = result.data as unknown as AuthSessionType;
    return { data: session, error: null };
  },

  /**
   * Registra novo usuário com status `pending`.
   * O acesso é liberado manualmente por um administrador.
   */
  register: async (
    payload: RegisterPayloadType
  ): Promise<{ error: { message: string } | null }> => {
    try {
      // Usamos o api (axios) diretamente pois o signUp.email não expõe
      // campos customizados (data.*) no tipo do Better Auth client.
      // O endpoint POST /api/auth/sign-up/email aceita esses campos no body.
      const { api } = await import('@lib/api/client');
      await api.post('/api/auth/sign-up/email', {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        birthDate: payload.birthDate,
        phone: payload.phone,
        cpf: payload.cpf,
      });
      return { error: null };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível criar sua conta.';
      return { error: { message: msg } };
    }
  },

  /**
   * Obtém a sessão atual do usuário (GET /api/auth/get-session)
   */
  getCurrentSession: async (): Promise<AuthSessionType> => {
    const result = await getSession();
    if (result.error || !result.data) return null;
    return result.data as unknown as AuthSessionType;
  },

  /**
   * Encerra a sessão (POST /api/auth/sign-out)
   */
  signOut: async (): Promise<void> => {
    await signOut();
  },
};
