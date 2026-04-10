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
      // Usamos o api (axios) em nossa rota customizada de signup para suportar perfeitamente
      // CPF, telefone e criação vinculada de perfil.
      const { api } = await import('@lib/api/client');
      await api.post('/api/novo/users/signup', {
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
   * Obtém a sessão atual do usuário garantindo dados frescos do banco
   * (Contorna cache de JWT do Better-Auth para refletir status PENDING -> ACTIVE)
   */
  getCurrentSession: async (): Promise<AuthSessionType> => {
    try {
      const { api } = await import('@lib/api/client');
      // Adicionamos um timestamp para evitar qualquer cache de rede do device
      const { data } = await api.get(`/api/novo/users/me?t=${Date.now()}`);
      return data as AuthSessionType;
    } catch (err) {
      console.warn('[AuthService] Failed to get fresh session:', err);
      return null;
    }
  },

  /**
   * Encerra a sessão (POST /api/auth/sign-out)
   */
  signOut: async (): Promise<void> => {
    await signOut();
  },
};
