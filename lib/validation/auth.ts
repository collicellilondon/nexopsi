import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Digite seu e-mail.").email("Informe um endereco de e-mail valido."),
  password: z.string().min(1, "Digite sua senha."),
  confirmPassword: z.string().optional(),
  remember: z.boolean().default(true)
});

export const signupSchema = loginSchema
  .extend({
    password: z.string().min(8, "Use pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha.")
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas precisam ser iguais."
  });

export const recoverySchema = z.object({
  email: z.string().min(1, "Digite seu e-mail.").email("Informe um endereco de e-mail valido.")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type RecoveryFormValues = z.infer<typeof recoverySchema>;
