import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Digite seu e-mail.").email("Informe um endereço de e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
  remember: z.boolean().default(true)
});

export const recoverySchema = z.object({
  email: z.string().min(1, "Digite seu e-mail.").email("Informe um endereço de e-mail válido.")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RecoveryFormValues = z.infer<typeof recoverySchema>;
