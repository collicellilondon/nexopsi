"use client";

import { useState } from "react";
import { Camera, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type ProfessionalProfileData = {
  name: string;
  register: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
};

type ProfessionalProfileProps = {
  initialProfile: ProfessionalProfileData;
  onNotify: (message: string) => void;
  onSave: (profile: ProfessionalProfileData) => void;
};

export function ProfessionalProfile({ initialProfile, onNotify, onSave }: ProfessionalProfileProps) {
  const [profile, setProfile] = useState<ProfessionalProfileData>(initialProfile);
  const [saved, setSaved] = useState(false);

  function update(field: keyof ProfessionalProfileData, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveProfile() {
    onSave(profile);
    setSaved(true);
    onNotify(`Cadastro profissional salvo para ${profile.name}.`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro da psicologa</CardTitle>
        <CardDescription>Informacoes usadas em documentos, recibos, prontuarios e relatorios.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-border bg-background p-5 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-4xl font-black text-primary">
            {getInitials(profile.name)}
          </div>
          <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => onNotify("Upload de foto preparado para integracao com Supabase Storage.")}>
            <Camera className="h-4 w-4" />
            Alterar foto
          </Button>
          <p className="mt-3 text-sm text-ink-muted">Foto profissional de {profile.name} para cabecalhos e documentos.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome profissional"><Input value={profile.name} onChange={(event) => update("name", event.target.value)} /></Field>
          <Field label="Registro profissional"><Input value={profile.register} onChange={(event) => update("register", event.target.value)} /></Field>
          <Field label="E-mail"><Input value={profile.email} onChange={(event) => update("email", event.target.value)} /></Field>
          <Field label="Telefone"><Input value={profile.phone} onChange={(event) => update("phone", event.target.value)} /></Field>
          <Field label="Especialidade"><Input value={profile.specialty} onChange={(event) => update("specialty", event.target.value)} /></Field>
          <Field label="Assinatura em documentos"><Input value={`${profile.name} - ${profile.register}`} readOnly /></Field>
          <label className="text-sm font-bold text-ink md:col-span-2">
            Bio profissional
            <textarea className="mt-2 min-h-28 w-full rounded-md border border-border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={profile.bio} onChange={(event) => update("bio", event.target.value)} />
          </label>
          {saved ? (
            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-700 md:col-span-2">
              <CheckCircle2 className="h-4 w-4" />
              Cadastro salvo. O cabecalho ja foi atualizado com {profile.name}.
            </div>
          ) : null}
          <div className="flex justify-end md:col-span-2">
            <Button type="button" onClick={saveProfile}>
              <Save className="h-4 w-4" />
              Salvar cadastro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm font-bold text-ink">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NX";
}
