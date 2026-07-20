"use client";

import { useEffect, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Search, X } from "lucide-react";
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

type AddressSuggestion = {
  id: string;
  label: string;
};

type PhotonFeature = {
  properties?: {
    osm_id?: string | number;
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
};

export function PatientRegistrationModal({ professionalName, onClose, onCreate }: PatientRegistrationModalProps) {
  const responsibleName = professionalName.trim() || "Profissional a definir";
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
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
  const addressValue = form.watch("address");

  useEffect(() => {
    const query = addressValue.trim();
    if (query.length < 5) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=pt`, {
          signal: controller.signal
        });
        if (!response.ok) return;
        const payload = await response.json();
        const suggestions: AddressSuggestion[] = ((payload.features ?? []) as PhotonFeature[])
          .map((feature, index) => {
            const props = feature.properties ?? {};
            const label = [
              props.name,
              props.street,
              props.housenumber,
              props.district,
              props.city,
              props.state,
              props.country,
              props.postcode
            ]
              .filter(Boolean)
              .join(", ");

            return {
              id: `${props.osm_id ?? index}-${index}`,
              label
            };
          })
          .filter((item) => item.label);
        setAddressSuggestions(suggestions);
      } catch {
        if (!controller.signal.aborted) setAddressSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsSearchingAddress(false);
      }
    }, 420);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [addressValue]);

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

          <div className="md:col-span-2">
            <Field label="Endereço completo" error={form.formState.errors.address?.message}>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-muted" />
                <Input {...form.register("address")} placeholder="Rua, número, bairro, cidade, UF, CEP" autoComplete="street-address" className="pl-9" />
                {isSearchingAddress ? (
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                    <Search className="h-3.5 w-3.5 animate-pulse" />
                    Buscando endereços...
                  </div>
                ) : null}
                {addressSuggestions.length > 0 ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 max-h-56 overflow-y-auto rounded-md border border-border bg-white p-1 shadow-[0_18px_45px_rgba(31,41,55,0.14)]">
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        className="w-full rounded-sm px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-primary-soft hover:text-primary"
                        onClick={() => {
                          form.setValue("address", suggestion.label, { shouldDirty: true, shouldValidate: true });
                          setAddressSuggestions([]);
                        }}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="mt-2 text-xs font-semibold text-ink-muted">Digite o endereço e escolha uma sugestão da base mundial quando aparecer.</p>
            </Field>
          </div>

          <Field label="Contato de emergência" error={form.formState.errors.emergencyContact?.message}><Input {...form.register("emergencyContact")} /></Field>
          <Field label="Responsável legal" error={form.formState.errors.guardian?.message}><Input {...form.register("guardian")} placeholder="Quando aplicável" /></Field>
          <Field label="Origem do encaminhamento" error={form.formState.errors.referralSource?.message}><Input {...form.register("referralSource")} /></Field>
          <Field label="Psicólogo responsável"><Input value={responsibleName} readOnly /></Field>
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
