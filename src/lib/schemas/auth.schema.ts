import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail')
    .email('Formato de e-mail inválido'),
  password: z
    .string()
    .min(1, 'Informe sua senha')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
  remember: z.boolean().optional(),
});

export type LoginFormSchemaType = z.infer<typeof loginSchema>;
