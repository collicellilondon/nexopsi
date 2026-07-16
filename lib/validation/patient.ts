import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  phone: z.string().min(10, "Informe um telefone válido"),
  status: z.enum(["ativo", "pausado", "alta", "triagem"])
});

export type PatientFormValues = z.infer<typeof patientSchema>;
