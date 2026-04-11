/**
 * Tipos de autenticação alinhados com o VigidocMedic (Beryl Alpha).
 *
 * O servidor usa Better-Auth com o campo adicional `role` no user.
 */

export type UserRoleType = 'admin' | 'doctor' | 'user';

export type UserStatusType = 'PENDING' | 'ACTIVE' | 'BLOCKED';

export type AuthUserType = {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  status?: UserStatusType;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type AuthSessionType = {
  session: {
    id: string;
    userId: string;
    expiresAt: Date | string;
    token: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
  user: AuthUserType;
} | null;

export type LoginFormType = {
  email: string;
  password: string;
  remember: boolean;
};

export type AuthErrorType = {
  code?: string;
  message: string;
};
