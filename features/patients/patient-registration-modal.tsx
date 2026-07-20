"use client";

import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Patient } from "@/lib/types";

const schema = z.object({
  name: z.string().min(3, "Informe o nome completo."),
  email: z.string().email("Informe um e-mail válido."),
  phone: z.string().min(10, "Informe um telefone válido."),
  cpf: z.string().min(11, "Informe o CPF."),
  birthDate: z.string().min(1, "Informe a data de nascimento."),
  address: z.string().min(6, "Informe o endereço completo."),
  emergencyContact: z.string().min(6, "Informe um contato de emergência."),
  guardian: z.string().optional(),
  occupation: z.string().optional(),
  referralSource: z.string().optional(),
  mainComplaint: z.string().min(8, "Descreva a queixa principal."),
  clinicalNotes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

type PatientRegistrationModalProps = {
  professionalName: string;
  onClose: () => void;
  onCreate: (patient: Patient) => void;
};

export function PatientRegistrationModal({ professionalName, onClose, onCreate }: PatientRegistrationModalProps) {
  const responsibleName = professionalName.trim() || "Profissional a definir";
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      birthDate: "",
      address: "",
      emergencyContact: "",
      guardian: "",
      occupation: "",
      referralSource: "",
      mainComplaint: "",
      clinicalNotes: ""
    }
  });

  function submit(values: FormValues) {
    const birthYear = Number(values.birthDate.slice(0, 4));
    onCreate({
      ...values,
      id: `pac-${Date.now()}`,
      name: values.name,
      age: Number.isFinite(birthYear) ? new Date().getFullYear() - birthYear : 0,
      status: "triagem",
      tags: ["Novo cadastro"],
      nextSession: "A agendar",
      lastSession: "Sem histórico",
      pendingBalance: 0,
      phone: values.phone,
      email: values.email,
      therapist: responsibleName
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-[0_30px_90px_rgba(31,41,55,0.22)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-black text-ink">Novo paciente</h2>
            <p className="text-sm text-ink-muted">Ficha cadastral completa para iniciar o acompanhamento.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar cadastro">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form className="grid gap-5 p-5 md:grid-cols-2" onSubmit={form.handleSubmit(submit)} noValidate>
          <Field label="Nome completo" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <Field label="CPF" error={form.formState.errors.cpf?.message}><Input {...form.register("cpf")} placeholder="000.000.000-00" /></Field>
          <Field label="E-mail" error={form.formState.errors.email?.message}><Input type="email" {...form.register("email")} /></Field>
          <Field label="Telefone / WhatsApp" error={form.formState.errors.phone?.message}><Input {...form.register("phone")} /></Field>
          <Field label="Data de nascimento" error={form.formState.errors.birthDate?.message}><Input type="date" {...form.register("birthDate")} /></Field>
          <Field label="Profissão" error={form.formState.errors.occupation?.message}><Input {...form.register("occupation")} /></Field>
          <div className="md:col-span-2"><Field label="Endereço completo" error={form.formState.errors.address?.message}><Input {...form.register("address")} placeholder="Rua, número, bairro, cidade, UF, CEP" /></Field></div>
          <Field label="Contato de emergência" error={form.formState.errors.emergencyContact?.message}><Input {...form.register("emergencyContact")} /></Field>
          <Field label="Responsável legal" error={form.formState.errors.guardian?.message}><Input {...form.register("guardian")} placeholder="Quando aplicável" /></Field>
          <Field label="Origem do encaminhamento" error={form.formState.errors.referralSource?.message}><Input {...form.register("referralSource")} /></Field>
          <Field label="Psicóloga responsável"><Input value={responsibleName} readOnly /></Field>
          <div className="md:col-span-2"><TextField label="Queixa principal" error={form.formState.errors.mainComplaint?.message} registration={form.register("mainComplaint")} /></div>
          <div className="md:col-span-2"><TextField label="Observações clínicas iniciais" registration={form.register("clinicalNotes")} /></div>
          <div className="flex justify-end gap-3 border-t border-border pt-4 md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar paciente</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-sm font-semibold text-destructive">{error}</p> : null}
    </label>
  );
}

function TextField({ label, error, registration }: { label: string; error?: string; registration: UseFormRegisterReturn }) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <textarea className="mt-2 min-h-24 w-full rounded-md border border-border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" {...registration} />
      {error ? <p className="mt-1 text-sm font-semibold text-destructive">{error}</p> : null}
    </label>
  );
}
