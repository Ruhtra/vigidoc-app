import { z } from 'zod';

// ── CPF helper ──────────────────────────────────────────────────────
function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(digits[i]) * (len + 1 - i);
    const rem = (sum * 10) % 11;
    return rem >= 10 ? 0 : rem;
  };

  return calc(9) === parseInt(digits[9]) && calc(10) === parseInt(digits[10]);
}

// ── Register schema ──────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Nome deve ter pelo menos 3 caracteres')
      .max(100, 'Nome muito longo'),
    email: z
      .string()
      .min(1, 'Informe seu e-mail')
      .email('Formato de e-mail inválido'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Deve conter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    birthDate: z.string().min(1, 'Informe sua data de nascimento'),
    phone: z
      .string()
      .min(10, 'Telefone inválido'),
    cpf: z
      .string()
      .min(11, 'CPF inválido')
      .refine((v) => isValidCpf(v), 'CPF inválido'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterFormSchemaType = z.infer<typeof registerSchema>;
