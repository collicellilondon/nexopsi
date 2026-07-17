"use client";

import { useRef, useState } from "react";
import Image from "next/image";
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
  photoUrl?: string;
};

type ProfessionalProfileProps = {
  initialProfile: ProfessionalProfileData;
  onNotify: (message: string) => void;
  onSave: (profile: ProfessionalProfileData) => void;
};

export function ProfessionalProfile({ initialProfile, onNotify, onSave }: ProfessionalProfileProps) {
  const [profile, setProfile] = useState<ProfessionalProfileData>(initialProfile);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update(field: keyof ProfessionalProfileData, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveProfile() {
    onSave(profile);
    setSaved(true);
    onNotify(`Cadastro profissional salvo para ${profile.name}.`);
  }

  function changePhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onNotify("Selecione um arquivo de imagem para a foto profissional.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const photoUrl = String(reader.result);
      setProfile((current) => ({ ...current, photoUrl }));
      setSaved(false);
      onNotify("Foto carregada. Clique em Salvar cadastro para aplicar no cabeçalho.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro da psicóloga</CardTitle>
        <CardDescription>Informações usadas em documentos, recibos, prontuários e relatórios.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-border bg-background p-5 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-4xl font-black text-primary">
            {profile.photoUrl ? <Image src={profile.photoUrl} alt={`Foto de ${profile.name}`} width={128} height={128} unoptimized className="h-full w-full object-cover" /> : getInitials(profile.name)}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => changePhoto(event.target.files?.[0])}
          />
          <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => fileInputRef.current?.click()}>
            <Camera className="h-4 w-4" />
            Alterar foto
          </Button>
          <p className="mt-3 text-sm text-ink-muted">Foto profissional de {profile.name} para cabeçalhos e documentos.</p>
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
              Cadastro salvo. O cabeçalho já foi atualizado com {profile.name}.
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
